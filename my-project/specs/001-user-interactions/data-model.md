# Data Model: Modelos de UI (Dominio del Frontend)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

Este documento define las entidades del dominio de UI (Principio II y III de `constitution.md`):
clases livianas del lado cliente que encapsulan sus propios datos **y** las reglas de
visualización/habilitación que hoy dependerían de condicionales repetidos en componentes. Ninguna
de estas clases persiste datos ni llama a la API directamente (eso es responsabilidad de
`services/`); solo modelan el estado y las reglas derivadas de dicho estado.

---

## Enums (Value Objects)

### `TipoContenido`
Representa el tipo de contenido de una publicación. Determinado por el archivo adjunto o
seleccionado por el usuario (FR-005).

```ts
enum TipoContenido {
  IMAGEN = "IMAGEN",
  VIDEO = "VIDEO",
  MUSICA = "MUSICA",
  TUTORIAL = "TUTORIAL",
}
```

### `EstadoPublicacion`
Representa el estado de moderación/vida de una publicación, tal como lo informa el backend.

```ts
enum EstadoPublicacion {
  ACTIVA = "ACTIVA",
  REPORTADA = "REPORTADA",
  ELIMINADA = "ELIMINADA",
}
```

### `TipoFiltro`
Representa las dimensiones de filtro disponibles en la pantalla Descubrir (FR-013).

```ts
enum TipoFiltro {
  ESTILO = "ESTILO",
  TECNICA = "TECNICA",
  TIPO_CONTENIDO = "TIPO_CONTENIDO",
  DISTANCIA = "DISTANCIA",
}
```

### `RolUsuario`
El frontend de usuario únicamente reconoce y opera con el rol `USER` (Principio V, FR-048). El
valor `ADMIN` puede existir en el contrato de datos del backend, pero el frontend nunca lo usa para
habilitar funcionalidad.

```ts
enum RolUsuario {
  USER = "USER",
}
```

### `MotivoReporte`
Vocabulario cerrado de motivos de reporte, provisto por el backend (AC-04.3). Se modela como enum
con posibilidad de extensión vía catálogo remoto (ver `contracts/api-contracts.md`).

```ts
enum MotivoReporteCodigo {
  CONTENIDO_INAPROPIADO = "CONTENIDO_INAPROPIADO",
  SPAM = "SPAM",
  PLAGIO = "PLAGIO",
  DISCURSO_ODIO = "DISCURSO_ODIO",
  OTRO = "OTRO",
}

interface MotivoReporte {
  codigo: MotivoReporteCodigo;
  etiqueta: string; // texto mostrado al usuario, provisto por el backend
}
```

---

## Entidad: `Publicacion`

Representa una publicación de contenido creada por un usuario. Encapsula el estado de like propio,
el estado de reporte propio, y todas las reglas de habilitación de acciones sobre sí misma.

### Campos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Identificador único de la publicación |
| `autorId` | `string` | ID del usuario autor |
| `tipoContenido` | `TipoContenido` | Tipo de contenido de la publicación |
| `estado` | `EstadoPublicacion` | Estado actual (ACTIVA/REPORTADA/ELIMINADA) |
| `tags` | `string[]` | Tags asociados (máx. 10, del vocabulario controlado — FR-006) |
| `urlContenido` | `string` | URL del archivo principal (imagen/video/audio) |
| `cantidadLikes` | `number` | Contador de likes |
| `likeadaPorMi` | `boolean` | Si el usuario actual ya dio like |
| `reportadaPorMi` | `boolean` | Si el usuario actual ya reportó esta publicación (estado propio, no global — FR-023) |
| `creadaEn` | `Date` | Fecha de creación |

### Reglas encapsuladas (métodos)

