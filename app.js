const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
    console.log(`App is running on Port NO : ${PORT}`)
});

let socketsConnected = new Set();

const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', onConnected);

function onConnected(socket) {
    console.log(socket.id);
    socketsConnected.add(socket.id);

    io.emit('clients-total', socketsConnected.size);

    // if any socket is disconnected
    socket.on('disconnect', () => {
        console.log('Socket disconnected', socket.id);
        socketsConnected.delete(socket.id);
        io.emit('clients-total', socketsConnected.size);
    })

    socket.on('message', (data) => {
        console.log(data);
        socket.broadcast.emit('chat-message', data);
    })

    socket.on('feedback', (data) => {
        socket.broadcast.emit('feedback', data)
    })
}