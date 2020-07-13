var fs = require("fs");
var https = require("https");
const { post } = require("jquery");
const { emit } = require("process");
var privateKey = fs.readFileSync("./server.key", "utf8");
var certificate = fs.readFileSync("./STAR_iskwela_net-bundle.crt", "utf8");
var credentials = { key: privateKey, cert: certificate };
var app = require("express")();

app.get("/", function (req, res) {
  res.end("dev");
});

var httpsServer = https.createServer(credentials, app);
var io = require("socket.io")(httpsServer);

const posts = {};
const progress = {
  quizzes: {},
  periodical_tests: {},
  assignments: {},
};

io.on("connection", (socket) => {
  socket.on("new class details", (c) => {
    c = JSON.parse(c);
    socket.broadcast.emit("get class details", c);
  });

  socket.on("update schedule details", (newScheduleDetails) => {
    socket.broadcast.emit("get schedule details", newScheduleDetails);
  });

  socket.on("start quiz", (c) => {
    socket.broadcast.emit("get quiz details", c);
  });

  socket.on("new questionnaires", (quiz) => {
    io.emit("get questionnaires", quiz);
  });

  socket.on("send_item", (details) => {
    if (details.to) {
      io.to(details.to).emit("get item", details);
    }
  });

  socket.on("delete items", (items) => {
    socket.broadcast.emit("delete items", items);
  });

  socket.on("add items", (items) => {
    socket.broadcast.emit("add items", items);
  });

  socket.on("get post", (id) => {
    socket.emit("get post", posts[id]);
  });

  socket.on("save post", (post) => {
    if (posts[post.class_id]) {
      post = { id: posts[post.class_id].length, ...post };
      posts[post.class_id] = [...posts[post.class_id], post];
    } else {
      post = { id: 0, ...post };
      posts[post.class_id] = [post];
    }
    io.emit("add items", {
      type: "POST",
      items: post,
    });
  });
  socket.on("add comment", ({ class_id, post_id, comment, author }) => {
    if (posts[class_id]) {
      let p = posts[class_id];
      let c = p.find((q) => q.id === post_id);
      if (c.comments) {
        c.comments.push({
          id: c.comments.length,
          comment,
          author,
          date: new Date().toString(),
        });
      } else {
        c.comments = [
          {
            id: 0,
            comment,
            author,
            date: new Date().toString(),
          },
        ];
      }
      posts[class_id][p.findIndex((q) => q.id === post_id)].comments =
        c.comments;
      io.emit(
        "update post",
        posts[class_id][p.findIndex((q) => q.id === post_id)]
      );
    }
  });
  socket.on("delete post", ({ class_id, id }) => {
    if (posts[class_id]) {
      let p = posts[class_id];
      p.splice(
        p.findIndex((q) => q.id === id),
        1
      );
      posts[class_id] = p;
      io.emit("delete items", {
        type: "POST",
        id,
      });
    }
  });
  socket.on("get progress", (data) => {
    let emitted = false;
    let s = progress[data.type][data.student_id];
    if (s) {
      if (s.data) {
        socket.emit("get progress", s.data[data.id]);
        emitted = true;
      }
    }
    if (!emitted) socket.emit("get progress", {});
  });
  socket.on("remove progress", (data) => {
    if (progress[data.type]) {
      let p = progress[data.type][data.student_id];
      if (p && p.data && p.data[data.id]) {
        delete p.data[data.id];
      }
    }
  });
  socket.on("update progress", (data) => {
    if (progress[data.type]) {
      let p = progress[data.type];
      if (p[data.student_id]) {
        let d = p[data.student_id].data;
        if (d[data.item.id]) {
          d[data.item.id] = { ...d[data.item.id], ...data.item };
        } else {
          d[data.item.id] = data.item;
        }
      } else {
        progress[data.type][data.student_id] = {};
        progress[data.type][data.student_id].data = {};
        progress[data.type][data.student_id].data[data.item.id] = data.item;
      }
    }
  });
});

httpsServer.listen(3001);
