import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { prisma } from "../config/prisma";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Instanciar servicio y controlador
const authService = new AuthService(prisma);
const authController = new AuthController(authService);

// Rutas públicas
router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));

// Rutas protegidas
router.get("/profile", authenticate, authController.getProfile.bind(authController));
router.post("/change-password", authenticate, authController.changePassword.bind(authController));

export default router;