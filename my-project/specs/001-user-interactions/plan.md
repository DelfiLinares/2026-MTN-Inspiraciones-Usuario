# Implementation Plan: Interacciones del Usuario en el Frontend

**Branch**: `001-user-interactions` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-user-interactions/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Diseñar la arquitectura técnica del **frontend de usuario** (React + Vite + TypeScript) que implementa
las 9 historias de usuario de `spec.md`: like, publicar contenido con tags, buscar/filtrar,
reportar, login, registro, editar perfil, seguir usuarios y gestionar carpetas de posts guardados.
El enfoque técnico consiste en organizar el código en **cuatro capas estrictamente separadas**
(presentación, dominio/modelos de UI, aplicación/servicios, infraestructura) según el Principio III
(NON-NEGOTIABLE) de `constitution.md`, con modelos de dominio ricos (`Publicacion`, `Usuario`,
`Filtro`, `Carpeta`, `Desafio`) que encapsulan sus propias reglas de habilitación/visibilidad, un
cliente HTTP centralizado en infraestructura que adjunta automáticamente el token de sesión, y
patrones de UI (actualización optimista, scroll infinito, lazy loading, estados de carga
explícitos) que garantizan los Principios VII, VIII y IX. No se implementa código en esta fase;
este documento y sus artefactos asociados (`research.md`, `data-model.md`, `contracts/`,
`quickstart.md`) son el resultado esperado.

## Technical Context

**Language/Version**: TypeScript 5.x sobre React 18 (Vite como build tool/dev server)

**Primary Dependencies**: React, React Router (navegación y guard de rutas protegidas), un cliente
HTTP (fetch nativo envuelto en un módulo propio — decisión justificada en `research.md`), CSS
simple sin frameworks de UI (módulos CSS o CSS plano por componente)

**Storage**: N/A en este módulo (no hay persistencia propia; toda persistencia ocurre en el backend
Java/Spring Boot vía API REST). El único almacenamiento local relevante es el del token de sesión
(mecanismo decidido en `research.md`) y estado efímero de UI (cache en memoria de resultados
paginados, borradores de formularios no persistidos)

**Testing**: Vitest + React Testing Library para tests unitarios de modelos de dominio y
componentes; enfoque prioritario en las reglas de negocio de cliente listadas en el Principio VII

**Target Platform**: Navegador web (aplicación SPA), responsive para desktop y mobile web

**Project Type**: Web frontend (aplicación cliente independiente que consume una API REST externa;
no incluye backend en este repositorio/plan)

**Performance Goals**:
- Primeros resultados de búsqueda visibles en ≤2s (SC-003)
- Percepción de like/optimista reflejada en ≤200ms en pantalla (SC-001)
- Flujo de subida de publicación con estado de carga continuo, alineado a objetivo de backend de
  ≤5s de respuesta (SC-002, FR-010)

**Constraints**:
- Componentes de presentación NUNCA invocan fetch/axios directamente (Principio III)
- Filtros de búsqueda SIEMPRE resueltos contra la API, nunca en memoria de cliente (Principio VIII,
  FR-013)
- El frontend NUNCA opera con rol ADMIN ni muestra pantallas de moderación (Principio I, FR-048)
- Toda regla de negocio de cliente verificable DEBE tener test asociado (Principio VII)

