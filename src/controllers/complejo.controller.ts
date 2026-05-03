import { Request, Response } from "express";
import {
  ComplejoService,
  CreateComplejoDTO,
  UpdateComplejoDTO,
} from "../services/complejo.service";

export class ComplejoController {
  private complejoService: ComplejoService;

  constructor(complejoService: ComplejoService) {
    this.complejoService = complejoService;
  }

  async findAll(req: Request, res: Response) {
    try {
      const complejos = await this.complejoService.findAll();
      res.json(complejos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const complejo = await this.complejoService.findById(id);

      if (!complejo) {
        res.status(404).json({ error: "Complejo no encontrado" });
        return;
      }

      res.json(complejo);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findByBarrio(req: Request, res: Response) {
    try {
      const barrio = String(req.params.barrio);
      const complejos = await this.complejoService.findByBarrio(barrio);
      res.json(complejos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = req.body as CreateComplejoDTO;

      if (!data.nombre || !data.direccion || !data.barrio || !data.adminId) {
        res.status(400).json({
          error: "Nombre, dirección, barrio y adminId son requeridos",
        });
        return;
      }

      const complejo = await this.complejoService.create(data);
      res.status(201).json(complejo);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const data = req.body as UpdateComplejoDTO;

      const complejo = await this.complejoService.update(id, data);
      res.json(complejo);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      await this.complejoService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getByAdmin(req: Request, res: Response) {
    try {
      const adminId = String(req.params.adminId);
      const complejos = await this.complejoService.getByAdmin(adminId);
      res.json(complejos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}