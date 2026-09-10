/**
 * Vocabulario cerrado de motivos de reporte, provisto por el backend (AC-04.3).
 * Se modela como enum con posibilidad de extensión vía catálogo remoto
 * (ver contracts/api-contracts.md).
 *
 * Fuente de verdad: specs/001-user-interactions/data-model.md
 */
export enum MotivoReporteCodigo {
  CONTENIDO_INAPROPIADO = 'CONTENIDO_INAPROPIADO',
  SPAM = 'SPAM',
  PLAGIO = 'PLAGIO',
  DISCURSO_ODIO = 'DISCURSO_ODIO',
  OTRO = 'OTRO',
}

/**
 * Motivo de reporte tal como lo provee el backend: un código cerrado
 * (MotivoReporteCodigo) junto con la etiqueta a mostrar al usuario.
 */
export interface MotivoReporte {
  codigo: MotivoReporteCodigo
  etiqueta: string
}
