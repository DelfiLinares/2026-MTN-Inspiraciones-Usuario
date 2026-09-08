# Feature Specification: Interacciones del Usuario en el Frontend

**Feature Branch**: `001-user-interactions`

**Created**: 2026-09-07

**Status**: Draft

**Input**: User description: "Frontend de Usuario | Red Social de Inspiración Artística — funcionalidades transversales/de pantalla: like a publicaciones, publicar contenido con tags, buscar y filtrar publicaciones, reportar una publicación ajena, login e inicio de sesión, registro de cuenta, editar datos de perfil (excepto contraseña), seguir a otra persona, crear carpetas de posts guardados."

## Clarifications

### Session 2026-09-08

- Q: ¿Los tags de una publicación son texto libre o deben validarse contra un vocabulario controlado del backend? → A: Vocabulario controlado — el usuario solo puede elegir tags de una lista provista por el backend mediante autocompletado.
- Q: ¿Las carpetas de posts guardados son privadas, públicas o configurables? → A: Siempre públicas — visibles en el perfil de cualquier usuario que lo visite.
- Q: ¿Cómo se valida en cliente el tipo y tamaño de archivo por tipo de contenido? → A: El frontend solo valida el tipo de archivo (extensión/MIME); el tamaño máximo lo valida exclusivamente el backend.
- Q: ¿Cuál es el límite máximo de tags por publicación? → A: 10 tags máximo.
- Q: ¿Existe un límite máximo de carpetas por usuario? → A: Límite duro de 100 carpetas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dar like a una publicación (Priority: P1)

Como usuario autenticado, quiero marcar con like una publicación que me inspire, para expresar
apreciación y ayudar al sistema a conocer mis gustos.

**Why this priority**: El like es la interacción más frecuente y de menor fricción; habilita señal
de interés para el resto de la plataforma y es prerequisito de la experiencia básica del feed.

**Independent Test**: Puede probarse completamente dando like/quitando like a una publicación ajena
desde el home, descubrir o el perfil de otro usuario, y verificando que el contador y el estado
visual se actualizan de forma optimista.

**Acceptance Scenarios**:

1. **Given** una publicación ajena visible en home, descubrir o perfil de otro usuario, **When** el
   usuario autenticado hace clic en el botón de like, **Then** el botón cambia a estado activo y el
   contador se incrementa inmediatamente, sin recargar la página.
2. **Given** una publicación a la que el usuario ya dio like, **When** se renderiza la publicación,
   **Then** el botón de like se muestra en estado activo, visualmente distinguible del inactivo.
3. **Given** un like optimista ya aplicado en pantalla, **When** la llamada a la API falla,
   **Then** el like se revierte visualmente y se muestra un mensaje de error no bloqueante.
4. **Given** una publicación propia del usuario autenticado, **When** se renderiza dicha publicación,
   **Then** el botón de like no está habilitado para esa publicación.
5. **Given** un usuario no autenticado, **When** intenta dar like a una publicación,
   **Then** es invitado/redirigido a iniciar sesión y la acción no se ejecuta hasta autenticarse.

---

### User Story 2 - Publicar contenido con tags (Priority: P1)

Como usuario autenticado, quiero crear una publicación con contenido (imagen, video, música, etc.)
y agregarle tags descriptivos, para que otros usuarios puedan descubrir y filtrar mi trabajo.

**Why this priority**: Sin la capacidad de publicar no existe contenido que descubrir, likear,
reportar o guardar; es la fuente primaria de valor de la red social.

**Independent Test**: Puede probarse completamente completando el formulario de publicación con un
archivo adjunto y al menos un tag, enviándolo, y verificando que la publicación aparece en el
perfil propio sin recargar la página.

**Acceptance Scenarios**:

1. **Given** el formulario de publicación abierto, **When** el usuario adjunta un archivo de
   contenido (imagen, video, audio o texto enriquecido), **Then** el archivo queda asociado a la
   publicación en curso y el tipo de contenido se determina o se puede seleccionar.
2. **Given** el formulario de publicación, **When** el usuario busca un tag mediante autocompletado
   y selecciona una opción del vocabulario controlado provisto por el backend, **Then** el tag se
   muestra como chip removible mediante una acción de eliminar (×), hasta un máximo de 10 tags por
   publicación.