**Scale/Scope**: 8 pantallas de usuario final (cuestionario, registro, login, home, desafíos,
descubrir, perfil, editar perfil) + interacciones transversales (like, reportar, seguir, guardar en
carpeta) sobre esas pantallas; hasta 100 carpetas y 10 tags por publicación como límites duros
confirmados en clarificación

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Verificación | Estado |
|---|---|---|
| I. La Especificación Manda sobre la Implementación | Todas las User Stories del plan están trazadas 1:1 a `spec.md` (HU-01..HU-09); ninguna pantalla de administración/moderación se incluye en la estructura del proyecto. | ✅ PASS |
| II. Diseño OO del Dominio de UI | `data-model.md` define `Publicacion`, `Usuario`, `Filtro`, `Carpeta`, `Desafio` como clases con métodos que encapsulan reglas (`puedeEditar()`, `puedeReportar()`, `puedeDarLike()`, `esPropio()`, etc.), no solo estructuras de datos. | ✅ PASS |
| III. Separación de Responsabilidades por Capa (NON-NEGOTIABLE) | Estructura de carpetas en "Project Structure" separa `pages/` (presentación), `domain/` (modelos de UI), `services/` (casos de uso), `infrastructure/` (HTTP/tokens/geolocalización). Ningún componente importa el cliente HTTP directamente. | ✅ PASS |
| IV. Sin Duplicación ni Componentes Monolíticos | Reglas de habilitación (like/reportar/seguir/editar propios) centralizadas una única vez en los modelos de dominio, consumidas por múltiples componentes de presentación sin reimplementar la condición. | ✅ PASS |
| V. Enums y Value Objects | `data-model.md` define `TipoContenido`, `EstadoPublicacion`, `TipoFiltro`, `RolUsuario` como enums TypeScript; ningún string mágico se usa para representarlos en el diseño. | ✅ PASS |
| VI. Patrones de Diseño con Propósito | Se aplica el patrón contenedor/presentacional (hooks de contenedor + componente presentacional) y estrategia para proveedores de login (mail/Google/GitHub), documentados con justificación en `research.md`; no se fuerzan patrones adicionales. | ✅ PASS |
| VII. Tests Obligatorios (NON-NEGOTIABLE) | Sección de testing en Technical Context + `quickstart.md` referencian explícitamente los 6 casos de reglas de negocio de cliente listados en el requerimiento del usuario, todos mapeados a métodos de dominio testeables de forma aislada. | ✅ PASS |
| VIII. Escalabilidad y Percepción de Rendimiento | Scroll infinito/paginación (home y Descubrir), lazy loading de medios, filtros resueltos en API, y skeletons/spinners en todo punto de espera están todos ubicados explícitamente en la capa de servicios + presentación en `data-model.md` y `research.md`. | ✅ PASS |
| IX. Usabilidad como Prioridad de Producto | El diseño de filtros laterales, tres proveedores de login, y flujo de subida ágil (con estado de carga, no bloqueo) están cubiertos en `contracts/api-contracts.md` y `quickstart.md`. | ✅ PASS |
| X. Especificación Antes que Código | Este plan y sus artefactos asociados no incluyen código de producción; solo diseño, contratos y guías. | ✅ PASS |

**Resultado del Gate**: Todos los principios PASAN. No se requiere completar `Complexity Tracking`
(no hay violaciones a justificar).

## Project Structure

### Documentation (this feature)

