module.exports = {
  posts: (io, socket) => {
    socket.on("new post", ({ post, class_id, school_id }) => {
      if (!post || (!class_id && !school_id)) return;
      io.emit("new post", { post, class_id, school_id });
    });
    socket.on("update post", ({ post, class_id, school_id }) => {
      if (!post || (!class_id && !school_id)) return;
      io.emit("update post", { post, class_id, school_id });
    });
    socket.on("add comment", ({ class_id, post, comment, school_id }) => {
      if ((!class_id && !school_id) || !post || !comment) return;
      io.emit("new comment", { class_id, post, comment, school_id });
    });
    socket.on("delete post", ({ class_id, post, school_id }) => {
      if ((!class_id && !school_id) || !post) return;
      io.emit("delete post", { class_id, post, school_id });
    });
  },
};
