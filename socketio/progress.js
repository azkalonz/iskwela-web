const progress = {
  quizzes: {},
  periodical_tests: {},
  assignments: {},
};
module.exports = {
  progress: (io, socket) => {
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
  },
};
