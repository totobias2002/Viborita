# Frontend Screens

Este documento propone una estructura concreta de pantallas y componentes para Viborita, pensada sobre el contrato definido en:

- [frontend-contract.ts](/abs/path/c:/Users/toto/Desktop/facu/Viborita/docs/frontend-contract.ts:1)
- [frontend-react-hooks.ts](/abs/path/c:/Users/toto/Desktop/facu/Viborita/docs/frontend-react-hooks.ts:1)

## Rutas recomendadas

- `/`
- `/complejos/:id`
- `/checkout`
- `/reserva/exito`
- `/reserva/invitado/:token`
- `/mis-reservas`
- `/admin/complejos/:id/config`
- `/admin/reservas`

## 1. Home

Ruta: `/`

Objetivo:

- descubrir complejos
- filtrar por barrio
- entrar rápido al detalle del complejo

Componentes:

- `HomePage`
- `SearchBar`
- `NeighborhoodFilter`
- `ComplexGrid`
- `ComplexCard`

Props sugeridas:

```ts
type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

type ComplexCardProps = {
  complejo: ComplejoListItem;
  onOpen: (id: string) => void;
};
```

Contenido visual:

- título fuerte: `Reserva tu cancha de padel en menos de 1 minuto`
- buscador simple
- lista de complejos
- badge de política de cancelación

Estados:

- loading de lista
- empty state si no hay resultados
- error state si falla la API

## 2. Detalle de Complejo

Ruta: `/complejos/:id`

Objetivo:

- mostrar información del complejo
- mostrar canchas activas
- mostrar política de cancelación
- permitir elegir fecha y horario

Componentes:

- `ComplexDetailPage`
- `ComplexHero`
- `CancellationPolicyBanner`
- `CourtList`
- `AvailabilitySearchForm`
- `AvailabilityResults`

Props sugeridas:

```ts
type CancellationPolicyBannerProps = {
  cancelacionLimiteHoras: number;
  permiteCancelacionTardia: boolean;
};

type AvailabilitySearchFormProps = {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  onChange: (patch: {
    fecha?: string;
    horaInicio?: string;
    horaFin?: string;
  }) => void;
  onSearch: () => void;
  loading: boolean;
};
```

UX:

- la política del complejo tiene que verse antes del checkout
- si el usuario todavía no eligió horario, mostrar mensaje de ayuda
- cuando hay resultados, mostrar CTA directo a reservar

## 3. Resultados de Disponibilidad

Vive dentro del detalle del complejo.

Objetivo:

- transformar canchas disponibles en opciones de reserva concretas

Componentes:

- `AvailabilityResults`
- `AvailabilityCard`

Props sugeridas:

```ts
type AvailabilityCardProps = {
  selection: CheckoutSelection;
  onReserve: (selection: CheckoutSelection) => void;
};
```

Cada card debería mostrar:

- nombre de cancha
- tipo
- horario seleccionado
- precio estimado
- CTA `Reservar`

## 4. Checkout

Ruta: `/checkout`

Objetivo:

- cerrar la reserva con el menor esfuerzo posible

Layout recomendado:

- columna izquierda: resumen
- columna derecha: formulario

Componentes:

- `CheckoutPage`
- `ReservationSummaryCard`
- `CheckoutGuestForm`
- `CheckoutUserBox`
- `CheckoutPolicyNotice`
- `CheckoutSubmitBar`

Props sugeridas:

```ts
type ReservationSummaryCardProps = {
  selection: CheckoutSelection;
  complejoDireccion?: string;
  canchaTipo?: string;
};

type CheckoutGuestFormProps = {
  form: GuestCheckoutFormState;
  onChange: (patch: Partial<GuestCheckoutFormState>) => void;
  disabled: boolean;
};

type CheckoutSubmitBarProps = {
  isAuthenticated: boolean;
  submitting: boolean;
  error?: string;
  onSubmitGuest: () => void;
  onSubmitUser: () => void;
};
```

Comportamiento:

- si no hay sesión:
  - pedir `nombre`
  - pedir `telefono`
  - `email` opcional
- si hay sesión:
  - no pedir datos de contacto otra vez
  - dejar notas opcionales

Copy recomendado:

- `Ya casi terminamos`
- `Te guardamos este turno con tus datos`
- `Podés cancelarlo hasta X horas antes`

