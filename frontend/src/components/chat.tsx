import { ChangeEvent, useEffect, useRef, useState } from "react";
import { socket } from "../socket";

const Chat = () => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);
  const [typingStatus, setTypingStatus] = useState<boolean>(false);
  const [isUserTyping, setUserTyping] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const onlineTimer = useRef<NodeJS.Timer | null>(null);

  useEffect(() => {
    const onConnect = () => {};

    const onDisconnect = () => {
      if (onlineTimer.current) {
        clearInterval(onlineTimer.current);
        onlineTimer.current = null;
      }
    };

    const onReceiveMessage = (msg: string) => {
      setMessages([...messages, msg]);
    };

    const onGetTypingStatus = (status: boolean) => {
      setTypingStatus(status);
    };

    const onGetOnlineUsers = (users: number) => {
      setOnlineUsers(users);
    };

    socket.on("connection", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive-message", onReceiveMessage);
    socket.on("get-typing-status", onGetTypingStatus);
    socket.on("get-online-users", onGetOnlineUsers);
    return () => {
      socket.off("connection", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive-message", onReceiveMessage);
      socket.off("get-typing-status", onGetTypingStatus);
      socket.off("get-online-users", onGetOnlineUsers);
    };
  }, [socket, messages]);

  const onMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const sendMessage = () => {
    setMessages([...messages, message]);
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
      socket.emit("typing", false);
      setUserTyping(false);
    }
    socket.emit("send-message", message);
  };

  useEffect(() => {
    if (!message) return;
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    } else if (!timer.current && !isUserTyping) {
      setUserTyping(true);
      socket.emit("typing", true);
    }
    timer.current = setTimeout(() => {
      timer.current = null;
      socket.emit("typing", false);
      setUserTyping(false);
    }, 1500);
  }, [message]);

  useEffect(() => {
    socket.emit("get-online");
    onlineTimer.current = setInterval(() => {
      socket.emit("get-online");
    }, 5000);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center",
      }}
    >
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
      {typingStatus ? "Пользователь печатает" : ""}
      <input type="text" value={message} onChange={onMessageChange} />
      <button onClick={sendMessage}>Send</button>
      <button
        onClick={() => {
          socket.emit("search-opponent");
        }}
      >
        поиск
      </button>
      {onlineUsers}
    </div>
  );
};

export default Chat;
