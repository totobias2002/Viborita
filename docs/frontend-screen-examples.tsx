import React from "react";
import {
  CheckoutSelection,
  GuestCheckoutFormState,
  ReservaWithRelations,
  getCancellationPolicyLabel,
} from "./frontend-contract";

type ComplexDetailPageProps = {
  complejo: {
    id: string;
    nombre: string;
    direccion: string;
    barrio: string;
    descripcion?: string | null;
    cancelacionLimiteHoras: number;
    permiteCancelacionTardia: boolean;
  };
  availabilityForm: {
    fecha: string;
    horaInicio: string;
    horaFin: string;
  };
  availabilityLoading: boolean;
  availabilityError?: string | null;
  results: CheckoutSelection[];
  onAvailabilityChange: (patch: {
    fecha?: string;
    horaInicio?: string;
    horaFin?: string;
  }) => void;
  onSearchAvailability: () => void;
  onReserveSelection: (selection: CheckoutSelection) => void;
};

export function ComplexDetailPage({
  complejo,
  availabilityForm,
  availabilityLoading,
  availabilityError,
  results,
  onAvailabilityChange,
  onSearchAvailability,
  onReserveSelection,
}: ComplexDetailPageProps) {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">{complejo.barrio}</p>
          <h1>{complejo.nombre}</h1>
          <p>{complejo.direccion}</p>
          {complejo.descripcion ? <p>{complejo.descripcion}</p> : null}
        </div>
        <aside className="policy-chip">
          {getCancellationPolicyLabel(
            complejo.cancelacionLimiteHoras,
            complejo.permiteCancelacionTardia
          )}
        </aside>
      </section>

      <section className="search-card">
        <h2>Elegí día y horario</h2>
        <div className="search-grid">
          <label>
            Fecha
            <input
              type="date"
              value={availabilityForm.fecha}
              onChange={(event) =>
                onAvailabilityChange({ fecha: event.target.value })
              }
            />
          </label>

          <label>
            Desde
            <input
              type="time"
              value={availabilityForm.horaInicio}
              onChange={(event) =>
                onAvailabilityChange({ horaInicio: event.target.value })
              }
            />
          </label>

          <label>
            Hasta
            <input
              type="time"
              value={availabilityForm.horaFin}
              onChange={(event) =>
                onAvailabilityChange({ horaFin: event.target.value })
              }
            />
          </label>

          <button onClick={onSearchAvailability} disabled={availabilityLoading}>
            {availabilityLoading ? "Buscando..." : "Ver disponibilidad"}
          </button>
        </div>

        {availabilityError ? <p className="error-box">{availabilityError}</p> : null}
      </section>

      <section className="results-grid">
        {results.length === 0 ? (
          <div className="empty-card">
            <h3>No hay resultados todavía</h3>
            <p>Elegí fecha y horario para ver qué canchas están disponibles.</p>
          </div>
        ) : (
          results.map((selection) => (
            <article key={selection.canchaId} className="availability-card">
              <div>
                <h3>{selection.canchaNombre}</h3>
                <p>
                  {selection.fecha} · {selection.horaInicio} a {selection.horaFin}
                </p>
              </div>
              <strong>${selection.precioTotal}</strong>
              <button onClick={() => onReserveSelection(selection)}>Reservar</button>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

type CheckoutPageProps = {
  selection: CheckoutSelection;
  isAuthenticated: boolean;
  guestForm: GuestCheckoutFormState;
  submitting: boolean;
  error?: string;
  onGuestFormChange: (patch: Partial<GuestCheckoutFormState>) => void;
  onSubmitGuest: () => void;
  onSubmitUser: () => void;
};

export function CheckoutPage({
  selection,
  isAuthenticated,
  guestForm,
  submitting,
  error,
  onGuestFormChange,
  onSubmitGuest,
  onSubmitUser,
}: CheckoutPageProps) {
  return (
    <main className="checkout-layout">
      <section className="summary-card">
        <p className="eyebrow">Ya casi terminamos</p>
        <h1>Confirmá tu turno</h1>

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
            <dt>Precio</dt>
            <dd>${selection.precioTotal}</dd>
          </div>
        </dl>

        <div className="policy-note">
          {getCancellationPolicyLabel(
            selection.cancelacionLimiteHoras,
            selection.permiteCancelacionTardia
          )}
        </div>
      </section>

      <section className="form-card">
        {isAuthenticated ? (
          <>
            <h2>Reservando con tu cuenta</h2>
            <label>
              Notas
              <textarea
                value={guestForm.notas}
                onChange={(event) =>
                  onGuestFormChange({ notas: event.target.value })
                }
              />
            </label>
            <button onClick={onSubmitUser} disabled={submitting}>
              {submitting ? "Confirmando..." : "Confirmar reserva"}
            </button>
          </>
        ) : (
          <>
            <h2>Dejanos tus datos</h2>
            <p>Te vamos a guardar este turno sin obligarte a crear una cuenta.</p>

            <label>
              Nombre
              <input
                value={guestForm.invitadoNombre}
                onChange={(event) =>
                  onGuestFormChange({ invitadoNombre: event.target.value })
                }
              />
            </label>

            <label>
              Teléfono
              <input
                value={guestForm.invitadoTelefono}
                onChange={(event) =>
                  onGuestFormChange({ invitadoTelefono: event.target.value })
                }
              />
            </label>

            <label>
              Email opcional
              <input
                value={guestForm.invitadoEmail}
                onChange={(event) =>
                  onGuestFormChange({ invitadoEmail: event.target.value })
                }
              />
            </label>

            <label>
              Notas
              <textarea
                value={guestForm.notas}
                onChange={(event) =>
                  onGuestFormChange({ notas: event.target.value })
                }
              />
            </label>

            <button onClick={onSubmitGuest} disabled={submitting}>
              {submitting ? "Confirmando..." : "Confirmar reserva"}
            </button>
          </>
        )}

        {error ? <p className="error-box">{error}</p> : null}
      </section>
    </main>
  );
}

type GuestReservationPageProps = {
  reserva: ReservaWithRelations;
  loading: boolean;
  error?: string | null;
  onCancel: () => void;
};

export function GuestReservationPage({
  reserva,
  loading,
  error,
  onCancel,
}: GuestReservationPageProps) {
  const canCancel =
    reserva.estado !== "CANCELADA" && reserva.estado !== "COMPLETADA";

  return (
    <main className="guest-page">
      <section className="guest-header-card">
        <p className="eyebrow">Tu reserva</p>
        <h1>{reserva.cancha.complejo.nombre}</h1>
        <span className={`status-badge status-${reserva.estado.toLowerCase()}`}>
          {reserva.estado}
        </span>
      </section>

      <section className="guest-details-card">
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
            <dt>Precio</dt>
            <dd>${reserva.precioTotal}</dd>
          </div>
          <div>
            <dt>Reservó</dt>
            <dd>{reserva.invitadoNombre || reserva.usuario?.nombre}</dd>
          </div>
          <div>
            <dt>Política</dt>
            <dd>
              {getCancellationPolicyLabel(
                reserva.cancha.complejo.cancelacionLimiteHoras,
                reserva.cancha.complejo.permiteCancelacionTardia
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section className="guest-actions-card">
        {canCancel ? (
          <button onClick={onCancel} disabled={loading}>
            {loading ? "Cancelando..." : "Cancelar reserva"}
          </button>
        ) : (
          <p>Esta reserva ya no puede cancelarse online.</p>
        )}

        {error ? <p className="error-box">{error}</p> : null}
      </section>
    </main>
  );
}
