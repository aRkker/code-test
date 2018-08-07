var socket = null;

exports.setup = io => {
    
    var app = require('express')();
    var http = require('http').Server(app);
    var io = require('socket.io')(http);

    this.socket = io;

    io.on('connection', function(socket){
        console.log('a user connected');
    });

    http.listen(process.env.NOTIFICATION_SERVER_PORT, function(){
        console.log(`listening on *:${process.env.NOTIFICATION_SERVER_PORT}`);
    });
}

exports.sendNotification = notificationMessage => {
    this.socket.emit('notification', {message: notificationMessage});
    // Here you could add an unlimited amount of different services for triggers/notifications
}