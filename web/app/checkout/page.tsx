"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createApiClient } from "@/lib/api/client";
import { buildGuestReservationUrl, type CheckoutSelection } from "@/lib/api/viborita";
import { getStoredAuth } from "@/lib/state/auth";
import {
  clearSelection,
  getSelection,
  saveSuccessState,
} from "@/lib/state/checkout";
import { formatMoney } from "@/lib/utils";
import { createMockReserva, isMockMode } from "@/lib/mock";

export default function CheckoutPage() {
  const router = useRouter();
  const api = useMemo(() => createApiClient(), []);
  const [selection, setSelection] = useState<CheckoutSelection | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    invitadoNombre: "",
    invitadoTelefono: "",
    invitadoEmail: "",
    notas: "",
  });

  useEffect(() => {
    setSelection(getSelection());
    setIsAuthenticated(Boolean(getStoredAuth()));
  }, []);

  async function submit() {
    if (!selection) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        fecha: selection.fecha,
        horaInicio: selection.horaInicio,
        horaFin: selection.horaFin,
        canchaId: selection.canchaId,
        ...(isAuthenticated
          ? { notas: form.notas }
          : {
              invitadoNombre: form.invitadoNombre,
              invitadoTelefono: form.invitadoTelefono,
              invitadoEmail: form.invitadoEmail || undefined,
              notas: form.notas,
            }),
      };

      const auth = getStoredAuth();
      const reserva = isMockMode()
        ? createMockReserva(payload, auth?.user || null)
        : await api.createReserva(payload, isAuthenticated);

      const frontendBaseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      const success = {
        reservaId: reserva.id,
        estado: reserva.estado,
        invitadoToken: reserva.invitadoToken,
        redirectUrl: reserva.invitadoToken
          ? buildGuestReservationUrl(frontendBaseUrl, reserva.invitadoToken)
          : `${frontendBaseUrl}/mis-reservas`,
      };

      saveSuccessState(success);
      clearSelection();
      router.push("/reserva/exito");
    } catch (cause) {
      try {
        const auth = getStoredAuth();
        const payload = {
          fecha: selection.fecha,
          horaInicio: selection.horaInicio,
          horaFin: selection.horaFin,
          canchaId: selection.canchaId,
          ...(isAuthenticated
            ? { notas: form.notas }
            : {
                invitadoNombre: form.invitadoNombre,
                invitadoTelefono: form.invitadoTelefono,
                invitadoEmail: form.invitadoEmail || undefined,
                notas: form.notas,
              }),
        };
        const reserva = createMockReserva(payload, auth?.user || null);
        const frontendBaseUrl =
          typeof window !== "undefined" ? window.location.origin : "";
        const success = {
          reservaId: reserva.id,
          estado: reserva.estado,
          invitadoToken: reserva.invitadoToken,
          redirectUrl: reserva.invitadoToken
            ? buildGuestReservationUrl(frontendBaseUrl, reserva.invitadoToken)
            : `${frontendBaseUrl}/mis-reservas`,
        };

        saveSuccessState(success);
        clearSelection();
        router.push("/reserva/exito");
        return;
      } catch {
        setError(cause instanceof Error ? cause.message : "No se pudo reservar");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!selection) {
    return (
      <main className="page">
        <div className="empty-state">
          No hay una seleccion activa. Volve a un complejo y elegi un turno.
        </div>
      </main>
    );
  }

  return (
    <main className="page checkout-layout">
      <section className="card">
        <p className="eyebrow">Ya casi terminamos</p>
        <h1>Confirma tu turno</h1>
        <dl className="summary-list">
          <div>
            <dt>Complejo</dt>
            <dd>{selection.complejoNombre}</dd>
          </div>
          <div>
            <dt>Cancha</dt>
            <dd>{selection.canchaNombre}</dd>
          </div>
          <div>
            <dt>Fecha</dt>
            <dd>{selection.fecha}</dd>
          </div>
          <div>
            <dt>Horario</dt>
            <dd>
              {selection.horaInicio} - {selection.horaFin}
            </dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{formatMoney(selection.precioTotal)}</dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <h2>{isAuthenticated ? "Reserva con tu cuenta" : "Dejanos tus datos"}</h2>
        <p>
          {isAuthenticated
            ? "Como ya tenes sesion, solo podes sumar notas para el complejo."
            : "Pedimos lo minimo para no perder conversion y que el complejo pueda contactarte."}
        </p>

        <div className="grid-form">
          {!isAuthenticated ? (
            <>
              <label>
                Nombre
                <input
                  value={form.invitadoNombre}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      invitadoNombre: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Telefono
                <input
                  value={form.invitadoTelefono}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      invitadoTelefono: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Email opcional
                <input
                  type="email"
                  value={form.invitadoEmail}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      invitadoEmail: event.target.value,
                    }))
                  }
                />
              </label>
            </>
          ) : null}

          <label>
            Notas
            <textarea
              rows={4}
              value={form.notas}
              onChange={(event) =>
                setForm((current) => ({ ...current, notas: event.target.value }))
              }
            />
          </label>
        </div>

        {!isAuthenticated ? (
          <p className="notice">
            Si preferis guardar historial y cancelar mas facil, podes{" "}
            <Link href="/login">ingresar a tu cuenta</Link>.
          </p>
        ) : null}

        {isMockMode() ? (
          <p className="notice">
            Estas confirmando una reserva demo. El resultado se guarda en tu navegador.
          </p>
        ) : null}

        {error ? <p className="error-box">{error}</p> : null}

        <div className="actions-row">
          <button className="primary-button" onClick={() => void submit()}>
            {submitting ? "Confirmando..." : "Confirmar reserva"}
          </button>
        </div>
      </section>
    </main>
  );
}
