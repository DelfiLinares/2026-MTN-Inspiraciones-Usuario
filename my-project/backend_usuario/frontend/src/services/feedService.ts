import { httpClient } from '../infrastructure/httpClient'
import { Publicacion } from '../domain/Publicacion'
import { EstadoPublicacion } from '../domain/enums/EstadoPublicacion'
import { TipoContenido } from '../domain/enums/TipoContenido'
import type { PaginaResultado } from './useInfiniteList'

/**
 * Servicio de aplicación para el feed de Home.
 *
 * Fuente de verdad: specs/001-user-interactions/contracts/api-contracts.md
 * (sección "5. Home (feed)": `GET /api/feed`, paginación por cursor, mismo
 * shape que `GET /api/publicaciones/buscar`).
 *
 * Nota: el mecanismo exacto de paginación (cursor opaco vs. `page`/`size`)
 * está marcado como `[NEEDS CONFIRMATION]` (B5) en `api-contracts.md`; este
 * servicio asume cursor opaco, consistente con el resto de servicios
 * paginados (`busquedaService`).
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

interface FeedResponseDto {
  items: PublicacionDto[]
  nextCursor: string | null
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
 * Obtiene una página del feed (`GET /api/feed?cursor=...`), compatible con
 * `useInfiniteList` (T026).
 */
async function obtenerPagina(cursor: string | null): Promise<PaginaResultado<Publicacion>> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
  const dto = await httpClient.get<FeedResponseDto>(`/feed${query}`)

  return {
    items: dto.items.map(mapearPublicacion),
    siguienteCursor: dto.nextCursor,
  }
}

export const feedService = {
  obtenerPagina,
}
