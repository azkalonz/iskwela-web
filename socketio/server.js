var fs = require("fs");
var https = require("https");
var privateKey = fs.readFileSync("./server.key", "utf8");
var certificate = fs.readFileSync("./STAR_iskwela_net-bundle.crt", "utf8");
var credentials = { key: privateKey, cert: certificate };
var app = require("express")();
var { classRoom } = require("./classRoom");
var { posts } = require("./posts");
var { whiteBoard } = require("./whiteBoard");
var { progress } = require("./progress");
var { chat } = require("./chat");

app.get("/", function (req, res) {
  res.end("dev");
});

var httpsServer = https.createServer(credentials, app);
var io = require("socket.io")(httpsServer);

io.on("connection", (socket) => {
  classRoom(io, socket);
  posts(io, socket);
  progress(io, socket);
  whiteBoard(io, socket);
  chat(io, socket);
});

httpsServer.listen(3001);
