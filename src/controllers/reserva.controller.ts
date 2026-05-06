import { Request, Response } from "express";
import {
  ReservaService,
  CreateReservaDTO,
  UpdateReservaDTO,
} from "../services/reserva.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export class ReservaController {
  private reservaService: ReservaService;

  constructor(reservaService: ReservaService) {
    this.reservaService = reservaService;
  }

  async findAll(req: Request, res: Response) {
    try {
      const reservas = await this.reservaService.findAll();
      res.json(reservas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const reserva = await this.reservaService.findById(id as string);

      if (!reserva) {
        res.status(404).json({ error: "Reserva no encontrada" });
        return;
      }

      res.json(reserva);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findGuestByToken(req: Request, res: Response) {
    try {
      const token = String(req.params.token);
      const reserva = await this.reservaService.findGuestByToken(token);

      if (!reserva) {
        res.status(404).json({ error: "Reserva no encontrada" });
        return;
      }

      res.json(reserva);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findByUser(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: "No autorizado" });
        return;
      }

      const reservas = await this.reservaService.findByUser(userId);
      res.json(reservas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findByCancha(req: Request, res: Response) {
    try {
      const canchaId = String(req.params.canchaId);
      const { fecha } = req.query;
      const parsedFechaRaw =
        typeof fecha === "string" ? this.parseFecha(fecha) : undefined;

      if (fecha && !parsedFechaRaw) {
        res
          .status(400)
          .json({ error: "La fecha debe tener formato valido YYYY-MM-DD" });
        return;
      }

      const parsedFecha = parsedFechaRaw ?? undefined;

      const reservas = await this.reservaService.findByCancha(
        canchaId,
        parsedFecha
      );

      res.json(reservas);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const data = req.body as CreateReservaDTO;

      if (!data.fecha || !data.horaInicio || !data.horaFin || !data.canchaId) {
        res.status(400).json({
          error: "Fecha, horaInicio, horaFin y canchaId son requeridos",
        });
        return;
      }

      const fecha = this.parseFecha(String(data.fecha));

      if (!fecha) {
        res
          .status(400)
          .json({ error: "La fecha debe tener formato valido YYYY-MM-DD" });
        return;
      }

      if (!this.isValidTimeRange(data.horaInicio, data.horaFin)) {
        res.status(400).json({
          error:
            "horaInicio y horaFin deben tener formato HH:mm y horaFin debe ser mayor",
        });
        return;
      }

      const invitadoNombre = this.normalizeOptionalText(data.invitadoNombre);
      const invitadoTelefono = this.normalizeOptionalText(data.invitadoTelefono);
      const invitadoEmail = this.normalizeOptionalText(data.invitadoEmail);

      if (!userId && (!invitadoNombre || !invitadoTelefono)) {
        res.status(400).json({
          error:
            "Para reservar sin cuenta debes enviar invitadoNombre e invitadoTelefono",
        });
        return;
      }

      if (invitadoEmail && !this.isValidEmail(invitadoEmail)) {
        res.status(400).json({
          error: "invitadoEmail debe tener un formato valido",
        });
        return;
      }

      const reserva = await this.reservaService.create({
        ...data,
        fecha,
        usuarioId: userId,
        invitadoNombre,
        invitadoTelefono,
        invitadoEmail,
      });

      res.status(201).json(reserva);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async cancel(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: "No autorizado" });
        return;
      }

      const reserva = await this.reservaService.cancel(id as string, userId);
      res.json(reserva);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async cancelGuest(req: Request, res: Response) {
    try {
      const token = String(req.params.token);
      const reserva = await this.reservaService.cancelGuestByToken(token);
      res.json(reserva);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.rol;

      if (!userId || !userRole) {
        res.status(401).json({ error: "No autorizado" });
        return;
      }

      const body = req.body as UpdateReservaDTO;
      const data: UpdateReservaDTO = { ...body };

      if (body.fecha) {
        const fecha = this.parseFecha(String(body.fecha));

        if (!fecha) {
          res
            .status(400)
            .json({ error: "La fecha debe tener formato valido YYYY-MM-DD" });
          return;
        }

        data.fecha = fecha;
      }

      const horaInicio = body.horaInicio;
      const horaFin = body.horaFin;

      if (
        (horaInicio && !this.isValidTime(horaInicio)) ||
        (horaFin && !this.isValidTime(horaFin))
      ) {
        res.status(400).json({
          error: "horaInicio y horaFin deben tener formato HH:mm",
        });
        return;
      }

      const reserva = await this.reservaService.update(id as string, data, {
        userId,
        userRole,
      });
      res.json(reserva);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async confirm(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.rol;

      if (!userId || !userRole) {
        res.status(401).json({ error: "No autorizado" });
        return;
      }

      const reserva = await this.reservaService.confirm(id as string, {
        userId,
        userRole,
      });
      res.json(reserva);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async complete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.rol;

      if (!userId || !userRole) {
        res.status(401).json({ error: "No autorizado" });
        return;
      }

      const reserva = await this.reservaService.complete(id as string, {
        userId,
        userRole,
      });
      res.json(reserva);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  private parseFecha(fecha: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return null;
    }

    const parsed = new Date(`${fecha}T00:00:00`);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private isValidTime(hora: string): boolean {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(hora);
  }

  private isValidTimeRange(horaInicio: string, horaFin: string): boolean {
    return (
      this.isValidTime(horaInicio) &&
      this.isValidTime(horaFin) &&
      this.isEndTimeAfterStartTime(horaInicio, horaFin)
    );
  }

  private isEndTimeAfterStartTime(
    horaInicio: string,
    horaFin: string
  ): boolean {
    return horaInicio < horaFin;
  }

  private normalizeOptionalText(value?: string): string | undefined {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
