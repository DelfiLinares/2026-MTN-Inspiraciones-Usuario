# Research: Interacciones del Usuario en el Frontend

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Este documento consolida las decisiones técnicas necesarias para resolver el Technical Context de
`plan.md`. No quedan `NEEDS CLARIFICATION` pendientes tras esta fase.

---

## 1. Manejo de estado global vs. local

**Decision**: Usar **estado local por pantalla** (React `useState`/`useReducer` dentro de hooks de
contenedor) para la mayoría de los flujos, combinado con un **Contexto de React (`AuthContext`)**
acotado exclusivamente a la sesión del usuario autenticado (token, datos básicos de `Usuario`,
estado de autenticación). No se introduce una librería de manejo de estado global (Redux, Zustand,
Recoil, etc.).

**Rationale**:
- El Principio VI (Patrones de Diseño con Propósito) exige no forzar patrones cuando una solución
  simple alcanza. El alcance funcional (9 historias, 8 pantallas) no presenta estado compartido
  complejo entre pantallas no relacionadas: cada pantalla (home, descubrir, perfil) gestiona su
  propia lista paginada y sus propios filtros de forma aislada.
- El único estado verdaderamente transversal es la sesión del usuario autenticado (necesaria en
  casi todas las pantallas para condicionar acciones como like/reportar/seguir), lo cual encaja
  naturalmente en un Contexto de React sin necesidad de una librería adicional.
- Mantiene la separación de capas: el Contexto vive en la capa de aplicación (consume
  `authService`), nunca en infraestructura ni en presentación directamente.

**Alternatives considered**:
- **Redux Toolkit**: rechazado por sobre-ingeniería; el proyecto no requiere time-travel debugging,
  ni un store centralizado con múltiples slices interdependientes. Añadiría boilerplate sin
  beneficio medible para 9 historias de usuario.
- **Zustand/Recoil**: más livianos que Redux, pero igual innecesarios dado que no hay estado
  compartido entre pantallas no relacionadas más allá de la sesión.
- **Prop drilling puro sin Contexto**: rechazado porque la sesión del usuario se necesita en
  componentes profundamente anidados (botones de like/reportar/seguir dentro de tarjetas de
  publicación), lo que generaría prop drilling excesivo violando el Principio IV (sin duplicación).

---

## 2. Cliente HTTP: fetch nativo vs. Axios

**Decision**: Usar **fetch nativo del navegador**, envuelto en un módulo propio de infraestructura
(`httpClient.ts`) que centraliza: base URL configurable por variable de entorno, adjunto automático
del token de sesión, manejo uniforme de errores HTTP, y soporte de cancelación de requests
(`AbortController`) para escenarios como debounce de búsqueda.

**Rationale**:
- El stack definido por el usuario no exige una librería adicional; `fetch` está disponible de
  forma nativa en todos los navegadores modernos objetivo (target: navegador web SPA).
- Envolver `fetch` en un módulo propio permite cumplir el Principio III (ninguna llamada HTTP fuera
  de infraestructura) sin acoplar el proyecto a una dependencia externa adicional, reduciendo
  superficie de mantenimiento.
- `AbortController` (parte de la Fetch API) cubre la necesidad de CB-02 (serializar/cancelar
  llamadas de like en rápida sucesión) y de debounce de búsqueda por texto libre, sin necesitar
  Axios ni librerías de cancelación adicionales.

**Alternatives considered**:
- **Axios**: ofrece interceptors listos y una API más ergonómica para manejo de errores, pero
  agrega una dependencia externa para una funcionalidad que `fetch` + un wrapper delgado cubren
  completamente. Se descarta por simplicidad (Principio VI), dado que no hay necesidad de
  funcionalidades exclusivas de Axios (como cancelación basada en tokens propios, ya cubierta por
  `AbortController` nativo).

---

## 3. Autenticación con Google y GitHub

