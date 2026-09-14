import { httpClient } from '../infrastructure/httpClient'

/**
 * Servicio de aplicación para las opciones de filtro (catálogo de estilos y
 * técnicas) de la pantalla Descubrir (`FiltroPanel`, HU-03).
 *
 * Fuente de verdad: specs/001-user-interactions/contracts/api-contracts.md
 * (sección "4. Descubrir (búsqueda y filtros)": `GET /api/publicaciones/buscar`).
 *
 * Confirmado (B6) vía `/speckit.clarify`: el catálogo de estilos/técnicas
 * **no es un endpoint propio** (`GET /api/filtros/opciones` descartado);
 * viene **embebido** en el campo `opcionesFiltro` de la respuesta de
 * `GET /api/publicaciones/buscar`. Este servicio extrae ese campo para
 * poblar `FiltroPanel` (T045), realizando una búsqueda sin criterios
 * (todas las publicaciones) únicamente para obtener las facetas.
 */

export interface OpcionesFiltro {
  estilos: string[]
  tecnicas: string[]
}

interface BusquedaResponseDto {
  opcionesFiltro: OpcionesFiltro
}

/**
 * Obtiene el catálogo de estilos/técnicas disponible, extraído del campo
 * `opcionesFiltro` embebido en la respuesta de `GET /api/publicaciones/buscar`
 * (B6 confirmado, sin endpoint separado).
 */
async function obtenerOpcionesFiltro(): Promise<OpcionesFiltro> {
  const dto = await httpClient.get<BusquedaResponseDto>('/publicaciones/buscar')
  return dto.opcionesFiltro
}

export const filtroOpcionesService = {
  obtenerOpcionesFiltro,
}
