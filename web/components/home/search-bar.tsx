"use client";

import { useRef, type ReactNode } from "react";

type SearchBarProps = {
  searchText: string;
  onSearchTextChange: (value: string) => void;
  selectedDate: string;
  onSelectedDateChange: (value: string) => void;
  minDate: string;
  tomorrowDate: string;
  selectedDateLabel: string;
  minTime?: string;
  selectedTime: string;
  onSelectedTimeChange: (value: string) => void;
  timeOptions: string[];
  onSearch: () => void;
  isSearchDisabled?: boolean;
  loadingMessage?: ReactNode;
  suggestions?: ReactNode;
};

export function SearchBar({
  searchText,
  onSearchTextChange,
  selectedDate,
  onSelectedDateChange,
  minDate,
  tomorrowDate,
  selectedDateLabel,
  minTime,
  selectedTime,
  onSelectedTimeChange,
  timeOptions,
  onSearch,
  isSearchDisabled = false,
  loadingMessage,
  suggestions,
}: SearchBarProps) {
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  function openDatePicker() {
    const input = dateInputRef.current;
    if (!input) {
      return;
    }

    const pickerInput = input as HTMLInputElement & {
      showPicker?: () => void;
    };

    if (typeof pickerInput.showPicker === "function") {
      pickerInput.showPicker();
      return;
    }

    input.click();
  }

  return (
    <div className="search-strip">
      <div className="search-segment search-stack">
        <span className="search-segment__label">Barrio o zona</span>
        <input
          placeholder="Busca barrio o zona"
          value={searchText}
          onChange={(event) => onSearchTextChange(event.target.value)}
        />

        {loadingMessage}
        {suggestions}
      </div>

      <div className="search-segment search-segment--date">
        <span className="search-segment__label">Fecha</span>
        <div className="search-date-picker">
          <div className="search-date-quick">
            <button
              type="button"
              className={selectedDate === minDate ? "date-chip is-active" : "date-chip"}
              onClick={() => onSelectedDateChange(minDate)}
            >
              Hoy
            </button>
            <button
              type="button"
              className={
                selectedDate === tomorrowDate ? "date-chip is-active" : "date-chip"
              }
              onClick={() => onSelectedDateChange(tomorrowDate)}
            >
              Manana
            </button>
          </div>

          <button type="button" className="date-display-button" onClick={openDatePicker}>
            <span className="date-display-button__label">{selectedDateLabel}</span>
            <span className="date-display-button__hint">Elegir otra fecha</span>
          </button>

          <input
            ref={dateInputRef}
            className="search-date-native"
            type="date"
            value={selectedDate}
            min={minDate}
            onChange={(event) => onSelectedDateChange(event.target.value)}
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="search-segment search-segment--time">
        <span className="search-segment__label">Hora</span>
        <label className="search-control">
          <select value={selectedTime} onChange={(event) => onSelectedTimeChange(event.target.value)}>
            <option value="">Elige horario</option>
            {timeOptions.map((option) => (
              <option key={option} value={option}>
                {option} hs
              </option>
            ))}
          </select>
          <span className="search-control__hint">
            {minTime ? `Disponible desde ${minTime}` : "Franjas de 30 minutos"}
          </span>
        </label>
      </div>

      <button className="primary-button search-submit" onClick={onSearch} disabled={isSearchDisabled}>
        Buscar canchas
      </button>
    </div>
  );
}
