ALTER TABLE "reservas"
ADD COLUMN "invitado_nombre" TEXT,
ADD COLUMN "invitado_telefono" TEXT,
ADD COLUMN "invitado_email" TEXT,
ADD COLUMN "invitado_token" TEXT;

ALTER TABLE "reservas"
ALTER COLUMN "usuarioId" DROP NOT NULL;

CREATE UNIQUE INDEX "reservas_invitado_token_key" ON "reservas"("invitado_token");
CREATE INDEX "reservas_invitado_token_idx" ON "reservas"("invitado_token");
