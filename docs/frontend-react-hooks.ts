import {
  ApiErrorResponse,
  CheckoutPageState,
  CheckoutSelection,
  ComplejoListItem,
  CreateReservaPayload,
  GuestCheckoutFormState,
  ReservaSuccessState,
  ReservaWithRelations,
  SearchAvailabilityParams,
  ViboritaApiClient,
  buildGuestReservationUrl,
} from "./frontend-contract";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseComplexListResult extends AsyncState<ComplejoListItem[]> {
  refetch: () => Promise<void>;
}

export interface UseAvailabilityResult
  extends AsyncState<CheckoutSelection[]> {
  search: (params: SearchAvailabilityParams) => Promise<void>;
  reset: () => void;
}

export interface UseCheckoutResult {
  state: CheckoutPageState;
  setSelection: (selection: CheckoutSelection) => void;
  updateGuestForm: (patch: Partial<GuestCheckoutFormState>) => void;
  submitAsGuest: () => Promise<ReservaSuccessState>;
  submitAsUser: () => Promise<ReservaSuccessState>;
  reset: () => void;
}

export interface UseGuestReservationResult
  extends AsyncState<ReservaWithRelations> {
  cancel: () => Promise<ReservaWithRelations>;
  refetch: () => Promise<void>;
}

export interface UseMyReservationsResult
  extends AsyncState<ReservaWithRelations[]> {
  cancel: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const createEmptyGuestCheckoutForm = (): GuestCheckoutFormState => ({
  invitadoNombre: "",
  invitadoTelefono: "",
  invitadoEmail: "",
  notas: "",
});

export const createEmptyCheckoutState = (): CheckoutPageState => ({
  selection: {
    complejoId: "",
    complejoNombre: "",
    canchaId: "",
    canchaNombre: "",
    fecha: "",
    horaInicio: "",
    horaFin: "",
    precioTotal: 0,
    cancelacionLimiteHoras: 1,
    permiteCancelacionTardia: false,
  },
  guestForm: createEmptyGuestCheckoutForm(),
  isAuthenticated: false,
  submitting: false,
  error: undefined,
});

export const mapAvailableCanchasToCheckoutSelection = (
  params: SearchAvailabilityParams,
  complejo: {
    id: string;
    nombre: string;
    cancelacionLimiteHoras: number;
    permiteCancelacionTardia: boolean;
  },
  canchas: Array<{
    id: string;
    nombre: string;
    precio: string;
  }>,
  estimatePrice: (precioPorHora: number, horaInicio: string, horaFin: string) => number
): CheckoutSelection[] => {
  if (!params.horaInicio || !params.horaFin) {
    return [];
  }

  return canchas.map((cancha) => ({
    complejoId: complejo.id,
    complejoNombre: complejo.nombre,
    canchaId: cancha.id,
    canchaNombre: cancha.nombre,
    fecha: params.fecha,
    horaInicio: params.horaInicio!,
    horaFin: params.horaFin!,
    precioTotal: estimatePrice(
      Number(cancha.precio),
      params.horaInicio!,
      params.horaFin!
    ),
    cancelacionLimiteHoras: complejo.cancelacionLimiteHoras,
    permiteCancelacionTardia: complejo.permiteCancelacionTardia,
  }));
};

export const createGuestCheckoutPayload = (
  state: CheckoutPageState
): CreateReservaPayload => ({
  fecha: state.selection.fecha,
  horaInicio: state.selection.horaInicio,
  horaFin: state.selection.horaFin,
  canchaId: state.selection.canchaId,
  invitadoNombre: state.guestForm.invitadoNombre.trim(),
  invitadoTelefono: state.guestForm.invitadoTelefono.trim(),
  ...(state.guestForm.invitadoEmail.trim()
    ? { invitadoEmail: state.guestForm.invitadoEmail.trim() }
    : {}),
  ...(state.guestForm.notas.trim() ? { notas: state.guestForm.notas.trim() } : {}),
});

export const createUserCheckoutPayload = (
  state: CheckoutPageState
): CreateReservaPayload => ({
  fecha: state.selection.fecha,
  horaInicio: state.selection.horaInicio,
  horaFin: state.selection.horaFin,
  canchaId: state.selection.canchaId,
  ...(state.guestForm.notas.trim() ? { notas: state.guestForm.notas.trim() } : {}),
});

export const buildReservationSuccessState = (
  reserva: ReservaWithRelations,
  frontendBaseUrl: string
): ReservaSuccessState => ({
  reservaId: reserva.id,
  estado: reserva.estado,
  invitadoToken: reserva.invitadoToken,
  redirectUrl: reserva.invitadoToken
    ? buildGuestReservationUrl(frontendBaseUrl, reserva.invitadoToken)
    : `${frontendBaseUrl}/mis-reservas`,
});

export const validateGuestCheckout = (state: CheckoutPageState) => {
  if (!state.selection.canchaId) {
    return "Debes seleccionar una cancha";
  }

  if (!state.selection.fecha || !state.selection.horaInicio || !state.selection.horaFin) {
    return "Debes completar fecha y horario";
  }

  if (!state.guestForm.invitadoNombre.trim()) {
    return "El nombre es obligatorio";
  }

  if (!state.guestForm.invitadoTelefono.trim()) {
    return "El telefono es obligatorio";
  }

  return null;
};

export const validateAuthenticatedCheckout = (state: CheckoutPageState) => {
  if (!state.selection.canchaId) {
    return "Debes seleccionar una cancha";
  }

  if (!state.selection.fecha || !state.selection.horaInicio || !state.selection.horaFin) {
    return "Debes completar fecha y horario";
  }

  return null;
};

export const normalizeApiError = async (error: unknown): Promise<string> => {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    typeof (error as ApiErrorResponse).error === "string"
  ) {
    return (error as ApiErrorResponse).error;
  }

  return "Ocurrio un error inesperado";
};

