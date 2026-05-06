"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createApiClient } from "@/lib/api/client";
import { isMockMode, mockRegister } from "@/lib/mock";
import { saveStoredAuth } from "@/lib/state/auth";

export default function RegisterPage() {
  const api = useMemo(() => createApiClient(), []);
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);

    if (isMockMode()) {
      try {
        const response = mockRegister(form);
        saveStoredAuth(response);
        router.push("/mis-reservas");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo crear");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const response = await api.register(form);
      saveStoredAuth(response);
      router.push("/mis-reservas");
    } catch (cause) {
      try {
        const response = mockRegister(form);
        saveStoredAuth(response);
        router.push("/mis-reservas");
      } catch {
        setError(cause instanceof Error ? cause.message : "No se pudo crear");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <p className="eyebrow">Registro</p>
        <h1>Crea tu cuenta</h1>
        <p>Te sirve para repetir reservas, seguir estados y crecer despues con membresias.</p>
        {isMockMode() ? (
          <p className="notice">
            Esta cuenta se crea solo en modo demo y queda guardada localmente.
          </p>
        ) : null}
        <div className="grid-form" style={{ marginTop: "1rem" }}>
          <label>
            Nombre
            <input
              value={form.nombre}
              onChange={(event) =>
                setForm((current) => ({ ...current, nombre: event.target.value }))
              }
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </label>
          <label>
            Telefono
            <input
              value={form.telefono}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  telefono: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Contrasena
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
            />
          </label>
        </div>
        {error ? <p className="error-box">{error}</p> : null}
        <div className="actions-row" style={{ marginTop: "1rem" }}>
          <button className="primary-button" onClick={() => void submit()}>
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </div>
      </section>
    </main>
  );
}
