"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createApiClient } from "@/lib/api/client";
import type { ComplejoListItem } from "@/lib/api/viborita";
import { getCancellationPolicyLabel } from "@/lib/api/viborita";
import { searchBuenosAiresPlaces } from "@/lib/georef";
import {
  type MockComplexSearchResult,
  type MockPlaceSuggestion,
  listMockComplejos,
  listMockPlaceSuggestions,
  searchMockComplejosByCoordinates,
} from "@/lib/mock";

type SearchSuggestion = MockPlaceSuggestion;

const formatDistance = (value?: number) => {
  if (value === undefined) {
    return null;
  }

  return value < 1 ? `${Math.round(value * 1000)} m` : `${value.toFixed(1)} km`;
};

export default function HomePage() {
  const api = useMemo(() => createApiClient(), []);
  const [searchText, setSearchText] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<SearchSuggestion | null>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [complexes, setComplexes] = useState<
    Array<ComplejoListItem | MockComplexSearchResult>
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<"default" | "nearby">("default");

  useEffect(() => {
    void loadComplejos();
  }, []);

  useEffect(() => {
    if (searchText.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadSuggestions(searchText);
    }, 220);

    return () => window.clearTimeout(timeoutId);
  }, [searchText]);

  async function loadSuggestions(value: string) {
    setSearchingPlaces(true);

    try {
      const places = await searchBuenosAiresPlaces(value);
      setSuggestions(places);
      if (places.length > 0) {
        return;
      }
      setSuggestions(listMockPlaceSuggestions(value));
    } catch {
      setSuggestions(listMockPlaceSuggestions(value));
    } finally {
      setSearchingPlaces(false);
    }
  }

  async function loadComplejos(search = "") {
    setLoading(true);
    setError(null);

    try {
      if (selectedPlace) {
        const data = await api.searchComplejosNearby({
          lat: selectedPlace.lat,
          lng: selectedPlace.lng,
          radioKm: 10,
        });
        setComplexes(data);
        setSearchMode("nearby");
      } else {
        const data = search
          ? await api.searchComplejosByBarrio(search)
          : await api.listComplejos();
        setComplexes(data);
        setSearchMode("default");
      }
    } catch {
      if (selectedPlace) {
        setComplexes(
          searchMockComplejosByCoordinates(selectedPlace.lat, selectedPlace.lng)
        );
        setSearchMode("nearby");
        setError("Modo fallback activo: complejos ordenados por cercania");
      } else {
        setComplexes(listMockComplejos(search));
        setSearchMode("default");
        setError("Modo fallback activo: mostrando complejos demo");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestionSelect(place: SearchSuggestion) {
    setSelectedPlace(place);
    setSearchText(place.label);
    setSuggestions([]);
    setLoading(true);
    setComplexes(searchMockComplejosByCoordinates(place.lat, place.lng));
    setSearchMode("nearby");
    setLoading(false);
  }

  function handleSearch() {
    const directMatch = suggestions.find(
      (place) =>
        place.label.toLowerCase() === searchText.trim().toLowerCase() ||
        `${place.label} ${place.subtitle}`.toLowerCase() ===
          searchText.trim().toLowerCase()
    );

    if (directMatch) {
      handleSuggestionSelect(directMatch);
      return;
    }

    if (selectedPlace) {
      void loadComplejos(searchText.trim());
      return;
    }

    void loadComplejos(searchText.trim());
  }

  return (
    <main className="page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Padel first</p>
          <h1>Reserva tu cancha de padel sin vueltas.</h1>
          <p>
            Viborita nace para complejos de padel que quieren vender turnos
            online, ordenar cancelaciones y darle una experiencia rapida a sus
            jugadores.
          </p>
          <div className="hero-actions">
            <a href="#complejos" className="primary-button">
              Ver complejos
            </a>
            <Link href="/register" className="ghost-button">
              Crear cuenta
            </Link>
          </div>
        </div>

        <aside className="hero-panel">
          <p className="eyebrow" style={{ color: "#d7ff68" }}>
            Pensado para producto real
          </p>
          <div className="hero-stat">
            <strong>Reserva en 3 pasos</strong>
            <span>Elegis complejo, horario y cerras la reserva.</span>
          </div>
          <div className="hero-stat">
            <strong>Politica clara</strong>
            <span>Cada complejo muestra su ventana de cancelacion.</span>
          </div>
          <div className="hero-stat" style={{ borderBottom: "none" }}>
            <strong>Invitados y usuarios</strong>
            <span>Turnos con o sin cuenta para no perder conversion.</span>
          </div>
        </aside>
      </section>

      <section id="complejos">
        <div className="section-header">
          <div>
            <h2>Complejos cargados</h2>
            <p>Empeza con un nicho claro: canchas de padel y operacion simple.</p>
          </div>
        </div>

        <p className="notice">
          El buscador intenta traer localidades y municipios reales de Buenos Aires con GeoRef Argentina. Si el servicio no responde, cae al fallback demo.
        </p>

        <div className="card search-strip">
          <div className="search-stack">
            <input
              placeholder="Busca barrio o zona"
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value);
                setSelectedPlace(null);
              }}
            />

            {searchingPlaces ? <div className="search-loading">Buscando ubicaciones...</div> : null}

            {searchText.trim().length > 0 && suggestions.length > 0 ? (
              <div className="search-suggestions">
                {suggestions.map((place) => (
                  <button
                    key={place.id}
                    className="search-suggestion"
                    onClick={() => handleSuggestionSelect(place)}
                  >
                    <strong>{place.label}</strong>
                    <span>{place.subtitle}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button className="primary-button" onClick={handleSearch}>
            Buscar
          </button>
        </div>

        {selectedPlace ? (
          <p className="notice">
            Mostrando complejos a 10 km de <strong>{selectedPlace.label}</strong>
            {" - "}
            {selectedPlace.subtitle}, del mas cercano al mas lejano.
          </p>
        ) : null}

        {selectedPlace && searchMode === "nearby" && complexes.length > 0 ? (
          <p className="notice">
            Si no hay complejos dentro de 10 km, te mostramos igual las opciones mas cercanas para no dejar vacia la busqueda.
          </p>
        ) : null}

        {error ? <p className="error-box">{error}</p> : null}

        {loading ? (
          <div className="empty-state">Cargando complejos...</div>
        ) : complexes.length === 0 ? (
          <div className="empty-state">No encontramos complejos para esa zona todavia.</div>
        ) : (
          <div className="complex-grid" style={{ marginTop: "1rem" }}>
            {complexes.map((complejo) => (
              <article key={complejo.id} className="card complex-card">
                <div>
                  <p className="eyebrow">{complejo.barrio}</p>
                  <h3>{complejo.nombre}</h3>
                  <p>{complejo.direccion}</p>
                </div>
                <div className="complex-card__meta">
                  <span className="tag">
                    {complejo._count?.canchas || complejo.canchas?.length || 0} canchas
                  </span>
                  {"distanceKm" in complejo ? (
                    <span className="tag">
                      {formatDistance(complejo.distanceKm)} de tu busqueda
                    </span>
                  ) : null}
                  <span className="tag">
                    {getCancellationPolicyLabel(
                      complejo.cancelacionLimiteHoras,
                      complejo.permiteCancelacionTardia
                    )}
                  </span>
                </div>
                <Link href={`/complejos/${complejo.id}`} className="primary-button">
                  Ver disponibilidad
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
