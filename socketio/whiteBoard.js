const whiteBoard = {};
module.exports = {
  whiteBoard: (io, socket) => {
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
    // socket.on("disconnect", function () {
    //   Object.keys(whiteBoard).map((k) => {
    //     whiteBoard[k].clients.forEach((client, index) => {
    //       if (client.socket === socket.id) {
    //         let boardIndex = whiteBoard[k].boards.findIndex(
    //           (q) => q.socket === socket.id
    //         );
    //         whiteBoard[k].clients.splice(index, 1);
    //         whiteBoard[k].boards.splice(boardIndex, 1);
    //         updateWhiteBoard(k);
    //       }
    //     });
    //   });
    // });
  },
};