| Método | Regla | Requisito |
|---|---|---|
| `puedeDarLike(usuarioActualId: string): boolean` | `false` si `autorId === usuarioActualId`, o si el usuario no está autenticado; `true` en caso contrario y si `estado === ACTIVA` | FR-003, FR-004, US-1 AC-01.5 |
| `puedeReportar(usuarioActualId: string): boolean` | `false` si `autorId === usuarioActualId`, si `reportadaPorMi === true`, o si no está autenticado | FR-021, FR-023, US-7 AC-04.2/04.6 |
| `puedeEditar(usuarioActual: Usuario): boolean` | `true` solo si `usuarioActual.id === autorId` (el frontend de usuario no contempla edición por ADMIN, ver Principio I) | Principio II (ejemplo explícito) |
| `puedeEliminar(usuarioActual: Usuario): boolean` | Igual regla que `puedeEditar` | Principio II |
| `esPropia(usuarioActualId: string): boolean` | `autorId === usuarioActualId` | Base de las reglas anteriores |
| `aplicarLikeOptimista(): Publicacion` | Retorna una copia con `likeadaPorMi = true` y `cantidadLikes + 1`, sin llamar a la API | FR-001, US-1 AC-01.3 |
| `revertirLikeOptimista(): Publicacion` | Retorna una copia revirtiendo el cambio anterior | FR-002, CB-02 |

**Nota de diseño**: los métodos de mutación (`aplicarLikeOptimista`, `revertirLikeOptimista`)
retornan una nueva instancia inmutable en vez de mutar el objeto, para facilitar su uso directo como
valor de estado en React (`setState`) sin efectos colaterales inesperados.

---

## Entidad: `Usuario`

Representa a un usuario registrado (rol único `USER` en este módulo). Encapsula el estado de sesión
y la relación de "seguir" respecto a otros usuarios.

### Campos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Identificador único |
| `nombre` | `string` | Nombre |
| `apellido` | `string` | Apellido |
| `bio` | `string \| null` | Descripción/bio del perfil |
| `fotoUrl` | `string \| null` | URL de la foto de perfil |
| `rol` | `RolUsuario` | Siempre `USER` en este módulo (FR-048) |
| `cantidadSeguidores` | `number` | Contador de seguidores |
| `sigoAEsteUsuario` | `boolean` | Si el usuario actual sigue a este usuario (solo relevante cuando se representa a "otro" usuario) |

### Reglas encapsuladas (métodos)

| Método | Regla | Requisito |
|---|---|---|
| `esPropio(usuarioActualId: string): boolean` | `id === usuarioActualId` | Base de reglas de UI (ocultar "Seguir", habilitar edición) |
| `puedeVerBotonSeguir(usuarioActualId: string, estaAutenticado: boolean): boolean` | `false` si `esPropio(usuarioActualId)` o si no está autenticado | FR-040, US-8 AC-08.5 |
| `aplicarSeguirOptimista(): Usuario` | Retorna copia con `sigoAEsteUsuario = true` y `cantidadSeguidores + 1` | FR-042, US-8 AC-08.3 |
| `aplicarDejarDeSeguirOptimista(): Usuario` | Retorna copia inversa | FR-042 |
| `revertirCambioSeguimiento(previo: Usuario): Usuario` | Restaura el estado anterior ante error de API | FR-042, US-8 AC-08.4 |

---

## Entidad: `Filtro`

Representa el conjunto de criterios de búsqueda activos en la pantalla Descubrir. Encapsula la
serialización hacia parámetros de consulta de la API, evitando que cada componente construya el
query string manualmente (Principio IV).

### Campos

| Campo | Tipo | Descripción |
|---|---|---|
| `texto` | `string \| null` | Texto libre de búsqueda |
| `estilo` | `string \| null` | Valor de filtro de estilo |
| `tecnica` | `string \| null` | Valor de filtro de técnica |
| `tipoContenido` | `TipoContenido \| null` | Filtro por tipo de contenido |
| `distanciaKm` | `number \| null` | Filtro de distancia en kilómetros |
| `geolocalizacionActiva` | `boolean` | Si el usuario activó la geolocalización (condiciona `distanciaKm`) |

### Reglas encapsuladas (métodos)

| Método | Regla | Requisito |
|---|---|---|
| `distanciaHabilitada(): boolean` | `true` solo si `geolocalizacionActiva === true` | FR-018, US-3 AC-03.8, CB-10 |
| `tieneAlgunFiltroActivo(): boolean` | `true` si al menos un campo (excepto `texto`) no es `null` | Determina si se muestran chips de filtro (FR-015) |
| `listaDeChips(): { tipo: TipoFiltro; etiqueta: string }[]` | Devuelve la lista de filtros activos representables como chips removibles | US-3 AC-03.4 |
| `quitarFiltro(tipo: TipoFiltro): Filtro` | Retorna copia con ese campo en `null` | US-3 AC-03.4 |
| `aQueryParams(): Record<string, string>` | Serializa los campos no nulos a parámetros de query para la API (nunca filtra en memoria) | FR-013, Principio VIII |

