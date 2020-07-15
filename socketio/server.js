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

const whiteBoard = {};
const posts = {};
// for tracking quiz/periodical/assignment answers
// progress[TYPE][STUDENT_ID].data[ID]
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
  const createBoard = (id, data, init = false) => {
    if (init) {
      whiteBoard[id] = data;
    } else {
      whiteBoard[id].boards.push(data);
    }
    return data;
  };
  const updateWhiteBoard = (id, data = null) => {
    if (data) {
      if (data.id !== null) {
        let boardIndex = whiteBoard[id].boards.findIndex(
          (q) => q.info && data.user && q.info.id === data.user.id
        );
        if (boardIndex >= 0)
          whiteBoard[id].boards[boardIndex] = {
            ...whiteBoard[id].boards[boardIndex],
            ...data,
          };
      } else {
        let boardIndex = whiteBoard[id].boards.findIndex(
          (q) => q.id === data.id
        );
        if (boardIndex >= 0)
          whiteBoard[id].boards[boardIndex] = {
            ...whiteBoard[id].boards[boardIndex],
            b64: data.b64,
            json: data.json,
          };
      }
    }
    io.emit("update whiteboard", { board: whiteBoard[id], id });
  };
  socket.on("update whiteboard", ({ id, data = {} }) => {
    updateWhiteBoard(id, data);
  });
  socket.on("whiteboard", ({ id, user, is_host }) => {
    let board = whiteBoard[id];
    if (!board) {
      board = createBoard(
        id,
        {
          id,
          date_created: new Date(),
          config: {
            is_controlled: false,
            host_only: false,
            live_preview: true,
          },
          focused_board: null,
          host: {},
          clients: [],
          boards: [],
        },
        true
      );
    } else if (is_host !== undefined) {
      if (is_host && !board.host.board) {
        board.host.info = user;
        board.host.board = createBoard(id, {
          id: board.boards.length,
          info: user,
          title: "My Board",
          date_created: new Date(),
          socket: socket.id,
          config: {
            background: "#fff",
            is_hidden: false,
          },
        });
      } else if (
        !is_host &&
        !board.boards.find((q) => q.info && q.info.id === user.id)
      ) {
        board.clients.push(
          createBoard(id, {
            id: board.boards.length,
            title: "My Board",
            info: user,
            date_created: new Date(),
            socket: socket.id,
            config: {
              background: "#fff",
              is_hidden: false,
            },
          })
        );
      }
    }
    socket.emit("get whiteboard", whiteBoard[id]);
    console.log(whiteBoard);
  });
  socket.on("delete boards", (id) => {
    if (whiteBoard[id]) {
      delete whiteBoard[id];
      io.emit("delete boards", id);
    }
  });
  socket.on("disconnect", function () {
    Object.keys(whiteBoard).map((k) => {
      whiteBoard[k].clients.forEach((client, index) => {
        if (client.socket === socket.id) {
          let boardIndex = whiteBoard[k].boards.findIndex(
            (q) => q.socket === socket.id
          );
          whiteBoard[k].clients.splice(index, 1);
          whiteBoard[k].boards.splice(boardIndex, 1);
          updateWhiteBoard(k);
        }
      });
    });
  });
});

httpsServer.listen(3001);
