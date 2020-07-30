module.exports = {
  posts: (io, socket) => {
    socket.on("new post", ({ post, class_id }) => {
      if (!post || !class_id) return;
      io.emit("new post", { post, class_id });
    });
    socket.on("update post", ({ post, class_id }) => {
      if (!post || !class_id) return;
      io.emit("update post", { post, class_id });
    });
    socket.on("add comment", ({ class_id, post, comment }) => {
      if (!class_id || !post || !comment) return;
      io.emit("new comment", { class_id, post, comment });
    });
    socket.on("delete post", ({ class_id, post }) => {
      if (!class_id || !post) return;
      io.emit("delete post", { class_id, post });
    });
  },
};
