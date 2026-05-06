import {
  Prisma,
  PrismaClient,
  Reserva,
  ReservationStatus,
  UserRole,
} from "@prisma/client";
import { randomBytes } from "crypto";

export interface CreateReservaDTO {
  fecha: Date;
  horaInicio: string; // Formato "HH:mm"
  horaFin: string; // Formato "HH:mm"
  canchaId: string;
  usuarioId?: string;
  invitadoNombre?: string;
  invitadoTelefono?: string;
  invitadoEmail?: string;
  notas?: string;
}

export interface UpdateReservaDTO {
  fecha?: Date;
  horaInicio?: string;
  horaFin?: string;
  notas?: string;
}

type ReservaWithRelations = Prisma.ReservaGetPayload<{
  include: {
    usuario: {
      select: { id: true; nombre: true; email: true; telefono: true };
    };
    cancha: {
      include: {
        complejo: true;
      };
    };
  };
}>;

interface ReservaActor {
  userId: string;
  userRole: string;
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

  async findById(id: string): Promise<ReservaWithRelations | null> {
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

  async findGuestByToken(token: string): Promise<ReservaWithRelations | null> {
    return this.prisma.reserva.findUnique({
      where: { invitadoToken: token },
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

    const createData: Prisma.ReservaUncheckedCreateInput = {
      fecha: data.fecha,
      horaInicio,
      horaFin,
      precioTotal,
      notas: data.notas,
      invitadoNombre: data.invitadoNombre,
      invitadoTelefono: data.invitadoTelefono,
      invitadoEmail: data.invitadoEmail,
      ...(data.usuarioId ? {} : { invitadoToken: this.generateGuestToken() }),
      canchaId: data.canchaId,
      estado: ReservationStatus.PENDIENTE,
      ...(data.usuarioId ? { usuarioId: data.usuarioId } : {}),
    };

    return this.prisma.reserva.create({
      data: createData,
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
      include: {
        cancha: {
          include: {
            complejo: true,
          },
        },
      },
    });

    if (!reserva) {
      throw new Error("Reserva no encontrada");
    }

    if (!reserva.usuarioId || reserva.usuarioId !== usuarioId) {
      throw new Error("No tienes permiso para cancelar esta reserva");
    }

    if (reserva.estado === ReservationStatus.CANCELADA) {
      throw new Error("La reserva ya está cancelada");
    }

    if (reserva.estado === ReservationStatus.COMPLETADA) {
      throw new Error("No puedes cancelar una reserva completada");
    }

    this.assertCancellationAllowed(reserva);

    return this.prisma.reserva.update({
      where: { id },
      data: { estado: ReservationStatus.CANCELADA },
    });
  }

  async cancelGuestByToken(token: string): Promise<Reserva> {
    const reserva = await this.prisma.reserva.findUnique({
      where: { invitadoToken: token },
      include: {
        cancha: {
          include: {
            complejo: true,
          },
        },
      },
    });

    if (!reserva) {
      throw new Error("Reserva no encontrada");
    }

    if (!reserva.invitadoToken) {
      throw new Error("Esta reserva no admite cancelacion de invitado");
    }

    if (reserva.estado === ReservationStatus.CANCELADA) {
      throw new Error("La reserva ya está cancelada");
    }

    if (reserva.estado === ReservationStatus.COMPLETADA) {
      throw new Error("No puedes cancelar una reserva completada");
    }

    this.assertCancellationAllowed(reserva);

    return this.prisma.reserva.update({
      where: { id: reserva.id },
      data: { estado: ReservationStatus.CANCELADA },
    });
  }

  async update(
    id: string,
    data: UpdateReservaDTO,
    actor: ReservaActor
  ): Promise<Reserva> {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id },
      include: {
        cancha: {
          include: {
            complejo: {
              select: { adminId: true },
            },
          },
        },
      },
    });

    if (!reserva) {
      throw new Error("Reserva no encontrada");
    }

    this.assertCanManageReserva(reserva, actor);

    if (reserva.estado !== ReservationStatus.PENDIENTE) {
      throw new Error("Solo puedes modificar reservas pendientes");
    }

    const nextFecha = data.fecha ?? reserva.fecha;
    const nextHoraInicio = data.horaInicio ?? this.formatTime(reserva.horaInicio);
    const nextHoraFin = data.horaFin ?? this.formatTime(reserva.horaFin);
    const changedSchedule = Boolean(data.fecha || data.horaInicio || data.horaFin);

    if (!this.isEndTimeAfterStartTime(nextHoraInicio, nextHoraFin)) {
      throw new Error("horaFin debe ser mayor a horaInicio");
    }

    if (changedSchedule) {
      const hasConflict = await this.checkConflict(
        reserva.canchaId,
        nextFecha,
        nextHoraInicio,
        nextHoraFin,
        id
      );

      if (hasConflict) {
        throw new Error("La cancha ya está reservada en ese horario");
      }
    }

    const updateData: any = { ...data };

    if (data.horaInicio || data.horaFin) {
      const [horaInicio, horaFin] = this.parseHours(nextHoraInicio, nextHoraFin);
      updateData.horaInicio = horaInicio;
      updateData.horaFin = horaFin;
    }

    if (data.horaInicio || data.horaFin) {
      updateData.precioTotal = this.calculatePrice(
        Number(reserva.cancha.precio),
        nextHoraInicio,
        nextHoraFin
      );
    }

    return this.prisma.reserva.update({
      where: { id },
      data: updateData,
    });
  }

