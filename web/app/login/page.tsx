"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createApiClient } from "@/lib/api/client";
import { isMockMode, mockLogin } from "@/lib/mock";
import { saveStoredAuth } from "@/lib/state/auth";

export default function LoginPage() {
  const api = useMemo(() => createApiClient(), []);
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);

    if (isMockMode()) {
      try {
        const response = mockLogin(form.email, form.password);
        saveStoredAuth(response);
        router.push("/mis-reservas");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo ingresar");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const response = await api.login(form);
      saveStoredAuth(response);
      router.push("/mis-reservas");
    } catch (cause) {
      try {
        const response = mockLogin(form.email, form.password);
        saveStoredAuth(response);
        router.push("/mis-reservas");
      } catch {
        setError(cause instanceof Error ? cause.message : "No se pudo ingresar");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <p className="eyebrow">Acceso</p>
        <h1>Entra a tu cuenta</h1>
        <p>Vas a poder revisar y cancelar tus reservas sin depender de un link.</p>
        {isMockMode() ? (
          <p className="notice">
            Modo demo activo. Podes entrar con cualquier email y contrasena,
            o usar demo@viborita.app.
          </p>
        ) : null}
        <div className="grid-form" style={{ marginTop: "1rem" }}>
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
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
          <Link href="/register" className="ghost-button">
            Crear cuenta
          </Link>
        </div>
      </section>
    </main>
  );
}
