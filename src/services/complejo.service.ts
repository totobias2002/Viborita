import { PrismaClient, Complejo } from "@prisma/client";

export interface CreateComplejoDTO {
  nombre: string;
  direccion: string;
  barrio: string;
  ciudad?: string;
  provincia?: string;
  countryCode?: string;
  googlePlaceId?: string;
  latitude?: number;
  longitude?: number;
  descripcion?: string;
  telefono?: string;
  email?: string;
  cancelacionLimiteHoras?: number;
  permiteCancelacionTardia?: boolean;
  adminId: string;
}

export interface UpdateComplejoDTO {
  nombre?: string;
  direccion?: string;
  barrio?: string;
  ciudad?: string;
  provincia?: string;
  countryCode?: string;
  googlePlaceId?: string;
  latitude?: number;
  longitude?: number;
  descripcion?: string;
  telefono?: string;
  email?: string;
  cancelacionLimiteHoras?: number;
  permiteCancelacionTardia?: boolean;
}

export interface SearchNearbyComplejosDTO {
  latitude: number;
  longitude: number;
  radiusKm?: number;
}

export interface ComplejoNearbyResult extends Complejo {
  distanceKm: number;
}

export class ComplejoService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(): Promise<Complejo[]> {
    return this.prisma.complejo.findMany({
      include: {
        canchas: {
          where: { activa: true },
        },
        _count: {
          select: { canchas: true, reviews: true },
        },
      },
    });
  }

  async findById(id: string): Promise<Complejo | null> {
    return this.prisma.complejo.findUnique({
      where: { id },
      include: {
        canchas: {
          where: { activa: true },
        },
        reviews: {
          include: {
            usuario: {
              select: { id: true, nombre: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: { canchas: true, reviews: true },
        },
      },
    });
  }

  async findByBarrio(barrio: string): Promise<Complejo[]> {
    return this.prisma.complejo.findMany({
      where: { barrio: { contains: barrio, mode: "insensitive" } },
      include: {
        canchas: {
          where: { activa: true },
        },
        _count: {
          select: { canchas: true },
        },
      },
    });
  }

  async findNearby({
    latitude,
    longitude,
    radiusKm = 10,
  }: SearchNearbyComplejosDTO): Promise<ComplejoNearbyResult[]> {
    const complejos = await this.prisma.complejo.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        canchas: {
          where: { activa: true },
        },
        _count: {
          select: { canchas: true, reviews: true },
        },
      },
    });

    return complejos
      .map((complejo) => ({
        ...complejo,
        distanceKm: this.calculateDistanceKm(
          latitude,
          longitude,
          Number(complejo.latitude),
          Number(complejo.longitude)
        ),
      }))
      .filter((complejo) => complejo.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  async create(data: CreateComplejoDTO): Promise<Complejo> {
    return this.prisma.complejo.create({
      data,
    });
  }

  async update(id: string, data: UpdateComplejoDTO): Promise<Complejo> {
    return this.prisma.complejo.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.complejo.delete({
      where: { id },
    });
  }

  async getByAdmin(adminId: string): Promise<Complejo[]> {
    return this.prisma.complejo.findMany({
      where: { adminId },
      include: {
        canchas: true,
        _count: {
          select: { canchas: true, reviews: true },
        },
      },
    });
  }

  private calculateDistanceKm(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number
  ): number {
    const earthRadiusKm = 6371;
    const dLat = this.toRadians(toLat - fromLat);
    const dLng = this.toRadians(toLng - fromLng);
    const lat1 = this.toRadians(fromLat);
    const lat2 = this.toRadians(toLat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLng / 2) *
        Math.sin(dLng / 2) *
        Math.cos(lat1) *
        Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  private toRadians(value: number): number {
    return (value * Math.PI) / 180;
  }
}
