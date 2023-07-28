import { io } from "socket.io-client";
const URL = "ws://45.12.236.183:5000";
/*const URL = import.meta.env.PROD
  ? import.meta.env.BACKEND_URL
  : "ws://localhost:5000";
*/
export const socket = io(URL);
