import { Request, Response } from "express";
import {
  CanchaService,
  CreateCanchaDTO,
  UpdateCanchaDTO,
} from "../services/cancha.service";

export class CanchaController {
  private canchaService: CanchaService;

  constructor(canchaService: CanchaService) {
    this.canchaService = canchaService;
  }

  async findAll(req: Request, res: Response) {
    try {
      const canchas = await this.canchaService.findAll();
      res.json(canchas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const cancha = await this.canchaService.findById(id);

      if (!cancha) {
        res.status(404).json({ error: "Cancha no encontrada" });
        return;
      }

      res.json(cancha);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findByComplejo(req: Request, res: Response) {
    try {
      const complejoId = String(req.params.complejoId);
      const canchas = await this.canchaService.findByComplejo(complejoId);
      res.json(canchas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findAvailable(req: Request, res: Response) {
    try {
      const complejoId = String(req.params.complejoId);
      const { fecha, horaInicio, horaFin } = req.query;

      if (!fecha) {
        res.status(400).json({ error: "Fecha es requerida" });
        return;
      }

      const canchas = await this.canchaService.findAvailable(
        complejoId,
        new Date(fecha as string),
        horaInicio as string,
        horaFin as string
      );

      res.json(canchas);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = req.body as CreateCanchaDTO;

      if (
        !data.nombre ||
        !data.tipo ||
        !data.precio ||
        !data.complejoId
      ) {
        res.status(400).json({
          error: "Nombre, tipo, precio y complejoId son requeridos",
        });
        return;
      }

      const cancha = await this.canchaService.create(data);
      res.status(201).json(cancha);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const data = req.body as UpdateCanchaDTO;

      const cancha = await this.canchaService.update(id, data);
      res.json(cancha);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      await this.canchaService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}