  async confirm(id: string, actor: ReservaActor): Promise<Reserva> {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id },
      include: {
        cancha: {
          include: {
            complejo: {
              select: { adminId: true },
            },
          },
        },
      },
    });

    if (!reserva) {
      throw new Error("Reserva no encontrada");
    }

    this.assertCanAdminReserva(reserva, actor);

    if (reserva.estado !== ReservationStatus.PENDIENTE) {
      throw new Error("Solo puedes confirmar reservas pendientes");
    }

    return this.prisma.reserva.update({
      where: { id },
      data: { estado: ReservationStatus.CONFIRMADA },
    });
  }

  async complete(id: string, actor: ReservaActor): Promise<Reserva> {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id },
      include: {
        cancha: {
          include: {
            complejo: {
              select: { adminId: true },
            },
          },
        },
      },
    });

    if (!reserva) {
      throw new Error("Reserva no encontrada");
    }

    this.assertCanAdminReserva(reserva, actor);

    if (reserva.estado !== ReservationStatus.CONFIRMADA) {
      throw new Error("Solo puedes completar reservas confirmadas");
    }

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

  private generateGuestToken(): string {
    return randomBytes(24).toString("hex");
  }

  private assertCancellationAllowed(
    reserva: Reserva & {
      cancha: {
        complejo: {
          cancelacionLimiteHoras: number;
          permiteCancelacionTardia: boolean;
        };
      };
    }
  ): void {
    const { cancelacionLimiteHoras, permiteCancelacionTardia } =
      reserva.cancha.complejo;

    if (permiteCancelacionTardia) {
      return;
    }

    const reservationStart = this.combineReservationDateTime(
      reserva.fecha,
      reserva.horaInicio
    );
    const limitDate = new Date(
      reservationStart.getTime() - cancelacionLimiteHoras * 60 * 60 * 1000
    );

    if (new Date() > limitDate) {
      throw new Error(
        `La reserva solo puede cancelarse hasta ${cancelacionLimiteHoras} hora(s) antes del inicio`
      );
    }
  }

  private combineReservationDateTime(fecha: Date, hora: Date): Date {
    const combined = new Date(fecha);
    combined.setHours(
      hora.getHours(),
      hora.getMinutes(),
      hora.getSeconds(),
      hora.getMilliseconds()
    );
    return combined;
  }

  private isEndTimeAfterStartTime(
    horaInicio: string,
    horaFin: string
  ): boolean {
    return horaInicio < horaFin;
  }

  private assertCanManageReserva(
    reserva: Reserva & {
      cancha: {
        precio: unknown;
        complejo: { adminId: string };
      };
    },
    actor: ReservaActor
  ): void {
    if (actor.userRole === UserRole.SUPERADMIN) {
      return;
    }

    if (reserva.usuarioId === actor.userId) {
      return;
    }

    if (
      actor.userRole === UserRole.ADMIN &&
      reserva.cancha.complejo.adminId === actor.userId
    ) {
      return;
    }

    throw new Error("No tienes permiso para modificar esta reserva");
  }

  private assertCanAdminReserva(
    reserva: Reserva & {
      cancha: {
        complejo: { adminId: string };
      };
    },
    actor: ReservaActor
  ): void {
    if (actor.userRole === UserRole.SUPERADMIN) {
      return;
    }

    if (
      actor.userRole === UserRole.ADMIN &&
      reserva.cancha.complejo.adminId === actor.userId
    ) {
      return;
    }

    throw new Error("No tienes permiso para gestionar esta reserva");
  }
}
