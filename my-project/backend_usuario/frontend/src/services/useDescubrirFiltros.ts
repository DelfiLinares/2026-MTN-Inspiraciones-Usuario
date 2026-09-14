import { useCallback, useMemo, useState } from 'react'
import { Filtro } from '../domain/Filtro'
import { Publicacion } from '../domain/Publicacion'
import { busquedaService } from './busquedaService'
import { useInfiniteList, type UseInfiniteListResult } from './useInfiniteList'

/**
 * Hook de aplicación `useDescubrirFiltros`: orquesta `Filtro` (T043),
 * `busquedaService` (T044) y `useInfiniteList` (T026) para la pantalla
 * Descubrir (HU-03).
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-013: filtros
 * resueltos siempre contra la API; FR-014: actualizar resultados al
 * aplicar/quitar un filtro sin recargar la página; FR-016: paginación por
 * scroll infinito) y
 * specs/001-user-interactions/contracts/api-contracts.md
 * (`GET /api/publicaciones/buscar`).
 *
 * Nota: el mecanismo de paginación fue confirmado vía `/speckit.clarify`
 * (B5): cursor opaco (no `page`/`size`). Cada cambio de `Filtro` reinicia
 * la paginación desde la primera página (FR-014), aprovechando el
 * `resetKey` de `useInfiniteList`.
 */

const FILTRO_INICIAL = new Filtro({
  texto: null,
  estilo: null,
  tecnica: null,
  tipoContenido: null,
  distanciaKm: null,
  geolocalizacionActiva: false,
})

export interface UseDescubrirFiltrosResult extends UseInfiniteListResult<Publicacion> {
  /** Filtro activo actual. */
  filtro: Filtro
  /** Reemplaza el filtro activo, reiniciando la paginación (FR-014). */
  aplicarFiltro: (filtro: Filtro) => void
}

export function useDescubrirFiltros(): UseDescubrirFiltrosResult {
  const [filtro, setFiltro] = useState<Filtro>(FILTRO_INICIAL)

  const cargarPagina = useCallback(
    (cursor: string | null) => busquedaService.buscarPublicaciones(filtro, cursor),
    [filtro],
  )

  // Clave de reinicio: cambia cada vez que cambian los criterios
  // serializables del filtro (FR-014), disparando una nueva búsqueda desde
  // la primera página en `useInfiniteList` (T026).
  const resetKey = useMemo(() => JSON.stringify(filtro.aQueryParams()), [filtro])

  const infiniteList = useInfiniteList<Publicacion>(cargarPagina, resetKey)

  const aplicarFiltro = useCallback((nuevoFiltro: Filtro) => {
    setFiltro(nuevoFiltro)
  }, [])

  return {
    ...infiniteList,
    filtro,
    aplicarFiltro,
  }
}
