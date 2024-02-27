'use strict';

const express = require('express');
const cors = require('cors');
const http = require("http");
const {Server} = require('socket.io');

const logger = require('../src/middleware/logger');
const v1Routes = require('./routes/v1.route');
const userROutes = require('./routes/user.route');
const chatRoutes = require('./routes/chats.rout');
const mailerChecker = require('./middleware/nodemailer');

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://shat.netlify.app"
    }
});

io.on("connection", socket => {

    socket.on("join_room", payload=>{
        socket.join(payload.convId);
    });

    socket.on("send_ver_code", payload => {
        mailerChecker(payload.username, payload.email, (error, verificationCode) => {
          if (error) {
            console.error('Error:', error);
          } else {
            socket.emit("ver_code_sent", verificationCode);
          }
        });
      });
      
    socket.on("send_message", payload=>{
        socket.to(payload.room).emit("receive_message", {room: payload.room, username: payload.username});
    });

    socket.on("is_typing", payload=>{
        socket.to(payload.room).emit("received_is_typing", {room: payload.room, username: payload.username});
    });

    socket.on("stopped_typing", payload=>{
        socket.to(payload.room).emit("received_stopped_typing", {room: payload.room, username: payload.username});
    });

    socket.on("update_profile", payload=>{
        socket.emit("refresh_profile");
    });

});

app.use(logger);

app.get('/', homePageHandler);

app.use('/api/v1', v1Routes);
app.use(userROutes);
app.use(chatRoutes);

app.use('*', PageNotFoundHandler);
app.use(errorHandler500);

function homePageHandler(req, res){
    res.status(200).send('Shat server');
}

function PageNotFoundHandler(req, res){
    res.status(404).json({
        status: 404,
        message: 'page not found :('
    });
}

function errorHandler500(err, req, res){
    res.status(500).json({
        status: 500,
        message: 'server error: '+ err.message || err
    });

}

function start (port){
    server.listen(port, ()=>{
        console.log('connecting with the server on port: ' + port);
    });
}

module.exports = {
    app,
    start
}