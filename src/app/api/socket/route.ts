import { Server } from "socket.io";
import { NextResponse } from "next/server";

export async function GET() {
  if ((global as { io?: Server }).io) {
    return new NextResponse("Socket.io server already running", { status: 200 });
  }

  const io = new Server({
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  (global as { io?: Server }).io = io;

  io.on("connection", (socket) => {
    console.log("Nouvelle connexion:", socket.id);

    socket.on("message", (message) => {
      io.emit("message", message);
    });

    socket.on("disconnect", () => {
      console.log("Client déconnecté:", socket.id);
    });
  });

  io.listen(3001);

  return new NextResponse("Socket.io server started", { status: 200 });
}