import { httpClient } from '../infrastructure/httpClient'
import { Carpeta } from '../domain/Carpeta'

/**
 * Servicio de aplicación para la gestión de carpetas de posts guardados.
 *
 * Fuente de verdad: specs/001-user-interactions/contracts/api-contracts.md
 * (sección "8. Carpetas (HU-09)") y specs/001-user-interactions/spec.md
 * (FR-043..FR-046).
 *
 * Expone:
 * - `obtenerCarpetas`: `GET /api/usuarios/{id}/carpetas`, endpoint público
 *   (cualquier visitante puede consultar las carpetas de cualquier
 *   usuario, según clarificación de spec).
 * - `crearCarpeta`: `POST /api/usuarios/me/carpetas`, requiere un nombre
 *   (FR-043). Ante `409 { codigo: "LIMITE_CARPETAS_ALCANZADO" }`,
 *   `httpClient` lanza `ApiError`; el frontend ya bloquea la creación al
 *   llegar a 100 carpetas mediante `Carpeta.puedeCrearNuevaCarpeta()`
 *   (T076), pero el backend valida igual (FR-047).
 * - `renombrarCarpeta`: `PATCH /api/carpetas/{id}` (FR-043).
 * - `eliminarCarpeta`: `DELETE /api/carpetas/{id}`; no elimina los posts
 *   guardados de la plataforma (FR-045).
 * - `guardarPostEnCarpeta`: `POST /api/carpetas/{id}/posts` (FR-044).
 * - `quitarPostDeCarpeta`: `DELETE /api/carpetas/{id}/posts/{publicacionId}`,
 *   sin eliminar el post de la plataforma (FR-046).
 */

interface CarpetaDto {
  id: string
  nombre: string
  cantidadPosts: number
  propietarioId?: string
}

function mapearCarpeta(dto: CarpetaDto, propietarioId: string): Carpeta {
  return new Carpeta({
    id: dto.id,
    nombre: dto.nombre,
    propietarioId: dto.propietarioId ?? propietarioId,
    cantidadPosts: dto.cantidadPosts,
  })
}

/**
 * Obtiene las carpetas públicas de un usuario (visibilidad pública
 * confirmada en clarificación de spec).
 */
async function obtenerCarpetas(usuarioId: string): Promise<Carpeta[]> {
  const dtos = await httpClient.get<CarpetaDto[]>(`/usuarios/${usuarioId}/carpetas`)
  return dtos.map((dto) => mapearCarpeta(dto, usuarioId))
}

/**
 * Crea una nueva carpeta del usuario autenticado (FR-043). El backend
 * valida el límite de 100 carpetas (FR-047), aunque el frontend ya lo
 * impide con `Carpeta.puedeCrearNuevaCarpeta()`.
 */
async function crearCarpeta(nombre: string, propietarioId: string): Promise<Carpeta> {
  const dto = await httpClient.post<CarpetaDto>('/usuarios/me/carpetas', { nombre })
  return mapearCarpeta(dto, propietarioId)
}

/**
 * Renombra una carpeta existente (FR-043). La decisión de si el usuario
 * actual puede renombrarla vive en `Carpeta.puedeRenombrar()`.
 */
async function renombrarCarpeta(carpetaId: string, nombre: string): Promise<void> {
  await httpClient.patch<void>(`/carpetas/${carpetaId}`, { nombre })
}

/**
 * Elimina una carpeta (FR-043). No elimina los posts guardados de la
 * plataforma (FR-045); la advertencia previa a esta acción es
 * responsabilidad de la capa de presentación.
 */
async function eliminarCarpeta(carpetaId: string): Promise<void> {
  await httpClient.delete<void>(`/carpetas/${carpetaId}`)
}

/**
 * Guarda un post en una carpeta, permitiendo seleccionar una carpeta
 * existente en el mismo flujo (FR-044).
 */
async function guardarPostEnCarpeta(carpetaId: string, publicacionId: string): Promise<void> {
  await httpClient.post<void>(`/carpetas/${carpetaId}/posts`, { publicacionId })
}

/**
 * Quita un post de una carpeta sin eliminarlo de la plataforma (FR-046).
 */
async function quitarPostDeCarpeta(carpetaId: string, publicacionId: string): Promise<void> {
  await httpClient.delete<void>(`/carpetas/${carpetaId}/posts/${publicacionId}`)
}

export const carpetaService = {
  obtenerCarpetas,
  crearCarpeta,
  renombrarCarpeta,
  eliminarCarpeta,
  guardarPostEnCarpeta,
  quitarPostDeCarpeta,
}
