-- Support real place autocomplete and nearby search for complexes.
ALTER TABLE "complejos"
ADD COLUMN "ciudad" TEXT,
ADD COLUMN "provincia" TEXT,
ADD COLUMN "country_code" TEXT,
ADD COLUMN "google_place_id" TEXT,
ADD COLUMN "latitude" DECIMAL(10,7),
ADD COLUMN "longitude" DECIMAL(10,7);

CREATE UNIQUE INDEX "complejos_google_place_id_key"
ON "complejos"("google_place_id");

CREATE INDEX "complejos_ciudad_idx"
ON "complejos"("ciudad");

CREATE INDEX "complejos_provincia_idx"
ON "complejos"("provincia");
