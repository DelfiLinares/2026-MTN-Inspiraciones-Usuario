# API Contracts: Interacciones del Usuario en el Frontend

**Feature**: [../spec.md](../spec.md) | **Plan**: [../plan.md](../plan.md) | **Data Model**: [../data-model.md](../data-model.md)

Este documento describe los contratos REST **esperados** que el frontend de usuario consume del
backend (Java/Spring Boot). El backend no se implementa en este repositorio ni en este plan; estos
contratos son la interfaz que el frontend asume y que debe confirmarse/negociarse con el equipo de
backend antes de implementar la capa de infraestructura. Todas las ambigüedades quedan marcadas
explícitamente al final de cada sección o en la sección global de **Ambigüedades pendientes**.

Convenciones generales:
- Base URL configurable vía variable de entorno (`VITE_API_BASE_URL`, ver `quickstart.md`).
- Autenticación vía cookie `httpOnly` (ver `research.md` §6); ningún endpoint requiere header
  `Authorization` manual desde el frontend.
- Formato de request/response: `application/json`, salvo subida de archivos (`multipart/form-data`).
- Códigos de error HTTP estándar (`400`, `401`, `403`, `404`, `409`, `422`, `500`) con cuerpo de
  error consistente: `{ "codigo": string, "mensaje": string }`.

---

## 1. Autenticación (HU-04, HU-05)

### `POST /api/auth/login`
**Request**:
```json
{ "email": "string", "password": "string" }
```
**Response 200**:
```json
{ "usuario": { "id": "string", "nombre": "string", "apellido": "string", "fotoUrl": "string|null" } }
```
(El token se setea como cookie `httpOnly` en la respuesta; no viaja en el body — FR-030.)

**Errores relevantes para el cliente**:
- `401 { "codigo": "CREDENCIALES_INVALIDAS" }` → mostrar mensaje genérico sin indicar campo (FR-027).

### `GET /api/auth/me`
Usado al montar la app para determinar si hay sesión activa (vía cookie).
**Response 200**: mismo shape que `usuario` arriba.
**Response 401**: sin sesión activa → redirigir a login si la ruta lo requiere.

### `POST /api/auth/logout`
**Response 204**: sin contenido; invalida la cookie de sesión.

### `POST /api/auth/register`
**Request**:
```json
{ "nombre": "string", "apellido": "string", "email": "string", "password": "string" }
```
**Response 201**: mismo shape que login.
**Errores relevantes**:
- `409 { "codigo": "EMAIL_YA_REGISTRADO" }` → FR-032.
- `422 { "codigo": "PASSWORD_DEBIL", "detalles": { "criterios": string[] } }` → usado para feedback en tiempo real (FR-031). **Criterios confirmados (B1)**: mínimo 8 caracteres, al menos una letra mayúscula y al menos un símbolo.

### `GET /api/auth/oauth/{provider}/redirect` (provider = `google` | `github`)
Redirige al usuario al proveedor externo. El frontend simplemente navega el navegador a esta URL
(no es una llamada `fetch`).

### `GET /api/auth/oauth/{provider}/callback?code=...`
**Confirmado (B2)**: el frontend implementa su **propia ruta de callback**
(`/auth/callback/:provider`), a la que el proveedor OAuth (o el backend, según corresponda)
redirige tras la autorización. Esta ruta propia es la responsable de completar el flujo (por
ejemplo, invocando al backend para intercambiar el código/confirmar la sesión) antes de redirigir
al usuario al home, en vez de que el backend redirija directamente sin pasar por una pantalla del
frontend. `AuthCallbackPage` (T055) renderiza esta pantalla de "procesando login" mientras se
completa el flujo (FR-025, FR-034).

---

## 2. Publicaciones — Like y Reporte (HU-01, HU-04)

### `POST /api/publicaciones/{id}/like`
**Response 200**: `{ "cantidadLikes": number }`
**Errores**: `403 { "codigo": "NO_PUEDE_LIKEAR_PROPIA" }` (defensivo; el frontend ya deshabilita el
botón vía `Publicacion.puedeDarLike()`, pero el backend debe validar igual).

### `DELETE /api/publicaciones/{id}/like`
**Response 200**: `{ "cantidadLikes": number }`

