import { Router } from "express";
import { ComplejoController } from "../controllers/complejo.controller";
import { ComplejoService } from "../services/complejo.service";
import { prisma } from "../config/prisma";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// Instanciar servicio y controlador
const complejoService = new ComplejoService(prisma);
const complejoController = new ComplejoController(complejoService);

// Rutas públicas
router.get("/", complejoController.findAll.bind(complejoController));
router.get("/barrio/:barrio", complejoController.findByBarrio.bind(complejoController));
router.get("/:id", complejoController.findById.bind(complejoController));

// Rutas protegidas - usuario autenticado
router.get("/admin/:adminId", authenticate, complejoController.getByAdmin.bind(complejoController));

// Rutas protegidas - solo ADMIN y SUPERADMIN
router.post("/", authenticate, authorize("ADMIN", "SUPERADMIN"), complejoController.create.bind(complejoController));
router.put("/:id", authenticate, authorize("ADMIN", "SUPERADMIN"), complejoController.update.bind(complejoController));
router.delete("/:id", authenticate, authorize("ADMIN", "SUPERADMIN"), complejoController.delete.bind(complejoController));

export default router;