import { Router } from "express";
import { ReservaController } from "../controllers/reserva.controller";
import { ReservaService } from "../services/reserva.service";
import { prisma } from "../config/prisma";
import {
  authenticate,
  authorize,
  optionalAuthenticate,
} from "../middlewares/auth.middleware";

const router = Router();

// Instanciar servicio y controlador
const reservaService = new ReservaService(prisma);
const reservaController = new ReservaController(reservaService);

// Rutas publicas
router.get("/", reservaController.findAll.bind(reservaController));
router.get(
  "/guest/:token",
  reservaController.findGuestByToken.bind(reservaController)
);
router.get(
  "/cancha/:canchaId",
  reservaController.findByCancha.bind(reservaController)
);

// Rutas protegidas - cualquier usuario autenticado
router.get(
  "/mis-reservas",
  authenticate,
  reservaController.findByUser.bind(reservaController)
);
router.post(
  "/",
  optionalAuthenticate,
  reservaController.create.bind(reservaController)
);
router.put(
  "/:id",
  authenticate,
  reservaController.update.bind(reservaController)
);
router.patch(
  "/guest/:token/cancelar",
  reservaController.cancelGuest.bind(reservaController)
);
router.patch(
  "/:id/cancelar",
  authenticate,
  reservaController.cancel.bind(reservaController)
);

// Rutas protegidas - solo ADMIN y SUPERADMIN
router.patch(
  "/:id/confirmar",
  authenticate,
  authorize("ADMIN", "SUPERADMIN"),
  reservaController.confirm.bind(reservaController)
);
router.patch(
  "/:id/completar",
  authenticate,
  authorize("ADMIN", "SUPERADMIN"),
  reservaController.complete.bind(reservaController)
);

// Esta ruta va al final para no interceptar endpoints mas especificos.
router.get("/:id", reservaController.findById.bind(reservaController));

export default router;
