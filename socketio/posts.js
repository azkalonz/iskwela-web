const posts = {};
module.exports = {
  posts: (io, socket) => {
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
  },
};