3. **Given** el formulario sin ningún archivo adjunto, **When** el usuario intenta enviarlo,
   **Then** el envío se bloquea y se indica que se requiere al menos un archivo.
4. **Given** un archivo cuyo tipo (extensión/MIME) no está permitido para el tipo de contenido
   seleccionado, **When** el usuario lo adjunta, **Then** se muestra un error claro en el cliente
   antes de intentar subirlo a la API; la validación de tamaño máximo del archivo es responsabilidad
   exclusiva del backend y se refleja mediante el error que este devuelva.
5. **Given** un archivo válido en proceso de subida, **When** la subida está en curso,
   **Then** se muestra feedback visual (barra de progreso o spinner) sin bloquear la interfaz.
6. **Given** una publicación enviada, **When** el backend responde dentro de los 5 segundos
   esperados, **Then** el frontend mantiene un estado de carga visible durante la espera sin
   bloquear el resto de la interfaz.
7. **Given** una publicación creada exitosamente, **When** el usuario vuelve a su perfil,
   **Then** la nueva publicación aparece sin necesidad de recargar la página.
8. **Given** un envío que falla, **When** el error es devuelto por la API,
   **Then** se muestra un mensaje descriptivo y el formulario conserva los datos ya ingresados.

---

### User Story 3 - Buscar publicaciones y aplicar filtros (Priority: P1)

Como usuario autenticado o visitante, quiero buscar publicaciones usando texto libre y aplicar
filtros (estilo, técnica, tipo de contenido, distancia), para encontrar inspiración específica de
forma rápida.

**Why this priority**: El descubrimiento de contenido es central a la propuesta de valor de la
plataforma ("inspiración"); sin búsqueda/filtrado efectivo el resto del contenido publicado pierde
utilidad para los usuarios.

**Independent Test**: Puede probarse completamente ingresando un término de búsqueda y/o aplicando
un filtro en la pantalla Descubrir, y verificando que los resultados devueltos por la API se
actualizan sin recargar la página y sin traer listas completas al cliente.

**Acceptance Scenarios**:

1. **Given** la pantalla Descubrir, **When** el usuario ingresa un término de búsqueda y confirma,
   **Then** los resultados se actualizan reflejando publicaciones que coinciden con el término.
2. **Given** el panel lateral o drawer de filtros, **When** el usuario selecciona un filtro de
   estilo, técnica, tipo de contenido o distancia, **Then** los resultados se actualizan de
   inmediato sin recargar la página ni requerir un botón "Buscar" adicional.
3. **Given** uno o más filtros activos, **When** se renderiza la pantalla, **Then** cada filtro
   aplicado se muestra como chip removible individualmente.
4. **Given** una búsqueda o combinación de filtros, **When** se ejecuta la consulta,
   **Then** la resolución ocurre contra la API (no se filtran en memoria del cliente datos ya
   cargados).
5. **Given** una lista de resultados extensa, **When** el usuario se desplaza,
   **Then** los resultados se cargan mediante paginación o scroll infinito, nunca como lista
   completa de una sola vez.
6. **Given** una búsqueda sin resultados, **When** se muestra la pantalla,
   **Then** aparece un estado vacío con mensaje claro y una sugerencia de acción (por ejemplo,
   "Probá con otros términos o quitá algún filtro").
7. **Given** el usuario no activó la geolocalización, **When** intenta usar el filtro de distancia,
   **Then** el filtro aparece deshabilitado junto con un mensaje explicativo.
8. **Given** una consulta en curso, **When** los resultados aún no llegaron,
   **Then** se muestran skeletons o placeholders en lugar de una pantalla en blanco.

---

### User Story 4 - Login e inicio de sesión (Priority: P1)

Como visitante, quiero iniciar sesión con mi cuenta (mail/contraseña, Google o GitHub), para acceder
a las funcionalidades del usuario autenticado.

**Why this priority**: Es la puerta de entrada a toda funcionalidad que requiere identidad (like,
publicar, reportar, seguir, guardar); sin login no hay experiencia autenticada posible.

