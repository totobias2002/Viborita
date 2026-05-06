# Frontend JSX Guide

Los esqueletos JSX base para las 3 pantallas más importantes quedaron en:

- [frontend-screen-examples.tsx](/abs/path/c:/Users/toto/Desktop/facu/Viborita/docs/frontend-screen-examples.tsx:1)

## Pantallas incluidas

- `ComplexDetailPage`
- `CheckoutPage`
- `GuestReservationPage`

## Para qué sirve

Este archivo no intenta ser un diseño final ni una app compilable dentro de este repo. Sirve como:

- referencia de estructura visual
- distribución de bloques
- ejemplo de props reales
- puente entre el contrato de API y la UI

## Cómo usarlo en un frontend real

1. Copiar el archivo a algo como `src/features/reservas/screens.tsx`
2. Reemplazar clases CSS por tu sistema de estilos
3. Conectar props con:
   - `frontend-contract.ts`
   - `frontend-react-hooks.ts`
4. Separar cada pantalla en componentes propios

## Orden recomendado

1. montar `ComplexDetailPage`
2. conectar disponibilidad y CTA a `CheckoutPage`
3. cerrar flujo de éxito y `GuestReservationPage`

## Lo más importante

Si solo hacés estas tres pantallas bien, ya tenés el corazón del producto:

- descubrir turno
- reservar sin login
- ver/cancelar la reserva después
