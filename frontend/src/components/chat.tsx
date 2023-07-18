import { ChangeEvent, useEffect, useRef, useState } from "react";
import { socket } from "../socket";

interface FormValues {
  himself: {
    sex?: string;
    age?: number;
  };
  opponent: {
    sex?: string;
    age: {
      from?: number;
      to?: number;
    };
  };
}

const initFormValues: FormValues = {
  himself: {
    sex: undefined,
    age: undefined,
  },
  opponent: {
    sex: undefined,
    age: {
      from: undefined,
      to: undefined,
    },
  },
};

const Chat = () => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);
  const [typingStatus, setTypingStatus] = useState<boolean>(false);
  const [isUserTyping, setUserTyping] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [isRoomFound, setRoomFound] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<FormValues>(initFormValues);
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

    const onRoomFound = (isRoomFound: boolean) => {
      setRoomFound(isRoomFound);
    };

    const onOpponentLeft = (status: boolean) => {
      setRoomFound(!status);
    };

    socket.on("connection", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive-message", onReceiveMessage);
    socket.on("get-typing-status", onGetTypingStatus);
    socket.on("get-online-users", onGetOnlineUsers);
    socket.on("room-found", onRoomFound);
    socket.on("opponent-left", onOpponentLeft);
    return () => {
      socket.off("connection", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive-message", onReceiveMessage);
      socket.off("get-typing-status", onGetTypingStatus);
      socket.off("get-online-users", onGetOnlineUsers);
      socket.off("room-found", onRoomFound);
      socket.off("opponent-left", onOpponentLeft);
    };
  }, [socket, messages]);

  const onMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const findOpponent = (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      formValues.himself.age &&
      formValues.himself.sex &&
      formValues.opponent.age.from &&
      formValues.opponent.age.to &&
      formValues.opponent.sex
    ) {
      socket.emit("search-opponent", formValues);
    }
  };

  const leaveRoom = () => {
    socket.emit("leave-opponent");
  };

  const sendMessage = () => {
    setMessages([...messages, message]);
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
      socket.emit("typing-message", false);
      setUserTyping(false);
    }
    socket.emit("send-message", message);
    setMessage("");
  };

  useEffect(() => {
    if (!message) return;
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    } else if (!timer.current && !isUserTyping) {
      setUserTyping(true);
      socket.emit("typing-message", true);
    }
    timer.current = setTimeout(() => {
      timer.current = null;
      socket.emit("typing-message", false);
      setUserTyping(false);
    }, 1500);
  }, [message]);

  useEffect(() => {
    if (isRoomFound) {
      if (onlineTimer.current) clearInterval(onlineTimer.current);
      onlineTimer.current = null;
      return;
    }
    socket.emit("get-online");
    onlineTimer.current = setInterval(() => {
      socket.emit("get-online");
    }, 5000);
  }, [isRoomFound]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center",
        margin: "200px 0",
        border: "2px solid black",
        justifyContent: "center",
        width: "500px",
        padding: "20px",
      }}
    >
      {isRoomFound ? (
        <>
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
          <button onClick={leaveRoom}>Leave</button>
        </>
      ) : (
        <>
          <button
            onClick={() => {
              setFormValues({
                himself: { age: 20, sex: "Male" },
                opponent: { age: { from: 18, to: 99 }, sex: "Female" },
              });
            }}
          >
            male
          </button>
          <button
            onClick={() => {
              setFormValues({
                himself: { age: 20, sex: "Female" },
                opponent: { age: { from: 18, to: 99 }, sex: "Male" },
              });
            }}
          >
            female
          </button>
          <form className="flex gap-5" onSubmit={findOpponent}>
            <div className="flex flex-col gap-2">
              <input
                type="number"
                value={formValues.himself.age}
                onChange={(e) => {
                  const age = formValues;
                  age["himself"]["age"] = Number(e.target.value);
                  setFormValues(age);
                }}
              />
              <select
                defaultValue={
                  formValues.himself.sex ? formValues.himself.sex : ""
                }
                onChange={(e) => {
                  const sex = formValues;
                  sex["himself"]["sex"] = e.target.value;
                  setFormValues(sex);
                }}
              >
                <option value="Male">Мужской</option>
                <option value="Female">Женский</option>
                <option value="">Не выбрано</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="number"
                onChange={(e) => {
                  const age = formValues;
                  age["opponent"]["age"]["from"] = Number(e.target.value);
                  setFormValues(age);
                }}
              />
              <input
                type="number"
                onChange={(e) => {
                  const age = formValues;
                  age["opponent"]["age"]["to"] = Number(e.target.value);
                  setFormValues(age);
                }}
              />

              <select
                defaultValue={
                  formValues.himself.sex ? formValues.himself.sex : ""
                }
                onChange={(e) => {
                  const sex = formValues;
                  sex["opponent"]["sex"] = e.target.value;
                  setFormValues(sex);
                }}
              >
                <option value="Male">Мужской</option>
                <option value="Female">Женский</option>
                <option value="">Не выбрано</option>
              </select>
            </div>
            <button
              style={{ border: "1px solid black", padding: "5px 10px" }}
              type="submit"
            >
              поиск
            </button>
          </form>
          Онлайн: {onlineUsers}
        </>
      )}
    </div>
  );
};

export default Chat;
