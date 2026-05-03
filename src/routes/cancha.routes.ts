import { Router } from "express";
import { CanchaController } from "../controllers/cancha.controller";
import { CanchaService } from "../services/cancha.service";
import { prisma } from "../config/prisma";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// Instanciar servicio y controlador
const canchaService = new CanchaService(prisma);
const canchaController = new CanchaController(canchaService);

// Rutas públicas
router.get("/", canchaController.findAll.bind(canchaController));
router.get("/complejo/:complejoId", canchaController.findByComplejo.bind(canchaController));
router.get("/disponibles/:complejoId", canchaController.findAvailable.bind(canchaController));
router.get("/:id", canchaController.findById.bind(canchaController));

// Rutas protegidas - solo ADMIN y SUPERADMIN
router.post("/", authenticate, authorize("ADMIN", "SUPERADMIN"), canchaController.create.bind(canchaController));
router.put("/:id", authenticate, authorize("ADMIN", "SUPERADMIN"), canchaController.update.bind(canchaController));
router.delete("/:id", authenticate, authorize("ADMIN", "SUPERADMIN"), canchaController.delete.bind(canchaController));

export default router;