import { Router } from "express";
import { HealthController } from "../controllers/health.controller";
import authRoutes from "./auth.routes";
import complejoRoutes from "./complejo.routes";
import canchaRoutes from "./cancha.routes";
import reservaRoutes from "./reserva.routes";

const router = Router();
const healthController = new HealthController();

router.get("/", healthController.getRoot);
router.get("/health/db", healthController.getDatabaseHealth);

// Rutas API
router.use("/auth", authRoutes);
router.use("/complejos", complejoRoutes);
router.use("/canchas", canchaRoutes);
router.use("/reservas", reservaRoutes);

export default router;
