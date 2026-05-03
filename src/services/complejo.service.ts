import { PrismaClient, Complejo } from "@prisma/client";

export interface CreateComplejoDTO {
  nombre: string;
  direccion: string;
  barrio: string;
  descripcion?: string;
  telefono?: string;
  email?: string;
  adminId: string;
}

export interface UpdateComplejoDTO {
  nombre?: string;
  direccion?: string;
  barrio?: string;
  descripcion?: string;
  telefono?: string;
  email?: string;
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
}