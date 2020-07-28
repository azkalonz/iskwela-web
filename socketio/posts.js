module.exports = {
  posts: (io, socket) => {
    socket.on("new post", ({ post, class_id }) => {
      if (!post || !class_id) return;
      io.emit("new post", { post, class_id });
    });
    socket.on("add comment", ({ class_id, post, comment }) => {
      if (!class_id || !post || !comment) return;
      io.emit("new comment", { class_id, post, comment });
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
  },
};