**Independent Test**: Puede probarse completamente iniciando sesión con mail/contraseña válidos (o
completando el flujo de un proveedor externo) y verificando la redirección al destino esperado con
sesión activa.

**Acceptance Scenarios**:

1. **Given** la pantalla de login, **When** se renderiza, **Then** se ofrecen claramente tres
   opciones: mail/contraseña, Google y GitHub.
2. **Given** el formulario de mail/contraseña, **When** el usuario intenta enviarlo con campos
   incompletos o mail con formato inválido, **Then** el envío se bloquea en cliente antes de
   contactar la API.
3. **Given** credenciales incorrectas, **When** la API responde con error,
   **Then** se muestra un mensaje de error genérico sin revelar cuál campo específico falló.
4. **Given** el usuario elige Google o GitHub, **When** completa el flujo del proveedor externo,
   **Then** el frontend maneja el callback de retorno y establece la sesión correctamente.
5. **Given** un login exitoso, **When** existía un destino previo protegido,
   **Then** el usuario es redirigido a ese destino; si no existía, es redirigido al home.
6. **Given** un login exitoso, **When** se establece la sesión,
   **Then** el token se almacena de forma segura y se incluye automáticamente en las llamadas a la
   API subsiguientes.
7. **Given** un envío de login en curso, **When** el usuario intenta enviar nuevamente,
   **Then** el botón de submit permanece deshabilitado hasta que la operación finalice.
8. **Given** un usuario ya autenticado, **When** intenta acceder a la pantalla de login,
   **Then** es redirigido al home.

---

### User Story 5 - Registro de cuenta (Priority: P1)

Como visitante, quiero registrar una cuenta nueva, para poder participar en la comunidad de
inspiración artística.

**Why this priority**: Es condición previa al login para nuevos usuarios; sin alta de cuenta no
existe base de usuarios que generar contenido ni consumirlo.

**Independent Test**: Puede probarse completamente completando el formulario de registro con datos
válidos y verificando que se crea la cuenta y se inicia el flujo de onboarding (cuestionario).

**Acceptance Scenarios**:

1. **Given** el formulario de registro, **When** se renderiza, **Then** solicita nombre, apellido,
   mail, contraseña y confirmación de contraseña.
2. **Given** el campo de contraseña, **When** el usuario escribe, **Then** se indica en tiempo real
   si se cumplen los criterios mínimos de seguridad definidos por el backend.
3. **Given** un mail ya registrado, **When** la API devuelve el error correspondiente,
   **Then** el frontend lo muestra de forma clara sin revelar información innecesaria sobre la
   cuenta existente.
4. **Given** un registro exitoso, **When** se completa el alta,
   **Then** se inicia el flujo de cuestionario de onboarding.
5. **Given** el registro por Google o GitHub, **When** el usuario completa el flujo externo,
   **Then** la cuenta se crea y autentica en un solo paso.

---

### User Story 6 - Editar datos de perfil (Priority: P2)

Como usuario autenticado, quiero actualizar mi información de perfil (nombre, apellido, bio, foto,
etc.) sin tocar mi contraseña, para mantener mi identidad actualizada en la plataforma.

**Why this priority**: Es una funcionalidad de mantenimiento de cuenta, valiosa pero no bloqueante
para la experiencia principal de descubrir/compartir contenido.

**Independent Test**: Puede probarse completamente modificando un campo del perfil (por ejemplo, la
bio), guardando, y verificando que el perfil visible se actualiza sin recargar la página.

**Acceptance Scenarios**:

1. **Given** la pantalla de edición de perfil, **When** se renderiza, **Then** permite modificar
   nombre, apellido, bio/descripción y foto de perfil.
2. **Given** el formulario de edición de perfil, **When** se renderiza,
   **Then** no incluye un campo de contraseña; en su lugar muestra un enlace "Cambiar contraseña"
   que lleva a un flujo separado.
3. **Given** campos requeridos vacíos, **When** el usuario intenta guardar,
   **Then** el envío se bloquea en cliente hasta completar los campos obligatorios.
4. **Given** un guardado exitoso, **When** la API confirma el cambio,
   **Then** el perfil visible se actualiza sin recargar la página.
