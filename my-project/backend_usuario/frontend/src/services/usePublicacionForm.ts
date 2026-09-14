/**
 * Servicio de aplicación para el formulario de nueva publicación.
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-007: "El
 * sistema DEBE bloquear el envío del formulario de publicación si no hay
 * al menos un archivo adjunto").
 *
 * Nota: esta tarea (T034) cubre exclusivamente la regla de bloqueo de
 * envío sin archivo adjunto. El estado completo del formulario (incluyendo
 * conservación de datos ante error, FR-012) se implementa en T038, que
 * depende también de `tagsService` (T036) y `archivoValidacion` (T037).
 */

/**
 * `true` si el formulario puede enviarse: requiere al menos un archivo
 * adjunto. FR-007
 */
export function puedeEnviarPublicacion(archivo: File | null): boolean {
  return archivo !== null
}

export const usePublicacionFormReglas = {
  puedeEnviarPublicacion,
}