---

## Entidad: `Carpeta`

Representa una colección personal de posts guardados. Pública en el perfil del usuario dueño
(clarificación de spec), con límite duro de 100 carpetas.

### Campos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Identificador único |
| `nombre` | `string` | Nombre de la carpeta |
| `propietarioId` | `string` | ID del usuario dueño |
| `cantidadPosts` | `number` | Cantidad de posts guardados |

### Reglas encapsuladas (métodos)

| Método | Regla | Requisito |
|---|---|---|
| `puedeEliminar(usuarioActualId: string): boolean` | `true` solo si `propietarioId === usuarioActualId` | FR-043 |
| `puedeRenombrar(usuarioActualId: string): boolean` | Igual regla que `puedeEliminar` | FR-043 |

### Regla a nivel de colección (no de instancia)

| Función | Regla | Requisito |
|---|---|---|
| `puedeCrearNuevaCarpeta(carpetasActuales: Carpeta[]): boolean` | `false` si `carpetasActuales.length >= 100` | FR-047, US-9 AC-06 |

---

## Entidad: `Desafio`

Referida transversalmente por pertenecer al mismo módulo de usuario (pantalla "Desafíos"), fuera
del detalle funcional de esta especificación (`spec.md` la incluye como entidad relacionada, sin
historias de usuario propias en este documento). Se modela aquí únicamente para respetar el
Principio III (toda entidad de dominio referida debe tener representación en la capa de dominio) y
soportar futuras specs sin romper la arquitectura de capas.

### Campos (mínimos, sujetos a spec futura)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Identificador único |
| `titulo` | `string` | Título del desafío |
| `descripcion` | `string` | Descripción del desafío |
| `fechaInicio` | `Date` | Fecha de inicio |
| `fechaFin` | `Date` | Fecha de fin |
| `participo` | `boolean` | Si el usuario actual ya participa |

### Reglas encapsuladas (métodos)

| Método | Regla |
|---|---|
| `estaVigente(fechaActual: Date): boolean` | `true` si `fechaActual` está entre `fechaInicio` y `fechaFin` |

> **Nota**: el detalle completo de reglas de `Desafio` (participación, propuesta de nuevos
> desafíos) queda fuera del alcance de `spec.md` (que solo cubre HU-01 a HU-09) y deberá
> especificarse en un documento de spec separado antes de planificar su implementación completa,
> en línea con el Principio I (la especificación manda sobre la implementación).

---

## Relaciones entre entidades

```text
Usuario 1 ──── N Publicacion        (autorId)
Usuario 1 ──── N Carpeta            (propietarioId)
Usuario N ──── N Usuario            (relación "sigue a", vía sigoAEsteUsuario)
Carpeta  N ──── N Publicacion       (posts guardados, relación de asociación gestionada por carpetaService)
Publicacion N ─ N string (tags)      (vocabulario controlado, gestionado por el backend)
Filtro   1 ──── 1 (query de búsqueda activa en Descubrir, no persistida)
Usuario  1 ──── N Desafio           (participo: boolean, fuera de alcance detallado)
```

## Trazabilidad con reglas de negocio testeables (Principio VII)

| Regla de negocio obligatoria (NON-NEGOTIABLE) | Método/entidad responsable |
|---|---|
| Un usuario no puede reportar su propia publicación | `Publicacion.puedeReportar()` |
| Solo el autor ve habilitadas editar/eliminar su publicación | `Publicacion.puedeEditar()` / `puedeEliminar()` |
| Un usuario no puede dar like a su propia publicación | `Publicacion.puedeDarLike()` |
| Un usuario no puede ver el botón "Seguir" en su propio perfil | `Usuario.puedeVerBotonSeguir()` |
| Un formulario sin campos obligatorios no puede enviarse | Validación en hooks de contenedor de cada formulario (fuera de estas entidades, ver `quickstart.md`) |
| El filtro de distancia no se habilita si la geolocalización no está activa | `Filtro.distanciaHabilitada()` |