5. **Given** cambios no guardados en el formulario, **When** el usuario intenta abandonar la
   pantalla, **Then** se le advierte antes de salir.
6. **Given** una foto de perfil nueva seleccionada, **When** aún no se confirmó la subida,
   **Then** se muestra una previsualización de la imagen.

---

### User Story 7 - Reportar una publicación ajena (Priority: P2)

Como usuario autenticado, quiero reportar una publicación que considero inapropiada, para alertar a
los moderadores de contenido que viola las normas de la comunidad.

**Why this priority**: Es una herramienta de seguridad de comunidad importante pero de uso mucho
menos frecuente que like/búsqueda/publicación.

**Independent Test**: Puede probarse completamente abriendo el modal de reporte en una publicación
ajena, seleccionando un motivo y confirmando el envío, verificando la confirmación no bloqueante.

**Acceptance Scenarios**:

1. **Given** una publicación que no es propia del usuario autenticado, **When** se renderiza,
   **Then** el botón "Reportar" está disponible.
2. **Given** una publicación propia del usuario autenticado, **When** se renderiza,
   **Then** el botón "Reportar" no está habilitado.
3. **Given** el botón "Reportar" habilitado, **When** el usuario hace clic,
   **Then** se abre un modal o drawer con la selección del motivo de reporte provista por el
   backend.
4. **Given** el modal de reporte abierto sin motivo seleccionado, **When** el usuario intenta
   enviar, **Then** el envío se bloquea hasta seleccionar un motivo.
5. **Given** un reporte enviado exitosamente, **When** la API confirma,
   **Then** se muestra una confirmación no bloqueante y el modal se cierra.
6. **Given** una publicación que el usuario ya reportó previamente, **When** se renderiza,
   **Then** el botón aparece deshabilitado o con el texto "Ya reportaste esto".
7. **Given** un reporte enviado, **When** el proceso de moderación continúa en el backend,
   **Then** el frontend no muestra al usuario el resultado de dicho proceso.

---

### User Story 8 - Seguir a otra persona (Priority: P2)

Como usuario autenticado, quiero seguir el perfil de otro usuario, para ver su contenido de forma
prioritaria en mi feed.

**Why this priority**: Mejora la personalización del feed pero no es indispensable para el valor
mínimo de descubrir y publicar contenido.

**Independent Test**: Puede probarse completamente siguiendo el perfil de otro usuario desde su
pantalla de perfil y verificando que el conteo de seguidores se actualiza de forma optimista.

**Acceptance Scenarios**:

1. **Given** el perfil de otro usuario, **When** se renderiza, **Then** el botón "Seguir" o
   "Siguiendo" es visible según el estado actual de la relación.
2. **Given** el botón en estado "Siguiendo", **When** el usuario hace clic,
   **Then** se solicita confirmación antes de dejar de seguir.
3. **Given** una acción de seguir exitosa, **When** se aplica de forma optimista,
   **Then** el conteo de seguidores del perfil visitado se actualiza inmediatamente.
4. **Given** una acción de seguir/dejar de seguir que falla en la API, **When** se recibe el error,
   **Then** el estado del botón se revierte y se muestra un mensaje de error no bloqueante.
5. **Given** el perfil propio del usuario autenticado, **When** se renderiza,
   **Then** el botón "Seguir" no se muestra.

---

### User Story 9 - Crear carpetas de posts guardados (Priority: P3)

Como usuario autenticado, quiero organizar los posts que me gustan en carpetas temáticas, para
volver a encontrarlos fácilmente y curar mis inspiraciones.

**Why this priority**: Es una funcionalidad de organización personal que añade valor de retención
pero no es crítica para el flujo primario de descubrir/publicar/interactuar.

**Independent Test**: Puede probarse completamente creando una carpeta, guardando un post en ella
desde la publicación, y verificando que aparece en el perfil con el conteo correcto de posts.

**Acceptance Scenarios**:

1. **Given** la sección de carpetas del perfil, **When** el usuario crea una carpeta indicando un
   nombre, **Then** la carpeta queda disponible para guardar posts.
2. **Given** una publicación cualquiera, **When** el usuario elige guardarla,
   **Then** puede seleccionar una carpeta existente o crear una nueva en el mismo flujo.
