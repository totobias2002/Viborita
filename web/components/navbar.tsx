"use client";

import Image from "next/image";
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
        <Image
          src="/viborita-logo.png"
          alt="Viborita"
          width={220}
          height={84}
          priority
          className="brand-mark__image"
        />
      </Link>

      <nav className="site-nav">
        <Link href="/">Inicio</Link>
        {loggedIn ? <Link href="/mis-reservas">Mis reservas</Link> : null}
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
