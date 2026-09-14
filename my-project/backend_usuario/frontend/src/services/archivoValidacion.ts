import { TipoContenido } from '../domain/enums/TipoContenido'

/**
 * Servicio de aplicación para validación de archivos de publicación.
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-008: "El
 * sistema DEBE validar en cliente únicamente el tipo (extensión/MIME) del
 * archivo adjunto según el tipo de contenido seleccionado... la validación
 * del tamaño máximo del archivo es responsabilidad exclusiva del
 * backend").
 *
 * Nota: los formatos MIME exactos aceptados por tipo de contenido están
 * marcados como `[NEEDS CONFIRMATION]` (B4) en `api-contracts.md`. Esta
 * implementación usa la lista razonable documentada allí mismo
 * (`image/*`, `video/*`, `audio/*`, y adjuntos de texto para TUTORIAL)
 * pendiente de confirmación definitiva; no valida tamaño (exclusivo del
 * backend).
 */

const PREFIJOS_MIME_POR_TIPO: Record<TipoContenido, string[]> = {
  [TipoContenido.IMAGEN]: ['image/'],
  [TipoContenido.VIDEO]: ['video/'],
  [TipoContenido.MUSICA]: ['audio/'],
  [TipoContenido.TUTORIAL]: ['text/', 'application/pdf'],
}

/**
 * `true` si el tipo MIME del archivo es válido para el `TipoContenido`
 * seleccionado. FR-008
 */
export function esTipoArchivoValido(mimeType: string, tipoContenido: TipoContenido): boolean {
  const prefijosPermitidos = PREFIJOS_MIME_POR_TIPO[tipoContenido]
  return prefijosPermitidos.some((prefijo) => mimeType.startsWith(prefijo))
}

export const archivoValidacion = {
  esTipoArchivoValido,
}