3. **Given** el perfil del usuario, **When** se renderiza la sección de carpetas,
   **Then** cada carpeta muestra su nombre y la cantidad de posts que contiene.
4. **Given** una carpeta existente, **When** el usuario la elimina,
   **Then** se le advierte que el contenido guardado se perderá (los posts originales no se
   eliminan de la plataforma).
5. **Given** un post guardado en una carpeta, **When** el usuario lo quita de la carpeta,
   **Then** el post no se elimina de la plataforma, solo de esa carpeta.
6. **Given** una lista de hasta 100 carpetas (límite máximo permitido), **When** se renderiza la
   sección de carpetas, **Then** la interfaz no se degrada, usando scroll o paginación si es
   necesario, y el sistema impide crear una carpeta adicional al alcanzar el límite.
7. **Given** el perfil de cualquier usuario visitado por otra persona, **When** se renderiza,
   **Then** las carpetas de ese usuario son visibles públicamente con su nombre y cantidad de posts.

---

### Edge Cases

- **CB-01**: El usuario pierde conexión a internet mientras sube una publicación. El frontend debe
  detectar el error de red, mostrar un mensaje claro y permitir reintentar sin perder los datos ya
  ingresados en el formulario.
- **CB-02**: El usuario da like y quita like en rápida sucesión antes de que la API responda. El
  frontend debe serializar o debounce las llamadas para evitar estados inconsistentes entre el
  contador visible y el estado real.
- **CB-03**: El usuario intenta guardar un post en una carpeta mientras la lista de carpetas aún
  está cargando. Debe mostrarse un estado de carga y no permitirse la acción hasta que la lista de
  carpetas esté disponible.
- **CB-04**: La búsqueda devuelve un resultado vacío por filtros muy restrictivos. La pantalla no
  debe quedar en blanco: debe mostrar un mensaje de estado vacío con opción de limpiar filtros.
- **CB-05**: El usuario llega al final del scroll infinito y no hay más resultados. Debe mostrarse
  un indicador de "fin de resultados", nunca un spinner infinito.
- **CB-06**: El token de sesión expira mientras el usuario navega. Al intentar cualquier acción
  protegida, el frontend debe redirigir al login y conservar el destino original para volver tras
  autenticarse.
- **CB-07**: El usuario intenta seguir a alguien y la API devuelve un error (por ejemplo, límite de
  seguidos alcanzado). El botón debe revertirse a su estado anterior y mostrarse el mensaje de error
  específico que provea la API.
- **CB-08**: El usuario edita su perfil e intenta subir una imagen que supera el tamaño máximo
  permitido por el backend. El frontend debe mostrar el mensaje de error específico devuelto por la
  API (la validación de tamaño no ocurre en cliente), sin perder los demás datos ya ingresados en el
  formulario.
- **CB-09**: El usuario abre el formulario de publicación, completa datos, y cierra la pestaña o
  navega fuera. El navegador/aplicación debe advertir sobre cambios no guardados.
- **CB-10**: El filtro de distancia está activo y el usuario revoca el permiso de geolocalización
  desde el navegador durante la sesión. El filtro debe deshabilitarse automáticamente y avisar al
  usuario del cambio.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar el estado de like (activo/inactivo) de cada publicación de
  forma inmediata mediante actualización optimista, sin esperar la respuesta de la API.
- **FR-002**: El sistema DEBE revertir el estado de like y mostrar un error no bloqueante si la
  llamada a la API de like falla.
- **FR-003**: El sistema DEBE impedir que un usuario dé like a su propia publicación, deshabilitando
  el botón correspondiente.
- **FR-004**: El sistema DEBE derivar a un usuario no autenticado al login cuando intente dar like,
  publicar, reportar, seguir o guardar contenido, conservando el destino original para volver tras
  autenticarse.
- **FR-005**: El formulario de publicación DEBE soportar los tipos de contenido IMAGEN, VIDEO,
  MUSICA y TUTORIAL, determinados por el archivo adjunto o seleccionables por el usuario.
