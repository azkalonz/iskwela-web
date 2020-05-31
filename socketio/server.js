var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

http.listen(3001, function () {});

io.on("connection", (socket) => {
  console.log("connected");
  socket.on("new class details", (c) => {
    c = JSON.parse(c);
    socket.broadcast.emit("get class details", c);
  });

  socket.on("update schedule details", (newScheduleDetails) => {
    socket.broadcast.emit("get schedule details", newScheduleDetails);
  });
});
