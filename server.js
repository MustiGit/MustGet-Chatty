// Settings for mongoose
const mongoose = require("mongoose")
require("./models/db")
var Message = require('./models/message')

// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
server.listen(process.env.PORT || 3000);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');

    // Add body-parser
    var bodyParser = require('body-parser')
    app.use(bodyParser.json())
});

users = [];
connections = [];

//io.socket connections
io.sockets.on('connection', function (socket) {

    connections.push(socket);
    console.log("Client connected. Currently online: %s", connections.length);

    // Disconnect
    socket.on('disconnect', function (data) {

        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Client disconnected. Currently online: %s', connections.length);
    });

    // Send Message:
    socket.on('send message', function (data) {

        //If message has data and username
        if (data && socket.username) {
            // Emit message
            io.sockets.emit('new message', { msg: data, user: socket.username });

            //POST message to MongoDB.
            app.post("/message", (req, res) => {
                var message = req.body;
                console.log("Message = ", message)
                message["_id"] = new mongoose.Types.ObjectId();
                var messageModel = new Message(message)

                messageModel.save(function (err) {
                    if (err) res.status(500).send("error in saving: " + err);
                    else {
                        res.status(201).send("Message" + message + " added")
                    }
                })
            })
        };
    });

    // New User
    socket.on('new user', function (data, callback) {
        callback(true);
            socket.username = data;
            users.push(socket.username);
            updateUsernames();
    });

    //Function to update usernames
    function updateUsernames() {
        io.sockets.emit('get users', users);
    }

    
});