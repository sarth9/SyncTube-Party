import dotenv from "dotenv";

dotenv.config();

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(`${name} is required in backend .env file.`);
  }

  return value.trim();
}

function getOptionalEnv(name: string, fallback: string): string {
  const value = process.env[name];

  if (!value || !value.trim()) {
    return fallback;
  }

  return value.trim();
}

export const env = {
  NODE_ENV: getOptionalEnv("NODE_ENV", "development"),
  PORT: Number(process.env.PORT) || 5000,
  MONGODB_URI: getRequiredEnv("MONGODB_URI"),
  CLIENT_URL: getOptionalEnv("CLIENT_URL", "http://localhost:5173"),
};

export const allowedOrigins = env.CLIENT_URL.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);