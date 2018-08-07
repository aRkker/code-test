var express = require('express'),
  app = express(),
  cors = require('cors');

const mongoose = require('mongoose');
var ReturnedDebitItem = mongoose.model('returneddebititems');

app.use(cors());

app.listen(process.env.UI_SERVER_PORT);

app.route('/getRows').get((req, response) => {
  //  console.log(req);
    ReturnedDebitItem.find({}, 'ReturnedDebitItem', (err, res) => {
        if (err) return err;
        response.send(res);
    });
});