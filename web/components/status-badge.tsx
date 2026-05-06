import type { ReservationStatus } from "@/lib/api/viborita";

export function StatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      {status}
    </span>
  );
}
