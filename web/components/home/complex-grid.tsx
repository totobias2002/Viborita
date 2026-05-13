import type { ComplejoListItem } from "@/lib/api/viborita";
import type { MockComplexSearchResult } from "@/lib/mock";
import { ComplexCard } from "@/components/home/complex-card";

type ComplexGridProps = {
  complexes: Array<ComplejoListItem | MockComplexSearchResult>;
};

export function ComplexGrid({ complexes }: ComplexGridProps) {
  return (
    <div className="complex-grid" style={{ marginTop: "1rem" }}>
      {complexes.map((complejo) => (
        <ComplexCard key={complejo.id} complejo={complejo} />
      ))}
    </div>
  );
}
