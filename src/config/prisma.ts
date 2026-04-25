import { PrismaClient } from "@prisma/client";

declare global {
  // Reutiliza la instancia en desarrollo para evitar multiples conexiones en reloads.
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  global.prismaGlobal ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}
