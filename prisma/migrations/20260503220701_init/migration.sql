-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "CourtType" AS ENUM ('INDOOR', 'OUTDOOR', 'PANORAMICA', 'TECHADA');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "UserRole" NOT NULL DEFAULT 'USER',
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complejos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "barrio" TEXT NOT NULL,
    "descripcion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complejos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canchas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "CourtType" NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "descripcion" TEXT,
    "techada" BOOLEAN NOT NULL DEFAULT false,
    "iluminacion" BOOLEAN NOT NULL DEFAULT false,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "complejoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canchas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "hora_inicio" TIME(0) NOT NULL,
    "hora_fin" TIME(0) NOT NULL,
    "estado" "ReservationStatus" NOT NULL DEFAULT 'PENDIENTE',
    "notas" TEXT,
    "precioTotal" DECIMAL(10,2) NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "canchaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "puntuacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "usuarioId" TEXT NOT NULL,
    "complejoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_rol_idx" ON "users"("rol");

-- CreateIndex
CREATE INDEX "complejos_adminId_idx" ON "complejos"("adminId");

-- CreateIndex
CREATE INDEX "complejos_barrio_idx" ON "complejos"("barrio");

-- CreateIndex
CREATE INDEX "canchas_complejoId_idx" ON "canchas"("complejoId");

-- CreateIndex
CREATE UNIQUE INDEX "canchas_complejoId_nombre_key" ON "canchas"("complejoId", "nombre");

-- CreateIndex
CREATE INDEX "reservas_usuarioId_idx" ON "reservas"("usuarioId");

-- CreateIndex
CREATE INDEX "reservas_canchaId_idx" ON "reservas"("canchaId");

-- CreateIndex
CREATE INDEX "reservas_fecha_estado_idx" ON "reservas"("fecha", "estado");

-- CreateIndex
CREATE INDEX "reservas_canchaId_fecha_idx" ON "reservas"("canchaId", "fecha");

-- CreateIndex
CREATE INDEX "reviews_usuarioId_idx" ON "reviews"("usuarioId");

-- CreateIndex
CREATE INDEX "reviews_complejoId_idx" ON "reviews"("complejoId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_usuarioId_complejoId_key" ON "reviews"("usuarioId", "complejoId");

-- AddForeignKey
ALTER TABLE "complejos" ADD CONSTRAINT "complejos_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canchas" ADD CONSTRAINT "canchas_complejoId_fkey" FOREIGN KEY ("complejoId") REFERENCES "complejos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_canchaId_fkey" FOREIGN KEY ("canchaId") REFERENCES "canchas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_complejoId_fkey" FOREIGN KEY ("complejoId") REFERENCES "complejos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