```text
specs/001-user-interactions/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── api-contracts.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
# Opción elegida: aplicación frontend única (no hay backend en este repo/plan)
frontend/
├── src/
│   ├── pages/                     # PRESENTACIÓN: una carpeta por pantalla del alcance
│   │   ├── cuestionario/
│   │   ├── registro/
│   │   ├── login/
│   │   ├── home/
│   │   ├── desafios/
│   │   ├── descubrir/
│   │   ├── perfil/
│   │   └── editar-perfil/
│   ├── components/                # PRESENTACIÓN: componentes reutilizables entre pantallas
│   │   ├── publicacion/           #   PublicacionCard, LikeButton, ReportButton, TagChip...
│   │   ├── filtros/               #   FiltroPanel, FiltroChip...
│   │   ├── carpetas/              #   CarpetaCard, GuardarEnCarpetaModal...
│   │   └── comunes/               #   Skeleton, Spinner, EmptyState, InfiniteScrollList...
│   ├── domain/                    # DOMINIO/MODELOS DE UI (Principio II, III, V)
│   │   ├── Publicacion.ts
│   │   ├── Usuario.ts
│   │   ├── Filtro.ts
│   │   ├── Carpeta.ts
│   │   ├── Desafio.ts
│   │   └── enums/
│   │       ├── TipoContenido.ts
│   │       ├── EstadoPublicacion.ts
│   │       ├── TipoFiltro.ts
│   │       ├── RolUsuario.ts
│   │       └── MotivoReporte.ts       # MotivoReporteCodigo + interfaz MotivoReporte
│   ├── services/                  # APLICACIÓN/SERVICIOS (casos de uso de cliente)
│   │   ├── AuthContext.tsx        #   estado de sesión, expone usuario actual (contenedor de React Context)
│   │   ├── authService.ts         #   login, registro, logout, refresh de sesión
│   │   ├── publicacionService.ts  #   crear publicación, dar/quitar like
│   │   ├── feedService.ts         #   GET /api/feed, alimenta HomePage
│   │   ├── tagsService.ts         #   autocompletado de vocabulario controlado de tags
│   │   ├── archivoValidacion.ts   #   validación de tipo/MIME de archivo por TipoContenido
│   │   ├── usePublicacionForm.ts  #   estado del formulario de nueva publicación
│   │   ├── busquedaService.ts     #   buscar con filtros, paginación/scroll infinito
│   │   ├── filtroOpcionesService.ts # GET /api/filtros/opciones, catálogo de estilos/técnicas
│   │   ├── useDescubrirFiltros.ts #   orquesta Filtro + busquedaService + useInfiniteList
│   │   ├── useInfiniteList.ts     #   hook de scroll infinito (IntersectionObserver)
│   │   ├── perfilService.ts       #   editar perfil, seguir/dejar de seguir
│   │   ├── usePerfilEdicion.ts    #   estado del formulario de edición de perfil
│   │   ├── reporteService.ts      #   motivos de reporte, estado propio, envío de reporte
│   │   └── carpetaService.ts      #   crear/renombrar/eliminar carpeta, guardar/quitar post
│   ├── infrastructure/            # INFRAESTRUCTURA (Principio III)
│   │   ├── httpClient.ts          #   cliente HTTP único, adjunta token automáticamente
│   │   ├── authProviders/         #   estrategias mail/contraseña, Google, GitHub
│   │   │   ├── mailPasswordProvider.ts
│   │   │   ├── googleProvider.ts
│   │   │   └── githubProvider.ts
│   │   ├── tokenStorage.ts        #   verificación de sesión activa (GET /api/auth/me)
│   │   └── geolocationClient.ts   #   acceso a navigator.geolocation, usado por Filtro/services de búsqueda
│   ├── routes/                    # Definición de rutas + guard de rutas protegidas
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── domain/                    # Tests de reglas de negocio de cliente (Principio VII)
│   │   ├── Publicacion.likes.test.ts
│   │   ├── Publicacion.permissions.test.ts
│   │   ├── Usuario.test.ts
│   │   ├── Usuario.seguir.test.ts
│   │   ├── Filtro.test.ts
│   │   └── Carpeta.test.ts
│   ├── services/                  # Tests de casos de uso con HTTP mockeado
│   └── components/                # Tests de componentes de presentación
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

**Structure Decision**: Se elige la opción de **aplicación frontend única** (equivalente a la
"Option 2: Web application" del template, solo la mitad `frontend/`, ya que el backend Java/Spring
Boot vive en otro repositorio fuera de alcance). Dentro de `frontend/src/`, la separación en
`pages/` + `components/` (presentación), `domain/` (modelos de UI), `services/` (aplicación) e
`infrastructure/` (infraestructura) materializa directamente las cuatro capas exigidas por el
Principio III de la constitución, y cada pantalla del alcance funcional tiene su propia carpeta en
`pages/` para mantener trazabilidad 1:1 con `spec.md`.

**Nota de reconciliación (post `/speckit.analyze` del 2026-09-08)**: la lista de `services/` fue
actualizada para reflejar exactamente los servicios y hooks definidos en `tasks.md` (T017–T094),
incluyendo `feedService.ts` y `filtroOpcionesService.ts` (agregados para cerrar huecos de contrato
detectados en el análisis de consistencia) y `AuthContext.tsx` (que ya se creaba en `tasks.md` pero
no figuraba en este árbol). Se eliminó `geolocalizacionService.ts`: ninguna tarea de `tasks.md` lo
implementa como servicio propio; la lógica de geolocalización queda cubierta por
`infrastructure/geolocationClient.ts` (acceso al navegador) y los métodos de `domain/Filtro.ts`
(`distanciaHabilitada()`, `aQueryParams()`), evitando una capa intermedia sin responsabilidad
propia.

## Complexity Tracking

> No aplica: el Constitution Check no reportó violaciones. No se requieren excepciones ni
> justificaciones de complejidad adicional.

