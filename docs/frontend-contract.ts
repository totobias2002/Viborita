export type UserRole = "USER" | "ADMIN" | "SUPERADMIN";

export type CourtType = "INDOOR" | "OUTDOOR" | "PANORAMICA" | "TECHADA";

export type ReservationStatus =
  | "PENDIENTE"
  | "CONFIRMADA"
  | "CANCELADA"
  | "COMPLETADA";

export interface ApiErrorResponse {
  error: string;
}

export interface UserSummary {
  id: string;
  nombre: string;
  email: string;
  telefono?: string | null;
}

export interface ComplejoSummary {
  id: string;
  nombre: string;
  direccion: string;
  barrio: string;
  ciudad?: string | null;
  provincia?: string | null;
  countryCode?: string | null;
  googlePlaceId?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  descripcion?: string | null;
  telefono?: string | null;
  email?: string | null;
  cancelacionLimiteHoras: number;
  permiteCancelacionTardia: boolean;
  adminId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ComplejoListItem extends ComplejoSummary {
  canchas?: CanchaSummary[];
  _count?: {
    canchas: number;
    reviews?: number;
  };
  distanceKm?: number;
}

export interface SearchNearbyComplejosParams {
  lat: number;
  lng: number;
  radioKm?: number;
}

export interface CanchaSummary {
  id: string;
  nombre: string;
  tipo: CourtType;
  precio: string;
  descripcion?: string | null;
  techada: boolean;
  iluminacion: boolean;
  activa: boolean;
  complejoId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CanchaWithComplejo extends CanchaSummary {
  complejo: Pick<
    ComplejoSummary,
    | "id"
    | "nombre"
    | "direccion"
    | "barrio"
    | "cancelacionLimiteHoras"
    | "permiteCancelacionTardia"
  >;
}

export interface ReservaSummary {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: ReservationStatus;
  notas?: string | null;
  invitadoNombre?: string | null;
  invitadoTelefono?: string | null;
  invitadoEmail?: string | null;
  invitadoToken?: string | null;
  precioTotal: number | string;
  usuarioId?: string | null;
  canchaId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReservaWithRelations extends ReservaSummary {
  usuario?: UserSummary | null;
  cancha: CanchaSummary & {
    complejo: ComplejoSummary;
  };
}

export interface AuthResponse {
  user: UserSummary & {
    rol: UserRole;
    activo: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  token: string;
}

export interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface SearchAvailabilityParams {
  complejoId: string;
  fecha: string;
  horaInicio?: string;
  horaFin?: string;
}

export interface GuestCheckoutPayload {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  canchaId: string;
  invitadoNombre: string;
  invitadoTelefono: string;
  invitadoEmail?: string;
  notas?: string;
}

export interface UserCheckoutPayload {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  canchaId: string;
  notas?: string;
}

export type CreateReservaPayload = GuestCheckoutPayload | UserCheckoutPayload;

export interface UpdateReservaPayload {
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
  notas?: string;
}

export interface CheckoutSelection {
  complejoId: string;
  complejoNombre: string;
  canchaId: string;
  canchaNombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  precioTotal: number;
  cancelacionLimiteHoras: number;
  permiteCancelacionTardia: boolean;
}

export interface GuestCheckoutFormState {
  invitadoNombre: string;
  invitadoTelefono: string;
  invitadoEmail: string;
  notas: string;
}

export interface CheckoutPageState {
  selection: CheckoutSelection;
  guestForm: GuestCheckoutFormState;
  isAuthenticated: boolean;
  submitting: boolean;
  error?: string;
}

export interface ReservaSuccessState {
  reservaId: string;
  estado: ReservationStatus;
  invitadoToken?: string | null;
  redirectUrl: string;
}

export const buildGuestReservationUrl = (
  frontendBaseUrl: string,
  invitadoToken: string
) => `${frontendBaseUrl}/reserva/invitado/${invitadoToken}`;

export const getCancellationPolicyLabel = (
  cancelacionLimiteHoras: number,
  permiteCancelacionTardia: boolean
) => {
  if (permiteCancelacionTardia) {
    return "Cancelacion online permitida incluso fuera del limite";
  }

  if (cancelacionLimiteHoras === 0) {
    return "Cancelacion online permitida hasta el horario de inicio";
  }

  if (cancelacionLimiteHoras === 1) {
    return "Cancelacion online hasta 1 hora antes";
  }

  return `Cancelacion online hasta ${cancelacionLimiteHoras} horas antes`;
};

export const buildEstimatedPrice = (
  precioPorHora: number,
  horaInicio: string,
  horaFin: string
) => {
  const [hiH, hiM] = horaInicio.split(":").map(Number);
  const [hfH, hfM] = horaFin.split(":").map(Number);
  const horas = hfH - hiH + (hfM - hiM) / 60;
  return Number((precioPorHora * horas).toFixed(2));
};

export interface ApiClientOptions {
  baseUrl: string;
  getToken?: () => string | null;
}

export class ViboritaApiClient {
  constructor(private readonly options: ApiClientOptions) {}

