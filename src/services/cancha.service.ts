import { PrismaClient, Cancha, CourtType } from "@prisma/client";

export interface CreateCanchaDTO {
  nombre: string;
  tipo: CourtType;
  precio: number;
  descripcion?: string;
  techada?: boolean;
  iluminacion?: boolean;
  complejoId: string;
}

export interface UpdateCanchaDTO {
  nombre?: string;
  tipo?: CourtType;
  precio?: number;
  descripcion?: string;
  techada?: boolean;
  iluminacion?: boolean;
  activa?: boolean;
}

export class CanchaService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(): Promise<Cancha[]> {
    return this.prisma.cancha.findMany({
      where: { activa: true },
      include: {
        complejo: {
          select: { id: true, nombre: true, direccion: true, barrio: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string): Promise<Cancha | null> {
    return this.prisma.cancha.findUnique({
      where: { id },
      include: {
        complejo: true,
        reservas: {
          where: {
            fecha: { gte: new Date() },
            estado: { in: ["PENDIENTE", "CONFIRMADA"] },
          },
          orderBy: { fecha: "asc" },
          take: 10,
        },
      },
    });
  }

  async findByComplejo(complejoId: string): Promise<Cancha[]> {
    return this.prisma.cancha.findMany({
      where: { complejoId, activa: true },
      orderBy: { nombre: "asc" },
    });
  }

  async findAvailable(
    complejoId: string,
    fecha: Date,
    horaInicio?: string,
    horaFin?: string
  ): Promise<Cancha[]> {
    const complejo = await this.prisma.complejo.findUnique({
      where: { id: complejoId },
      include: {
        canchas: {
          where: { activa: true },
        },
      },
    });

    if (!complejo) {
      throw new Error("Complejo no encontrado");
    }

    // Filtrar canchas que no tengan reservas en el horario indicado
    const canchasDisponibles: Cancha[] = [];

    for (const cancha of complejo.canchas) {
      const reservaConflicto = await this.prisma.reserva.findFirst({
        where: {
          canchaId: cancha.id,
          fecha: {
            gte: new Date(fecha.setHours(0, 0, 0, 0)),
            lt: new Date(fecha.setHours(23, 59, 59, 999)),
          },
          estado: { in: ["PENDIENTE", "CONFIRMADA"] },
          OR: [
            {
              horaInicio: {
                lte: horaInicio ? new Date(`1970-01-01T${horaInicio}:00`) : undefined,
              },
              horaFin: {
                gt: horaInicio ? new Date(`1970-01-01T${horaInicio}:00`) : undefined,
              },
            },
            {
              horaInicio: {
                lt: horaFin ? new Date(`1970-01-01T${horaFin}:00`) : undefined,
              },
              horaFin: {
                gte: horaFin ? new Date(`1970-01-01T${horaFin}:00`) : undefined,
              },
            },
          ],
        },
      });

      if (!reservaConflicto) {
        canchasDisponibles.push(cancha);
      }
    }

    return canchasDisponibles;
  }

  async create(data: CreateCanchaDTO): Promise<Cancha> {
    // Verificar que el complejo existe
    const complejo = await this.prisma.complejo.findUnique({
      where: { id: data.complejoId },
    });

    if (!complejo) {
      throw new Error("Complejo no encontrado");
    }

    // Verificar nombre único dentro del complejo
    const existingCancha = await this.prisma.cancha.findUnique({
      where: {
        complejoId_nombre: {
          complejoId: data.complejoId,
          nombre: data.nombre,
        },
      },
    });

    if (existingCancha) {
      throw new Error("Ya existe una cancha con ese nombre en este complejo");
    }

    return this.prisma.cancha.create({
      data: {
        ...data,
        precio: data.precio,
      },
    });
  }

  async update(id: string, data: UpdateCanchaDTO): Promise<Cancha> {
    return this.prisma.cancha.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    // Soft delete - marcar como inactiva
    await this.prisma.cancha.update({
      where: { id },
      data: { activa: false },
    });
  }
}