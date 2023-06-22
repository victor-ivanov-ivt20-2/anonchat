import { Server } from "socket.io";
const io = new Server({
  cors: {
    origin: "*",
  },
  pingTimeout: 60000,
});
interface Search {
  sex: "Male" | "Female" | undefined;
}
interface State {
  current_room: string | undefined;
  active_search: boolean;
  search: Search;
}
async function main() {
  let new_room: number = 0;
  io.on("connect", (socket) => {
    socket.leave(socket.id);

    const state: State = {
      current_room: undefined,
      active_search: false,
      search: { sex: undefined },
    };

    socket.data = state;

    socket.emit("check", socket.id);

    socket.on("init", () => {
      socket.leave(socket.id);
    });

    socket.on("search-room", async () => {
      if (state.current_room === undefined) {
        new_room++;
        socket.join(new_room.toString());
        state.current_room = new_room.toString();
        state.search.sex = "Male";
        socket.data = state;
      }
      try {
        const sockets = await io.fetchSockets();
        const rooms = io.sockets.adapter.rooms;
        for (let i = 0; i < sockets.length; i++) {
          const current_room = sockets[i].data?.current_room;
          const clientID = rooms.get(current_room);
          if (socket.id === sockets[i].id) continue;
          if (!state.current_room) continue;
          if (clientID?.size !== 1) continue;
          socket.leave(state.current_room);
          state.current_room = current_room;
          socket.join(current_room);
          socket.data = state;
        }
      } catch {
        if (state.current_room) socket.leave(state.current_room);
      }
    });

    socket.on("send-message", (message) => {
      if (typeof state.current_room === "string") {
        socket.broadcast
          .to(state.current_room)
          .emit("receive-message", message);
      }
    });
  });

  io.listen(8080);
}

main();
