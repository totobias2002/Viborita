"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { createApiClient } from "@/lib/api/client";
import type { ReservaWithRelations } from "@/lib/api/viborita";
import {
  cancelMockReserva,
  getMockMyReservas,
  isMockMode,
} from "@/lib/mock";
import { getStoredAuth } from "@/lib/state/auth";
import { formatMoney } from "@/lib/utils";

export default function MyReservationsPage() {
  const api = useMemo(() => createApiClient(), []);
  const [reservas, setReservas] = useState<ReservaWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const auth = getStoredAuth();
    setLoggedIn(Boolean(auth));

    if (!auth) {
      setLoading(false);
      return;
    }

    void loadReservas();
  }, []);

  async function loadReservas() {
    setLoading(true);
    setError(null);

    const auth = getStoredAuth();
    if (isMockMode() && auth?.user.id) {
      setReservas(getMockMyReservas(auth.user.id));
      setLoading(false);
      return;
    }

    try {
      setReservas(await api.getMyReservas());
    } catch (cause) {
      if (auth?.user.id) {
        setReservas(getMockMyReservas(auth.user.id));
        setError("Modo demo activo: reservas locales");
      } else {
        setError(cause instanceof Error ? cause.message : "No se pudo cargar");
      }
    } finally {
      setLoading(false);
    }
  }

  async function cancelReserva(id: string) {
    if (isMockMode()) {
      cancelMockReserva(id);
      await loadReservas();
      return;
    }

    try {
      await api.cancelReserva(id);
      await loadReservas();
    } catch (cause) {
      cancelMockReserva(id);
      await loadReservas();
      setError("Modo demo activo: cancelacion local");
    }
  }

  if (!loggedIn) {
    return (
      <main className="page">
        <div className="empty-state">
          Necesitas iniciar sesion para ver tus reservas.{" "}
          <Link href="/login">Ir a login</Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="page">
        <div className="empty-state">Cargando reservas...</div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="section-header">
        <div>
          <h1>Mis reservas</h1>
          <p>Tu historial de turnos, pensado para jugadores frecuentes.</p>
        </div>
      </div>

      {isMockMode() ? (
        <p className="notice">
          Estas viendo reservas demo guardadas localmente en este navegador.
        </p>
      ) : null}

      {error ? <p className="error-box">{error}</p> : null}

      {reservas.length === 0 ? (
        <div className="empty-state">
          Todavia no tenes reservas asociadas a tu cuenta.
        </div>
      ) : (
        <div className="reservation-grid">
          {reservas.map((reserva) => (
            <article key={reserva.id} className="card reservation-card">
              <div className="row-meta">
                <StatusBadge status={reserva.estado} />
                <span className="tag">{reserva.cancha.complejo.nombre}</span>
              </div>
              <div>
                <h3>{reserva.cancha.nombre}</h3>
                <p>
                  {reserva.fecha} - {reserva.horaInicio} a {reserva.horaFin}
                </p>
              </div>
              <span className="price-pill">{formatMoney(reserva.precioTotal)}</span>
              {reserva.estado === "PENDIENTE" ||
              reserva.estado === "CONFIRMADA" ? (
                <button
                  className="ghost-button"
                  onClick={() => void cancelReserva(reserva.id)}
                >
                  Cancelar
                </button>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