## 5. Reserva Exitosa

Ruta: `/reserva/exito`

Objetivo:

- confirmar visualmente que la reserva se creó
- dar siguiente paso claro

Componentes:

- `ReservationSuccessPage`
- `SuccessStateCard`
- `ReservationSuccessActions`

Props sugeridas:

```ts
type ReservationSuccessPageProps = {
  success: ReservaSuccessState;
};
```

Si es invitado:

- mostrar botón `Ver mi reserva`
- mostrar texto: `Guardá este acceso para revisar o cancelar tu turno`

Si es usuario:

- mostrar botón `Ir a mis reservas`

## 6. Reserva de Invitado

Ruta: `/reserva/invitado/:token`

Objetivo:

- permitir ver la reserva sin cuenta
- permitir cancelar si la política y el estado lo permiten

Componentes:

- `GuestReservationPage`
- `ReservationStatusBadge`
- `GuestReservationDetails`
- `GuestReservationActions`

Props sugeridas:

```ts
type GuestReservationActionsProps = {
  reserva: ReservaWithRelations;
  loading: boolean;
  error: string | null;
  onCancel: () => void;
};
```

Reglas de UI:

- si `estado` es `CANCELADA`, no mostrar CTA
- si `estado` es `COMPLETADA`, no mostrar CTA
- si backend devuelve error por ventana vencida, mostrarlo en claro

## 7. Mis Reservas

Ruta: `/mis-reservas`

Objetivo:

- mostrar historial del usuario
- permitir cancelar reservas propias

Componentes:

- `MyReservationsPage`
- `ReservationList`
- `ReservationListItem`
- `ReservationFilters`

Props sugeridas:

```ts
type ReservationListItemProps = {
  reserva: ReservaWithRelations;
  onCancel: (id: string) => void;
  canCancel: boolean;
};
```

Filtros útiles:

- todas
- pendientes
- confirmadas
- canceladas
- completadas

## 8. Admin Config

Ruta: `/admin/complejos/:id/config`

Objetivo:

- permitir que el admin configure la política de cancelación del complejo

Componentes:

- `AdminComplexConfigPage`
- `CancellationPolicyForm`
- `PolicyPreviewCard`

Props sugeridas:

```ts
type CancellationPolicyFormProps = {
  cancelacionLimiteHoras: number;
  permiteCancelacionTardia: boolean;
  onChange: (patch: {
    cancelacionLimiteHoras?: number;
    permiteCancelacionTardia?: boolean;
  }) => void;
  onSave: () => void;
  saving: boolean;
  error?: string | null;
};
```

UX:

- preview instantáneo del texto para cliente
- explicación corta de impacto

Ejemplos:

- `Cancelación online hasta 1 hora antes`
- `Se permite cancelación online fuera del límite`

## 9. Admin Reservas

Ruta: `/admin/reservas`

Objetivo:

- listar reservas del complejo del admin
- confirmar y completar reservas

Componentes:

- `AdminReservationsPage`
- `AdminReservationTable`
- `AdminReservationRow`
- `ReservationStatusActions`

Props sugeridas:

```ts
type ReservationStatusActionsProps = {
  reserva: ReservaWithRelations;
  onConfirm: (id: string) => void;
  onComplete: (id: string) => void;
  loading?: boolean;
};
```

## 10. UI Primitives

Conviene definir una base reutilizable:

- `PageContainer`
- `SectionHeader`
- `InfoBadge`
- `StatusBadge`
- `PrimaryButton`
- `SecondaryButton`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `FormField`
- `PriceTag`

## 11. Orden de construcción

Orden recomendado para implementarlo:

1. `HomePage`
2. `ComplexDetailPage`
3. `AvailabilityResults`
4. `CheckoutPage`
5. `ReservationSuccessPage`
6. `GuestReservationPage`
7. `MyReservationsPage`
8. `AdminComplexConfigPage`
9. `AdminReservationsPage`

## 12. Primera versión visual

Dirección visual sugerida para Viborita:

- look deportivo pero limpio
- énfasis en velocidad y claridad
- tarjetas grandes para canchas y horarios
- verde o azul intenso como color principal
- política de cancelación siempre visible pero no invasiva
- CTA de reserva muy evidente
