import { SeekerModel } from "./models/user.model";
import logger from "./lib/logger";
import { searchCriteria } from "./lib/search";
import { leavePrivateRoom } from "./lib/chat";
import io from "./socket";

async function main() {
  let newRoom: number = 0;
  io.on("connection", (socket) => {
    socket.on("search-opponent", async (seeker: SeekerModel) => {
      const waitingRoom = "searching";
      try {
        const chatters = await io.in(waitingRoom).fetchSockets();
        socket.data.searching = seeker;
        for (let i = 0; i < chatters.length; i++) {
          if (chatters[i].id === socket.id) continue;
          const chatter = chatters[i];
          const candidate = chatter.data.searching;
          if (searchCriteria(candidate, seeker)) continue;
          const newRoomString = (++newRoom).toString();
          chatter.leave(waitingRoom);
          chatter.join(newRoomString);
          socket.join(newRoomString);
          chatter.data.privateRoom = newRoomString;
          socket.data.privateRoom = newRoomString;
          chatter.emit("room-found", true);
          socket.emit("room-found", true);
          return;
        }
        socket.join(waitingRoom);
      } catch (e) {
        console.log(e);
      }
    });

    socket.on("leave-opponent", () => {
      if (!socket.data.privateRoom) return;
      const room: string = socket.data.privateRoom;
      leavePrivateRoom(room).then((status) => {
        if (status) {
          socket.leave(room);
          socket.emit("opponent-left", status);
        }
      });
    });

    socket.on("disconnect", () => {
      if (!socket.data.privateRoom) return;
      leavePrivateRoom(socket.data.privateRoom)
        .then((status) => {
          socket.emit("opponent-left", status);
        })
        .catch((e) => logger.error(e));
    });

    socket.on("get-online", () => {
      socket.emit("get-online-users", io.sockets.sockets.size);
    });

    socket.on("send-message", (message) => {
      const state = socket.data;
      if (typeof state.privateRoom === "string") {
        socket.to(state.privateRoom).emit("receive-message", message);
      }
    });

    socket.on("typing-message", (active) => {
      const state = socket.data;
      if (!state.privateRoom) return;
      if (active) socket.to(state.privateRoom).emit("get-typing-status", true);
      else socket.to(state.privateRoom).emit("get-typing-status", false);
    });
  });

  io.listen(8080);
}

main();
