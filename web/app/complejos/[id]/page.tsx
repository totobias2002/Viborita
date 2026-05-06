"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createApiClient } from "@/lib/api/client";
import {
  buildEstimatedPrice,
  getCancellationPolicyLabel,
  type CanchaSummary,
  type CheckoutSelection,
  type ComplejoSummary,
} from "@/lib/api/viborita";
import { saveSelection } from "@/lib/state/checkout";
import { formatCourtType, formatMoney, todayInputValue } from "@/lib/utils";
import {
  getMockAvailableCanchas,
  getMockComplejo,
  isMockMode,
} from "@/lib/mock";

export default function ComplexDetailPage() {
  const params = useParams<{ id: string }>();
  const complejoId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const api = useMemo(() => createApiClient(), []);
  const [complejo, setComplejo] = useState<(ComplejoSummary & {
    canchas: CanchaSummary[];
  }) | null>(null);
  const [results, setResults] = useState<CheckoutSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fecha: todayInputValue(),
    horaInicio: "18:00",
    horaFin: "19:30",
  });

  useEffect(() => {
    if (!complejoId) {
      return;
    }

    void loadComplejo(complejoId);
  }, [complejoId]);

  async function loadComplejo(id: string) {
    setLoading(true);
    setError(null);

    if (isMockMode()) {
      setComplejo(getMockComplejo(id));
      setLoading(false);
      return;
    }

    try {
      setComplejo(await api.getComplejo(id));
    } catch (cause) {
      setComplejo(getMockComplejo(id));
      setError("Modo demo activo: viendo detalle mock");
    } finally {
      setLoading(false);
    }
  }

  async function searchAvailability() {
    if (!complejo) {
      return;
    }

    setSearching(true);
    setError(null);

    if (isMockMode()) {
      const canchas = getMockAvailableCanchas({
        complejoId: complejo.id,
        ...form,
      });

      setResults(
        canchas.map((cancha) => ({
          complejoId: complejo.id,
          complejoNombre: complejo.nombre,
          canchaId: cancha.id,
          canchaNombre: cancha.nombre,
          fecha: form.fecha,
          horaInicio: form.horaInicio,
          horaFin: form.horaFin,
          precioTotal: buildEstimatedPrice(
            Number(cancha.precio),
            form.horaInicio,
            form.horaFin
          ),
          cancelacionLimiteHoras: complejo.cancelacionLimiteHoras,
          permiteCancelacionTardia: complejo.permiteCancelacionTardia,
        }))
      );
      setSearching(false);
      return;
    }

    try {
      const canchas = await api.getAvailableCanchas({
        complejoId: complejo.id,
        ...form,
      });

      setResults(
        canchas.map((cancha) => ({
          complejoId: complejo.id,
          complejoNombre: complejo.nombre,
          canchaId: cancha.id,
          canchaNombre: cancha.nombre,
          fecha: form.fecha,
          horaInicio: form.horaInicio,
          horaFin: form.horaFin,
          precioTotal: buildEstimatedPrice(
            Number(cancha.precio),
            form.horaInicio,
            form.horaFin
          ),
          cancelacionLimiteHoras: complejo.cancelacionLimiteHoras,
          permiteCancelacionTardia: complejo.permiteCancelacionTardia,
        }))
      );
    } catch (cause) {
      const canchas = getMockAvailableCanchas({
        complejoId: complejo.id,
        ...form,
      });
      setResults(
        canchas.map((cancha) => ({
          complejoId: complejo.id,
          complejoNombre: complejo.nombre,
          canchaId: cancha.id,
          canchaNombre: cancha.nombre,
          fecha: form.fecha,
          horaInicio: form.horaInicio,
          horaFin: form.horaFin,
          precioTotal: buildEstimatedPrice(
            Number(cancha.precio),
            form.horaInicio,
            form.horaFin
          ),
          cancelacionLimiteHoras: complejo.cancelacionLimiteHoras,
          permiteCancelacionTardia: complejo.permiteCancelacionTardia,
        }))
      );
      setError("Modo demo activo: disponibilidad simulada");
    } finally {
      setSearching(false);
    }
  }

  if (loading) {
    return (
      <main className="page">
        <div className="empty-state">Cargando complejo...</div>
      </main>
    );
  }

  if (!complejo) {
    return (
      <main className="page">
        <div className="error-box">{error || "Complejo no encontrado"}</div>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="split-layout">
        <div className="card">
          <p className="eyebrow">{complejo.barrio}</p>
          <h1>{complejo.nombre}</h1>
          <p>{complejo.direccion}</p>
          {complejo.descripcion ? <p>{complejo.descripcion}</p> : null}
          <div className="notice">
            {getCancellationPolicyLabel(
              complejo.cancelacionLimiteHoras,
              complejo.permiteCancelacionTardia
            )}
          </div>
        </div>

        <div className="card">
          <h2>Busca disponibilidad</h2>
          <div
            className="grid-form grid-form--three"
            style={{ marginTop: "1rem" }}
          >
            <label>
              Fecha
              <input
                type="date"
                value={form.fecha}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    fecha: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Desde
              <input
                type="time"
                value={form.horaInicio}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    horaInicio: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Hasta
              <input
                type="time"
                value={form.horaFin}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    horaFin: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <div className="actions-row" style={{ marginTop: "1rem" }}>
            <button
              className="primary-button"
              onClick={() => void searchAvailability()}
            >
              {searching ? "Buscando..." : "Ver turnos"}
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="section-header">
          <div>
            <h2>Canchas del complejo</h2>
            <p>El producto ya habla el idioma del nicho: padel y operacion.</p>
          </div>
        </div>
        <div className="complex-grid">
          {complejo.canchas.map((cancha) => (
            <article key={cancha.id} className="card complex-card">
              <div>
                <h3>{cancha.nombre}</h3>
                <p>{cancha.descripcion || "Lista para publicar online."}</p>
              </div>
              <div className="complex-card__meta">
                <span className="tag">{formatCourtType(cancha.tipo)}</span>
                {cancha.techada ? <span className="tag">Techada</span> : null}
                {cancha.iluminacion ? <span className="tag">Con luces</span> : null}
              </div>
              <span className="price-pill">{formatMoney(cancha.precio)}</span>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="section-header">
          <div>
            <h2>Resultados para tu horario</h2>
            <p>Reserva sin obligar al jugador a registrarse si no hace falta.</p>
          </div>
        </div>
        {error ? <p className="error-box">{error}</p> : null}
        {results.length === 0 ? (
          <div className="empty-state">
            Elegi fecha y horario para ver las canchas disponibles.
          </div>
        ) : (
          <div className="availability-grid">
            {results.map((selection) => (
              <article key={selection.canchaId} className="card availability-card">
                <div>
                  <h3>{selection.canchaNombre}</h3>
                  <p>
                    {selection.fecha} - {selection.horaInicio} a {selection.horaFin}
                  </p>
                </div>
                <span className="price-pill">{formatMoney(selection.precioTotal)}</span>
                <button
                  className="primary-button"
                  onClick={() => {
                    saveSelection(selection);
                    router.push("/checkout");
                  }}
                >
                  Reservar
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
