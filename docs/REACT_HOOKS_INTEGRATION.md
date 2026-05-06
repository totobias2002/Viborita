# React Hooks Integration

El archivo [frontend-react-hooks.ts](/abs/path/c:/Users/toto/Desktop/facu/Viborita/docs/frontend-react-hooks.ts:1) deja una capa pensada para React o Next encima del contrato base.

## Que trae

- factories/controladores para lista de complejos
- busqueda de disponibilidad
- checkout invitado o autenticado
- vista de reserva invitada por token
- listado de mis reservas
- validaciones de checkout y normalizacion de errores

## Idea de uso en React

La forma mas simple es copiar estos helpers al frontend y envolverlos con `useState`, `useEffect` o `useReducer`.

Ejemplo conceptual:

```ts
const api = new ViboritaApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  getToken: () => localStorage.getItem("token"),
});

const checkout = createCheckoutController(api, window.location.origin);

checkout.setSelection(selection);
checkout.updateGuestForm({ invitadoNombre: "Juan" });

const success = await checkout.submitAsGuest();
router.push(success.redirectUrl);
```

## Hooks reales recomendados

Si despues armas el frontend, estos controladores se pueden envolver asi:

- `useComplexList`
- `useAvailabilitySearch`
- `useCheckout`
- `useGuestReservation`
- `useMyReservations`

## Siguiente nivel

Cuando exista el frontend real, el paso natural es:

1. mover `frontend-contract.ts` a `src/lib/api/viborita.ts`
2. mover `frontend-react-hooks.ts` a `src/lib/api/viborita-hooks.ts`
3. crear hooks de verdad con React
4. conectar componentes:
   - `ComplexListPage`
   - `ComplexDetailPage`
   - `CheckoutPage`
   - `GuestReservationPage`
   - `MyReservationsPage`
