const express = require("express");
const fs = require("fs");
const http = require("http");
const socketio = require("socket.io");
const RTCMultiConnectionServer = require("rtcmulticonnection-server");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

let uuids = {};
let owners = {};

io.on("connection", (socket) => {
    RTCMultiConnectionServer.addSocket(socket);
    console.log("client terhubung: ", socket.id);

    // simpan roomid dan socket.id dari owner pengajar
    socket.on("owner_room", (owner_id) => {
        socket.owner_id = owner_id;
        owners[owner_id] = socket.id;
    });

    socket.on("disconnect", () => {
        console.log("client terputus: ", socket.id);
    });

    // jika ada peserta yang masuk room
    socket.on("mau_masuk", (owner_id, my_userid, my_socket_id) => {
        console.log("mau_masuk", owner_id, my_userid, my_socket_id);
        // kirim permintaan masuk ke owner dari peserta
        io.to(owners[owner_id]).emit(
            "permintaan_masuk",
            my_userid,
            my_socket_id
        );
    });

    // terima permintaan masuk dari owner room
    socket.on(
        "terima_permintaan_masuk",
        (owner_userid, data_userid, socket_id) => {
            console.log(
                "terima_permintaan_masuk",
                owner_userid,
                data_userid,
                socket_id
            );
            // konfirmasi data ke peserta yang request permintaan masuk
            io.to(socket_id).emit(
                "konfirmasi_data_masuk",
                owner_userid,
                data_userid
            );
        }
    );

    socket.on("run_timer", (owner_id, timer) => {
        console.log("run_timer", owner_id, timer);
        socket.broadcast.to(owners[owner_id]).emit("timer_video", timer);
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
