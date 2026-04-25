import { Request, Response, NextFunction } from "express";
import { HealthService } from "../services/health.service";

const healthService = new HealthService();

export class HealthController {
  async getRoot(_req: Request, res: Response, next: NextFunction) {
    try {
      const status = await healthService.getApiStatus();
      res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  }

  async getDatabaseHealth(_req: Request, res: Response, next: NextFunction) {
    try {
      const status = await healthService.getDatabaseStatus();
      res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  }
}
