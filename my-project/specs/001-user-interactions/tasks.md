# Tasks: Interacciones del Usuario en el Frontend

**Input**: Design documents from `/specs/001-user-interactions/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/api-contracts.md, quickstart.md

**Tests**: Se incluyen tareas de test explícitamente solicitadas por el usuario, priorizando dominio y reglas de negocio de cliente (Principio VII, NON-NEGOTIABLE de `constitution.md`).

**Organization**: Las tareas están agrupadas por historia de usuario (US1–US9, en el orden y prioridad de `spec.md`) para permitir implementación y prueba independientes de cada una.

**Scope**: Solo se generan tareas de planificación/implementación a ejecutar en una fase posterior. **No se implementa código en esta fase** (Principio X de `constitution.md`); este archivo es el resultado esperado de `/speckit.tasks`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivo distinto, sin dependencias pendientes)
- **[Story]**: Historia de usuario a la que pertenece (US1..US9); ausente en Setup, Foundational y Polish
- Cada tarea incluye la ruta de archivo exacta, relativa a `frontend/` (ver estructura de `plan.md`)

## Path Conventions

Aplicación frontend única (sin backend en este repo, ver `plan.md` → Structure Decision):

```text
frontend/
├── src/{pages,components,domain,services,infrastructure,routes}/
└── tests/{domain,services,components}/
```

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialización del proyecto frontend y estructura base

- [ ] T001 Crear estructura de carpetas del proyecto en `frontend/src/{pages,components,domain,services,infrastructure,routes}` y `frontend/tests/{domain,services,components}` según `plan.md`
- [ ] T002 Inicializar proyecto Vite + React + TypeScript en `frontend/` (`frontend/package.json`, `frontend/vite.config.ts`, `frontend/tsconfig.json`) — depende de T001
- [ ] T003 [P] Configurar Vitest + React Testing Library en `frontend/vitest.config.ts` y `frontend/tests/setup.ts` — depende de T002
- [ ] T004 [P] Configurar ESLint + Prettier en `frontend/.eslintrc.cjs` y `frontend/.prettierrc` — depende de T002
- [ ] T005 [P] Crear plantilla de variables de entorno en `frontend/.env.example` (`VITE_API_BASE_URL`, `VITE_OAUTH_GOOGLE_REDIRECT_PATH`, `VITE_OAUTH_GITHUB_REDIRECT_PATH`, `VITE_ENABLE_GEOLOCATION`) según `quickstart.md` — depende de T002

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Enums, modelos de dominio compartidos por múltiples historias, e infraestructura base que TODAS las historias necesitan

**⚠️ CRITICAL**: Ninguna historia de usuario puede comenzar hasta completar esta fase

### Enums (Principio V — value objects tipados)

- [ ] T006 [P] Crear enum `TipoContenido` en `frontend/src/domain/enums/TipoContenido.ts`
- [ ] T007 [P] Crear enum `EstadoPublicacion` en `frontend/src/domain/enums/EstadoPublicacion.ts`
- [ ] T008 [P] Crear enum `TipoFiltro` en `frontend/src/domain/enums/TipoFiltro.ts`
- [ ] T009 [P] Crear enum `RolUsuario` en `frontend/src/domain/enums/RolUsuario.ts`
- [ ] T010 [P] Crear enum `MotivoReporteCodigo` e interfaz `MotivoReporte` en `frontend/src/domain/enums/MotivoReporte.ts`

### Dominio compartido: Usuario (usado por login, seguir, perfil, publicaciones)

- [ ] T011 Crear modelo de dominio `Usuario` (`esPropio()`, `puedeVerBotonSeguir()`, `aplicarSeguirOptimista()`, `aplicarDejarDeSeguirOptimista()`, `revertirCambioSeguimiento()`) en `frontend/src/domain/Usuario.ts` — depende de T009
- [ ] T012 [P] Tests unitarios de reglas de negocio de `Usuario` (botón "Seguir" oculto en perfil propio — FR-040) en `frontend/tests/domain/Usuario.test.ts` — depende de T011

### Dominio compartido: Publicacion (usado por like, publicar, buscar, reportar)

- [ ] T013 Crear modelo de dominio `Publicacion` (`puedeDarLike()`, `puedeReportar()`, `puedeEditar()`, `puedeEliminar()`, `esPropia()`, `aplicarLikeOptimista()`, `revertirLikeOptimista()`) en `frontend/src/domain/Publicacion.ts` — depende de T006, T007
- [ ] T014 [P] Tests unitarios: reglas de like (no puede likear publicación propia, reversión optimista — FR-001..FR-003) en `frontend/tests/domain/Publicacion.likes.test.ts` — depende de T013
- [ ] T015 [P] Tests unitarios: reglas de permisos (solo el autor edita/elimina; no puede reportar publicación propia ni ya reportada — FR-021, FR-023) en `frontend/tests/domain/Publicacion.permissions.test.ts` — depende de T013

### Dominio compartido: Desafio (entidad referida transversalmente, sin HU propia en este alcance)

- [ ] T016 [P] Crear modelo de dominio mínimo `Desafio` (`estaVigente()`) en `frontend/src/domain/Desafio.ts` según nota de `data-model.md`

### Infraestructura compartida

- [ ] T017 Crear `httpClient` (wrapper de `fetch`, base URL desde `VITE_API_BASE_URL`, `credentials: 'include'`, manejo uniforme de errores, soporte `AbortController`) en `frontend/src/infrastructure/httpClient.ts` — depende de T005
- [ ] T018 [P] Crear `geolocationClient` (wrapper de `navigator.geolocation`) en `frontend/src/infrastructure/geolocationClient.ts`
- [ ] T019 Crear verificación de sesión (`GET /api/auth/me`) en `frontend/src/infrastructure/tokenStorage.ts` — depende de T017
- [ ] T020 Crear `AuthContext` (estado de sesión, expone usuario actual y helpers de login/logout) en `frontend/src/services/AuthContext.tsx` — depende de T011, T019
- [ ] T021 Crear esqueleto de rutas + guard de rutas protegidas en `frontend/src/routes/index.tsx` — depende de T020
- [ ] T022 [P] Crear componente `Skeleton` en `frontend/src/components/comunes/Skeleton.tsx`
- [ ] T023 [P] Crear componente `Spinner` en `frontend/src/components/comunes/Spinner.tsx`
- [ ] T024 [P] Crear componente `EmptyState` en `frontend/src/components/comunes/EmptyState.tsx`
- [ ] T025 [P] Crear componente `LazyMedia` (`loading="lazy"` + skeleton mientras carga — FR-020) en `frontend/src/components/comunes/LazyMedia.tsx`
- [ ] T026 Crear hook `useInfiniteList` (scroll infinito vía `IntersectionObserver` — FR-016) en `frontend/src/services/useInfiniteList.ts` — depende de T017

**Checkpoint**: Fundación lista — las historias de usuario pueden comenzar (en paralelo si hay múltiples desarrolladores)

---

## Phase 3: User Story 1 - Dar like a una publicación (Priority: P1) 🎯 MVP

**Goal**: Un usuario autenticado puede dar/quitar like a una publicación ajena con actualización optimista y reversión ante error; no puede likear su propia publicación; un usuario no autenticado es derivado a login.

**Independent Test**: Dar like/quitar like a una publicación ajena desde Home, verificar actualización optimista del contador, y verificar reversión + mensaje de error ante fallo simulado de red (Escenario A de `quickstart.md`).

> Las reglas de negocio de `puedeDarLike()` ya tienen test en T014 (Foundational). Esta fase se enfoca en servicios, componentes y wiring de UI.

### Implementation for User Story 1

- [ ] T027 [US1] Implementar `useLikePublicacion` (actualización optimista, reversión ante error, serialización de clics rápidos vía `AbortController` — CB-02) en `frontend/src/services/publicacionService.ts` — depende de T017, T013
- [ ] T028 [US1] Implementar componente presentacional `LikeButton` (usa `Publicacion.puedeDarLike()`, redirige a login si no autenticado — FR-004) en `frontend/src/components/publicacion/LikeButton.tsx` — depende de T027, T020
- [ ] T029 [P] [US1] Test de componente: `LikeButton` deshabilitado en publicación propia en `frontend/tests/components/LikeButton.test.tsx` — depende de T028
- [ ] T030 [US1] Implementar `PublicacionCard` (integra `LikeButton` y `LazyMedia`) en `frontend/src/components/publicacion/PublicacionCard.tsx` — depende de T028, T025
- [ ] T031 [US1] Implementar `HomePage` (feed con `useInfiniteList` + `PublicacionCard` + skeletons) en `frontend/src/pages/home/HomePage.tsx` — depende de T026, T030, T022

**Checkpoint**: User Story 1 (Like) funcional y testeable de forma independiente — MVP alcanzado

---

## Phase 4: User Story 2 - Publicar contenido con tags (Priority: P1)

**Goal**: Un usuario autenticado puede crear una publicación con archivo adjunto y hasta 10 tags de un vocabulario controlado, con validación de tipo de archivo en cliente y feedback visual de subida.

**Independent Test**: Completar el formulario de publicación con un archivo válido y tags seleccionados por autocompletado, enviarlo, y verificar que aparece en el perfil sin recargar la página (Escenario B de `quickstart.md`).

### Tests for User Story 2 ⚠️

> **Escribir estas pruebas PRIMERO; deben fallar antes de implementar los servicios correspondientes**

- [ ] T032 [P] [US2] Test unitario: límite máximo de 10 tags por publicación (FR-006) en `frontend/tests/services/tagsService.test.ts`
- [ ] T033 [P] [US2] Test unitario: validación de tipo de archivo (extensión/MIME) por `TipoContenido`, sin validar tamaño en cliente (FR-008, clarificación de spec) en `frontend/tests/services/archivoValidacion.test.ts`
- [ ] T034 [P] [US2] Test unitario: formulario de publicación bloquea envío sin archivo adjunto (FR-007) en `frontend/tests/services/usePublicacionForm.test.ts`

### Implementation for User Story 2

- [ ] T035 [P] [US2] Implementar `archivoValidacion` (valida tipo/MIME por `TipoContenido`) en `frontend/src/services/archivoValidacion.ts` — depende de T006, T033
- [ ] T036 [P] [US2] Implementar `tagsService` (autocompletado vía `GET /api/tags`, límite de 10 — FR-006) en `frontend/src/services/tagsService.ts` — depende de T017, T032
- [ ] T037 [US2] Extender `publicacionService` con `crearPublicacion()` (subida multipart con barra de progreso — FR-009) en `frontend/src/services/publicacionService.ts` — depende de T027, T035
- [ ] T038 [US2] Implementar `usePublicacionForm` (estado del formulario, conserva datos ante error — FR-012) en `frontend/src/services/usePublicacionForm.ts` — depende de T036, T037, T034
- [ ] T039 [US2] Implementar `TagChip` y `TagAutocomplete` en `frontend/src/components/publicacion/TagChip.tsx` y `frontend/src/components/publicacion/TagAutocomplete.tsx` — depende de T036
- [ ] T040 [US2] Implementar modal `PublicacionForm` (adjuntar archivo, tags, estado de carga ≤5s — FR-010) en `frontend/src/components/publicacion/PublicacionForm.tsx` — depende de T038, T039
- [ ] T041 [US2] Integrar botón "Nueva publicación" en `HomePage` para abrir `PublicacionForm` en `frontend/src/pages/home/HomePage.tsx` — depende de T040, T031

**Checkpoint**: User Stories 1 y 2 funcionales de forma independiente

---

## Phase 5: User Story 3 - Buscar publicaciones y aplicar filtros (Priority: P1)

**Goal**: Buscar publicaciones por texto libre y aplicar filtros de estilo, técnica, tipo de contenido y distancia, resueltos siempre contra la API, con scroll infinito y estados de carga/vacío.

**Independent Test**: Ingresar un término de búsqueda y aplicar un filtro en Descubrir, verificar actualización de resultados sin recargar, scroll infinito, y estado vacío ante filtros muy restrictivos (Escenario C de `quickstart.md`).

### Tests for User Story 3 ⚠️

- [ ] T042 [P] [US3] Tests unitarios de reglas de `Filtro` (`distanciaHabilitada()`, `aQueryParams()`, `listaDeChips()`, `quitarFiltro()` — FR-013, FR-015, FR-018) en `frontend/tests/domain/Filtro.test.ts`

### Implementation for User Story 3

- [ ] T043 [US3] Crear modelo de dominio `Filtro` en `frontend/src/domain/Filtro.ts` — depende de T008, T042
- [ ] T044 [US3] Implementar `busquedaService` (búsqueda con filtros vía `GET /api/publicaciones/buscar`, paginación por cursor) en `frontend/src/services/busquedaService.ts` — depende de T017, T043
- [ ] T045 [P] [US3] Implementar `FiltroPanel` (drawer lateral de filtros) en `frontend/src/components/filtros/FiltroPanel.tsx` — depende de T043
- [ ] T046 [P] [US3] Implementar `FiltroChip` (chip removible individualmente) en `frontend/src/components/filtros/FiltroChip.tsx` — depende de T043
- [ ] T047 [US3] Implementar `useDescubrirFiltros` (orquesta `Filtro` + `busquedaService` + `useInfiniteList`) en `frontend/src/services/useDescubrirFiltros.ts` — depende de T044, T026, T043
- [ ] T048 [US3] Implementar `DescubrirPage` (búsqueda de texto libre, `FiltroPanel`, skeletons, `EmptyState`, indicador de fin de resultados — CB-04, CB-05) en `frontend/src/pages/descubrir/DescubrirPage.tsx` — depende de T047, T045, T046, T022, T024

**Checkpoint**: User Stories 1, 2 y 3 funcionales de forma independiente

---

## Phase 6: User Story 4 - Login e inicio de sesión (Priority: P1)

**Goal**: Iniciar sesión vía mail/contraseña, Google o GitHub, con validación en cliente, mensajes de error genéricos, y redirección al destino original o al home.

**Independent Test**: Iniciar sesión con mail/contraseña válidos y con un proveedor externo, verificar redirección correcta con sesión activa (Escenario E de `quickstart.md`).

### Tests for User Story 4 ⚠️

- [ ] T049 [P] [US4] Test unitario: formulario de login bloquea envío con campos vacíos o mail inválido (FR-026) en `frontend/tests/services/loginForm.test.ts`

### Implementation for User Story 4

- [ ] T050 [P] [US4] Implementar `mailPasswordProvider` (estrategia mail/contraseña) en `frontend/src/infrastructure/authProviders/mailPasswordProvider.ts` — depende de T017
- [ ] T051 [P] [US4] Implementar `googleProvider` (estrategia OAuth con redirección) en `frontend/src/infrastructure/authProviders/googleProvider.ts` — depende de T017
- [ ] T052 [P] [US4] Implementar `githubProvider` (estrategia OAuth con redirección) en `frontend/src/infrastructure/authProviders/githubProvider.ts` — depende de T017
- [ ] T053 [US4] Implementar `authService` (orquesta los tres proveedores, login/logout, alimenta `AuthContext`) en `frontend/src/services/authService.ts` — depende de T050, T051, T052, T020
- [ ] T054 [US4] Implementar `LoginPage` (tres opciones, validación cliente, error genérico, submit deshabilitado en progreso, redirect si ya autenticado — FR-026..FR-029) en `frontend/src/pages/login/LoginPage.tsx` — depende de T053, T049
- [ ] T055 [US4] Implementar `AuthCallbackPage` (maneja retorno de OAuth Google/GitHub) en `frontend/src/pages/login/AuthCallbackPage.tsx` — depende de T053
- [ ] T056 [US4] Integrar redirección a login con conservación de destino original en el guard de rutas (CB-06) en `frontend/src/routes/index.tsx` — depende de T021, T053

**Checkpoint**: User Stories 1–4 funcionales de forma independiente

---

## Phase 7: User Story 5 - Registro de cuenta (Priority: P1)

**Goal**: Registrar una cuenta nueva vía mail/contraseña o proveedor social, con validación de fortaleza de contraseña en tiempo real, y redirección al cuestionario de onboarding.

**Independent Test**: Completar el formulario de registro con datos válidos y verificar que se crea la cuenta y se inicia el cuestionario de onboarding (Escenario del flujo de registro en `quickstart.md`, derivado de US-6 de `spec.md`).

### Tests for User Story 5 ⚠️

- [ ] T057 [P] [US5] Test unitario: formulario de registro bloquea envío con campos incompletos o contraseñas que no coinciden (FR-031) en `frontend/tests/services/registroForm.test.ts`

### Implementation for User Story 5

- [ ] T058 [US5] Extender `authService` con `registrar()` (`POST /api/auth/register`, manejo de error `EMAIL_YA_REGISTRADO` — FR-032) en `frontend/src/services/authService.ts` — depende de T053
- [ ] T059 [US5] Implementar `RegistroPage` (formulario completo, indicador de fortaleza de contraseña en tiempo real, registro social) en `frontend/src/pages/registro/RegistroPage.tsx` — depende de T058, T057
- [ ] T060 [US5] Implementar `CuestionarioPage` (onboarding post-registro — FR-033) en `frontend/src/pages/cuestionario/CuestionarioPage.tsx` — depende de T059

**Checkpoint**: User Stories 1–5 (todas las P1) funcionales de forma independiente

---

## Phase 8: User Story 6 - Editar datos de perfil (Priority: P2)

**Goal**: Editar nombre, apellido, bio y foto de perfil sin exponer el campo de contraseña, con previsualización de foto y advertencia de cambios no guardados.

**Independent Test**: Modificar la bio del perfil, guardar, y verificar que el perfil visible se actualiza sin recargar la página (Escenario del flujo de edición en `quickstart.md`, derivado de US-6 de `spec.md`).

### Tests for User Story 6 ⚠️

- [ ] T061 [P] [US6] Test unitario: formulario de edición de perfil bloquea envío con campos obligatorios vacíos (FR-036) en `frontend/tests/services/usePerfilEdicion.test.ts`

### Implementation for User Story 6

- [ ] T062 [US6] Implementar `perfilService` (`GET /api/usuarios/{id}`, `PATCH /api/usuarios/me`) en `frontend/src/services/perfilService.ts` — depende de T017, T011
- [ ] T063 [US6] Implementar `usePerfilEdicion` (estado del formulario, previsualización de foto, advertencia de cambios no guardados — FR-038, FR-039) en `frontend/src/services/usePerfilEdicion.ts` — depende de T062, T061
- [ ] T064 [US6] Implementar `EditarPerfilPage` (sin campo de contraseña, enlace "Cambiar contraseña" — FR-035) en `frontend/src/pages/editar-perfil/EditarPerfilPage.tsx` — depende de T063
- [ ] T065 [US6] Implementar `PerfilPage` (visualización de datos propios/ajenos usando `Usuario.esPropio()`) en `frontend/src/pages/perfil/PerfilPage.tsx` — depende de T062, T011

**Checkpoint**: User Stories 1–6 funcionales de forma independiente

---

## Phase 9: User Story 7 - Reportar una publicación ajena (Priority: P2)

**Goal**: Reportar una publicación ajena seleccionando un motivo provisto por el backend; el botón se deshabilita en publicaciones propias o ya reportadas.

**Independent Test**: Abrir el modal de reporte en una publicación ajena, seleccionar un motivo y confirmar el envío, verificando la confirmación no bloqueante (Escenario D de `quickstart.md`).

> Las reglas de negocio de `puedeReportar()` ya tienen test en T015 (Foundational).

### Implementation for User Story 7

- [ ] T066 [US7] Implementar `reporteService` (`GET` motivos, `GET` mi-reporte, `POST` reporte) en `frontend/src/services/reporteService.ts` — depende de T017, T013
- [ ] T067 [US7] Implementar `ReportButton` (deshabilitado en propias o ya reportadas — FR-021, FR-023) en `frontend/src/components/publicacion/ReportButton.tsx` — depende de T066
- [ ] T068 [US7] Implementar `ReportarModal` (selección de motivo, bloqueo sin motivo, confirmación no bloqueante — FR-022, FR-024) en `frontend/src/components/publicacion/ReportarModal.tsx` — depende de T067
- [ ] T069 [P] [US7] Test de componente: `ReportButton` deshabilitado en publicación propia y en ya reportada en `frontend/tests/components/ReportButton.test.tsx` — depende de T067
- [ ] T070 [US7] Integrar `ReportButton` y `ReportarModal` en `PublicacionCard` en `frontend/src/components/publicacion/PublicacionCard.tsx` — depende de T068, T030

**Checkpoint**: User Stories 1–7 funcionales de forma independiente

---

## Phase 10: User Story 8 - Seguir a otra persona (Priority: P2)

**Goal**: Seguir/dejar de seguir a otro usuario con actualización optimista del contador de seguidores; el botón no aparece en el perfil propio.

**Independent Test**: Seguir el perfil de otro usuario, verificar actualización optimista del contador, y verificar confirmación antes de dejar de seguir (Escenario F de `quickstart.md`).

> Las reglas de negocio de `puedeVerBotonSeguir()` ya tienen test en T012 (Foundational).

### Implementation for User Story 8

- [ ] T071 [US8] Extender `perfilService` con `seguir()`/`dejarDeSeguir()` (actualización optimista — FR-042) en `frontend/src/services/perfilService.ts` — depende de T062
- [ ] T072 [US8] Implementar `SeguirButton` (confirmación antes de dejar de seguir — FR-041, oculto en perfil propio — FR-040) en `frontend/src/components/perfil/SeguirButton.tsx` — depende de T071
- [ ] T073 [P] [US8] Test de componente: `SeguirButton` oculto en perfil propio y confirma antes de dejar de seguir en `frontend/tests/components/SeguirButton.test.tsx` — depende de T072
- [ ] T074 [US8] Integrar `SeguirButton` en `PerfilPage` en `frontend/src/pages/perfil/PerfilPage.tsx` — depende de T072, T065

**Checkpoint**: User Stories 1–8 funcionales de forma independiente

---

## Phase 11: User Story 9 - Crear carpetas de posts guardados (Priority: P3)

**Goal**: Crear, renombrar y eliminar carpetas de posts guardados (hasta 100, visibles públicamente); guardar/quitar posts sin afectar la publicación original.

**Independent Test**: Crear una carpeta, guardar un post en ella desde la publicación, y verificar que aparece en el perfil con el conteo correcto de posts (Escenario G de `quickstart.md`).

### Tests for User Story 9 ⚠️

- [ ] T075 [P] [US9] Tests unitarios de reglas de `Carpeta` (`puedeEliminar()`, `puedeRenombrar()`, `puedeCrearNuevaCarpeta()` con límite de 100 — FR-047) en `frontend/tests/domain/Carpeta.test.ts`

### Implementation for User Story 9

- [ ] T076 [US9] Crear modelo de dominio `Carpeta` en `frontend/src/domain/Carpeta.ts` — depende de T075
- [ ] T077 [US9] Implementar `carpetaService` (crear/renombrar/eliminar carpeta, guardar/quitar post — FR-043..FR-046) en `frontend/src/services/carpetaService.ts` — depende de T017, T076
- [ ] T078 [P] [US9] Implementar `CarpetaCard` en `frontend/src/components/carpetas/CarpetaCard.tsx` — depende de T076
- [ ] T079 [P] [US9] Implementar `GuardarEnCarpetaModal` (seleccionar carpeta existente o crear una nueva en el mismo flujo — FR-044) en `frontend/src/components/carpetas/GuardarEnCarpetaModal.tsx` — depende de T077
- [ ] T080 [US9] Integrar sección de carpetas (crear, listar hasta 100, eliminar con advertencia — FR-045) en `PerfilPage` en `frontend/src/pages/perfil/PerfilPage.tsx` — depende de T078, T077, T074
- [ ] T081 [US9] Integrar botón "Guardar en carpeta" en `PublicacionCard` en `frontend/src/components/publicacion/PublicacionCard.tsx` — depende de T079, T070

**Checkpoint**: Las 9 historias de usuario funcionan de forma independiente

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Mejoras transversales que afectan a múltiples historias

- [ ] T082 [P] Implementar `DesafiosPage` stub (visualización básica; detalle funcional fuera de alcance de `spec.md` según nota de `data-model.md`) en `frontend/src/pages/desafios/DesafiosPage.tsx` — depende de T016
- [ ] T083 [P] Pase de accesibilidad: foco visible y `aria-live` en estados de carga en `frontend/src/components/comunes/Skeleton.tsx` y `frontend/src/components/comunes/Spinner.tsx` — depende de T022, T023
- [ ] T084 Ejecutar manualmente los escenarios de validación A–G de `quickstart.md` contra todas las historias implementadas — depende de T031, T041, T048, T056, T060, T065, T070, T074, T081
- [ ] T085 [P] Actualizar `frontend/README.md` con instrucciones de instalación y ejecución según `quickstart.md`
- [ ] T086 Revisión de arquitectura contra el checklist de `quickstart.md` (ningún componente de presentación llama `fetch`/`axios` directamente, enums en vez de strings mágicos, toda regla de negocio testeada) — depende de T084

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — puede iniciar de inmediato
- **Foundational (Phase 2)**: Depende de Setup — **BLOQUEA** todas las historias de usuario
- **User Stories (Phase 3–11)**: Todas dependen de Foundational; pueden avanzar en paralelo entre equipos o secuencialmente en orden de prioridad (US1→US9)
- **Polish (Phase 12)**: Depende de las historias de usuario que se decida incluir en el alcance de la entrega

### User Story Dependencies

- **US1 (Like, P1)**: Sin dependencias de otras historias — MVP
- **US2 (Publicar, P1)**: Extiende `publicacionService` creado en US1 (T027); reutiliza `PublicacionCard`/`HomePage` de US1
- **US3 (Buscar/Filtrar, P1)**: Independiente de US1/US2 en su dominio (`Filtro`), pero reutiliza `PublicacionCard` de US1 para renderizar resultados
- **US4 (Login, P1)**: Independiente en su dominio; consumida por US2, US6, US7, US8, US9 para verificar autenticación
- **US5 (Registro, P1)**: Extiende `authService` de US4
- **US6 (Editar perfil, P2)**: Reutiliza `Usuario` (Foundational) y crea `PerfilPage` base, reutilizada luego por US8 y US9
- **US7 (Reportar, P2)**: Extiende `PublicacionCard` de US1
- **US8 (Seguir, P2)**: Extiende `perfilService`/`PerfilPage` de US6
- **US9 (Carpetas, P3)**: Extiende `PerfilPage` de US6/US8 y `PublicacionCard` de US1/US7

### Dentro de cada historia

- Tests (cuando se incluyen) se escriben primero y deben fallar antes de implementar
- Modelos de dominio antes que servicios
- Servicios antes que componentes de presentación
- Componentes antes que wiring en páginas

### Parallel Opportunities

- Todas las tareas `[P]` de Setup pueden ejecutarse en paralelo
- Todos los enums `[P]` de Foundational (T006–T010) pueden ejecutarse en paralelo
- Los tests de dominio `[P]` de Foundational (T012, T014, T015) pueden ejecutarse en paralelo entre sí una vez creado el modelo correspondiente
- Los tres proveedores de autenticación de US4 (T050, T051, T052) son `[P]` entre sí
- Distintas historias de usuario pueden trabajarse en paralelo por distintos desarrolladores una vez completada Foundational, respetando las dependencias cruzadas señaladas arriba (US2→US1, US5→US4, US8→US6, US9→US6/US1)

---

## Parallel Example: Foundational — Enums

```bash
Task: "Crear enum TipoContenido en frontend/src/domain/enums/TipoContenido.ts"
Task: "Crear enum EstadoPublicacion en frontend/src/domain/enums/EstadoPublicacion.ts"
Task: "Crear enum TipoFiltro en frontend/src/domain/enums/TipoFiltro.ts"
Task: "Crear enum RolUsuario en frontend/src/domain/enums/RolUsuario.ts"
Task: "Crear enum MotivoReporteCodigo e interfaz MotivoReporte en frontend/src/domain/enums/MotivoReporte.ts"
```

## Parallel Example: User Story 4 — Proveedores de autenticación

```bash
Task: "Implementar mailPasswordProvider en frontend/src/infrastructure/authProviders/mailPasswordProvider.ts"
Task: "Implementar googleProvider en frontend/src/infrastructure/authProviders/googleProvider.ts"
Task: "Implementar githubProvider en frontend/src/infrastructure/authProviders/githubProvider.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 solamente)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (crítico — bloquea todas las historias)
3. Completar Phase 3: User Story 1 (Like)
4. **Detener y validar**: probar Like de forma independiente (Escenario A de `quickstart.md`)
5. Demostrar/entregar si está listo

### Entrega incremental

1. Setup + Foundational → base lista
2. + US1 (Like) → validar → **MVP**
3. + US2 (Publicar) → validar
4. + US3 (Buscar/Filtrar) → validar
5. + US4 (Login) → validar
6. + US5 (Registro) → validar (cierra las 5 historias P1)
7. + US6 (Editar perfil) → validar
8. + US7 (Reportar) → validar
9. + US8 (Seguir) → validar
10. + US9 (Carpetas) → validar (cierra el alcance completo de `spec.md`)
11. Phase 12: Polish

---

## Notes

- `[P]` = archivos distintos, sin dependencias pendientes entre sí
- `[Story]` mapea cada tarea a su historia de usuario para trazabilidad con `spec.md`
- Las 6 reglas de negocio de cliente NON-NEGOTIABLE (Principio VII) están cubiertas por: T014, T015 (like/reportar/editar/eliminar), T012 (seguir), T034/T049/T057/T061 (formularios obligatorios), T042 (filtro de distancia)
- No se implementa código en esta fase; este archivo es un artefacto de planificación
- Verificar que cada test falle antes de implementar la funcionalidad correspondiente
- Detenerse en cada checkpoint para validar la historia de forma independiente