  async register(payload: RegisterPayload) {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async login(payload: LoginPayload) {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getProfile() {
    return this.request<AuthResponse["user"]>("/auth/profile", {
      method: "GET",
      auth: true,
    });
  }

  async changePassword(payload: ChangePasswordPayload) {
    return this.request<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: true,
    });
  }

  async listComplejos() {
    return this.request<ComplejoListItem[]>("/complejos", {
      method: "GET",
    });
  }

  async getComplejo(id: string) {
    return this.request<ComplejoSummary & { canchas: CanchaSummary[] }>(
      `/complejos/${id}`,
      {
        method: "GET",
      }
    );
  }

  async searchComplejosByBarrio(barrio: string) {
    return this.request<ComplejoListItem[]>(
      `/complejos/barrio/${encodeURIComponent(barrio)}`,
      {
        method: "GET",
      }
    );
  }

  async searchComplejosNearby(params: SearchNearbyComplejosParams) {
    const query = new URLSearchParams({
      lat: String(params.lat),
      lng: String(params.lng),
      ...(params.radioKm !== undefined
        ? { radioKm: String(params.radioKm) }
        : {}),
    });

    return this.request<ComplejoListItem[]>(
      `/complejos/cercanos?${query.toString()}`,
      {
        method: "GET",
      }
    );
  }

  async listCanchas() {
    return this.request<CanchaWithComplejo[]>("/canchas", {
      method: "GET",
    });
  }

  async listCanchasByComplejo(complejoId: string) {
    return this.request<CanchaSummary[]>(`/canchas/complejo/${complejoId}`, {
      method: "GET",
    });
  }

  async getCancha(id: string) {
    return this.request<CanchaWithComplejo>(`/canchas/${id}`, {
      method: "GET",
    });
  }

  async getAvailableCanchas(params: SearchAvailabilityParams) {
    const query = new URLSearchParams({
      fecha: params.fecha,
      ...(params.horaInicio ? { horaInicio: params.horaInicio } : {}),
      ...(params.horaFin ? { horaFin: params.horaFin } : {}),
    });

    return this.request<CanchaSummary[]>(
      `/canchas/disponibles/${params.complejoId}?${query.toString()}`,
      {
        method: "GET",
      }
    );
  }

  async createReserva(payload: CreateReservaPayload, authenticated = false) {
    return this.request<ReservaWithRelations>("/reservas", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: authenticated,
    });
  }

  async getMyReservas() {
    return this.request<ReservaWithRelations[]>("/reservas/mis-reservas", {
      method: "GET",
      auth: true,
    });
  }

  async getReserva(id: string) {
    return this.request<ReservaWithRelations>(`/reservas/${id}`, {
      method: "GET",
    });
  }

  async getGuestReserva(token: string) {
    return this.request<ReservaWithRelations>(`/reservas/guest/${token}`, {
      method: "GET",
    });
  }

  async cancelReserva(id: string) {
    return this.request<ReservaSummary>(`/reservas/${id}/cancelar`, {
      method: "PATCH",
      auth: true,
    });
  }

  async cancelGuestReserva(token: string) {
    return this.request<ReservaSummary>(`/reservas/guest/${token}/cancelar`, {
      method: "PATCH",
    });
  }

  async updateReserva(id: string, payload: UpdateReservaPayload) {
    return this.request<ReservaSummary>(`/reservas/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      auth: true,
    });
  }

  private async request<T>(
    path: string,
    init: RequestInit & { auth?: boolean }
  ): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Content-Type", "application/json");

    if (init.auth) {
      const token = this.options.getToken?.();

      if (!token) {
        throw new Error("No hay token de autenticacion disponible");
      }

      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${this.options.baseUrl}${path}`, {
      ...init,
      headers,
    });

    if (!response.ok) {
      const errorBody = (await response.json()) as ApiErrorResponse;
      throw new Error(errorBody.error || "Error inesperado en la API");
    }

    return response.json() as Promise<T>;
  }
}