**Decision**: Implementar el patrón **Strategy** en la capa de infraestructura
(`authProviders/mailPasswordProvider.ts`, `googleProvider.ts`, `githubProvider.ts`), todos
implementando una interfaz común `AuthProvider` (`login()`, `handleCallback()`), orquestados desde
`authService.ts` (capa de aplicación). El flujo de Google/GitHub usa **OAuth 2.0 Authorization Code
Flow con redirección** (el usuario es redirigido al proveedor externo y retorna a una ruta de
callback propia del frontend, por ejemplo `/auth/callback/google`), donde el frontend intercambia
el código recibido por una sesión propia llamando a un endpoint del backend (ver
`contracts/api-contracts.md`).

**Rationale**:
- El Principio VI recomienda explícitamente el patrón estrategia "para distintos proveedores de
  login": cada proveedor encapsula su propio flujo de redirección/callback sin que el componente de
  presentación (pantalla de Login) conozca los detalles de cada proveedor; solo invoca
  `authService.loginWith(provider)`.
- La redirección (en vez de popups) es más simple de implementar de forma consistente entre
  navegadores y evita problemas de bloqueo de popups, priorizando la usabilidad (Principio IX).
- El intercambio del código de autorización ocurre contra el backend (Java/Spring Boot), no en el
  cliente, evitando exponer secretos de cliente OAuth en el frontend.

**Alternatives considered**:
- **Popup-based OAuth flow**: rechazado por mayor fragilidad (bloqueo de popups, necesidad de
  `postMessage` entre ventanas) sin beneficio claro para este alcance.
- **Firebase Auth / Auth0 SDK**: rechazado por introducir una dependencia de un proveedor de
  identidad externo adicional cuando el backend propio (Java/Spring Boot) ya gestiona la sesión y
  los tres proveedores requeridos: agregaría una capa de indirección innecesaria.

---

## 4. Scroll infinito vs. paginación clásica

**Decision**: Implementar **scroll infinito** como patrón principal para Home y Descubrir, mediante
un hook de contenedor reutilizable (`useInfiniteList`) que orquesta llamadas paginadas a
`busquedaService`/`publicacionService` usando `IntersectionObserver` para detectar cuándo el
usuario se acerca al final de la lista.

**Rationale**:
- FR-016 exige "paginación o scroll infinito" sin favorecer una sobre otra; se elige scroll
  infinito por ser el patrón más alineado a la usabilidad esperada en un feed de descubrimiento de
  contenido (Principio IX: "encontrar contenido inspirador debe ser simple, rápido y claro"),
  evitando la fricción de clics en "página siguiente".
- `IntersectionObserver` es una API nativa del navegador, sin dependencias adicionales, con buen
  soporte y bajo costo de rendimiento comparado con listeners de scroll manuales.
- El hook se ubica en la capa de servicios/aplicación (no en presentación pura), y el componente de
  presentación (`InfiniteScrollList`) solo renderiza el estado que el hook expone (ítems, `loading`,
  `hasMore`), respetando el Principio III.

**Alternatives considered**:
- **Paginación clásica con botones "Anterior/Siguiente"**: más simple de implementar pero peor
  ajustada a la usabilidad esperada de un feed continuo; se descarta como patrón principal, aunque
  el diseño del hook no impide reutilizarlo si una pantalla futura lo requiriera.
- **Scroll listener manual (`window.onscroll`)**: rechazado por ser menos performante y más propenso
  a errores que `IntersectionObserver`.

---

## 5. Lazy loading de imágenes y medios

**Decision**: Usar el atributo nativo **`loading="lazy"`** de HTML en elementos `<img>` y `<video>`
(con poster) como mecanismo principal, complementado por un componente `LazyMedia` en
`components/comunes/` que además muestra un `Skeleton` mientras el recurso no ha cargado
(`onLoad`/`onError`).

**Rationale**:
- `loading="lazy"` es soportado nativamente por los navegadores modernos objetivo, no requiere
  librerías externas, y cumple directamente FR-020 (lazy loading de imágenes/medios) y el Principio
  VIII sin complejidad adicional.