### `GET /api/publicaciones/{id}/reporte-motivos`
**Response 200**:
```json
[ { "codigo": "CONTENIDO_INAPROPIADO", "etiqueta": "Contenido inapropiado" }, ... ]
```
Usado para poblar el modal de reporte (US-7 AC-04.3, `MotivoReporte` en `data-model.md`).

### `GET /api/publicaciones/{id}/mi-reporte`
**Response 200**: `{ "reportada": boolean }` — refleja únicamente el estado de reporte del usuario
actual (FR-023), nunca el estado global de reportes de la publicación.

### `POST /api/publicaciones/{id}/reportes`
**Request**: `{ "motivoCodigo": "string" }`
**Response 201**: `{ "confirmado": true }`
**Errores**: `409 { "codigo": "YA_REPORTADA_POR_USUARIO" }` (US-7 AC-04.6); `403` si es publicación
propia.

---

## 3. Publicaciones — Creación con tags (HU-02)

### `GET /api/tags?query={texto}`
Autocompletado del vocabulario controlado de tags (clarificación de spec).
**Response 200**: `[ { "id": "string", "nombre": "string" }, ... ]`
**Confirmado (B3)**: el catálogo de tags se presenta como una página propia con **todos los tags
posibles organizados en secciones** (por categoría), no como un autocompletado incremental
paginado; el frontend solicita el vocabulario completo (agrupado por sección) y filtra/busca en
cliente sobre ese conjunto ya cargado, en vez de paginar resultados parciales por cada tecleo.

### `POST /api/publicaciones` (multipart/form-data)
**Request (multipart fields)**:
- `archivo`: binario del contenido (imagen/video/audio)
- `tipoContenido`: `"IMAGEN" | "VIDEO" | "MUSICA" | "TUTORIAL"`
- `tagIds`: `string[]` (hasta 10, IDs del vocabulario controlado — FR-006)

**Response 201**:
```json
{
  "id": "string",
  "autorId": "string",
  "tipoContenido": "IMAGEN",
  "estado": "ACTIVA",
  "tags": ["string"],
  "urlContenido": "string",
  "cantidadLikes": 0,
  "likeadaPorMi": false,
  "reportadaPorMi": false,
  "creadaEn": "2026-09-08T00:00:00Z"
}
```

**Errores relevantes para el cliente**:
- `422 { "codigo": "TIPO_ARCHIVO_NO_PERMITIDO" }` → aunque el frontend valida el tipo en cliente
  (FR-008), el backend es la fuente de verdad final.
- `413 { "codigo": "ARCHIVO_EXCEDE_TAMANO_MAXIMO" }` → la validación de tamaño es **exclusiva del
  backend** (clarificación de spec); el frontend debe mostrar este mensaje tal cual lo devuelva la
  API (CB-08).
- `422 { "codigo": "LIMITE_DE_TAGS_EXCEDIDO" }` → defensivo; el frontend ya bloquea en 10 tags
  (FR-006).

**Confirmado (B4)**: el backend acepta los siguientes formatos: `.jpg`, `.jpeg`, `.png`, `.gif`
(imagen), `.mp3` (música/audio) y `.mp4` (video). Esta es la lista exacta de extensiones/MIME
permitidas para la validación de tipo en cliente (FR-008); ya no aplica la suposición previa de
`image/*`, `video/*`, `audio/*` genéricos.

---

## 4. Búsqueda y filtros (HU-03)

### `GET /api/publicaciones/buscar`
**Query params** (todos opcionales, generados por `Filtro.aQueryParams()`):
- `q`: texto libre
- `estilo`, `tecnica`: strings
- `tipoContenido`: `TipoContenido`
- `distanciaKm`, `lat`, `lng`: números (solo si `geolocalizacionActiva`)
- `cursor`: string opaco para scroll infinito. **Confirmado (B5)**: el backend pagina con
  **cursor opaco** (no con `page`/`size`).

