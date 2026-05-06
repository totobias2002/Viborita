"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { createApiClient } from "@/lib/api/client";
import { getCancellationPolicyLabel } from "@/lib/api/viborita";
import type { ReservaWithRelations } from "@/lib/api/viborita";
import {
  cancelMockGuestReserva,
  getMockGuestReserva,
  isMockMode,
} from "@/lib/mock";
import { formatMoney } from "@/lib/utils";

export default function GuestReservationPage() {
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const api = useMemo(() => createApiClient(), []);
  const [reserva, setReserva] = useState<ReservaWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    void loadReserva(token);
  }, [token]);

  async function loadReserva(value: string) {
    setLoading(true);
    setError(null);

    if (isMockMode()) {
      setReserva(getMockGuestReserva(value));
      setLoading(false);
      return;
    }

    try {
      setReserva(await api.getGuestReserva(value));
    } catch (cause) {
      setReserva(getMockGuestReserva(value));
      setError("Modo demo activo: reserva invitada local");
    } finally {
      setLoading(false);
    }
  }

  async function cancelReserva() {
    if (!token) {
      return;
    }

    setActionLoading(true);
    setError(null);

    if (isMockMode()) {
      cancelMockGuestReserva(token);
      await loadReserva(token);
      setActionLoading(false);
      return;
    }

    try {
      await api.cancelGuestReserva(token);
      await loadReserva(token);
    } catch (cause) {
      cancelMockGuestReserva(token);
      await loadReserva(token);
      setError("Modo demo activo: cancelacion local");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="page">
        <div className="empty-state">Cargando reserva...</div>
      </main>
    );
  }

  if (!reserva) {
    return (
      <main className="page">
        <div className="error-box">{error || "Reserva no encontrada"}</div>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Tu reserva</p>
        <h1>{reserva.cancha.complejo.nombre}</h1>
        <StatusBadge status={reserva.estado} />

        {isMockMode() ? (
          <p className="notice">
            Esta reserva invitada vive solo en modo demo y se guarda localmente.
          </p>
        ) : null}

        <dl className="summary-list">
          <div>
            <dt>Cancha</dt>
            <dd>{reserva.cancha.nombre}</dd>
          </div>
          <div>
            <dt>Fecha</dt>
            <dd>{reserva.fecha}</dd>
          </div>
          <div>
            <dt>Horario</dt>
            <dd>
              {reserva.horaInicio} - {reserva.horaFin}
            </dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{formatMoney(reserva.precioTotal)}</dd>
          </div>
          <div>
            <dt>Politica</dt>
            <dd>
              {getCancellationPolicyLabel(
                reserva.cancha.complejo.cancelacionLimiteHoras,
                reserva.cancha.complejo.permiteCancelacionTardia
              )}
            </dd>
          </div>
        </dl>

        {error ? <p className="error-box">{error}</p> : null}

        {reserva.estado === "CANCELADA" || reserva.estado === "COMPLETADA" ? (
          <p className="notice">Esta reserva ya no admite cancelacion online.</p>
        ) : (
          <div className="actions-row" style={{ marginTop: "1rem" }}>
            <button
              className="primary-button"
              onClick={() => void cancelReserva()}
            >
              {actionLoading ? "Cancelando..." : "Cancelar reserva"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
