ALTER TABLE "complejos"
ADD COLUMN "cancelacion_limite_horas" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "permite_cancelacion_tardia" BOOLEAN NOT NULL DEFAULT false;
