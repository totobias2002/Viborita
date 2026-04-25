import { Router } from "express";
import { HealthController } from "../controllers/health.controller";

const router = Router();
const healthController = new HealthController();

router.get("/", healthController.getRoot);
router.get("/health/db", healthController.getDatabaseHealth);

export default router;
