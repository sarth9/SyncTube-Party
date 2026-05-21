export function generateRoomCode(length = 6): string {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let roomCode = "";

  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    roomCode += characters[randomIndex];
  }

  return roomCode;
}