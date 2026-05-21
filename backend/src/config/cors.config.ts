import type { CorsOptions } from "cors";
import { allowedOrigins } from "./env.config";

export function isAllowedOrigin(origin: string | undefined): boolean {
  /*
    Browser requests send Origin.
    Postman, curl, Render health checks may not send Origin.
  */
  if (!origin) {
    return true;
  }

  return allowedOrigins.includes(origin);
}

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

export const socketCorsOptions = {
  origin(origin: string | undefined, callback: (error: Error | null, success?: boolean) => void) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Socket.IO CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST"],
  credentials: true,
};