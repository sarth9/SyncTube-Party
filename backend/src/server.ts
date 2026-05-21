import http from "http";
import { Server } from "socket.io";
import { app } from "./app";
import { socketCorsOptions } from "./config/cors.config";
import { allowedOrigins, env } from "./config/env.config";
import { connectDatabase } from "./db/connect";
import { registerSocketHandlers } from "./socket/socketHandler";

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: socketCorsOptions,
  transports: ["websocket", "polling"],
});

registerSocketHandlers(io);

async function startServer(): Promise<void> {
  try {
    await connectDatabase(env.MONGODB_URI);

    httpServer.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
      console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

function shutdown(signal: string): void {
  console.log(`${signal} received. Shutting down server...`);

  io.close(() => {
    console.log("Socket.IO server closed.");
  });

  httpServer.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();