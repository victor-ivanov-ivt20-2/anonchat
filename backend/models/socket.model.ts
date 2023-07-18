import { UserModel, SeekerModel } from "./user.model";

export interface ServerToClientEvents {
  "room-found": (status: boolean) => void;
  "get-typing-status": (status: boolean) => void;
  "receive-message": (message: string) => void;
  "get-online-users": (count: number) => void;
  "opponent-left": (status: boolean) => void;
}

export interface ClientToServerEvents {
  "search-opponent": (seeker: SeekerModel) => void;
  "leave-opponent": () => void;
  "get-online": () => void;
  "send-message": (message: string) => void;
  "typing-message": (active: boolean) => void;
}

export interface InterServerEvents {}

export interface SocketData extends UserModel {}
