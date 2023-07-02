import { Server } from "socket.io";

// socket.io without DataBASE
const io = new Server({
  cors: {
    origin: "*",
  },
  pingTimeout: 60000,
});

async function leavePrivateRoom(room: string) {
  const opponent = await io.in(room).fetchSockets();
  if (opponent.length) opponent[0].leave(room);
}

async function main() {
  let newRoom: number = 0;
  io.on("connection", (socket) => {
    socket.on("search-opponent", async () => {
      const waitingRoom = "searching";
      try {
        const chatters = await io.in(waitingRoom).fetchSockets();
        if (chatters.length) {
          const chatter = chatters[0];
          const newRoomString = (++newRoom).toString();
          chatter.leave(waitingRoom);
          chatter.data.room = newRoomString;
          socket.data.room = newRoomString;
          chatter.join(newRoomString);
          socket.join(newRoomString);
          chatter.emit("room-found", true);
          socket.emit("room-found", true);
        } else {
          socket.join(waitingRoom);
        }
      } catch {}
    });

    socket.on("leave-opponent", () => {
      leavePrivateRoom(socket.data.room);
      socket.leave(socket.data.room);
    });

    socket.on("disconnect", () => {
      leavePrivateRoom(socket.data.room);
    });

    socket.on("get-online", () => {
      socket.emit("get-online-users", io.sockets.sockets.size);
    });

    socket.on("send-message", (message) => {
      const state = socket.data;
      if (typeof state.room === "string") {
        socket.to(state.room).emit("receive-message", message);
      }
    });

    socket.on("typing", (active) => {
      const state = socket.data;
      if (!state.room) return;
      if (active) socket.to(state.room).emit("get-typing-status", true);
      else socket.to(state.room).emit("get-typing-status", false);
    });
  });

  io.listen(8080);
}

main();
