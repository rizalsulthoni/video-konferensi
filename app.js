const express = require("express");
const fs = require("fs");
const http = require("http");
const socketio = require("socket.io");
const RTCMultiConnectionServer = require("rtcmulticonnection-server");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
    RTCMultiConnectionServer.addSocket(socket);
    console.log("client terhubung: ", socket.id);

    socket.emit("open", "anda terhubung dengan soketi.io");

    socket.on("pesan", (data) => {
        console.log("pesan diterima: ", data);
        socket.emit("emailBalasan", "pesan diterima!");
    });

    socket.on("disconnect", () => {
        console.log("client terputus: ", socket.id);
    });

    // Menangani event createOrJoin
    socket.on("createOrJoin", ({ roomId }) => {
        const room = io.sockets.adapter.rooms.get(roomId);

        if (!room || room.size === 0) {
            // Jika room belum ada atau kosong, maka socket yang mengirim event akan menjadi host
            socket.join(roomId);
            io.to(socket.id).emit("createdOrJoined", { userId: socket.id });
        } else {
            // Jika room sudah ada, maka socket yang mengirim event akan bergabung sebagai peserta
            socket.join(roomId);
            io.to(socket.id).emit("createdOrJoined", { userId: socket.id });
        }
    });
});

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.get("/video-pengajar", (req, res) => {
    res.sendFile(__dirname + "/video-pengajar.html");
});
app.get("/video-peserta", (req, res) => {
    res.sendFile(__dirname + "/video-peserta.html");
});
app.get("/video-konferensi", (req, res) => {
    res.sendFile(__dirname + "/video-konferensi.html");
});

server.listen(5000, () => {
    console.log("server up and running on port 3000");
});
