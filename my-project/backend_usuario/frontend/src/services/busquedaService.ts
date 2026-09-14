import { httpClient } from '../infrastructure/httpClient'
import { Publicacion } from '../domain/Publicacion'
import { EstadoPublicacion } from '../domain/enums/EstadoPublicacion'
import { TipoContenido } from '../domain/enums/TipoContenido'
import { Filtro } from '../domain/Filtro'
import type { PaginaResultado } from './useInfiniteList'

/**
 * Servicio de aplicación para la búsqueda de publicaciones con filtros
 * (pantalla Descubrir, HU-03).
 *
 * Fuente de verdad: specs/001-user-interactions/contracts/api-contracts.md
 * (sección "4. Descubrir (búsqueda y filtros)": `GET /api/publicaciones/buscar`)
 * y specs/001-user-interactions/spec.md (FR-013, FR-016, FR-017).
 *
 * Nota: el mecanismo de paginación fue confirmado vía `/speckit.clarify`
 * (B5): cursor opaco (no `page`/`size`). Este servicio usa cursor opaco,
 * consistente con `feedService`.
 */

interface PublicacionDto {
  id: string
  autorId: string
  tipoContenido: TipoContenido
  estado: EstadoPublicacion
  tags: string[]
  urlContenido: string
  cantidadLikes: number
  likeadaPorMi: boolean
  reportadaPorMi: boolean
  creadaEn: string
}

interface BusquedaResponseDto {
  items: PublicacionDto[]
  nextCursor: string | null
  opcionesFiltro: { estilos: string[]; tecnicas: string[] }
}

function mapearPublicacion(dto: PublicacionDto): Publicacion {
  return new Publicacion({
    id: dto.id,
    autorId: dto.autorId,
    tipoContenido: dto.tipoContenido,
    estado: dto.estado,
    tags: dto.tags,
    urlContenido: dto.urlContenido,
    cantidadLikes: dto.cantidadLikes,
    likeadaPorMi: dto.likeadaPorMi,
    reportadaPorMi: dto.reportadaPorMi,
    creadaEn: new Date(dto.creadaEn),
  })
}

/**
 * Busca publicaciones (`GET /api/publicaciones/buscar`) aplicando los
 * criterios de `Filtro` (serializados vía `Filtro.aQueryParams()`, FR-013)
 * más el `cursor` opaco de paginación (B5 confirmado), compatible con
 * `useInfiniteList` (T026).
 */
async function buscarPublicaciones(
  filtro: Filtro,
  cursor: string | null,
): Promise<PaginaResultado<Publicacion>> {
  const params = new URLSearchParams(filtro.aQueryParams())
  if (cursor) {
    params.set('cursor', cursor)
  }
  const query = params.toString() ? `?${params.toString()}` : ''
  const dto = await httpClient.get<BusquedaResponseDto>(`/publicaciones/buscar${query}`)

  return {
    items: dto.items.map(mapearPublicacion),
    siguienteCursor: dto.nextCursor,
  }
}

export const busquedaService = {
  buscarPublicaciones,
}
