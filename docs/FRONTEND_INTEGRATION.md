# Frontend Integration

El archivo [frontend-contract.ts](/abs/path/c:/Users/toto/Desktop/facu/Viborita/docs/frontend-contract.ts:1) deja un contrato listo para mover a un front en React, Next.js o similar.

## Que incluye

- tipos TypeScript para auth, complejos, canchas y reservas
- payloads para checkout de invitado y usuario autenticado
- helpers para mostrar politica de cancelacion y calcular precio estimado
- un cliente `ViboritaApiClient` basado en `fetch`
- shapes de estado utiles para la pantalla de checkout y exito

## Uso sugerido

1. Copiar `docs/frontend-contract.ts` a algo como `src/lib/api/viborita.ts` en el frontend.
2. Instanciar el cliente:

```ts
const api = new ViboritaApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  getToken: () => localStorage.getItem("token"),
});
```

3. Flujo de checkout:

- llamar `api.getComplejo(id)` para mostrar politica y datos del lugar
- llamar `api.getAvailableCanchas(...)` para mostrar horarios/canchas
- construir `CheckoutSelection`
- si no hay sesion, enviar `GuestCheckoutPayload`
- si hay sesion, enviar `UserCheckoutPayload`
- si vuelve `invitadoToken`, redirigir a `/reserva/invitado/:token`

## Componentes recomendados

- `ComplexListPage`
- `ComplexDetailPage`
- `AvailabilityPicker`
- `CheckoutPage`
- `ReservationSuccessPage`
- `GuestReservationPage`
- `MyReservationsPage`
- `AdminReservationPolicyForm`

## Nota

Este contrato sigue el backend actual. Si mas adelante sumas seña, penalidades o pagos, conviene extender primero estos tipos y despues las pantallas.
