<!--
Sync Impact Report
==================
Version change: [TEMPLATE] → 1.0.0 (initial ratification)
Modified principles: N/A (first ratified version; all principles newly defined)
Added sections:
  - Core Principles (10 principles, I–X)
  - Alcance del Módulo (pantallas y funcionalidad cubierta / fuera de alcance)
  - Arquitectura de Capas del Frontend
  - Governance
Removed sections: none (template placeholders replaced)
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ no changes required (Constitution Check section already generic; gates reference this file at plan time)
  - .specify/templates/spec-template.md ✅ no changes required (scope of screens enforced via this constitution, not template structure)
  - .specify/templates/tasks-template.md ✅ no changes required
  - .specify/templates/checklist-template.md ✅ no changes required
Follow-up TODOs: none — all placeholders resolved from user-supplied constitution text.
-->

# Inspiraciones Frontend de Usuario Constitution

## Core Principles

### I. La Especificación Manda sobre la Implementación
No se debe programar ninguna pantalla, componente o flujo que no esté trazado a una historia de
usuario o requisito del documento de alcance. Este módulo trabaja ÚNICAMENTE sobre las pantallas:
cuestionario, registro, login, home, desafíos, descubrir, perfil del usuario y editar perfil del
usuario. Cualquier funcionalidad de administración/moderación (gestión de usuarios, borrado
administrativo, promoción de admins, revisión de reportes) está fuera de alcance y corresponde al
frontend de administración; no debe implementarse aquí bajo ninguna circunstancia.

### II. Diseño Orientado a Objetos del Dominio de UI
El dominio de UI DEBE modelarse con orientación a objetos real cuando exista lógica de negocio en
el cliente (validación de formularios, reglas de visibilidad de acciones, armado de filtros de
búsqueda, estado de un desafío, etc.). Se prohíben componentes/hooks anémicos que solo muevan datos
sin encapsular sus reglas. Ejemplo obligatorio: un modelo `Publicacion` en el frontend sabe si el
usuario actual puede editarla o eliminarla (autor o admin), sin repetir esa condición en cada
componente que la renderiza.

### III. Separación de Responsabilidades por Capa (NON-NEGOTIABLE)
El frontend DEBE organizarse en capas claramente separadas:
- **Presentación**: componentes React de cada pantalla (cuestionario, registro, login, home,
  desafíos, descubrir, perfil, editar perfil). Solo renderizan y delegan.
- **Dominio/modelos de UI**: entidades livianas del lado cliente (`Publicacion`, `Usuario`,
  `Filtro`, `Desafio`, `Carpeta`) con sus reglas de visualización/edición encapsuladas.
- **Aplicación/servicios**: casos de uso de cliente (autenticar, buscar con filtros, subir
  publicación, proponer desafío, editar perfil, activar/desactivar geolocalización).
- **Infraestructura**: clientes HTTP hacia la API REST (Java/Spring Boot), manejo de tokens de
  sesión (mail-contraseña, Google, GitHub), acceso a geolocalización del navegador/dispositivo.
Los componentes de presentación NUNCA deben invocar directamente la API (fetch/axios); toda
llamada externa pasa obligatoriamente por la capa de servicios.

### IV. Sin Duplicación ni Componentes Monolíticos
Se prohíbe la lógica duplicada, los componentes gigantes que mezclan responsabilidades, y las
validaciones de formularios repetidas en cada pantalla. Un componente de presentación no debe
contener reglas de negocio ni llamadas directas a fetch/axios. Toda regla o validación reutilizable
DEBE extraerse a la capa de dominio o de servicios correspondiente.

### V. Enums y Value Objects para Valores Cerrados
Los valores cerrados provenientes del backend o usados en el cliente DEBEN representarse con enums
o value objects tipados, nunca con strings/números mágicos dispersos en el código. Ejemplos
obligatorios: `TipoContenido` (IMAGEN, VIDEO, MUSICA, TUTORIAL), `EstadoPublicacion` (ACTIVA,
REPORTADA, ELIMINADA), `TipoFiltro` (estilo, técnica, tipo de arte, distancia), `RolUsuario`. El
frontend de usuario NUNCA opera con el rol ADMIN ni expone acciones asociadas a él.

### VI. Patrones de Diseño con Propósito
Los patrones de diseño (por ejemplo, contenedor/presentacional para separar lógica de estado de la
vista, o estrategia para distintos proveedores de login) SOLO se aplican cuando simplifican el
diseño de la UI. No se debe forzar un patrón donde una solución simple sea suficiente y más clara.

### VII. Tests Obligatorios sobre Reglas de Negocio del Cliente (NON-NEGOTIABLE)
Toda regla de negocio importante que resida en el frontend DEBE tener tests automatizados. Casos
mínimos obligatorios: un usuario no puede reportar su propia publicación (el botón de reportar no
se habilita); solo el autor ve habilitada la opción de editar/eliminar su publicación; el
formulario de propuesta de desafío no se envía si faltan campos obligatorios. Ninguna regla de
negocio de cliente se considera completa sin su test correspondiente.

