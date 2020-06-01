var fs = require("fs");
var https = require("https");
var privateKey = fs.readFileSync("./server.key", "utf8");
var certificate = fs.readFileSync("./STAR_iskwela_net-bundle.crt", "utf8");
var credentials = { key: privateKey, cert: certificate };
var app = require("express")();

app.get("/", function (req, res) {
  res.end("dev");
});

var httpsServer = https.createServer(credentials, app);
var io = require("socket.io")(httpsServer);

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

httpsServer.listen(3001);