**Response 200**:
```json
{
  "items": [ /* Publicacion[] */ ],
  "nextCursor": "string|null",
  "opcionesFiltro": { "estilos": ["string"], "tecnicas": ["string"] }
}
```
Un `items: []` con `nextCursor: null` representa el estado vacío (US-3 AC-03.6, FR-017). La
ausencia de `nextCursor` indica fin de resultados (CB-05). El campo `opcionesFiltro` (B6,
confirmado) trae embebido el catálogo de estilos/técnicas disponible para poblar `FiltroPanel`
(T045)/`filtroOpcionesService` (T089), sin necesidad de un endpoint separado.

### `GET /api/filtros/opciones`
**Confirmado (B6)**: el catálogo de estilos/técnicas **no es un endpoint propio**; viene
**embebido en las respuestas de búsqueda** (`GET /api/publicaciones/buscar`), ya que los
estilos/técnicas disponibles son uno de los posibles resultados/facetas que devuelve la búsqueda
en la página de búsqueda. En consecuencia, este endpoint queda descartado: `FiltroPanel` (T045) y
`filtroOpcionesService` (T089) deben obtener las opciones de estilo/técnica a partir del campo de
facetas embebido en la respuesta de `GET /api/publicaciones/buscar` (ver sección 4, campo
`opcionesFiltro` agregado a la respuesta), no de una llamada separada.

**Response 200** (ejemplo, ahora embebido en `GET /api/publicaciones/buscar`):
```json
{
  "estilos": ["string"],
  "tecnicas": ["string"]
}
```

---

## 5. Home (feed)

### `GET /api/feed`
**Query params**: `cursor` (mismo mecanismo que búsqueda)
**Response 200**: mismo shape que `/api/publicaciones/buscar` (`items` + `nextCursor`).

---

## 6. Perfil y edición (HU-06)

### `GET /api/usuarios/{id}`
**Response 200**: shape de `Usuario` (ver `data-model.md`), incluyendo `sigoAEsteUsuario` cuando
aplica.

### `PATCH /api/usuarios/me`
**Confirmado (B7)**: la lista definitiva de campos editables del perfil es:
- `usuario` (nombre de usuario)
- `fotoUrl` (foto de perfil)
- `bannerUrl` (banner)
- `mail`
- `fechaNacimiento`, separada en `diaNacimiento`, `mesNacimiento`, `anioNacimiento`
- `redesSociales`: array de hasta 3 entradas por defecto (cada una con un link a una red social),
  con la posibilidad de agregar más entradas dinámicamente (botón "+" para crear barras
  adicionales)

La contraseña **no se edita en este endpoint**: se edita en un flujo separado de "Cambiar
contraseña" (ver `POST /api/auth/cambiar-password` más abajo), donde el usuario ingresa su
contraseña anterior y la nueva; si no la recuerda, dispone de la opción "No recuerdo mi
contraseña", que envía una verificación a su mail (ver `POST /api/auth/recuperar-password`).

**Request** (multipart si incluye foto/banner, JSON si no):
```json
{
  "usuario": "string",
  "bio": "string",
  "mail": "string",
  "diaNacimiento": "number",
  "mesNacimiento": "number",
  "anioNacimiento": "number",
  "redesSociales": ["string"],
  "foto": "binario opcional",
  "banner": "binario opcional"
}
```
**Response 200**: shape de `Usuario` actualizado.
**Errores**: `422` con detalles de campo si falla validación de servidor.

### `POST /api/auth/cambiar-password`
**Confirmado (B7)**: flujo separado de edición de perfil, para cambiar la contraseña con la
contraseña anterior.
**Request**: `{ "passwordActual": "string", "passwordNueva": "string" }`
**Response 200**: sin contenido relevante para el cliente (confirmación no bloqueante).
**Errores**: `401 { "codigo": "PASSWORD_ACTUAL_INCORRECTA" }`; `422 { "codigo": "PASSWORD_DEBIL" }`
(mismos criterios que B1: mínimo 8 caracteres, una mayúscula y un símbolo).

### `POST /api/auth/recuperar-password`
**Confirmado (B7)**: usado desde el enlace "No recuerdo mi contraseña" del flujo de cambio de
contraseña.
**Request**: `{ "email": "string" }`
**Response 200**: sin contenido relevante para el cliente (confirmación no bloqueante, no revela
si el mail existe o no, por seguridad).

---

## 7. Seguir usuarios (HU-08)

