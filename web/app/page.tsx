"use client";

import { useEffect, useMemo, useState } from "react";
import { ComplexGrid } from "@/components/home/complex-grid";
import { HeroSection } from "@/components/home/hero-section";
import { SearchBar } from "@/components/home/search-bar";
import { NoticeBanner } from "@/components/ui/notice-banner";
import { createApiClient } from "@/lib/api/client";
import type { ComplejoListItem } from "@/lib/api/viborita";
import { searchBuenosAiresPlaces } from "@/lib/georef";
import {
  type MockComplexSearchResult,
  type MockPlaceSuggestion,
  listMockComplejos,
  listMockPlaceSuggestions,
} from "@/lib/mock";

type SearchSuggestion = MockPlaceSuggestion;

function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayDate() {
  return formatDateForInput(new Date());
}

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateForInput(tomorrow);
}

function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getNextValidTime(baseTime?: string) {
  const source = baseTime ?? getCurrentTime();
  const [hours, minutes] = source.split(":").map(Number);
  const roundedMinutes = minutes <= 30 ? 30 : 60;
  const nextDate = new Date();
  nextDate.setHours(hours, 0, 0, 0);
  nextDate.setMinutes(roundedMinutes);

  if (roundedMinutes === 60) {
    nextDate.setHours(hours + 1, 0, 0, 0);
  }

  return `${String(nextDate.getHours()).padStart(2, "0")}:${String(
    nextDate.getMinutes()
  ).padStart(2, "0")}`;
}

function formatSelectedDate(value: string) {
  if (!value) {
    return "Elegir fecha";
  }

  if (value === getTodayDate()) {
    return "Hoy";
  }

  if (value === getTomorrowDate()) {
    return "Manana";
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function buildTimeOptions(minTime?: string) {
  const options: string[] = [];
  const startHour = 8;
  const endHour = 23;

  for (let hour = startHour; hour <= endHour; hour += 1) {
    for (const minute of [0, 30]) {
      const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

      if (minTime && value < minTime) {
        continue;
      }

      options.push(value);
    }
  }

  return options;
}

export default function HomePage() {
  const api = useMemo(() => createApiClient(), []);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDate);
  const [selectedTime, setSelectedTime] = useState("");
  const [complexes, setComplexes] = useState<
    Array<ComplejoListItem | MockComplexSearchResult>
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shouldShowSearchLoading =
    searchingPlaces && searchText.trim().length >= 2 && suggestions.length === 0;

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

  useEffect(() => {
    const today = getTodayDate();
    const currentTime = getCurrentTime();

    if (selectedDate < today) {
      setSelectedDate(today);
      setSelectedTime("");
      return;
    }

    if (selectedDate === today && selectedTime && selectedTime < currentTime) {
      setSelectedTime("");
    }
  }, [selectedDate, selectedTime]);

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
      const data = search
        ? await api.searchComplejosByBarrio(search)
        : await api.listComplejos();
      setComplexes(data);
    } catch {
      setComplexes(listMockComplejos(search));
      setError("Modo fallback activo: mostrando complejos demo");
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestionSelect(place: SearchSuggestion) {
    setSearchText(place.label);
    setSuggestions([]);
  }

  function handleSearch() {
    if (!searchText.trim() || !selectedDate || !selectedTime) {
      setError("Completa barrio, fecha y hora para buscar canchas.");
      return;
    }

    const today = getTodayDate();
    const currentTime = getCurrentTime();

    if (selectedDate < today) {
      setError("No puedes buscar con una fecha pasada.");
      return;
    }

    if (selectedDate === today && selectedTime < currentTime) {
      setError("No puedes buscar con una hora pasada para el dia de hoy.");
      return;
    }

    const directMatch = suggestions.find(
      (place) =>
        place.label.toLowerCase() === searchText.trim().toLowerCase() ||
        `${place.label} ${place.subtitle}`.toLowerCase() ===
          searchText.trim().toLowerCase()
    );

    if (directMatch) {
      handleSuggestionSelect(directMatch);
    }

    setError(null);
    setSuggestions([]);
    void loadComplejos(searchText.trim());
  }

  const isSearchDisabled =
    searchText.trim().length === 0 || selectedDate.length === 0 || selectedTime.length === 0;
  const minTime =
    selectedDate === getTodayDate() ? getNextValidTime(getCurrentTime()) : undefined;
  const timeOptions = buildTimeOptions(minTime);
  const selectedDateLabel = formatSelectedDate(selectedDate);
  const tomorrowDate = getTomorrowDate();

  return (
    <main className="page">
      <section className="hero-stage">
        <HeroSection />
        <SearchBar
          searchText={searchText}
          onSearchTextChange={setSearchText}
          selectedDate={selectedDate}
          onSelectedDateChange={setSelectedDate}
          minDate={getTodayDate()}
          tomorrowDate={tomorrowDate}
          selectedDateLabel={selectedDateLabel}
          minTime={minTime}
          selectedTime={selectedTime}
          onSelectedTimeChange={setSelectedTime}
          timeOptions={timeOptions}
          onSearch={handleSearch}
          isSearchDisabled={isSearchDisabled}
          loadingMessage={
            shouldShowSearchLoading ? (
              <div className="search-loading">Buscando ubicaciones...</div>
            ) : null
          }
          suggestions={
            searchText.trim().length > 0 && suggestions.length > 0 ? (
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
            ) : null
          }
        />
      </section>

      <section id="complejos" className="complexes-section">
        <div className="section-header">
          <div>
            <h2>Complejos cargados</h2>
            <p>Busca por barrio, elige fecha y hora, y encuentra las canchas disponibles.</p>
          </div>
        </div>

        <NoticeBanner>
          El buscador intenta traer localidades y municipios reales de Buenos Aires con GeoRef
          Argentina. Si el servicio no responde, cae al fallback demo.
        </NoticeBanner>

        {error ? <NoticeBanner variant="error">{error}</NoticeBanner> : null}

        {loading ? (
          <div className="empty-state">Cargando complejos...</div>
        ) : complexes.length === 0 ? (
          <div className="empty-state">No encontramos complejos para esa zona todavia.</div>
        ) : (
          <ComplexGrid complexes={complexes} />
        )}
      </section>
    </main>
  );
}
