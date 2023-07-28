import { io } from "socket.io-client";

const URL = import.meta.env.PROD
  ? import.meta.env.BACKEND_URL
  : "ws://localhost:5000";
export const socket = io(URL);