- **FR-006**: El sistema DEBE permitir agregar tags exclusivamente desde un vocabulario controlado
  provisto por el backend, mediante autocompletado; cada tag seleccionado se muestra como chip
  removible individualmente, hasta un máximo de 10 tags por publicación.
- **FR-007**: El sistema DEBE bloquear el envío del formulario de publicación si no hay al menos un
  archivo adjunto.
- **FR-008**: El sistema DEBE validar en cliente únicamente el tipo (extensión/MIME) del archivo
  adjunto según el tipo de contenido seleccionado, mostrando un error claro cuando no cumpla; la
  validación del tamaño máximo del archivo es responsabilidad exclusiva del backend.
- **FR-009**: El sistema DEBE mostrar feedback visual (barra de progreso o spinner) mientras un
  archivo de publicación se está subiendo.
- **FR-010**: El sistema DEBE mostrar un estado de carga durante el envío de una publicación sin
  bloquear el resto de la interfaz, en línea con el objetivo de no superar los 5 segundos de espera.
- **FR-011**: El sistema DEBE mostrar la publicación recién creada en el perfil del usuario sin
  requerir recarga de página.
- **FR-012**: El sistema DEBE conservar los datos ingresados en el formulario de publicación cuando
  el envío falla, mostrando un mensaje de error descriptivo.
- **FR-013**: La pantalla Descubrir DEBE ofrecer búsqueda por texto libre y filtros de estilo,
  técnica, tipo de contenido y distancia, resueltos siempre contra la API (nunca filtrando en
  memoria del cliente listas ya cargadas).
- **FR-014**: El sistema DEBE actualizar los resultados de búsqueda al aplicar o quitar un filtro,
  sin recargar la página y sin requerir una acción adicional de "Buscar" (excepto para texto libre,
  que puede requerir confirmación con Enter).
- **FR-015**: El sistema DEBE mostrar cada filtro activo como chip removible individualmente.
- **FR-016**: El sistema DEBE implementar paginación o scroll infinito tanto en los resultados de
  búsqueda como en el feed de home, sin traer nunca la lista completa al cliente.
- **FR-017**: El sistema DEBE mostrar un estado vacío con mensaje claro y sugerencia de acción
  cuando una búsqueda no arroje resultados.
- **FR-018**: El sistema DEBE deshabilitar el filtro de distancia, mostrando un mensaje explicativo,
  cuando el usuario no haya activado la geolocalización.
- **FR-019**: El sistema DEBE mostrar skeletons o placeholders mientras se cargan resultados de
  búsqueda o el feed, evitando pantallas en blanco.
- **FR-020**: Las imágenes y medios DEBEN cargarse con lazy loading para no bloquear el render
  inicial de la interfaz.
- **FR-021**: El botón "Reportar" DEBE ocultarse o deshabilitarse en las publicaciones propias del
  usuario autenticado.
- **FR-022**: El sistema DEBE requerir la selección de un motivo de reporte (provisto por el
  backend) antes de permitir el envío del reporte.
- **FR-023**: El sistema DEBE deshabilitar el botón "Reportar" (o indicar "Ya reportaste esto")
  cuando el usuario ya haya reportado esa publicación, consultando el estado de reporte propio del
  usuario (no el estado global de reportes de la publicación).
- **FR-024**: El sistema DEBE mostrar confirmación no bloqueante tras un reporte enviado
  exitosamente, sin exponer al usuario el resultado del proceso de moderación.
- **FR-025**: El sistema DEBE soportar los tres proveedores de autenticación: mail/contraseña,
  Google y GitHub, tanto para login como para registro.
- **FR-026**: El formulario de login DEBE validar en cliente que ambos campos (mail y contraseña)
  estén completos y que el mail tenga formato válido antes de enviar la solicitud.
- **FR-027**: El sistema DEBE mostrar un mensaje de error genérico ante credenciales incorrectas,
  sin revelar cuál campo específico fue incorrecto.
- **FR-028**: El sistema DEBE deshabilitar el botón de submit del login mientras la operación está
  en progreso, para evitar envíos duplicados.
- **FR-029**: El sistema DEBE redirigir a un usuario ya autenticado que acceda a la pantalla de
  login hacia el home.
- **FR-030**: El token de sesión DEBE almacenarse de forma segura e incluirse automáticamente en
  todas las llamadas HTTP hacia la API.