export const createComplexListController = (api: ViboritaApiClient) => {
  let current: UseComplexListResult = {
    data: null,
    loading: false,
    error: null,
    refetch,
  };

  async function refetch() {
    current = { ...current, loading: true, error: null };
    try {
      const data = await api.listComplejos();
      current = { ...current, data, loading: false };
    } catch (error) {
      current = {
        ...current,
        loading: false,
        error: await normalizeApiError(error),
      };
    }
  }

  return {
    getState: () => current,
    refetch,
  };
};

export const createAvailabilityController = (
  api: ViboritaApiClient,
  buildSelections: (
    params: SearchAvailabilityParams,
    canchas: Awaited<ReturnType<ViboritaApiClient["getAvailableCanchas"]>>
  ) => CheckoutSelection[]
) => {
  let current: UseAvailabilityResult = {
    data: null,
    loading: false,
    error: null,
    search,
    reset,
  };

  async function search(params: SearchAvailabilityParams) {
    current = { ...current, loading: true, error: null };
    try {
      const canchas = await api.getAvailableCanchas(params);
      current = {
        ...current,
        data: buildSelections(params, canchas),
        loading: false,
      };
    } catch (error) {
      current = {
        ...current,
        loading: false,
        error: await normalizeApiError(error),
      };
    }
  }

  function reset() {
    current = {
      ...current,
      data: null,
      loading: false,
      error: null,
    };
  }

  return {
    getState: () => current,
    search,
    reset,
  };
};

export const createCheckoutController = (
  api: ViboritaApiClient,
  frontendBaseUrl: string
) => {
  let current = createEmptyCheckoutState();

  const setSelection = (selection: CheckoutSelection) => {
    current = {
      ...current,
      selection,
      error: undefined,
    };
  };

  const updateGuestForm = (patch: Partial<GuestCheckoutFormState>) => {
    current = {
      ...current,
      guestForm: {
        ...current.guestForm,
        ...patch,
      },
      error: undefined,
    };
  };

  const submitAsGuest = async () => {
    const validationError = validateGuestCheckout(current);

    if (validationError) {
      current = { ...current, error: validationError };
      throw new Error(validationError);
    }

    current = { ...current, submitting: true, error: undefined };

    try {
      const reserva = await api.createReserva(createGuestCheckoutPayload(current));
      const success = buildReservationSuccessState(reserva, frontendBaseUrl);
      current = { ...current, submitting: false };
      return success;
    } catch (error) {
      const message = await normalizeApiError(error);
      current = { ...current, submitting: false, error: message };
      throw new Error(message);
    }
  };

  const submitAsUser = async () => {
    const validationError = validateAuthenticatedCheckout(current);

    if (validationError) {
      current = { ...current, error: validationError };
      throw new Error(validationError);
    }

    current = { ...current, submitting: true, error: undefined };

    try {
      const reserva = await api.createReserva(createUserCheckoutPayload(current), true);
      const success = buildReservationSuccessState(reserva, frontendBaseUrl);
      current = { ...current, submitting: false };
      return success;
    } catch (error) {
      const message = await normalizeApiError(error);
      current = { ...current, submitting: false, error: message };
      throw new Error(message);
    }
  };

  const reset = () => {
    current = createEmptyCheckoutState();
  };

  return {
    getState: () => current,
    setSelection,
    updateGuestForm,
    submitAsGuest,
    submitAsUser,
    reset,
  };
};

export const createGuestReservationController = (
  api: ViboritaApiClient,
  token: string
) => {
  let current: UseGuestReservationResult = {
    data: null,
    loading: false,
    error: null,
    cancel,
    refetch,
  };

  async function refetch() {
    current = { ...current, loading: true, error: null };
    try {
      const data = await api.getGuestReserva(token);
      current = { ...current, data, loading: false };
    } catch (error) {
      current = {
        ...current,
        loading: false,
        error: await normalizeApiError(error),
      };
    }
  }

  async function cancel() {
    current = { ...current, loading: true, error: null };
    try {
      await api.cancelGuestReserva(token);
      const refreshed = await api.getGuestReserva(token);
      current = { ...current, data: refreshed, loading: false };
      return refreshed;
    } catch (error) {
      current = {
        ...current,
        loading: false,
        error: await normalizeApiError(error),
      };
      throw error;
    }
  }

  return {
    getState: () => current,
    cancel,
    refetch,
  };
};

export const createMyReservationsController = (api: ViboritaApiClient) => {
  let current: UseMyReservationsResult = {
    data: null,
    loading: false,
    error: null,
    cancel,
    refetch,
  };

  async function refetch() {
    current = { ...current, loading: true, error: null };
    try {
      const data = await api.getMyReservas();
      current = { ...current, data, loading: false };
    } catch (error) {
      current = {
        ...current,
        loading: false,
        error: await normalizeApiError(error),
      };
    }
  }

  async function cancel(id: string) {
    current = { ...current, loading: true, error: null };
    try {
      await api.cancelReserva(id);
      const data = await api.getMyReservas();
      current = { ...current, data, loading: false };
    } catch (error) {
      current = {
        ...current,
        loading: false,
        error: await normalizeApiError(error),
      };
      throw error;
    }
  }

  return {
    getState: () => current,
    cancel,
    refetch,
  };
};
