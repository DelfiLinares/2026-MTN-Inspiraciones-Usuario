# Revisión de arquitectura (T086)

**Tarea**: `T086 Revisión de arquitectura contra el checklist de quickstart.md` — depende de
T084, T012, T014, T015, T042, T075, T090.

> Nota: por decisión explícita del usuario, esta revisión se ejecuta **sin** haber ejecutado T084
> (validación manual end-to-end), dado que esa tarea requiere un backend real corriendo y un
> navegador interactivo que no están disponibles en este entorno. El resto de las dependencias
> (T012, T014, T015, T042, T075, T090 — tests unitarios de reglas de negocio de dominio) están
> implementadas y se referencian abajo.

Fuente de verdad: `specs/001-user-interactions/quickstart.md` (sección 6, "Checklist de
arquitectura antes de dar por completada la implementación").

## Resultado de la revisión

- [x] **Ningún componente en `pages/` o `components/` importa `httpClient` o realiza
      `fetch`/`axios` directamente (Principio III).**
      Verificado: la única referencia a `infrastructure/httpClient` fuera de `services/` e
      `infrastructure/` es `pages/registro/RegistroPage.tsx`, que importa únicamente el tipo
      `ApiError` para tipar el `catch` de errores — no invoca `httpClient` ni realiza peticiones
      de red directamente. Todas las llamadas HTTP reales están encapsuladas en `src/services/*`
      (`authService`, `feedService`, `busquedaService`, `perfilService`, `carpetaService`,
      `publicacionService`, `reporteService`, `tagsService`, `filtroOpcionesService`) y en
      `src/infrastructure/authProviders/*`.

- [x] **Toda regla de habilitación de acciones (like, reportar, seguir, editar/eliminar) se
      consulta desde los métodos de `domain/`, no reimplementada en el componente (Principio
      IV).**
      Verificado: `domain/Publicacion.ts` expone `puedeDarLike()`, `puedeReportar()`,
      `puedeEditar()`, `puedeEliminar()`; `domain/Usuario.ts` expone `puedeVerBotonSeguir()` y las
      transiciones optimistas de seguimiento; `domain/Carpeta.ts` expone `puedeEliminar()`,
      `puedeRenombrar()`, `puedeCrearNuevaCarpeta()`. Los componentes (`PublicacionCard`,
      `LikeButton`, `ReportButton`, `SeguirButton`, `CarpetaCard`, `PerfilPage`) consultan estos
      métodos en vez de reimplementar la lógica de habilitación.

- [x] **Los enums de `data-model.md` (`TipoContenido`, `EstadoPublicacion`, `TipoFiltro`,
      `RolUsuario`) se usan en vez de strings sueltos (Principio V).**
      Verificado: existen `domain/enums/TipoContenido.ts`, `EstadoPublicacion.ts`,
      `MotivoReporte.ts`, `RolUsuario.ts`, `TipoFiltro.ts`, y son consumidos como tipos/valores en
      todo el dominio y los servicios (por ejemplo, `TipoContenido.IMAGEN`/`VIDEO` en filtros de
      contenido, `TipoFiltro.DISTANCIA` en `Filtro`). No se encontraron strings mágicos
      equivalentes sueltos en su lugar.

- [x] **Todo listado (home, Descubrir) implementa scroll infinito/paginación y lazy loading de
      medios (Principio VIII).**
      Verificado: `HomePage.tsx` y `useDescubrirFiltros.ts` (usado por la página Descubrir) se
      apoyan en el hook compartido `services/useInfiniteList.ts` (paginación + centinela de
      intersección para scroll infinito). El renderizado de medios en las tarjetas de publicación
      usa `components/comunes/LazyMedia.tsx`.

- [x] **Todo punto de espera de red muestra un estado de carga explícito (Principio VIII).**
      Verificado: `HomePage` usa `Skeleton` mientras `cargando` es verdadero; `LoginPage` evita
      renderizar el formulario o redirigir mientras `cargando` (estado de sesión) es verdadero;
      `PerfilPage` mantiene su propio estado `cargando` y muestra "Cargando perfil…" mientras
      resuelve los datos del perfil. Los formularios (`PublicacionForm`, login, registro,
      cuestionario) exponen estados de envío/carga explícitos en sus componentes.

- [x] **Los tests de `tests/domain/` cubren las 6 reglas de negocio obligatorias listadas en la
      sección 4 de `quickstart.md` (Principio VII).**
      Verificado: existen y están implementados
      `tests/domain/Publicacion.likes.test.ts` (T014),
      `tests/domain/Publicacion.permissions.test.ts` (T015),
      `tests/domain/Usuario.test.ts` (T012),
      `tests/domain/Usuario.seguir.test.ts` (T090),
      `tests/domain/Filtro.test.ts` (T042),
      `tests/domain/Carpeta.test.ts` (T075).

## Conclusión

Los seis puntos del checklist de arquitectura de `quickstart.md` se cumplen en el estado actual
del código de `backend_usuario/frontend/`. No se identificaron violaciones de los Principios III,
IV, V, VII u VIII.

**Pendiente fuera del alcance de esta tarea**: T084 (validación manual end-to-end de los
escenarios A–G), explícitamente no ejecutada en esta revisión por indicación del usuario.
