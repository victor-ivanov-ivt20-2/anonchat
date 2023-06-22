import { useEffect, useState } from "react";
import { socket } from "../socket";
const Test = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);
  const [room, setRoom] = useState("");
  const [myRoom, setMyRoom] = useState("");
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }
    function onReceiveMessage(msg: string) {
      setMessages([...messages, msg]);
    }
    function onCheck(room: string) {
      setMyRoom(room);
    }
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive-message", onReceiveMessage);
    socket.on("check", onCheck);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive-message", onReceiveMessage);
      socket.off("check", onCheck);
    };
  }, [socket, messages]);

  function connect() {
    socket.connect();
  }

  function disconnect() {
    socket.disconnect();
  }

  function sendMessage() {
    setMessages([...messages]);
    socket.emit("send-message", message);
  }

  const joinRoom = () => {
    socket.emit("create-room");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center",
      }}
    >
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          alignItems: "center",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
      {myRoom}
      <input
        type="text"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <button onClick={joinRoom}>отправиться</button>
      <button
        onClick={() => {
          socket.emit("search-room");
        }}
      >
        поиск
      </button>
    </div>
  );
};

export default Test;
