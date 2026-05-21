import cors from "cors";
import express, {
  NextFunction,
  Request,
  Response,
} from "express";
import { corsOptions } from "./config/cors.config";
import { allowedOrigins, env } from "./config/env.config";
import roomRoutes from "./routes/room.routes";

export const app = express();

app.use(cors(corsOptions));

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "YouTube Watch Party API is running",
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    allowedOrigins,
  });
});

app.use("/api/rooms", roomRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

app.use(
  (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error("API error:", error);

    res.status(500).json({
      success: false,
      message:
        env.NODE_ENV === "production"
          ? "Internal server error."
          : error.message,
    });
  }
);