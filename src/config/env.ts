import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.PORT ?? 3000);

if (Number.isNaN(port) || port <= 0) {
  throw new Error("PORT debe ser un numero positivo.");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no esta definida en las variables de entorno.");
}

// JWT Configuration
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? "7d";

if (!jwtSecret) {
  console.warn("⚠️  Advertencia: JWT_SECRET no está definido. Usando valor por defecto (NO usar en producción).");
}

export const env = {
  port,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: jwtSecret ?? "default-insecure-secret-change-me",
  jwtExpiresIn,
};
