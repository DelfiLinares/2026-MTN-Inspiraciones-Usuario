# Frontend de Usuario — Inspiraciones (red social de arte)

Aplicación SPA en React 18 + Vite + TypeScript que implementa las interacciones del usuario final
(feed, publicaciones, búsqueda con filtros, login, reportes, perfil, seguidores y carpetas de posts
guardados) descriptas en `specs/001-user-interactions/spec.md`.

Fuente de verdad de este README: `specs/001-user-interactions/quickstart.md`.

---

## 1. Prerrequisitos

- Node.js LTS (≥18.x) y npm.
- Acceso a una instancia del backend Java/Spring Boot corriendo localmente o en un entorno de
  desarrollo compartido (este repositorio **no** incluye el backend).
- Credenciales de cliente OAuth de Google y GitHub para pruebas de login social (provistas por el
  equipo de backend/infraestructura).

---

## 2. Variables de entorno

El proyecto Vite lee variables con prefijo `VITE_` desde un archivo `.env.local` (no versionado,
crear uno propio a partir de este ejemplo).

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_BASE_URL` | URL base de la API REST del backend | `http://localhost:8080/api` |
| `VITE_OAUTH_GOOGLE_REDIRECT_PATH` | Ruta de callback propia para Google | `/auth/callback/google` |
| `VITE_OAUTH_GITHUB_REDIRECT_PATH` | Ruta de callback propia para GitHub | `/auth/callback/github` |
| `VITE_ENABLE_GEOLOCATION` | Flag para habilitar/deshabilitar el filtro de distancia en entornos donde la geolocalización del navegador no esté disponible (ej. CI) | `true` |

Ejemplo de `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_OAUTH_GOOGLE_REDIRECT_PATH=/auth/callback/google
VITE_OAUTH_GITHUB_REDIRECT_PATH=/auth/callback/github
VITE_ENABLE_GEOLOCATION=true
```

---

## 3. Instalación y ejecución local

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173` (puerto por defecto de Vite), apuntando
al backend configurado en `VITE_API_BASE_URL`.

Para apuntar a un backend distinto (por ejemplo, un entorno de staging compartido por el equipo),
basta con cambiar `VITE_API_BASE_URL` en `.env.local` y reiniciar `npm run dev`.

---

## 4. Scripts disponibles

```bash
npm run dev        # servidor de desarrollo (Vite)
npm run build       # tsc -b && vite build — build de producción
npm run preview     # sirve el build de producción localmente
npm run test        # Vitest en modo watch
npm run test:ci      # Vitest en modo single-run, usado en CI
npm run lint        # ESLint sobre .ts/.tsx
npm run format      # Prettier --write
```

---

## 5. Tests

Los tests obligatorios (Principio VII, NON-NEGOTIABLE) viven en `tests/domain/` y `tests/services/`,
y cubren como mínimo las reglas de negocio de `Publicacion`, `Usuario`, `Filtro` y `Carpeta`
(`puedeDarLike()`, `puedeReportar()`, `puedeEliminar()`, `puedeVerBotonSeguir()`,
`distanciaHabilitada()`, `puedeCrearNuevaCarpeta()`, entre otras), además de los tests de
componentes en `tests/components/` y de validación de formularios en `tests/services/`.

```bash
npm run test:ci
```

---

## 6. Escenarios de validación end-to-end

Ver `specs/001-user-interactions/quickstart.md`, sección 5, para los escenarios manuales A–G que
validan de punta a punta el cumplimiento de los criterios de aceptación de `spec.md` (like con
reversión, publicación con tags, búsqueda con filtros y scroll infinito, reporte de publicaciones,
login con los tres proveedores, seguir/dejar de seguir, y carpetas de posts guardados).

---

## 7. Arquitectura

Arquitectura en capas (Principio III de la constitución del proyecto):

- `src/domain/`: entidades y reglas de negocio puras (sin `fetch`, sin React).
- `src/services/`: casos de uso y hooks de React que orquestan `domain/` e `infrastructure/`.
- `src/infrastructure/`: cliente HTTP único (`httpClient`) y adaptadores externos (geolocalización,
  almacenamiento de tokens).
- `src/components/`: componentes presentacionales puros, agrupados por dominio (`publicacion/`,
  `carpetas/`, `filtros/`, `perfil/`, `comunes/`).
- `src/pages/`: pantallas que integran componentes y servicios.

Ningún componente de `pages/` o `components/` debe invocar `fetch`/`axios` directamente; toda
comunicación con el backend pasa por `src/infrastructure/httpClient.ts`.
