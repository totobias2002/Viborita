import { Request, Response } from "express";
import { AuthService, RegisterDTO, LoginDTO } from "../services/auth.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async register(req: Request, res: Response) {
    try {
      const data = req.body as RegisterDTO;

      if (!data.nombre || !data.email || !data.password) {
        res.status(400).json({
          error: "Nombre, email y password son requeridos",
        });
        return;
      }

      const result = await this.authService.register(data);

      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data = req.body as LoginDTO;

      if (!data.email || !data.password) {
        res.status(400).json({
          error: "Email y password son requeridos",
        });
        return;
      }

      const result = await this.authService.login(data);

      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: "No autorizado" });
        return;
      }

      const user = await this.authService.getProfile(userId);

      res.json(user);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async changePassword(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: "No autorizado" });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          error: "Contraseña actual y nueva son requeridas",
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          error: "La nueva contraseña debe tener al menos 6 caracteres",
        });
        return;
      }

      await this.authService.changePassword(userId, currentPassword, newPassword);

      res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
