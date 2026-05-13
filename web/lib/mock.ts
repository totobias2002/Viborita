import type {
  AuthResponse,
  CanchaSummary,
  ComplejoListItem,
  CreateReservaPayload,
  ReservaWithRelations,
  SearchAvailabilityParams,
} from "@/lib/api/viborita";
import { buildEstimatedPrice } from "@/lib/api/viborita";

const MOCK_RESERVAS_KEY = "viborita.mock.reservas";
const MOCK_USERS_KEY = "viborita.mock.users";

type MockComplejo = ComplejoListItem & {
  canchas: CanchaSummary[];
  location: {
    lat: number;
    lng: number;
  };
};

export interface MockPlaceSuggestion {
  id: string;
  label: string;
  subtitle: string;
  lat: number;
  lng: number;
}

export interface MockComplexSearchResult extends ComplejoListItem {
  distanceKm?: number;
}

const nowIso = new Date().toISOString();

const mockComplejos: MockComplejo[] = [
  {
    id: "cmp-belgrano-smash",
    nombre: "Smash Belgrano",
    direccion: "Av. Monroe 2241",
    barrio: "Belgrano",
    descripcion:
      "Complejo pensado para turnos post oficina, clases y partidos de pareja fija.",
    telefono: "+54 11 4567 8899",
    email: "hola@smashbelgrano.com",
    cancelacionLimiteHoras: 3,
    permiteCancelacionTardia: false,
    adminId: "admin-smash",
    createdAt: nowIso,
    updatedAt: nowIso,
    _count: { canchas: 3, reviews: 14 },
    location: {
      lat: -34.5629,
      lng: -58.4625,
    },
    canchas: [
      {
        id: "cancha-smash-1",
        nombre: "Cancha Central",
        tipo: "PANORAMICA",
        precio: "22000",
        descripcion: "La mas pedida para partidos premium y clases filmadas.",
        techada: true,
        iluminacion: true,
        activa: true,
        complejoId: "cmp-belgrano-smash",
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        id: "cancha-smash-2",
        nombre: "Cancha 2",
        tipo: "INDOOR",
        precio: "18000",
        descripcion: "Ideal para partidos rapidos entre semana.",
        techada: true,
        iluminacion: true,
        activa: true,
        complejoId: "cmp-belgrano-smash",
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        id: "cancha-smash-3",
        nombre: "Cancha Terraza",
        tipo: "OUTDOOR",
        precio: "16000",
        descripcion: "Exterior, con vista abierta y horario sunset.",
        techada: false,
        iluminacion: true,
        activa: true,
        complejoId: "cmp-belgrano-smash",
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    ],
  },
  {
    id: "cmp-palermo-rally",
    nombre: "Rally Padel House",
    direccion: "Costa Rica 5630",
    barrio: "Palermo",
    descripcion:
      "Look mas urbano, foco en experiencia social y eventos de comunidad.",
    telefono: "+54 11 4988 1122",
    email: "turnos@rallyhouse.com",
    cancelacionLimiteHoras: 2,
    permiteCancelacionTardia: true,
    adminId: "admin-rally",
    createdAt: nowIso,
    updatedAt: nowIso,
    _count: { canchas: 2, reviews: 9 },
    location: {
      lat: -34.5822,
      lng: -58.4338,
    },
    canchas: [
      {
        id: "cancha-rally-1",
        nombre: "Arena 01",
        tipo: "TECHADA",
        precio: "21000",
        descripcion: "Perfecta para torneos cortos y partidos intensos.",
        techada: true,
        iluminacion: true,
        activa: true,
        complejoId: "cmp-palermo-rally",
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        id: "cancha-rally-2",
        nombre: "Arena 02",
        tipo: "PANORAMICA",
        precio: "24000",
        descripcion: "Cancha premium para fotos, reels y finales.",
        techada: true,
        iluminacion: true,
        activa: true,
        complejoId: "cmp-palermo-rally",
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    ],
  },
  {
    id: "cmp-vicente-lopez-lob",
    nombre: "Lob Norte",
    direccion: "Maipu 811",
    barrio: "Vicente Lopez",
    descripcion:
      "Padel de barrio bien ejecutado: turnos claros, buena iluminacion y ritmo constante.",
    telefono: "+54 11 4321 7700",
    email: "reservas@lobnorte.com",
    cancelacionLimiteHoras: 1,
    permiteCancelacionTardia: false,
    adminId: "admin-lob",
    createdAt: nowIso,
    updatedAt: nowIso,
    _count: { canchas: 2, reviews: 6 },
    location: {
      lat: -34.5263,
      lng: -58.4769,
    },
    canchas: [
      {
        id: "cancha-lob-1",
        nombre: "Norte 1",
        tipo: "INDOOR",
        precio: "17000",
        descripcion: "Buen precio para captar partidos recurrentes.",
        techada: true,
        iluminacion: true,
        activa: true,
        complejoId: "cmp-vicente-lopez-lob",
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        id: "cancha-lob-2",
        nombre: "Norte 2",
        tipo: "OUTDOOR",
        precio: "15000",
        descripcion: "Exterior con buena luz y ocupacion fuerte de fin de semana.",
        techada: false,
        iluminacion: true,
        activa: true,
        complejoId: "cmp-vicente-lopez-lob",
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    ],
  },
];

const mockPlaces: MockPlaceSuggestion[] = [
  {
    id: "place-saavedra-caba",
    label: "Saavedra",
    subtitle: "Ciudad Autonoma de Buenos Aires, Argentina",
    lat: -34.5547,
    lng: -58.4919,
  },
  {
    id: "place-saavedra-provincia",
    label: "Saavedra",
    subtitle: "Provincia de Buenos Aires, Argentina",
    lat: -37.7692,
    lng: -62.3494,
  },
  {
    id: "place-saavedra-santa-fe",
    label: "Saavedra",
    subtitle: "Santa Fe, Argentina",
    lat: -31.6333,
    lng: -60.7001,
  },
  {
    id: "place-belgrano-caba",
    label: "Belgrano",
    subtitle: "Ciudad Autonoma de Buenos Aires, Argentina",
    lat: -34.5621,
    lng: -58.4563,
  },
  {
    id: "place-belgrano-cordoba",
    label: "Belgrano",
    subtitle: "Cordoba, Argentina",
    lat: -31.397,
    lng: -64.1825,
  },
  {
    id: "place-palermo-caba",
    label: "Palermo",
    subtitle: "Ciudad Autonoma de Buenos Aires, Argentina",
    lat: -34.5795,
    lng: -58.4306,
  },
  {
    id: "place-palermo-provincia",
    label: "Palermo",
    subtitle: "Provincia de Buenos Aires, Argentina",
    lat: -34.9133,
    lng: -57.9516,
  },
  {
    id: "place-palermo-santa-fe",
    label: "Palermo",
    subtitle: "Santa Fe, Argentina",
    lat: -31.6328,
    lng: -60.6989,
  },
  {
    id: "place-vicente-lopez",
    label: "Vicente Lopez",
    subtitle: "Provincia de Buenos Aires, Argentina",
    lat: -34.5271,
    lng: -58.4803,
  },
  {
    id: "place-moron",
    label: "Moron",
    subtitle: "Provincia de Buenos Aires, Argentina",
    lat: -34.6534,
    lng: -58.6198,
  },
  {
    id: "place-merlo",
    label: "Merlo",
    subtitle: "Provincia de Buenos Aires, Argentina",
    lat: -34.6665,
    lng: -58.7275,
  },
  {
    id: "place-san-miguel",
    label: "San Miguel",
    subtitle: "Provincia de Buenos Aires, Argentina",
    lat: -34.5431,
    lng: -58.7126,
  },
  {
    id: "place-pilar",
    label: "Pilar",
    subtitle: "Provincia de Buenos Aires, Argentina",
    lat: -34.4587,
    lng: -58.9142,
  },
  {
    id: "place-tigre",
    label: "Tigre",
    subtitle: "Provincia de Buenos Aires, Argentina",
    lat: -34.4251,
    lng: -58.5797,
  },
  {
    id: "place-ramos-mejia",
    label: "Ramos Mejia",
    subtitle: "Provincia de Buenos Aires, Argentina",
    lat: -34.646,
    lng: -58.5615,
  },
  {
    id: "place-castelar",
    label: "Castelar",
    subtitle: "Moron, Provincia de Buenos Aires, Argentina",
    lat: -34.6512,
    lng: -58.6438,
  },
  {
    id: "place-ituzaingo",
    label: "Ituzaingo",
    subtitle: "Provincia de Buenos Aires, Argentina",
    lat: -34.6584,
    lng: -58.6731,
  },
  {
    id: "place-nunez-caba",
    label: "Nunez",
    subtitle: "Ciudad Autonoma de Buenos Aires, Argentina",
    lat: -34.5453,
    lng: -58.4658,
  },
];

const demoUser = {
  id: "mock-user-demo",
  nombre: "Jugador Demo",
  email: "demo@viborita.app",
  telefono: "11 5555 1234",
  rol: "USER" as const,
  activo: true,
  createdAt: nowIso,
  updatedAt: nowIso,
};

const buildReservaId = () => `res-${Math.random().toString(36).slice(2, 10)}`;
const buildGuestToken = () => `guest-${Math.random().toString(36).slice(2, 12)}`;

const buildReservaRecord = (
  complejo: MockComplejo,
  cancha: CanchaSummary,
  payload: CreateReservaPayload,
  user?: AuthResponse["user"] | null
): ReservaWithRelations => ({
  id: buildReservaId(),
  fecha: payload.fecha,
  horaInicio: payload.horaInicio,
  horaFin: payload.horaFin,
  estado: "PENDIENTE",
  notas: payload.notas || null,
  invitadoNombre: payload.invitadoNombre || null,
  invitadoTelefono: payload.invitadoTelefono || null,
  invitadoEmail: payload.invitadoEmail || null,
  invitadoToken: user ? null : buildGuestToken(),
  precioTotal: buildEstimatedPrice(
    Number(cancha.precio),
    payload.horaInicio,
    payload.horaFin
  ),
  usuarioId: user?.id || null,
  canchaId: cancha.id,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  usuario: user
    ? {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono || null,
      }
    : null,
  cancha: {
    ...cancha,
    complejo: {
      id: complejo.id,
      nombre: complejo.nombre,
      direccion: complejo.direccion,
      barrio: complejo.barrio,
      descripcion: complejo.descripcion || null,
      telefono: complejo.telefono || null,
      email: complejo.email || null,
      cancelacionLimiteHoras: complejo.cancelacionLimiteHoras,
      permiteCancelacionTardia: complejo.permiteCancelacionTardia,
      adminId: complejo.adminId,
      createdAt: complejo.createdAt,
      updatedAt: complejo.updatedAt,
    },
  },
});

const ensureWindow = () => {
  if (typeof window === "undefined") {
    throw new Error("Mock storage disponible solo en cliente");
  }
};

const readJson = <T,>(key: string, fallback: T): T => {
  ensureWindow();
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = <T,>(key: string, value: T) => {
  ensureWindow();
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const isMockMode = () =>
  process.env.NEXT_PUBLIC_USE_REAL_API !== "true";

export const listMockComplejos = (search = "") => {
  const normalized = search.trim().toLowerCase();
  if (!normalized) {
    return mockComplejos;
  }

  return mockComplejos.filter(
    (complejo) =>
      complejo.barrio.toLowerCase().includes(normalized) ||
      complejo.nombre.toLowerCase().includes(normalized)
  );
};

const toRadians = (value: number) => (value * Math.PI) / 180;

const distanceBetweenKm = (
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) *
      Math.sin(dLng / 2) *
      Math.cos(lat1) *
      Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

export const listMockPlaceSuggestions = (search = "") => {
  const normalized = search.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  const matches = mockPlaces.filter(
    (place) =>
      place.label.toLowerCase().includes(normalized) ||
      place.subtitle.toLowerCase().includes(normalized)
  );

  const unique = new Map<string, MockPlaceSuggestion>();

  matches.forEach((place) => {
    const key = place.label.toLowerCase();
    if (!unique.has(key)) {
      unique.set(key, place);
    }
  });

  return Array.from(unique.values());
};

export const getMockPlaceById = (placeId: string) =>
  mockPlaces.find((place) => place.id === placeId) || null;

export const searchMockComplejosNearby = (
  placeId: string,
  radiusKm = 10
): MockComplexSearchResult[] => {
  const place = getMockPlaceById(placeId);

  if (!place) {
    return [];
  }

  const sorted = mockComplejos
    .map((complejo) => ({
      ...complejo,
      distanceKm: distanceBetweenKm(place, complejo.location),
    }))
    .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

  const withinRadius = sorted.filter(
    (complejo) => (complejo.distanceKm || 0) <= radiusKm
  );

  if (withinRadius.length > 0) {
    return withinRadius;
  }

  return sorted.slice(0, 3);
};

export const searchMockComplejosByCoordinates = (
  latitude: number,
  longitude: number,
  radiusKm = 10
): MockComplexSearchResult[] => {
  const sorted = mockComplejos
    .map((complejo) => ({
      ...complejo,
      distanceKm: distanceBetweenKm(
        { lat: latitude, lng: longitude },
        complejo.location
      ),
    }))
    .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

  const withinRadius = sorted.filter(
    (complejo) => (complejo.distanceKm || 0) <= radiusKm
  );

  if (withinRadius.length > 0) {
    return withinRadius;
  }

  return sorted.slice(0, 3);
};

export const getMockComplejo = (id: string) =>
  mockComplejos.find((complejo) => complejo.id === id) || null;

export const getMockAvailableCanchas = (params: SearchAvailabilityParams) => {
  const complejo = getMockComplejo(params.complejoId);
  if (!complejo) {
    return [];
  }

  const hourBlock =
    params.horaInicio && params.horaInicio >= "20:00" ? 1 : 0;

  return complejo.canchas.filter((_, index) => index !== hourBlock);
};

const seedMockReservas = (): ReservaWithRelations[] => {
  const complejo = mockComplejos[0];
  const cancha = complejo.canchas[1];

  return [
    buildReservaRecord(
      complejo,
      cancha,
      {
        fecha: "2026-05-10",
        horaInicio: "19:00",
        horaFin: "20:30",
        canchaId: cancha.id,
        notas: "Partido demo",
      },
      demoUser
    ),
  ];
};

export const getMockReservas = () => {
  const reservas = readJson<ReservaWithRelations[]>(
    MOCK_RESERVAS_KEY,
    seedMockReservas()
  );

  if (reservas.length === 0) {
    const seeded = seedMockReservas();
    writeJson(MOCK_RESERVAS_KEY, seeded);
    return seeded;
  }

  return reservas;
};

const saveMockReservas = (reservas: ReservaWithRelations[]) => {
  writeJson(MOCK_RESERVAS_KEY, reservas);
};

export const createMockReserva = (
  payload: CreateReservaPayload,
  user?: AuthResponse["user"] | null
) => {
  const complejo = mockComplejos.find((item) =>
    item.canchas.some((cancha) => cancha.id === payload.canchaId)
  );

  if (!complejo) {
    throw new Error("No encontramos la cancha en el dataset demo");
  }

  const cancha = complejo.canchas.find((item) => item.id === payload.canchaId);

  if (!cancha) {
    throw new Error("No encontramos la cancha en el dataset demo");
  }

  const reserva = buildReservaRecord(complejo, cancha, payload, user);
  const next = [reserva, ...getMockReservas()];
  saveMockReservas(next);
  return reserva;
};

export const getMockGuestReserva = (token: string) =>
  getMockReservas().find((reserva) => reserva.invitadoToken === token) || null;

export const cancelMockGuestReserva = (token: string) => {
  const next = getMockReservas().map((reserva) =>
    reserva.invitadoToken === token
      ? {
          ...reserva,
          estado: "CANCELADA" as const,
          updatedAt: new Date().toISOString(),
        }
      : reserva
  );
  saveMockReservas(next);
  return next.find((reserva) => reserva.invitadoToken === token) || null;
};

export const getMockMyReservas = (userId: string) =>
  getMockReservas().filter((reserva) => reserva.usuarioId === userId);

export const cancelMockReserva = (id: string) => {
  const next = getMockReservas().map((reserva) =>
    reserva.id === id
      ? {
          ...reserva,
          estado: "CANCELADA" as const,
          updatedAt: new Date().toISOString(),
        }
      : reserva
  );
  saveMockReservas(next);
  return next.find((reserva) => reserva.id === id) || null;
};

const getMockUsers = () => readJson<AuthResponse[]>(MOCK_USERS_KEY, []);

const saveMockUsers = (users: AuthResponse[]) => {
  writeJson(MOCK_USERS_KEY, users);
};

export const mockLogin = (email: string, password: string): AuthResponse => {
  if (!email.trim() || !password.trim()) {
    throw new Error("Completa email y contrasena para el modo demo");
  }

  const users = getMockUsers();
  const existing = users.find((user) => user.user.email === email.trim());
  if (existing) {
    return existing;
  }

  if (email.trim() === demoUser.email) {
    const response: AuthResponse = {
      user: demoUser,
      token: "mock-token-demo",
    };
    saveMockUsers([response, ...users]);
    return response;
  }

  const response: AuthResponse = {
    user: {
      id: `mock-user-${Math.random().toString(36).slice(2, 8)}`,
      nombre: email.split("@")[0] || "Jugador",
      email: email.trim(),
      telefono: null,
      rol: "USER",
      activo: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    token: `mock-token-${Math.random().toString(36).slice(2, 10)}`,
  };
  saveMockUsers([response, ...users]);
  return response;
};

export const mockRegister = (payload: {
  nombre: string;
  email: string;
  telefono?: string;
  password: string;
}): AuthResponse => {
  if (!payload.nombre.trim() || !payload.email.trim() || !payload.password.trim()) {
    throw new Error("Completa nombre, email y contrasena para crear la cuenta demo");
  }

  const response: AuthResponse = {
    user: {
      id: `mock-user-${Math.random().toString(36).slice(2, 8)}`,
      nombre: payload.nombre.trim(),
      email: payload.email.trim(),
      telefono: payload.telefono?.trim() || null,
      rol: "USER",
      activo: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    token: `mock-token-${Math.random().toString(36).slice(2, 10)}`,
  };

  saveMockUsers([response, ...getMockUsers()]);
  return response;
};
