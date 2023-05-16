const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Mengirim perintah mute/unmute video peserta ke semua client di room kecuali pengirimnya
function sendParticipantVideoControl(senderSocket, enabled) {
    senderSocket.broadcast
        .to(senderSocket.room)
        .emit("participantVideoControl", enabled);
}

app.get("/video-konferensi", (req, res) => {
    res.sendFile(__dirname + "/video-konferensi.html");
});

// Event saat client terhubung ke server menggunakan Socket.io
io.on("connection", function (socket) {
    console.log("Client terhubung: " + socket.id);

    // Event saat client bergabung ke room
    socket.on("joinRoom", function (roomId) {
        socket.join(roomId);
        socket.room = roomId;
    });

    // Event saat menerima perintah mute/unmute video peserta dari client
    socket.on("participantVideoControl", function (enabled) {
        sendParticipantVideoControl(socket, enabled);
    });

    // Event saat client disconnect
    socket.on("disconnect", function () {
        console.log("Client terputus: " + socket.id);
        // Lakukan penanganan sesuai kebutuhan saat client disconnect
        // Misalnya, menghapus data client dari room atau memberitahukan client lain
    });
});

server.listen(5000, () => {
    console.log("server up and running on port 3000");
});
