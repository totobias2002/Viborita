"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReservaSuccessState } from "@/lib/api/viborita";
import { getSuccessState } from "@/lib/state/checkout";

export default function ReservationSuccessPage() {
  const [success, setSuccess] = useState<ReservaSuccessState | null>(null);
  const [destination, setDestination] = useState("/");

  useEffect(() => {
    const current = getSuccessState();
    setSuccess(current);

    if (!current) {
      return;
    }

    const origin = window.location.origin;
    setDestination(current.redirectUrl.replace(origin, ""));
  }, []);

  if (!success) {
    return (
      <main className="page">
        <div className="empty-state">
          No encontramos el estado de exito. Hace una reserva para continuar.
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Reserva creada</p>
        <h1>Tu turno ya quedo registrado</h1>
        <p>
          Estado inicial: <strong>{success.estado}</strong>
        </p>
        <div className="success-box">
          {success.invitadoToken
            ? "Guardamos un acceso rapido para que puedas revisar o cancelar tu reserva sin cuenta."
            : "Como estas autenticado, ya podes seguir todo desde Mis reservas."}
        </div>
        <div className="actions-row" style={{ marginTop: "1rem" }}>
          <Link href={destination} className="primary-button">
            {success.invitadoToken ? "Ver mi reserva" : "Ir a mis reservas"}
          </Link>
          <Link href="/" className="ghost-button">
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
