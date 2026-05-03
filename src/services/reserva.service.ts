import { PrismaClient, Reserva, ReservationStatus } from "@prisma/client";

export interface CreateReservaDTO {
  fecha: Date;
  horaInicio: string; // Formato "HH:mm"
  horaFin: string; // Formato "HH:mm"
  canchaId: string;
  usuarioId: string;
  notas?: string;
}

export interface UpdateReservaDTO {
  fecha?: Date;
  horaInicio?: string;
  horaFin?: string;
  notas?: string;
}

export class ReservaService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(): Promise<Reserva[]> {
    return this.prisma.reserva.findMany({
      include: {
        usuario: {
          select: { id: true, nombre: true, email: true, telefono: true },
        },
        cancha: {
          include: {
            complejo: {
              select: { id: true, nombre: true, direccion: true },
            },
          },
        },
      },
      orderBy: { fecha: "desc" },
    });
  }

  async findById(id: string): Promise<Reserva | null> {
    return this.prisma.reserva.findUnique({
      where: { id },
      include: {
        usuario: {
          select: { id: true, nombre: true, email: true, telefono: true },
        },
        cancha: {
          include: {
            complejo: true,
          },
        },
      },
    });
  }

  async findByUser(usuarioId: string): Promise<Reserva[]> {
    return this.prisma.reserva.findMany({
      where: { usuarioId },
      include: {
        cancha: {
          include: {
            complejo: {
              select: { id: true, nombre: true, direccion: true },
            },
          },
        },
      },
      orderBy: { fecha: "desc" },
    });
  }

  async findByCancha(canchaId: string, fecha?: Date): Promise<Reserva[]> {
    return this.prisma.reserva.findMany({
      where: {
        canchaId,
        ...(fecha
          ? {
              fecha: {
                gte: new Date(fecha.setHours(0, 0, 0, 0)),
                lt: new Date(fecha.setHours(23, 59, 59, 999)),
              },
            }
          : {}),
        estado: { in: ["PENDIENTE", "CONFIRMADA"] },
      },
      orderBy: { horaInicio: "asc" },
    });
  }

  async create(data: CreateReservaDTO): Promise<Reserva> {
    // Verificar que la cancha existe y está activa
    const cancha = await this.prisma.cancha.findUnique({
      where: { id: data.canchaId },
    });

    if (!cancha || !cancha.activa) {
      throw new Error("Cancha no disponible");
    }

    // Verificar conflicto de horario
    const hasConflict = await this.checkConflict(
      data.canchaId,
      data.fecha,
      data.horaInicio,
      data.horaFin
    );

    if (hasConflict) {
      throw new Error("La cancha ya está reservada en ese horario");
    }

    // Calcular precio total
    const precioTotal = this.calculatePrice(
      Number(cancha.precio),
      data.horaInicio,
      data.horaFin
    );

    // Convertir horas a DateTime
    const [horaInicio, horaFin] = this.parseHours(
      data.horaInicio,
      data.horaFin
    );

    return this.prisma.reserva.create({
      data: {
        fecha: data.fecha,
        horaInicio,
        horaFin,
        precioTotal,
        notas: data.notas,
        usuarioId: data.usuarioId,
        canchaId: data.canchaId,
        estado: ReservationStatus.PENDIENTE,
      },
      include: {
        usuario: {
          select: { id: true, nombre: true, email: true },
        },
        cancha: {
          include: {
            complejo: {
              select: { id: true, nombre: true },
            },
          },
        },
      },
    });
  }

  async cancel(id: string, usuarioId: string): Promise<Reserva> {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id },
    });

    if (!reserva) {
      throw new Error("Reserva no encontrada");
    }

    if (reserva.usuarioId !== usuarioId) {
      throw new Error("No tienes permiso para cancelar esta reserva");
    }

    if (reserva.estado === ReservationStatus.CANCELADA) {
      throw new Error("La reserva ya está cancelada");
    }

    if (reserva.estado === ReservationStatus.COMPLETADA) {
      throw new Error("No puedes cancelar una reserva completada");
    }

    return this.prisma.reserva.update({
      where: { id },
      data: { estado: ReservationStatus.CANCELADA },
    });
  }

  async update(id: string, data: UpdateReservaDTO): Promise<Reserva> {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id },
    });

    if (!reserva) {
      throw new Error("Reserva no encontrada");
    }

    if (reserva.estado !== ReservationStatus.PENDIENTE) {
      throw new Error("Solo puedes modificar reservas pendientes");
    }

    // Si cambia horario, verificar conflicto
    if (data.horaInicio || data.horaFin) {
      const hasConflict = await this.checkConflict(
        reserva.canchaId,
        data.fecha || reserva.fecha,
        data.horaInicio || this.formatTime(reserva.horaInicio),
        data.horaFin || this.formatTime(reserva.horaFin),
        id
      );

      if (hasConflict) {
        throw new Error("La cancha ya está reservada en ese horario");
      }
    }

    const updateData: any = { ...data };

    if (data.horaInicio && data.horaFin) {
      const [horaInicio, horaFin] = this.parseHours(
        data.horaInicio,
        data.horaFin
      );
      updateData.horaInicio = horaInicio;
      updateData.horaFin = horaFin;
    }

    return this.prisma.reserva.update({
      where: { id },
      data: updateData,
    });
  }

  async confirm(id: string): Promise<Reserva> {
    return this.prisma.reserva.update({
      where: { id },
      data: { estado: ReservationStatus.CONFIRMADA },
    });
  }

  async complete(id: string): Promise<Reserva> {
    return this.prisma.reserva.update({
      where: { id },
      data: { estado: ReservationStatus.COMPLETADA },
    });
  }

  private async checkConflict(
    canchaId: string,
    fecha: Date,
    horaInicio: string,
    horaFin: string,
    excludeId?: string
  ): Promise<boolean> {
    const [inicio, fin] = this.parseHours(horaInicio, horaFin);

    const conflicting = await this.prisma.reserva.findFirst({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        canchaId,
        fecha: {
          gte: new Date(fecha.setHours(0, 0, 0, 0)),
          lt: new Date(fecha.setHours(23, 59, 59, 999)),
        },
        estado: { in: ["PENDIENTE", "CONFIRMADA"] },
        OR: [
          {
            horaInicio: { lte: inicio },
            horaFin: { gt: inicio },
          },
          {
            horaInicio: { lt: fin },
            horaFin: { gte: fin },
          },
          {
            horaInicio: { gte: inicio },
            horaFin: { lte: fin },
          },
        ],
      },
    });

    return !!conflicting;
  }

  private parseHours(horaInicio: string, horaFin: string): [Date, Date] {
    const hoy = new Date();
    const [hiH, hiM] = horaInicio.split(":").map(Number);
    const [hfH, hfM] = horaFin.split(":").map(Number);

    const inicio = new Date(hoy);
    inicio.setHours(hiH, hiM, 0, 0);

    const fin = new Date(hoy);
    fin.setHours(hfH, hfM, 0, 0);

    return [inicio, fin];
  }

  private formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  private calculatePrice(
    precioPorHora: number,
    horaInicio: string,
    horaFin: string
  ): number {
    const [hiH, hiM] = horaInicio.split(":").map(Number);
    const [hfH, hfM] = horaFin.split(":").map(Number);

    const horas =
      hfH - hiH + (hfM - hiM) / 60;

    return Number((precioPorHora * horas).toFixed(2));
  }
}