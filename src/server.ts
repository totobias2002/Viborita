import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log("Base de datos conectada correctamente.");

    app.listen(env.port, () => {
      console.log(`Servidor escuchando en http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar Viborita.", error);
    process.exit(1);
  }
}

void bootstrap();
