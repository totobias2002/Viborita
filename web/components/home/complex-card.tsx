import Link from "next/link";
import type { ComplejoListItem } from "@/lib/api/viborita";
import { getCancellationPolicyLabel } from "@/lib/api/viborita";
import type { MockComplexSearchResult } from "@/lib/mock";

type ComplexCardProps = {
  complejo: ComplejoListItem | MockComplexSearchResult;
};

const formatDistance = (value?: number) => {
  if (value === undefined) {
    return null;
  }

  return value < 1 ? `${Math.round(value * 1000)} m` : `${value.toFixed(1)} km`;
};

export function ComplexCard({ complejo }: ComplexCardProps) {
  return (
    <article className="card complex-card">
      <div>
        <p className="eyebrow">{complejo.barrio}</p>
        <h3>{complejo.nombre}</h3>
        <p>{complejo.direccion}</p>
      </div>
      <div className="complex-card__meta">
        <span className="tag">
          {complejo._count?.canchas || complejo.canchas?.length || 0} canchas
        </span>
        {"distanceKm" in complejo ? (
          <span className="tag">
            {formatDistance(complejo.distanceKm)} de tu busqueda
          </span>
        ) : null}
        <span className="tag">
          {getCancellationPolicyLabel(
            complejo.cancelacionLimiteHoras,
            complejo.permiteCancelacionTardia
          )}
        </span>
      </div>
      <Link href={`/complejos/${complejo.id}`} className="primary-button">
        Ver disponibilidad
      </Link>
    </article>
  );
}
