# Viborita

Backend base con Node.js, TypeScript, Express, PostgreSQL y Prisma.

## Estructura

```text
viborita/
  prisma/
    schema.prisma
  src/
    config/
    controllers/
    middlewares/
    routes/
    services/
    app.ts
    server.ts
```

## Puesta en marcha

1. Instalar dependencias:

```bash
npm install
```

2. Crear variables de entorno:

```bash
cp .env.example .env
```

3. Generar Prisma Client:

```bash
npm run prisma:generate
```

4. Ejecutar migraciones cuando tengas PostgreSQL listo:

```bash
npm run prisma:migrate:dev -- --name init
```

5. Levantar el entorno de desarrollo:

```bash
npm run dev
```

## Arquitectura

- `routes`: define endpoints y delega responsabilidades.
- `controllers`: traduce HTTP hacia la capa de negocio.
- `services`: contiene reglas de negocio y acceso a infraestructura.
- `config`: centraliza entorno y clientes compartidos como Prisma.
- `middlewares`: concentra manejo transversal de errores y 404.

## Frontend web

Se agrego una base de frontend en [web/](</c:/Users/toto/Desktop/facu/Viborita/web/README.md:1>) con `Next.js + TypeScript`.

Scripts utiles desde la raiz:

- `npm run dev:web`
- `npm run build:web`