- Envolver el atributo nativo en un componente propio (`LazyMedia`) permite añadir el estado de
  carga explícito (skeleton) exigido transversalmente por el Principio VIII ("todo punto de espera
  de red DEBE mostrar un estado de carga explícito"), sin duplicar esa lógica en cada pantalla.

**Alternatives considered**:
- **Librerías de lazy loading basadas en IntersectionObserver (ej. `react-lazyload`)**: rechazadas
  por ser redundantes frente al soporte nativo `loading="lazy"`, que ya cubre el caso de uso sin
  dependencia adicional.

---

## 6. Almacenamiento del token de sesión

**Decision**: Almacenar el token de sesión en una **cookie `httpOnly`, `Secure`, `SameSite=Lax`**
seteada por el backend tras un login/registro exitoso (incluyendo el retorno del flujo OAuth). El
cliente HTTP (`httpClient.ts`) se configura para enviar credenciales (`credentials: 'include'`) en
cada request, sin manipular el token directamente desde JavaScript.

**Rationale**:
- Cumple el Principio de seguridad básica ya documentado como supuesto en `spec.md` ("mecanismo
  seguro... cookie httpOnly o equivalente") y con FR-030 (token incluido automáticamente en todas
  las llamadas), sin exponer el token a scripts de terceros ni a ataques XSS que sí podrían leer
  `localStorage`.
- Al ser httpOnly, el frontend no necesita lógica propia de adjuntar el header `Authorization` en
  cada request: el navegador lo hace automáticamente vía cookie, simplificando `httpClient.ts`.
- El estado "¿está logueado?" en el `AuthContext` se deriva de un endpoint `/api/auth/me` (o
  equivalente) llamado al montar la aplicación, no de leer el token directamente.

**Alternatives considered**:
- **`localStorage`/`sessionStorage`**: rechazado por ser vulnerable a robo de token vía XSS;
  contradice el Principio de seguridad básica mencionado en la constitución y en los supuestos del
  spec.
- **Cookie no-httpOnly manipulada por JS**: rechazada por la misma razón (accesible a scripts,
  vulnerable a XSS).

**Nota de contrato pendiente**: el mecanismo exacto de la cookie (nombre, dominio, expiración) debe
confirmarse con el equipo de backend; se documenta como pendiente en
`contracts/api-contracts.md`.

---

## 7. Patrón contenedor/presentacional

**Decision**: Aplicar el patrón **contenedor (hook)/presentacional (componente)** de forma
consistente en las pantallas con lógica de datos: un hook de contenedor por pantalla o feature
(`useHomeFeed`, `useDescubrirFiltros`, `usePublicacionForm`, `usePerfilEdicion`, `useCarpetas`) que
orquesta llamadas a servicios y expone estado + callbacks, consumido por un componente
presentacional que solo renderiza.

**Rationale**:
- Es el patrón explícitamente sugerido por el Principio VI para "separar lógica de estado de la
  vista", y encaja naturalmente con la separación de capas del Principio III: el hook vive
  conceptualmente en el límite entre presentación y aplicación (invoca servicios, nunca HTTP
  directo), y el componente permanece "tonto" (solo props in, JSX out).
- Facilita testear la lógica de estado de forma aislada (Principio VII) sin necesidad de renderizar
  el árbol completo de componentes.

**Alternatives considered**:
- **Lógica embebida directamente en el componente**: rechazada porque mezclaría responsabilidades
  (Principio IV) y dificultaría el testing aislado de reglas de negocio.
- **HOCs (Higher-Order Components)**: patrón más antiguo y menos idiomático en React moderno con
  hooks; se descarta a favor de hooks de contenedor, más simple y con mejor soporte de TypeScript.

---

## Resumen de decisiones (Technical Context resuelto)

| Aspecto | Decisión |
|---|---|
| Estado global vs. local | Local por pantalla + `AuthContext` acotado a sesión |
| Cliente HTTP | `fetch` nativo envuelto en `httpClient.ts` propio |
| Auth Google/GitHub | Patrón Strategy + OAuth Authorization Code Flow con redirección |
| Scroll infinito | `IntersectionObserver` + hook `useInfiniteList` |
| Lazy loading | Atributo nativo `loading="lazy"` + componente `LazyMedia` con skeleton |
| Almacenamiento de token | Cookie `httpOnly` + `credentials: 'include'` |
| Patrón de UI dominante | Contenedor (hook)/Presentacional (componente) |
