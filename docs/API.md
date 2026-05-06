# API Guide - Viborita

> Version: 1.1.0
> Last updated: 2026-05-04
> Status: Active

## Overview

Viborita is a REST API for padel court reservations. It supports:

- User registration and login with JWT
- Complex management
- Court management
- Reservation creation with availability checks
- Guest checkout for reservations without mandatory login
- Reservation lifecycle updates by owner or admins

Base routes currently mounted in the app:

- `GET /`
- `GET /health/db`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/profile`
- `POST /auth/change-password`
- `GET /complejos`
- `GET /complejos/cercanos`
- `GET /complejos/barrio/:barrio`
- `GET /complejos/:id`
- `GET /complejos/admin/:adminId`
- `POST /complejos`
- `PUT /complejos/:id`
- `DELETE /complejos/:id`
- `GET /canchas`
- `GET /canchas/complejo/:complejoId`
- `GET /canchas/disponibles/:complejoId`
- `GET /canchas/:id`
- `POST /canchas`
- `PUT /canchas/:id`
- `DELETE /canchas/:id`
- `GET /reservas`
- `GET /reservas/guest/:token`
- `GET /reservas/cancha/:canchaId`
- `GET /reservas/mis-reservas`
- `GET /reservas/:id`
- `POST /reservas`
- `PUT /reservas/:id`
- `PATCH /reservas/guest/:token/cancelar`
- `PATCH /reservas/:id/cancelar`
- `PATCH /reservas/:id/confirmar`
- `PATCH /reservas/:id/completar`

## Auth

Protected endpoints require:

```http
Authorization: Bearer <token>
```

Roles in the system:

- `USER`
- `ADMIN`
- `SUPERADMIN`

### POST /auth/register

Body:

```json
{
  "nombre": "Juan Perez",
  "email": "juan@email.com",
  "password": "secreto123",
  "telefono": "+5491112345678"
}
```

Response `201`:

```json
{
  "user": {
    "id": "cuid123",
    "nombre": "Juan Perez",
    "email": "juan@email.com",
    "rol": "USER",
    "telefono": "+5491112345678",
    "activo": true
  },
  "token": "jwt-token"
}
```

### POST /auth/login

Body:

```json
{
  "email": "juan@email.com",
  "password": "secreto123"
}
```

### GET /auth/profile

Returns the authenticated user profile.

### POST /auth/change-password

Body:

```json
{
  "currentPassword": "secreto123",
  "newPassword": "nuevo456"
}
```

## Complejos

### GET /complejos

Lists all complexes.

### GET /complejos/barrio/:barrio

Filters complexes by neighborhood.

### GET /complejos/cercanos

Searches complexes ordered by distance from a point.

Query params:

- `lat` required
- `lng` required
- `radioKm` optional, default `10`

Example:

```http
GET /complejos/cercanos?lat=-34.6507&lng=-58.6198&radioKm=10
```

Typical use case:

- the frontend resolves a place like `Moron, Provincia de Buenos Aires, Argentina`
- it gets coordinates from Google Places
- then it asks Viborita for complexes near that point

### GET /complejos/:id

Returns one complex by id.

### GET /complejos/admin/:adminId

Protected. Returns complexes administered by the given user.

### POST /complejos

Protected. Requires `ADMIN` or `SUPERADMIN`.

Body:

```json
{
  "nombre": "Club Padel Central",
  "direccion": "Av. Corrientes 1234",
  "barrio": "Centro",
  "ciudad": "Moron",
  "provincia": "Provincia de Buenos Aires",
  "countryCode": "AR",
  "googlePlaceId": "ChIJ-demo-place-id",
  "latitude": -34.6507,
  "longitude": -58.6198,
  "descripcion": "Complejo principal",
  "telefono": "+5491112345678",
  "email": "contacto@club.com",
  "cancelacionLimiteHoras": 1,
  "permiteCancelacionTardia": false,
  "adminId": "cuid-admin"
}
```

### PUT /complejos/:id

Protected. Requires `ADMIN` or `SUPERADMIN`.

Location fields for a production-ready search experience:

- `ciudad`
- `provincia`
- `countryCode`
- `googlePlaceId`
- `latitude`
- `longitude`

Cancellation policy fields:

- `cancelacionLimiteHoras`: integer, default `1`
- `permiteCancelacionTardia`: boolean, default `false`

Recommended MVP behavior:

- the complex defines how many hours before the match a reservation can still be canceled
- if `permiteCancelacionTardia` is `false`, online cancellation is blocked after that limit
- if `permiteCancelacionTardia` is `true`, the system allows late cancellation and you can later attach penalties or deposit rules

### DELETE /complejos/:id

Protected. Requires `ADMIN` or `SUPERADMIN`.

## Canchas

### GET /canchas

Lists all courts.

### GET /canchas/complejo/:complejoId

Lists courts for one complex.

### GET /canchas/disponibles/:complejoId

Query params:

- `fecha` required, format `YYYY-MM-DD`
- `horaInicio` optional, format `HH:mm`
- `horaFin` optional, format `HH:mm`

Example:

```http
GET /canchas/disponibles/cuid-complejo?fecha=2026-05-04&horaInicio=18:00&horaFin=19:30
```

### GET /canchas/:id

Returns one court by id.

### POST /canchas

Protected. Requires `ADMIN` or `SUPERADMIN`.

Body:

```json
{
  "nombre": "Cancha 1",
  "tipo": "PANORAMICA",
  "precio": 1500,
  "descripcion": "Cancha principal",
  "techada": true,
  "iluminacion": true,
  "complejoId": "cuid-complejo"
}
```

### PUT /canchas/:id

Protected. Requires `ADMIN` or `SUPERADMIN`.

### DELETE /canchas/:id

Protected. Requires `ADMIN` or `SUPERADMIN`.

Note: delete is a soft delete. The court is marked with `activa: false`.

## Reservas

Reservation states:

- `PENDIENTE`
- `CONFIRMADA`
- `CANCELADA`
- `COMPLETADA`

### GET /reservas

Lists all reservations.

### GET /reservas/:id

Returns one reservation by id.

### GET /reservas/mis-reservas

Protected. Returns reservations for the authenticated user.

### GET /reservas/cancha/:canchaId

Optional query param:

- `fecha` with format `YYYY-MM-DD`

### POST /reservas

Public. If the request includes a valid `Authorization: Bearer <token>`, the reservation is associated with that user.
If there is no session, the reservation can still be created as a guest checkout.

Body:

```json
{
  "fecha": "2026-05-04",
  "horaInicio": "18:00",
  "horaFin": "19:30",
  "canchaId": "cuid-cancha",
  "invitadoNombre": "Juan Perez",
  "invitadoTelefono": "+5491112345678",
  "invitadoEmail": "juan@email.com",
  "notas": "Partido amistoso"
}
```

Rules:

- `fecha`, `horaInicio`, `horaFin` and `canchaId` are required
- time format must be `HH:mm`
- `horaFin` must be greater than `horaInicio`
- the selected court must be active
- overlapping `PENDIENTE` or `CONFIRMADA` reservations are rejected
- `precioTotal` is calculated automatically from court price and duration
- if the user is not authenticated, `invitadoNombre` and `invitadoTelefono` are required
- `invitadoEmail` is optional but must have valid format if sent

Guest checkout example:

```json
{
  "fecha": "2026-05-04",
  "horaInicio": "20:00",
  "horaFin": "21:30",
  "canchaId": "cuid-cancha",
  "invitadoNombre": "Juan Perez",
  "invitadoTelefono": "+5491112345678",
  "notas": "Primera vez usando Viborita"
}
```

Guest checkout response notes:

- guest reservations include `invitadoToken`
- that token can be used later to view or cancel the reservation without login

### GET /reservas/guest/:token

Public.

Returns a guest reservation using its unique token.

Typical use case:

- show reservation details from a link sent by WhatsApp or email
- let the guest review date, court, complex and status without creating an account

### PUT /reservas/:id

Protected.

Rules:

- only `PENDIENTE` reservations can be updated
- the reservation owner can update it
- the admin of the complex that owns the court can also update it
- `SUPERADMIN` can update any reservation
- if date or time changes, availability is checked again
- if only one time value is sent, the other one is taken from the existing reservation
- the resulting range must still have `horaFin > horaInicio`
- if the time range changes, `precioTotal` is recalculated

Example partial update body:

```json
{
  "fecha": "2026-05-05",
  "horaInicio": "19:00"
}
```

### PATCH /reservas/:id/cancelar

Protected.

Rules:

- only the reservation owner can cancel it
- guest reservations cannot be canceled from this endpoint because they are not linked to an authenticated user
- a completed reservation cannot be canceled
- if the complex blocks late cancellation, the reservation can only be canceled before the configured limit

### PATCH /reservas/guest/:token/cancelar

Public.

Rules:

- only reservations created as guest checkout can be canceled here
- the guest must have the correct `invitadoToken`
- a completed reservation cannot be canceled
- if the complex blocks late cancellation, the reservation can only be canceled before the configured limit
- this is the natural endpoint to connect with a future cancellation policy or penalty flow

### PATCH /reservas/:id/confirmar

Protected. Route access requires `ADMIN` or `SUPERADMIN`.

Business rules:

- only `PENDIENTE` reservations can be confirmed
- an `ADMIN` can only confirm reservations for courts in their own complex
- `SUPERADMIN` can confirm any reservation

### PATCH /reservas/:id/completar

Protected. Route access requires `ADMIN` or `SUPERADMIN`.

Business rules:

- only `CONFIRMADA` reservations can be completed
- an `ADMIN` can only complete reservations for courts in their own complex
- `SUPERADMIN` can complete any reservation

## Data Model Summary

### User

- `id`
- `nombre`
- `email`
- `password`
- `rol`
- `telefono`
- `activo`
- `createdAt`
- `updatedAt`

### Complejo

- `id`
- `nombre`
- `direccion`
- `barrio`
- `ciudad`
- `provincia`
- `countryCode`
- `googlePlaceId`
- `latitude`
- `longitude`
- `descripcion`
- `telefono`
- `email`
- `cancelacionLimiteHoras`
- `permiteCancelacionTardia`
- `adminId`

### Cancha

- `id`
- `nombre`
- `tipo`
- `precio`
- `descripcion`
- `techada`
- `iluminacion`
- `activa`
- `complejoId`

### Reserva

- `id`
- `fecha`
- `horaInicio`
- `horaFin`
- `estado`
- `notas`
- `invitadoNombre`
- `invitadoTelefono`
- `invitadoEmail`
- `invitadoToken`
- `precioTotal`
- `usuarioId`
- `canchaId`

## Common Status Codes

- `200` OK
- `201` Created
- `204` No Content
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `500` Internal Server Error

## Common Errors

Auth:

- `"El email ya esta registrado"`
- `"Credenciales invalidas"`
- `"Usuario inactivo"`

Reservas:

- `"Cancha no disponible"`
- `"La cancha ya esta reservada en ese horario"`
- `"Para reservar sin cuenta debes enviar invitadoNombre e invitadoTelefono"`
- `"La reserva solo puede cancelarse hasta X hora(s) antes del inicio"`
- `"Solo puedes modificar reservas pendientes"`
- `"Solo puedes confirmar reservas pendientes"`
- `"Solo puedes completar reservas confirmadas"`
- `"horaFin debe ser mayor a horaInicio"`
- `"No tienes permiso para modificar esta reserva"`
- `"No tienes permiso para gestionar esta reserva"`

General notes:

- time format is 24-hour `HH:mm`
- dates are handled as ISO values
- generated docs should be updated when routes or permissions change
