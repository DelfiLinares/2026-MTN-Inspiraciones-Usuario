import { httpClient } from '../infrastructure/httpClient'
import type { MotivoReporte } from '../domain/enums/MotivoReporte'

/**
 * Servicio de aplicación para el reporte de publicaciones.
 *
 * Fuente de verdad: specs/001-user-interactions/contracts/api-contracts.md
 * (sección "2. Publicaciones — Like y Reporte") y
 * specs/001-user-interactions/spec.md (FR-021..FR-024).
 *
 * Expone:
 * - `obtenerMotivos`: `GET /api/publicaciones/{id}/reporte-motivos`, para
 *   poblar el modal de reporte (US-7 AC-04.3).
 * - `obtenerMiReporte`: `GET /api/publicaciones/{id}/mi-reporte`, que
 *   refleja únicamente el estado de reporte propio del usuario actual
 *   (FR-023), nunca el estado global de reportes de la publicación.
 * - `enviarReporte`: `POST /api/publicaciones/{id}/reportes`, requiere un
 *   motivo (FR-022) y produce una confirmación no bloqueante (FR-024).
 */

interface MiReporteResponseDto {
  reportada: boolean
}

interface EnviarReporteResponseDto {
  confirmado: boolean
}

/**
 * Obtiene el vocabulario de motivos de reporte provisto por el backend
 * (US-7 AC-04.3).
 */
async function obtenerMotivos(publicacionId: string): Promise<MotivoReporte[]> {
  return httpClient.get<MotivoReporte[]>(`/publicaciones/${publicacionId}/reporte-motivos`)
}

/**
 * Consulta si el usuario actual ya reportó esta publicación (estado
 * propio, no global — FR-023).
 */
async function obtenerMiReporte(publicacionId: string): Promise<boolean> {
  const dto = await httpClient.get<MiReporteResponseDto>(
    `/publicaciones/${publicacionId}/mi-reporte`,
  )
  return dto.reportada
}

/**
 * Envía un reporte con el motivo seleccionado (FR-022). Ante
 * `409 { codigo: "YA_REPORTADA_POR_USUARIO" }`, `httpClient` lanza
 * `ApiError`; la capa de presentación decide cómo comunicarlo.
 */
async function enviarReporte(publicacionId: string, motivoCodigo: string): Promise<boolean> {
  const dto = await httpClient.post<EnviarReporteResponseDto>(
    `/publicaciones/${publicacionId}/reportes`,
    { motivoCodigo },
  )
  return dto.confirmado
}

export const reporteService = {
  obtenerMotivos,
  obtenerMiReporte,
  enviarReporte,
}
