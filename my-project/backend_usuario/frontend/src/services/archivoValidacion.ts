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
 * Nota: los formatos exactos aceptados por el backend para IMAGEN, VIDEO y
 * MUSICA fueron confirmados vía `/speckit.clarify` (B4): `.jpg`, `.jpeg`,
 * `.png`, `.gif` (imagen), `.mp3` (música/audio) y `.mp4` (video). Esta
 * implementación valida esos tres tipos contra el MIME exacto
 * correspondiente a esas extensiones. TUTORIAL no fue parte de la
 * clarificación B4; se mantiene la validación por prefijo genérico
 * (`text/*`, `application/pdf`) ya existente. No valida tamaño (exclusivo
 * del backend).
 */

const MIME_EXACTOS_POR_TIPO: Partial<Record<TipoContenido, string[]>> = {
  [TipoContenido.IMAGEN]: ['image/jpeg', 'image/png', 'image/gif'],
  [TipoContenido.VIDEO]: ['video/mp4'],
  [TipoContenido.MUSICA]: ['audio/mpeg', 'audio/mp3'],
}

const PREFIJOS_MIME_POR_TIPO: Partial<Record<TipoContenido, string[]>> = {
  [TipoContenido.TUTORIAL]: ['text/', 'application/pdf'],
}

/**
 * `true` si el tipo MIME del archivo es válido para el `TipoContenido`
 * seleccionado. FR-008. IMAGEN/VIDEO/MUSICA validan contra la lista exacta
 * de MIME confirmada (B4); TUTORIAL valida por prefijo genérico.
 */
export function esTipoArchivoValido(mimeType: string, tipoContenido: TipoContenido): boolean {
  const mimeExactos = MIME_EXACTOS_POR_TIPO[tipoContenido]
  if (mimeExactos) {
    return mimeExactos.includes(mimeType)
  }
  const prefijosPermitidos = PREFIJOS_MIME_POR_TIPO[tipoContenido]
  return prefijosPermitidos ? prefijosPermitidos.some((prefijo) => mimeType.startsWith(prefijo)) : false
}

export const archivoValidacion = {
  esTipoArchivoValido,
}
