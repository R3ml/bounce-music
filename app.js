const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/public/sounds"));

app.get("/", (req, res) => {
    res.sendFile(dirname__ + "/public/index.html")
});

io.on("connection", (socket) => {

    socket.on("mousedown", (x, y) => {
        io.emit("placeBallLeft", x, y);
    })

    socket.on("mouseup", (id, mousePosition) =>{
        io.emit("placeBallRight", id, mousePosition)
    })
});


server.listen(process.env.PORT || 8080, (error)=> {
    if (error) {
        console.log(error);
    }
    console.log("server is running on port 8080");
});




