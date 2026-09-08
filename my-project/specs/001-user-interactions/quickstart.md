# Quickstart: Frontend de Usuario — Interacciones del Usuario

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Contracts**: [contracts/api-contracts.md](./contracts/api-contracts.md)

Esta guía describe cómo levantar el proyecto frontend localmente y cómo validar, de punta a punta,
que la implementación futura de las 9 historias de usuario cumple lo especificado. **No incluye
código de implementación** (Principio X); es una guía de ejecución y validación.

---

## 1. Prerrequisitos

- Node.js LTS (≥18.x) y npm (o pnpm/yarn, a definir por el equipo al iniciar el proyecto)
- Acceso a una instancia del backend Java/Spring Boot corriendo localmente o en un entorno de
  desarrollo compartido (este repositorio **no** incluye el backend)
- Credenciales de cliente OAuth de Google y GitHub para pruebas de login social (provistas por el
  equipo de backend/infraestructura, no se generan desde este frontend)

---

## 2. Variables de entorno

El proyecto Vite lee variables con prefijo `VITE_` desde un archivo `.env.local` (no versionado).

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_BASE_URL` | URL base de la API REST del backend | `http://localhost:8080/api` |
| `VITE_OAUTH_GOOGLE_REDIRECT_PATH` | Ruta de callback propia para Google (si el backend la requiere — ver ambigüedad B2 en `contracts/api-contracts.md`) | `/auth/callback/google` |
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

La aplicación quedará disponible en `http://localhost:5173` (puerto por defecto de Vite), apuntando
al backend configurado en `VITE_API_BASE_URL`.

Para apuntar a un backend distinto (por ejemplo, un entorno de staging compartido por el equipo),
basta con cambiar `VITE_API_BASE_URL` en `.env.local` y reiniciar `npm run dev`.

---

## 4. Ejecución de tests

```bash
cd frontend
npm run test        # Vitest en modo watch
npm run test:ci      # Vitest en modo single-run, usado en CI
```

Los tests obligatorios por el Principio VII (NON-NEGOTIABLE) deben vivir en `tests/domain/` y
cubrir, como mínimo:

| Archivo de test | Reglas cubiertas |
|---|---|
| `tests/domain/Publicacion.test.ts` | `puedeDarLike()`, `puedeReportar()`, `puedeEditar()`, `puedeEliminar()` para publicación propia vs. ajena |
| `tests/domain/Usuario.test.ts` | `puedeVerBotonSeguir()` para perfil propio vs. ajeno |
| `tests/domain/Filtro.test.ts` | `distanciaHabilitada()` con geolocalización activa/inactiva |
| `tests/services/*` (formularios) | Bloqueo de envío cuando faltan campos obligatorios (publicación sin archivo, login/registro con campos vacíos, propuesta de carpeta sin nombre) |

---

## 5. Escenarios de validación end-to-end (manual o E2E futuro)

Estos escenarios validan que la implementación futura cumple los criterios de aceptación de
`spec.md`. Se listan como guía de validación, no como test suite completa (que se define en la fase
de tareas).

### Escenario A — Like con reversión ante error (US-1)
1. Iniciar sesión como Usuario A.
2. Ver una publicación de Usuario B en Home.
3. Hacer clic en "Like" → verificar que el contador sube inmediatamente (sin recargar).
4. Simular una falla de red (desconectar backend) y repetir → verificar que el like se revierte y
   aparece un mensaje de error no bloqueante.
5. Ver una publicación propia de Usuario A → verificar que el botón de like está deshabilitado.

### Escenario B — Publicación con tags y validación de archivo (US-2)
1. Abrir el formulario de nueva publicación.
2. Intentar enviar sin archivo adjunto → verificar bloqueo con mensaje claro.
3. Adjuntar un archivo de tipo no permitido → verificar error de tipo en cliente antes de llamar a
   la API.
4. Adjuntar un archivo válido, buscar y seleccionar tags vía autocompletado hasta el límite de 10 →
   verificar que un 11º tag no puede agregarse.
5. Enviar la publicación → verificar estado de carga visible y que la publicación aparece en el
   perfil sin recargar la página.

### Escenario C — Búsqueda con filtros y scroll infinito (US-3)
1. Ir a Descubrir sin filtros → verificar skeletons mientras cargan los primeros resultados.
2. Aplicar un filtro de tipo de contenido → verificar que los resultados se actualizan sin recargar
   ni requerir un botón adicional.
3. Desplazarse hasta el final de la lista → verificar carga de más resultados (scroll infinito) y,
   al agotarse, el indicador de "fin de resultados".
4. Aplicar filtros que no devuelvan resultados → verificar estado vacío con sugerencia de acción.
5. Sin geolocalización activa, verificar que el filtro de distancia aparece deshabilitado con
   mensaje explicativo; activarla y verificar que se habilita.

### Escenario D — Reporte de publicación ajena (US-7)
1. Ver una publicación ajena → verificar que "Reportar" está disponible.
2. Ver una publicación propia → verificar que "Reportar" no está habilitado.
3. Reportar la publicación ajena seleccionando un motivo → verificar confirmación no bloqueante.
4. Volver a ver la misma publicación → verificar que el botón indica "Ya reportaste esto".

### Escenario E — Login con los tres proveedores (US-4)
1. Verificar que la pantalla de login ofrece mail/contraseña, Google y GitHub.
2. Iniciar sesión con mail/contraseña inválido → verificar mensaje de error genérico.
3. Iniciar sesión con Google (o GitHub) → verificar redirección al proveedor y retorno con sesión
   activa.
4. Con sesión ya iniciada, navegar a `/login` → verificar redirección automática al home.

### Escenario F — Seguir y dejar de seguir (US-8)
1. Visitar el perfil de otro usuario → verificar botón "Seguir".
2. Seguir → verificar actualización optimista del contador de seguidores.
3. Hacer clic en "Siguiendo" → verificar solicitud de confirmación antes de dejar de seguir.
4. Visitar el perfil propio → verificar que el botón "Seguir" no aparece.

### Escenario G — Carpetas de posts guardados (US-9)
1. Crear una carpeta nueva indicando un nombre.
2. Guardar una publicación en esa carpeta desde la propia publicación.
3. Visitar el perfil (propio o de otro usuario) → verificar que las carpetas son visibles
   públicamente con nombre y cantidad de posts.
4. Eliminar la carpeta → verificar advertencia de pérdida de contenido guardado (sin eliminar los
   posts originales).
5. Repetir la creación de carpetas hasta el límite de 100 → verificar que no se puede crear una
   carpeta adicional.

---

## 6. Checklist de arquitectura antes de dar por completada la implementación

- [ ] Ningún componente en `pages/` o `components/` importa `httpClient` o realiza `fetch`/`axios`
      directamente (Principio III).
- [ ] Toda regla de habilitación de acciones (like, reportar, seguir, editar/eliminar) se consulta
      desde los métodos de `domain/`, no reimplementada en el componente (Principio IV).
- [ ] Los enums de `data-model.md` (`TipoContenido`, `EstadoPublicacion`, `TipoFiltro`,
      `RolUsuario`) se usan en vez de strings sueltos (Principio V).
- [ ] Todo listado (home, Descubrir) implementa scroll infinito/paginación y lazy loading de medios
      (Principio VIII).
- [ ] Todo punto de espera de red muestra un estado de carga explícito (Principio VIII).
- [ ] Los tests de `tests/domain/` cubren las 6 reglas de negocio obligatorias listadas en la
      sección 4 de esta guía (Principio VII).
