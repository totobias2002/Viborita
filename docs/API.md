# 📘 Guía de API - Viborita

> **Versión:** 1.0.0  
> **Última actualización:** Abril 2026  
> **Estado:** ✅ Activo

---

## 📋 Índice

1. [Introducción](#1-introducción)
2. [Arquitectura](#2-arquitectura)
3. [Autenticación](#3-autenticación)
4. [Endpoints](#4-endpoints)
5. [Modelos de Datos](#5-modelos-de-datos)
6. [Códigos de Respuesta](#6-códigos-de-respuesta)
7. [Errores Comunes](#7-errores-comunes)

---

## 1. Introducción

### 1.1 Descripción del Proyecto

Viborita es una API REST para la gestión de reservas de canchas de pádel. Permite a usuarios buscar complejos deportivos, visualizar canchas disponibles y realizar reservas.

### 1.2 Características Principales

- ✅ Registro y autenticación de usuarios
- ✅ Gestión de complejos deportivos
- ✅ Administración de canchas
- ✅ Sistema de reservas con verificación de disponibilidad
- ✅ Cálculo automático de precios

### 1.3 Tecnologías

| Tecnología | Propósito |
|------------|-----------|
| Express.js | Framework web |
| Prisma | ORM para TypeScript |
| PostgreSQL | Base de datos |
| bcryptjs | Hash de contraseñas |
| TypeScript | Tipado estático |

---

## 2. Arquitectura

### 2.1 Estructura de Archivos

```
src/
├── config/
│   ├── env.ts          # Variables de entorno
│   └── prisma.ts       # Cliente Prisma
├── controllers/
│   ├── auth.controller.ts
│   ├── complejo.controller.ts
│   ├── cancha.controller.ts
│   └── reserva.controller.ts
├── services/
│   ├── auth.service.ts
│   ├── complejo.service.ts
│   ├── cancha.service.ts
│   └── reserva.service.ts
├── routes/
│   ├── index.ts        # Router principal
│   ├── auth.routes.ts
│   ├── complejo.routes.ts
│   ├── cancha.routes.ts
│   └── reserva.routes.ts
└── middlewares/
    ├── error-handler.middleware.ts
    └── not-found.middleware.ts
```

### 2.2 Patrón de Diseño

La API sigue el patrón **Service-Controller**:

```
Routes → Controller → Service → Prisma → Database
```

- **Routes**: Definición de endpoints HTTP
- **Controller**: Lógica de request/response
- **Service**: Lógica de negocio
- **Prisma**: Acceso a datos

---

## 3. Autenticación

### 3.1 Flujo de Autenticación

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Usuario │────▶│   Login  │────▶│  Token   │
└──────────┘     └──────────┘     └──────────┘
```

### 3.2 Headers Requeridos

Para endpoints protegidos, incluir el token en el header:

```http
Authorization: Bearer <token>
```

### 3.3 Roles de Usuario

| Rol | Descripción |
|-----|-------------|
| `USER` | Usuario estándar |
| `ADMIN` | Administrador de complejo |
| `SUPERADMIN` | Administrador global |

---

## 4. Endpoints

### 4.1 Auth - Autenticación

#### 📌 Registro de Usuario

```http
POST /api/auth/register
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|--------------|
| `nombre` | string | ✅ | Nombre completo |
| `email` | string | ✅ | Correo electrónico |
| `password` | string | ✅ | Contraseña (mín. 6 caracteres) |
| `telefono` | string | ❌ | Teléfono de contacto |

**Respuesta exitosa (201):**

```json
{
  "user": {
    "id": "cuid123...",
    "nombre": "Juan Pérez",
    "email": "juan@email.com",
    "rol": "USER",
    "telefono": "+5491112345678",
    "activo": true,
    "createdAt": "2026-04-25T10:00:00Z"
  },
  "token": "mock-token-cuid123..."
}
```

---

#### 📌 Inicio de Sesión

```http
POST /api/auth/login
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|--------------|
| `email` | string | ✅ | Correo electrónico |
| `password` | string | ✅ | Contraseña |

**Respuesta exitosa (200):**

```json
{
  "user": { ... },
  "token": "mock-token-cuid123..."
}
```

---

#### 📌 Obtener Perfil

```http
GET /api/auth/profile
```

**Headers:** `Authorization: Bearer <token>`

**Respuesta exitosa (200):**

```json
{
  "id": "cuid123...",
  "nombre": "Juan Pérez",
  "email": "juan@email.com",
  "rol": "USER",
  "telefono": "+5491112345678",
  "activo": true
}
```

---

### 4.2 Complejos - Gestión de Complejos

#### 📌 Listar Todos

```http
GET /api/complejos
```

**Respuesta (200):**

```json
[
  {
    "id": "cuid...",
    "nombre": "Club Pádel Central",
    "direccion": "Av. Corrientes 1234",
    "barrio": "Centro",
    "descripcion": "El mejor club de pádel",
    "telefono": "+5491112345678",
    "email": "contacto@clubpadel.com",
    "canchas": [...],
    "_count": { "canchas": 4, "reviews": 12 }
  }
]
```

---

#### 📌 Obtener por ID

```http
GET /api/complejos/:id
```

**Parámetros:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | string | ID del complejo |

---

#### 📌 Buscar por Barrio

```http
GET /api/complejos/barrio/:barrio
```

**Ejemplo:** `/api/complejos/barrio/centro`

---

#### 📌 Complejos de Admin

```http
GET /api/complejos/admin/:adminId
```

---

#### 📌 Crear Complejo

```http
POST /api/complejos
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|--------------|
| `nombre` | string | ✅ | Nombre del complejo |
| `direccion` | string | ✅ | Dirección completa |
| `barrio` | string | ✅ | Barrio/Zona |
| `descripcion` | string | ❌ | Descripción del lugar |
| `telefono` | string | ❌ | Teléfono de contacto |
| `email` | string | ❌ | Correo electrónico |
| `adminId` | string | ✅ | ID del usuario admin |

---

#### 📌 Actualizar Complejo

```http
PUT /api/complejos/:id
```

**Body (al menos un campo):**

```json
{
  "nombre": "Nuevo Nombre",
  "direccion": "Nueva Dirección",
  "barrio": "Nuevo Barrio",
  "descripcion": "Nueva descripción",
  "telefono": "+5490000000000",
  "email": "nuevo@email.com"
}
```

---

#### 📌 Eliminar Complejo

```http
DELETE /api/complejos/:id
```

**Respuesta:** `204 No Content`

---

### 4.3 Canchas - Gestión de Canchas

#### 📌 Listar Todas

```http
GET /api/canchas
```

**Respuesta (200):**

```json
[
  {
    "id": "cuid...",
    "nombre": "Cancha 1",
    "tipo": "PANORAMICA",
    "precio": "1500.00",
    "descripcion": "Cancha principal",
    "techada": true,
    "iluminacion": true,
    "activa": true,
    "complejoId": "cuid...",
    "complejo": {
      "id": "cuid...",
      "nombre": "Club Pádel Central",
      "direccion": "Av. Corrientes 1234",
      "barrio": "Centro"
    }
  }
]
```

---

#### 📌 Obtener por ID

```http
GET /api/canchas/:id
```

---

#### 📌 Canchas por Complejo

```http
GET /api/canchas/complejo/:complejoId
```

---

#### 📌 Canchas Disponibles

```http
GET /api/canchas/disponibles/:complejoId?fecha=2026-04-26&horaInicio=14:00&horaFin=16:00
```

**Query Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|--------------|
| `fecha` | string | ✅ | Fecha en formato ISO (YYYY-MM-DD) |
| `horaInicio` | string | ❌ | Hora de inicio (HH:mm) |
| `horaFin` | string | ❌ | Hora de fin (HH:mm) |

---

#### 📌 Crear Cancha

```http
POST /api/canchas
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|--------------|
| `nombre` | string | ✅ | Nombre de la cancha |
| `tipo` | enum | ✅ | Tipo de cancha |
| `precio` | number | ✅ | Precio por hora |
| `descripcion` | string | ❌ | Descripción |
| `techada` | boolean | ❌ | Si tiene techo |
| `iluminacion` | boolean | ❌ | Si tiene iluminación |
| `complejoId` | string | ✅ | ID del complejo |

**Tipos de Cancha:**

```typescript
type CourtType = "INDOOR" | "OUTDOOR" | "PANORAMICA" | "TECHADA";
```

---

#### 📌 Actualizar Cancha

```http
PUT /api/canchas/:id
```

---

#### 📌 Eliminar Cancha

```http
DELETE /api/canchas/:id
```

> **Nota:** Se realiza un soft delete (campo `activa: false`)

---

### 4.4 Reservas - Gestión de Reservas

#### 📌 Listar Todas

```http
GET /api/reservas
```

---

#### 📌 Obtener por ID

```http
GET /api/reservas/:id
```

---

#### 📌 Mis Reservas

```http
GET /api/reservas/mis-reservas
```

**Headers:** `Authorization: Bearer <token>`

---

#### 📌 Reservas por Cancha

```http
GET /api/reservas/cancha/:canchaId?fecha=2026-04-26
```

---

#### 📌 Crear Reserva

```http
POST /api/reservas
```

**Headers:** `Authorization: Bearer <token>`

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|--------------|
| `fecha` | string | ✅ | Fecha (YYYY-MM-DD) |
| `horaInicio` | string | ✅ | Hora inicio (HH:mm) |
| `horaFin` | string | ✅ | Hora fin (HH:mm) |
| `canchaId` | string | ✅ | ID de la cancha |
| `notas` | string | ❌ | Notas adicionales |

**Estados de Reserva:**

```typescript
type ReservationStatus = "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA";
```

**Ejemplo:**

```json
{
  "fecha": "2026-04-26",
  "horaInicio": "14:00",
  "horaFin": "16:00",
  "canchaId": "cuid...",
  "notas": "Jugadores: Juan, Pedro"
}
```

**Respuesta:**

```json
{
  "id": "cuid...",
  "fecha": "2026-04-26T00:00:00.000Z",
  "horaInicio": "2026-04-25T14:00:00.000Z",
  "horaFin": "2026-04-25T16:00:00.000Z",
  "estado": "PENDIENTE",
  "notas": "Jugadores: Juan, Pedro",
  "precioTotal": 3000,
  "usuarioId": "cuid...",
  "canchaId": "cuid...",
  "usuario": { "id": "...", "nombre": "Juan", "email": "..." },
  "cancha": { "id": "...", "nombre": "Cancha 1", "complejo": { "nombre": "..." } }
}
```

---

#### 📌 Actualizar Reserva

```http
PUT /api/reservas/:id
```

---

#### 📌 Cancelar Reserva

```http
PATCH /api/reservas/:id/cancelar
```

**Headers:** `Authorization: Bearer <token>`

> **Restricciones:** Solo el usuario que creó la reserva puede cancelarla.

---

#### 📌 Confirmar Reserva (Admin)

```http
PATCH /api/reservas/:id/confirmar
```

---

#### 📌 Completar Reserva

```http
PATCH /api/reservas/:id/completar
```

---

## 5. Modelos de Datos

### 5.1 User

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | ID único (CUID) |
| `nombre` | string | Nombre completo |
| `email` | string | Correo único |
| `password` | string | Hash bcrypt |
| `rol` | enum | USER, ADMIN, SUPERADMIN |
| `telefono` | string | Teléfono |
| `activo` | boolean | Estado |
| `createdAt` | datetime | Fecha creación |
| `updatedAt` | datetime | Fecha actualización |

### 5.2 Complejo

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | ID único |
| `nombre` | string | Nombre |
| `direccion` | string | Dirección |
| `barrio` | string | Barrio |
| `descripcion` | string | Descripción |
| `telefono` | string | Teléfono |
| `email` | string | Email |
| `adminId` | string | FK a User |

### 5.3 Cancha

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | ID único |
| `nombre` | string | Nombre |
| `tipo` | enum | Tipo de cancha |
| `precio` | decimal | Precio por hora |
| `techada` | boolean | Tiene techo |
| `iluminacion` | boolean | Tiene luz |
| `activa` | boolean | Estado |
| `complejoId` | string | FK a Complejo |

### 5.4 Reserva

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | ID único |
| `fecha` | date | Fecha reserva |
| `horaInicio` | time | Hora inicio |
| `horaFin` | time | Hora fin |
| `estado` | enum | Estado reserva |
| `notas` | string | Notas |
| `precioTotal` | decimal | Precio total |
| `usuarioId` | string | FK a User |
| `canchaId` | string | FK a Cancha |

---

## 6. Códigos de Respuesta

| Código | Significado | Descripción |
|--------|--------------|--------------|
| `200` | OK | Solicitud exitosa |
| `201` | Created | Recurso creado |
| `204` | No Content | Sin contenido |
| `400` | Bad Request | Datos inválidos |
| `401` | Unauthorized | No autenticado |
| `403` | Forbidden | No autorizado |
| `404` | Not Found | Recurso no encontrado |
| `500` | Internal Error | Error del servidor |

---

## 7. Errores Comunes

### 7.1 Errores de Auth

| Código | Mensaje | Solución |
|--------|---------|----------|
| 400 | "El email ya está registrado" | Usar otro email |
| 401 | "Credenciales inválidas" | Verificar email/password |
| 401 | "Usuario inactivo" | Contactar soporte |

### 7.2 Errores de Reservas

| Código | Mensaje | Solución |
|--------|---------|----------|
| 400 | "Cancha no disponible" | Verificar ID de cancha |
| 400 | "La cancha ya está reservada en ese horario" | Elegir otro horario |
| 400 | "Solo puedes modificar reservas pendientes" | No modificar confirmadas |

### 7.3 Errores de Complejos/Canchas

| Código | Mensaje | Solución |
|--------|---------|----------|
| 404 | "Complejo no encontrado" | Verificar ID |
| 400 | "Ya existe una cancha con ese nombre" | Usar otro nombre |

---

## 📌 Notas Adicionales

- Los horarios se manejan en formato **24 horas** (HH:mm)
- El precio total se calcula automáticamente: `precio × horas`
- Las canchas eliminadas no se borran, se marcan como inactivas
- Todas las fechas en formato ISO 8601

---

*Documento generado automáticamente para Viborita API*