- **FR-031**: El formulario de registro DEBE solicitar nombre, apellido, mail, contraseña y
  confirmación de contraseña, e indicar en tiempo real si la contraseña cumple los criterios
  mínimos de seguridad.
- **FR-032**: El sistema DEBE mostrar un error claro, sin revelar información innecesaria, cuando
  el mail ingresado en el registro ya esté registrado.
- **FR-033**: El sistema DEBE iniciar el flujo de cuestionario de onboarding inmediatamente después
  de un registro exitoso.
- **FR-034**: El registro mediante Google o GitHub DEBE crear la cuenta y autenticar al usuario en
  un solo paso.
- **FR-035**: La edición de perfil NO DEBE incluir el campo de contraseña; en su lugar DEBE ofrecer
  un enlace hacia un flujo separado de cambio de contraseña con verificación.
- **FR-036**: El formulario de edición de perfil DEBE validar en cliente los campos requeridos antes
  de permitir el envío.
- **FR-037**: El sistema DEBE actualizar el perfil visible inmediatamente tras un guardado exitoso,
  sin requerir recarga de página.
- **FR-038**: El sistema DEBE advertir al usuario antes de abandonar la pantalla de edición de
  perfil si existen cambios sin guardar.
- **FR-039**: El sistema DEBE previsualizar una nueva foto de perfil antes de confirmar su subida.
- **FR-040**: El botón "Seguir"/"Siguiendo" NO DEBE aparecer en el perfil propio del usuario
  autenticado.
- **FR-041**: El sistema DEBE solicitar confirmación antes de ejecutar la acción de dejar de seguir
  a otro usuario.
- **FR-042**: El sistema DEBE actualizar de forma optimista el conteo de seguidores al seguir/dejar
  de seguir, revirtiendo el estado y mostrando un error no bloqueante si la operación falla en la
  API.
- **FR-043**: El sistema DEBE permitir crear, renombrar y eliminar carpetas de posts guardados desde
  el perfil, indicando al menos un nombre al crearlas.
- **FR-044**: Al guardar un post, el sistema DEBE permitir seleccionar una carpeta existente o crear
  una nueva en el mismo flujo, sin salir de la publicación.
- **FR-045**: El sistema DEBE advertir que el contenido guardado se perderá al eliminar una carpeta,
  aclarando que los posts originales no se eliminan de la plataforma.
- **FR-046**: El sistema DEBE permitir quitar un post de una carpeta sin eliminarlo de la
  plataforma.
- **FR-047**: La lista de carpetas del usuario DEBE soportar hasta un máximo de 100 carpetas sin
  degradar la interfaz, usando scroll o paginación si es necesario; el sistema DEBE impedir la
  creación de una nueva carpeta al alcanzar dicho límite.
- **FR-048**: El frontend de usuario NUNCA DEBE operar con el rol ADMIN ni mostrar pantallas o
  acciones de moderación/administración.
- **FR-049**: Las carpetas de posts guardados de un usuario DEBEN ser visibles públicamente en su
  perfil, mostrando nombre y cantidad de posts, para cualquier visitante o usuario autenticado.

### Key Entities *(include if feature involves data)*

- **Publicación**: contenido creado por un usuario (imagen, video, música, tutorial) con hasta 10
  tags seleccionados de un vocabulario controlado, estado de like propio, contador de likes, estado
  de reporte propio del usuario actual, y reglas de si el usuario actual puede editarla, eliminarla,
  likearla o reportarla según sea o no su autor.
- **Usuario**: persona registrada (rol único USER en este módulo) con datos de perfil (nombre,
  apellido, bio, foto), estado de sesión, y relación de "seguir" respecto a otros usuarios.
- **Filtro de búsqueda**: combinación de texto libre, estilo, técnica, tipo de contenido y distancia
  activa que se envía como parámetros a la API para resolver resultados de Descubrir.
- **Desafío**: entidad de participación creativa (fuera del detalle de esta especificación, referida
  transversalmente por pertenecer al mismo módulo de usuario).
