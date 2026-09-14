/**
 * Servicio de aplicación para tags (vocabulario controlado de la
 * publicación).
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-006: "hasta un
 * máximo de 10 tags por publicación").
 *
 * Nota: el autocompletado vía `GET /api/tags` (T036) requiere confirmación
 * de backend (B3 — contrato exacto de paginación/límite) y NO se implementa
 * en esta tarea. T032 cubre exclusivamente la regla de negocio de límite
 * máximo de tags, independiente de esa llamada HTTP.
 */

export const LIMITE_MAXIMO_TAGS = 10

/**
 * `true` si aún se puede agregar un tag adicional a la selección actual
 * (menos de `LIMITE_MAXIMO_TAGS`). FR-006
 */
export function puedeAgregarTag(tagsSeleccionados: string[]): boolean {
  return tagsSeleccionados.length < LIMITE_MAXIMO_TAGS
}

export const tagsService = {
  LIMITE_MAXIMO_TAGS,
  puedeAgregarTag,
}
