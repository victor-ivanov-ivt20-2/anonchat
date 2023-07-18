import io from "../socket";
import logger from "./logger";

export async function leavePrivateRoom(room: string): Promise<boolean> {
  try {
    const opponent = await io.in(room).fetchSockets();
    if (opponent.length) {
      opponent[0].leave(room);
      opponent[0].emit("opponent-left", true);
      return true;
    }
    return false;
  } catch (e) {
    logger.error(e);
    return false;
  }
}
