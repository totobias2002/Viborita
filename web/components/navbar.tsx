"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearStoredAuth, getStoredAuth, onAuthChanged } from "@/lib/state/auth";

export function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      setLoggedIn(Boolean(getStoredAuth()));
    };

    syncAuth();

    return onAuthChanged(syncAuth);
  }, []);

  return (
    <header className="site-header">
      <Link href="/" className="brand-mark">
        <span className="brand-mark__badge">V</span>
        <div>
          <strong>Viborita</strong>
          <span>Reservas para padel</span>
        </div>
      </Link>

      <nav className="site-nav">
        <Link href="/">Inicio</Link>
        <Link href="/mis-reservas">Mis reservas</Link>
        {loggedIn ? (
          <button
            className="ghost-button"
            onClick={() => {
              clearStoredAuth();
            }}
          >
            Cerrar sesion
          </button>
        ) : (
          <>
            <Link href="/login">Ingresar</Link>
            <Link href="/register" className="primary-chip">
              Crear cuenta
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
