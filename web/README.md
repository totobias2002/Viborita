# Viborita Web

Frontend inicial en Next.js para el flujo principal de reservas.

## Arranque

1. Crear variables de entorno:

```bash
cp .env.example .env.local
```

2. Instalar dependencias:

```bash
npm install
```

3. Levantar en desarrollo:

```bash
npm run dev
```

Por defecto espera el backend en `http://localhost:3000`.

## Modo demo

El frontend corre en modo demo por defecto.

- muestra complejos mock
- permite reservar sin backend
- guarda cuentas y reservas en el navegador

Si mas adelante queres usar la API real, agrega en `.env.local`:

```env
NEXT_PUBLIC_USE_REAL_API=true
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Busqueda de ubicaciones

La home intenta usar GeoRef Argentina para traer localidades y municipios reales de Buenos Aires.

- no requiere tarjeta ni token
- encaja mejor con busquedas como `Moron`, `Merlo`, `San Miguel`, `Pilar`, `Tigre`
- si el servicio publico no responde, cae al fallback demo