### VIII. Escalabilidad y Percepción de Rendimiento
El sistema DEBE poder escalar en cantidad de publicaciones y usuarios sin degradar la experiencia.
Es obligatorio: paginación o scroll infinito en resultados de búsqueda y en el home; carga diferida
(lazy loading) de imágenes/medios; filtros resueltos contra la API (prohibido traer listas
completas al cliente para filtrar en memoria). La interacción del usuario nunca debe bloquearse
mientras se esperan datos del backend; todo punto de espera de red DEBE mostrar un estado de carga
explícito.

### IX. Usabilidad como Prioridad de Producto
La interfaz DEBE priorizar que encontrar contenido inspirador sea simple, rápido y claro. El
buscador con filtros laterales (estilo, tipo de arte, técnica, distancia) DEBE seguir el modelo
descripto en el documento de alcance. Las pantallas de registro/login DEBEN soportar de forma clara
mail-contraseña, Google y GitHub. El flujo de subida de contenido DEBE percibirse como ágil, en
línea con el requisito de backend de no superar los 5 segundos.

### X. Especificación Antes que Código
Durante las fases de especificación, aclaración, checklist, planificación y generación de tareas NO
se debe implementar código de producción. Estas fases solo crean o actualizan los documentos
correspondientes (spec, clarificaciones, checklist, plan, tareas). La implementación solo comienza
una vez que dichos artefactos estén completos y aprobados.

## Alcance del Módulo

Este módulo cubre exclusivamente el FRONTEND DE USUARIO (React), consumidor de la API REST del
backend (Java/Spring Boot), sin lógica de negocio de backend (persistencia, cálculo de
rankings/recomendaciones, moderación, envío de mails, etc.).

**Pantallas y funcionalidad dentro de alcance**:
- **Cuestionario**: onboarding/preguntas iniciales para calibrar intereses artísticos del usuario nuevo.
- **Registro / Login**: alta de cuenta y autenticación vía mail-contraseña, Google y GitHub.
- **Home**: feed principal con publicaciones recomendadas/relevantes para el usuario.
- **Descubrir**: búsqueda con filtros (estilo, técnica, tipo de contenido), resultados de obras,
  ubicaciones de inspiración, tutoriales y música; mapa de lugares de inspiración;
  activación/desactivación de geolocalización por el usuario.
- **Desafíos**: visualización de desafíos diarios/semanales, participación, y formulario para
  proponer nuevos desafíos.
- **Perfil del usuario / Editar perfil**: visualización de publicaciones, carpetas e inspiraciones
  guardadas propias; edición de datos de perfil.
- **Interacción transversal** en pantallas de contenido: likes, comentarios y reporte de
  publicaciones ajenas.

**Fuera de alcance**: cualquier pantalla o funcionalidad de administración/moderación (gestión de
usuarios, borrado administrativo, promoción de admins, revisión de reportes), que corresponde al
frontend de administración. Ninguna tarea, spec ni plan generado bajo esta constitución debe
introducir dichas funcionalidades en este módulo.

## Arquitectura de Capas del Frontend

Toda historia de usuario, spec, plan o tarea DEBE poder ubicarse en una de las cuatro capas
definidas en el Principio III (presentación, dominio/modelos de UI, aplicación/servicios,
infraestructura). Las revisiones de diseño y de código DEBEN verificar que:
1. No exista lógica de negocio de cliente fuera de la capa de dominio.
2. No exista acceso a red fuera de la capa de infraestructura, invocada únicamente desde servicios.
3. Los value objects/enums del Principio V sean la única forma de representar valores cerrados.
4. Toda regla verificable (visibilidad de botones, habilitación de acciones, validaciones) tenga
   test asociado, según el Principio VII.

## Governance

Esta constitución prevalece sobre cualquier otra práctica, convención informal o preferencia
individual dentro del módulo de frontend de usuario. Ante conflicto entre esta constitución y un
documento de spec/plan/tarea, la constitución prevalece salvo enmienda formal.

**Procedimiento de enmienda**:
1. Toda propuesta de cambio a un principio o sección de esta constitución se documenta como
   propuesta explícita (qué cambia y por qué) antes de aplicarse.
2. El versionado sigue semántica MAJOR.MINOR.PATCH:
   - MAJOR: eliminación o redefinición incompatible de un principio existente.
   - MINOR: adición de un nuevo principio o expansión material de una guía existente.
   - PATCH: aclaraciones, correcciones de redacción, refinamientos no semánticos.
3. Cada enmienda actualiza `Last Amended` a la fecha del cambio y se registra en un Sync Impact
   Report al inicio del archivo.

**Revisión de cumplimiento**: Todo plan (`/speckit.plan`) DEBE incluir una sección de verificación
contra esta constitución (Constitution Check) antes de aprobar el diseño técnico. Toda tarea
(`/speckit.tasks`) que implique lógica de negocio de cliente DEBE incluir su tarea de test
correspondiente, conforme al Principio VII. La complejidad adicional que se aparte de un principio
DEBE justificarse explícitamente en el plan, indicando por qué la alternativa más simple no es
viable.

**Version**: 1.0.0 | **Ratified**: 2026-09-07 | **Last Amended**: 2026-09-07