### `POST /api/usuarios/{id}/seguir`
**Response 200**: `{ "cantidadSeguidores": number }`
**Errores**: `409 { "codigo": "LIMITE_SEGUIDOS_ALCANZADO" }` (CB-07) → mostrar mensaje específico
de la API.

### `DELETE /api/usuarios/{id}/seguir`
**Response 200**: `{ "cantidadSeguidores": number }`

---

## 8. Carpetas (HU-09)

### `GET /api/usuarios/{id}/carpetas`
**Response 200**: `[ { "id": "string", "nombre": "string", "cantidadPosts": number }, ... ]`
(Visibilidad pública confirmada en clarificación de spec — cualquier visitante puede llamar este
endpoint sobre cualquier `id` de usuario.)

### `POST /api/usuarios/me/carpetas`
**Request**: `{ "nombre": "string" }`
**Response 201**: `Carpeta`
**Errores**: `409 { "codigo": "LIMITE_CARPETAS_ALCANZADO" }` → el frontend ya bloquea la creación al
llegar a 100 (`puedeCrearNuevaCarpeta()`), pero el backend valida igual (FR-047).

### `PATCH /api/carpetas/{id}`
**Request**: `{ "nombre": "string" }` → renombrar.

### `DELETE /api/carpetas/{id}`
**Response 204**: elimina la carpeta (no elimina los posts guardados de la plataforma — FR-045).

### `POST /api/carpetas/{id}/posts`
**Request**: `{ "publicacionId": "string" }` → guarda un post en la carpeta (FR-044).

### `DELETE /api/carpetas/{id}/posts/{publicacionId}`
Quita un post de la carpeta sin eliminarlo de la plataforma (FR-046).

---

## 9. Geolocalización

No hay endpoint dedicado: la geolocalización se obtiene del navegador (`geolocationClient.ts`) y
las coordenadas (`lat`, `lng`) se envían únicamente como parámetros de
`GET /api/publicaciones/buscar` cuando `Filtro.distanciaHabilitada()` es `true`. No se persiste
ubicación en el backend desde este módulo (Out of Scope de `spec.md`).

---

## Resumen de Ambigüedades (RESUELTAS vía /speckit.clarify)

| ID | Descripción | Endpoint afectado | Resolución |
|---|---|---|---|
| B1 | Criterios exactos de fortaleza de contraseña | `POST /api/auth/register`, `POST /api/auth/cambiar-password` | Mínimo 8 caracteres, al menos una mayúscula y al menos un símbolo. |
| B2 | Contrato exacto de URL/flujo de callback OAuth (ruta propia vs. redirección directa) | `GET /api/auth/oauth/{provider}/callback` | El frontend implementa su propia ruta de callback (`/auth/callback/:provider`). |
| B3 | Contrato exacto del endpoint de autocompletado de tags (paginación, límite) | `GET /api/tags` | El catálogo completo de tags se presenta en una página propia organizada en secciones; no requiere paginación incremental. |
| B4 | Formatos de archivo (MIME) aceptados por tipo de contenido | `POST /api/publicaciones` | `.jpg`, `.jpeg`, `.png`, `.gif`, `.mp3`, `.mp4`. |
| B5 | Mecanismo de paginación: cursor opaco vs. `page`/`size` | `GET /api/publicaciones/buscar`, `GET /api/feed` | Cursor opaco. |
| B6 | Origen del catálogo de estilos/técnicas (endpoint propio vs. embebido) | `GET /api/publicaciones/buscar` (campo `opcionesFiltro`) | Embebido en las respuestas de búsqueda; no existe endpoint `GET /api/filtros/opciones` separado. |
| B7 | Lista definitiva de campos editables de perfil | `PATCH /api/usuarios/me` | `usuario`, `fotoUrl`, `bannerUrl`, `mail`, fecha de nacimiento (día/mes/año), hasta 3+ redes sociales dinámicas. Contraseña editable en flujo separado (`POST /api/auth/cambiar-password` / `POST /api/auth/recuperar-password`). |

Estas ambigüedades fueron resueltas mediante `/speckit.clarify`; las tareas de `tasks.md` que
dependían de ellas ya no requieren confirmación adicional de backend antes de implementarse.


