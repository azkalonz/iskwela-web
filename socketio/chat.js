const chat = { online_users: [], conversations: {} };
let messageCounter = 0;
function createChatData({ sender, receiver }) {
  return {
    messages: [],
    participants: [sender, receiver],
    status: "",
  };
}
function getMessages({ channel, start = 0, end = 10 }) {
  let convo = chat.conversations[channel] || {};
  let messages = convo.messages || [];
  let total = messages.length;
  let participants = convo.participants || [];
  if (convo && messages) {
    messages = messages
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(start, end)
      .reverse();
  }
  return {
    channel,
    messages,
    participants,
    total,
    start,
    end,
  };
}
function getRecentMessages(user, otheruser) {
  let m = [];
  Object.keys(chat.conversations).map((k) => {
    let isUsersChannel = k.indexOf(user.username) === 0;
    if (!otheruser) {
      if (isUsersChannel && chat.conversations[k].messages.length > 0) {
        let latestNotSeen = chat.conversations[k].messages
          .reverse()
          .filter((q) => (q.seen[user.id] ? false : true));
        if (latestNotSeen.length) {
          latestNotSeen.push(chat.conversations[k].messages.reverse()[0]);
          m.push(
            ...latestNotSeen.filter((q, i) => {
              let duplicateIndex = latestNotSeen.findIndex(
                (qq) => qq.id === q.id
              );
              return i > duplicateIndex ? false : true;
            })
          );
        } else {
          m.push(chat.conversations[k].messages.reverse()[0]);
        }
      }
    } else {
      if (
        k.indexOf(otheruser.username) > user.username.length &&
        isUsersChannel &&
        chat.conversations[k].messages.length > 0
      ) {
        m.push(chat.conversations[k].messages[0]);
      }
    }
  });
  return m;
}
function getSocketId(user) {
  let u = chat.online_users.find((q) => user && q.id === user.id);
  return u && u.socket;
}
function getSocketSiblings(socketid) {
  let u = chat.online_users.find((q) => q.socket.indexOf(socketid) >= 0);
  return u && u.socket;
}
module.exports = {
  chat: (io, socket) => {
    io.sockets.setMaxListeners(0);
    socket.on("get messages", ({ channel = null, start = 0, end = 10 }) => {
      if (!channel) return;
      if (getSocketSiblings(socket.id)) {
        for (let socketID of getSocketSiblings(socket.id))
          io.to(socketID).emit(
            "get messages",
            getMessages({ channel, start, end })
          );
      }
    });
    socket.on("get recent messages", ({ user, otheruser }) => {
      if (!user) return;
      if (getSocketSiblings(socket.id))
        for (let socketID of getSocketSiblings(socket.id))
          io.to(socketID).emit(
            "get recent messages",
            getRecentMessages(user, otheruser)
          );
    });
    socket.on("send message", ({ channel, message }) => {
      const { receiver, sender } = channel;
      if (!receiver || !sender) return;
      const inChannel = receiver.username + "-" + sender.username;
      const outChannel = sender.username + "-" + receiver.username;
      if (!chat.conversations[inChannel])
        chat.conversations[inChannel] = createChatData({
          sender: receiver,
          receiver: sender,
        });
      if (!chat.conversations[outChannel]) {
        chat.conversations[outChannel] = createChatData({
          sender,
          receiver,
        });
        if (getSocketId(sender)) {
          if (getSocketSiblings(getSocketId(sender)[0])) {
            for (let socketID of getSocketSiblings(getSocketId(sender)[0]))
              io.to(socketID).emit(
                "get messages",
                getMessages({ channel: outChannel, start: 0, end: 10 })
              );
          }
        }
      }
      let seen = {};
      seen[sender.id] = sender;
      let incomingMessage = {
        id: messageCounter,
        seen,
        message,
        sender,
        receiver,
        date: new Date(),
      };
      chat.conversations[outChannel].messages.push({
        ...incomingMessage,
        channel: outChannel,
      });
      chat.conversations[inChannel].messages.push({
        ...incomingMessage,
        channel: inChannel,
      });
      if (getSocketSiblings(socket.id))
        for (let socketID of getSocketSiblings(socket.id))
          io.to(socketID).emit("new message", {
            ...incomingMessage,
            channel: outChannel,
          });
      if (getSocketId(receiver)) {
        for (let socketID of getSocketId(receiver)) {
          io.to(socketID).emit("new message", {
            ...incomingMessage,
            channel: inChannel,
          });
        }
      }
      messageCounter++;
    });

    socket.on("get online users", () => {
      if (getSocketSiblings(socket.id))
        for (let socketID of getSocketSiblings(socket.id))
          io.to(socketID).emit("get online users", chat.online_users);
    });
    socket.on("online user", (userInfo) => {
      if (!userInfo) return;
      let userIndex = chat.online_users.findIndex((q) => q.id === userInfo.id);
      if (userIndex >= 0) {
        chat.online_users[userIndex].status = "online";
        chat.online_users[userIndex].socket = [
          ...chat.online_users[userIndex].socket,
          socket.id,
        ];
      } else {
        chat.online_users.push({ ...userInfo, socket: [socket.id] });
      }
      io.emit("get online users", chat.online_users);
    });
    socket.on("disconnect", () => {
      let userIndex = chat.online_users.findIndex(
        (q) => q.socket.indexOf(socket.id) >= 0
      );
      if (userIndex >= 0) {
        let socketIndex = chat.online_users[userIndex].socket.findIndex(
          (q) => q === socket.id
        );
        if (socketIndex >= 0) {
          chat.online_users[userIndex].socket.splice(socketIndex, 1);
        }
        if (!chat.online_users[userIndex].socket.length)
          chat.online_users[userIndex].status = "offline";
        Object.keys(chat.conversations).forEach((k) => {
          let convo = chat.conversations[k];
          convo.status[chat.online_users[userIndex].id] = {};
        });
      }
      io.emit("get online users", chat.online_users);
    });
    socket.on("update message", ({ sender, receiver, id, update }) => {
      if (!sender || !receiver || id === undefined) return;
      let channels = [
        sender.username + "-" + receiver.username,
        receiver.username + "-" + sender.username,
      ];
      for (let channel of channels) {
        if (
          chat.conversations[channel] &&
          chat.conversations[channel].messages
        ) {
          if (typeof id === "number") {
            let msgIndex = chat.conversations[channel].messages.findIndex(
              (q) => q.id === id
            );
            if (msgIndex >= 0) {
              chat.conversations[channel].messages[msgIndex] = {
                ...chat.conversations[channel].messages[msgIndex],
                ...update,
              };
            }
          } else if (typeof id === "object") {
            for (let i of id) {
              let msgIndex = chat.conversations[channel].messages.findIndex(
                (q) => q.id === i
              );
              if (msgIndex >= 0) {
                chat.conversations[channel].messages[msgIndex] = {
                  ...chat.conversations[channel].messages[msgIndex],
                  ...update,
                };
              }
            }
          }
        }
      }
      if (getSocketId(sender)) {
        if (getSocketSiblings(getSocketId(sender)[0])) {
          for (let socketID of getSocketSiblings(getSocketId(sender)[0]))
            io.to(socketID).emit("update message", { id, update });
        }
      }
      if (getSocketId(receiver)) {
        if (getSocketSiblings(getSocketId(receiver)[0])) {
          for (let socketID of getSocketSiblings(getSocketId(receiver)[0]))
            io.to(socketID).emit("update message", { id, update });
        }
      }
    });
    socket.on("update chat", ({ sender, receiver, update }) => {
      if (!sender || !receiver) return;
      let channels = [
        sender.username + "-" + receiver.username,
        receiver.username + "-" + sender.username,
      ];
      for (let channel of channels) {
        if (chat.conversations[channel]) {
          chat.conversations[channel] = {
            ...chat.conversations[channel],
            ...update,
          };
        }
      }
      if (getSocketId(sender)) {
        if (getSocketSiblings(getSocketId(sender)[0])) {
          for (let socketID of getSocketSiblings(getSocketId(sender)[0]))
            io.to(socketID).emit("update chat", { update });
        }
      }
      if (getSocketId(receiver)) {
        if (getSocketSiblings(getSocketId(receiver)[0])) {
          for (let socketID of getSocketSiblings(getSocketId(receiver)[0]))
            io.to(socketID).emit("update chat", { update });
        }
      }
    });
    socket.on("videocall", ({ caller, receiver, status }) => {
      if (!caller || !receiver) return;
      let to = getSocketId(receiver);
      let from = getSocketId(caller);
      if (to.length && from.length) {
        io.to(to[to.length - 1]).emit("videocall", {
          caller,
          receiver,
          status,
        });
        io.to(from[from.length - 1]).emit("videocall", {
          caller,
          receiver,
          status,
        });
      }
    });
  },
};