- **Carpeta**: colección personal de posts guardados por el usuario, visible públicamente en su
  perfil, con nombre y cantidad de posts, creable/renombrable/eliminable desde el perfil, hasta un
  máximo de 100 carpetas por usuario.
- **Motivo de reporte**: valor cerrado provisto por el backend, seleccionado al reportar una
  publicación ajena.
- **Tag**: valor de un vocabulario controlado provisto por el backend, seleccionable mediante
  autocompletado al publicar contenido.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede dar like o quitar like a una publicación y ver el cambio reflejado en
  pantalla en menos de 200 ms (percepción de respuesta inmediata), independientemente de la latencia
  real de la API.
- **SC-002**: Un usuario puede completar la publicación de contenido nuevo (adjuntar archivo,
  agregar al menos un tag y confirmar) en menos de 60 segundos de interacción, sin contar el tiempo
  de subida del archivo.
- **SC-003**: Los primeros resultados de una búsqueda con filtros se muestran en pantalla en menos
  de 2 segundos desde que el usuario confirma la búsqueda o cambia un filtro.
- **SC-004**: El 90% de los usuarios que intentan iniciar sesión con credenciales válidas lo logran
  en el primer intento sin necesidad de asistencia adicional.
- **SC-005**: Ningún usuario puede completar una acción de like, reporte o seguimiento sobre su
  propio contenido o perfil propio; esto se verifica en el 100% de los casos mediante tests
  automatizados de las reglas de visibilidad/habilitación correspondientes.
- **SC-006**: La interfaz de resultados de búsqueda y del feed de home nunca queda bloqueada
  esperando datos del backend: el 100% de los estados de espera muestran un indicador de carga
  (skeleton, spinner o equivalente).
- **SC-007**: La lista de carpetas de un usuario con hasta 100 carpetas (límite máximo) se renderiza
  sin degradación perceptible (sin bloqueos de interacción) en el perfil.

## Assumptions

- **Verificación de contraseña** *(ref. A4)*: el enlace "Cambiar contraseña" en edición de perfil
  navega a un flujo independiente fuera de alcance de esta especificación; el mecanismo de
  verificación (mail, código u otro) se especificará en un documento separado cuando se diseñe.
- **Campos editables de perfil** *(ref. A6)*: se asume que los campos editables mínimos son nombre,
  apellido, bio/descripción y foto de perfil; campos adicionales se incorporarán si el contrato de
  API los expone, sin requerir cambios en las reglas de esta especificación.
- **Almacenamiento del token de sesión**: se asume un mecanismo seguro (por ejemplo, cookie
  httpOnly o equivalente) en línea con el Principio de seguridad básica de la constitución del
  proyecto; el mecanismo exacto se define en la fase de planificación técnica.
- **Reporte y estado propio**: el frontend consulta y refleja únicamente el estado de reporte del
  usuario actual sobre una publicación (si ya la reportó o no), nunca el estado global de reportes
  de esa publicación por parte de otros usuarios.
- **Origen del vocabulario controlado de tags**: se asume que el backend expone un endpoint de
  búsqueda/autocompletado de tags; el contrato exacto de dicho endpoint se define en la fase de
  planificación técnica.

## Out of Scope

- Pantallas o funcionalidades de administración/moderación (revisión de reportes, promoción de
  administradores, borrado administrativo de contenido o usuarios).
- Lógica de recomendaciones, rankings o cálculo del feed (responsabilidad del backend).
- Pagos, multas o compra de contenido.
- Envío de mails o notificaciones push (responsabilidad del backend/infraestructura).
- El flujo de cambio de contraseña en sí mismo (solo se referencia el enlace de acceso a dicho flujo
  desde edición de perfil; el flujo se especificará por separado).
- Cualquier operación o vista asociada a un rol distinto de USER.
- Persistencia de geolocalización en servidor; el frontend solo activa/desactiva localmente y envía
  coordenadas cuando corresponde a una consulta puntual.
- Validación del tamaño máximo de archivos subidos (responsabilidad exclusiva del backend); el
  frontend solo valida el tipo de archivo en cliente.
- Administración del vocabulario controlado de tags (alta/baja/edición de tags disponibles),
  responsabilidad del backend; el frontend solo consume dicho vocabulario vía autocompletado.
