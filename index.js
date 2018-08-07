require('dotenv').config()

const os = require('os');
const fs = require('fs');
const path = require('path');

const crypto = require('crypto');

const parser = require('xml2json-light');

const Client = require('ssh2-sftp-client');
const sftp = new Client();

const tmpFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'codetest-'));

const mongoose = require('mongoose');
require('./mongomodels/bacsdocuments');
require('./mongomodels/returneddebititems');

var BACSDocument = mongoose.model('bacsdocuments');
var ReturnedDebitItem = mongoose.model('returneddebititems');

mongoose.Promise = global.Promise;

mongoose.connect(`mongodb://${process.env.MONGO_USERNAME}:${encodeURIComponent(process.env.MONGO_PASS)}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`, {
    useNewUrlParser: true
});

const notificationFunctions = require('./notification-server');
notificationFunctions.setup();

require('./ui-content-server');

var lastReadCount = 0;

sftp.connect({
    host: process.env.SFTP_HOST,
    port: process.env.SFTP_PORT,
    username: process.env.SFTP_USER,
    password: process.env.SFTP_PASS
}).then(() => {
    console.debug(`Connected to ${process.env.SFTP_HOST + ':' + process.env.SFTP_PORT + ' as ' + process.env.SFTP_USER}`);

    setInterval(() => {

        sftp.list(process.env.XML_FOLDER).then(files => {
            let promises = [];

            for (let file of files) {
                if (file.type === 'd') continue;
                console.debug(`Processing file "${process.env.XML_FOLDER + '/' + file.name}"`);
                // download files to a temporary location
                promises.push(sftp.fastGet(process.env.XML_FOLDER + '/' + file.name, tmpFolder + '/' + file.name));
                promises.push(sftp.rename(process.env.XML_FOLDER + '/' + file.name, process.env.XML_FOLDER + '/' + process.env.XML_ARCHIVE + '/' + file.name));
            }

            return Promise.all(promises.map(reflect));

        }).then(() => {


            try {
                // Read the temporary directory
                fs.readdir(tmpFolder, (err, files) => {
                    if (err) throw err;
                    files.forEach(file => {
                        fs.readFile(tmpFolder + '\\' + file, (err, data) => {
                            
                            let parsed = parser.xml2json(data.toString('latin1')); // Node >= 6.4.0 required for ISO-8859-1
                            BACSDocument.create({
                                BACSDocument: parsed.BACSDocument
                            }, async (err, result) => {
                                if (err) throw err;

                                let BACS = result.BACSDocument;
                                let returnedDebitItems = objKeySearch(BACS, 'ReturnedDebitItem');

                                for (let item of returnedDebitItems) {
                                    await ReturnedDebitItem.create({
                                        ReturnedDebitItem: item
                                    });
                                }

                                fs.unlinkSync(tmpFolder + '\\' + file);
                                lastReadCount++;

                            });

                        })
                    })
                });
            } catch (err) {
                console.log(err);
            }
        }).then((e, v) => {
            if (lastReadCount > 0) {
                notificationFunctions.sendNotification('A new set of files have just been parsed succesfully');
                lastReadCount = 0;
            }
        });


    }, process.env.INTERVAL * 1000);
});

const reflect = p => p.then(v => ({
        v,
        status: "fulfilled"
    }),
    e => ({
        e,
        status: "rejected"
    }));

const objKeySearch = (obj, key) => {
    var result;

    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {

            if (property === key) {
                return obj[key];
            }
            if (typeof obj[property] === "object") {
                result = objKeySearch(obj[property], key);

                if (typeof result !== "undefined") {
                    return result;
                }
            } else if (property === key) {
                return obj[key];
            }
        }
    }
}