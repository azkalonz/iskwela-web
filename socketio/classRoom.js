module.exports = {
  classRoom: (io, socket) => {
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
  },
};
