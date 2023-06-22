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
  is_talk: boolean;
  search: Search;
}
async function main() {
  let new_room: number = 0;
  io.on("connect", (socket) => {
    socket.leave(socket.id);

    const state: State = {
      current_room: undefined,
      is_talk: false,
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
        state.is_talk = true;
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
          state.is_talk = true;
          socket.data = state;
        }
        console.log("rooms", rooms);
      } catch {
        if (state.current_room) socket.leave(state.current_room);
      }
    });

    socket.on("leave-conversation", () => {
      if (!state.current_room) return;
      const current_room = state.current_room;
      const rooms = io.sockets.adapter.rooms;
      const IterClient = rooms.get(state.current_room)?.keys();
      if (!IterClient) return;
      const clients = Array.from(IterClient);
      clients.forEach((id) => {
        const client = io.sockets.sockets.get(id);
        client?.leave(current_room);
        if (client?.data !== null && client?.data !== undefined) {
          const default_data: State = {
            search: { sex: undefined },
            is_talk: false,
            current_room: undefined,
          };
          client!.data = default_data;
        }
      });
      console.log("rooms", rooms);
      console.log("clients", clients);
    });

    socket.on("send-message", (message) => {
      console.log("rooms", io.sockets.adapter.rooms);
      if (state.is_talk && typeof state.current_room === "string") {
        socket.broadcast
          .to(state.current_room)
          .emit("receive-message", message);
      }
    });
  });

  io.listen(8080);
}

main();
