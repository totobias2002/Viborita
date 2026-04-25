import { prisma } from "../config/prisma";

export class HealthService {
  async getApiStatus() {
    return {
      message: "Viborita API funcionando 🐍",
    };
  }

  async getDatabaseStatus() {
    await prisma.$queryRaw`SELECT 1`;

    return {
      database: "ok",
    };
  }
}
