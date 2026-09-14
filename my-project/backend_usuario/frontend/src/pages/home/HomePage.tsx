import { useCallback } from 'react'
import { useInfiniteList } from '../../services/useInfiniteList'
import { feedService } from '../../services/feedService'
import { PublicacionCard } from '../../components/publicacion/PublicacionCard'
import { Skeleton } from '../../components/comunes/Skeleton'

/**
 * `HomePage`: feed principal, alimentado por `feedService` (T088) y
 * `useInfiniteList` (T026), renderizando cada resultado con
 * `PublicacionCard` (T030) y mostrando `Skeleton` (T022) mientras carga.
 *
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T031),
 * specs/001-user-interactions/spec.md (US-3 AC-03.7: skeletons en vez de
 * pantalla en blanco durante la carga).
 */
export function HomePage() {
  const cargarPagina = useCallback((cursor: string | null) => feedService.obtenerPagina(cursor), [])
  const { items, cargando, hayMas, centinelaRef } = useInfiniteList(cargarPagina)

  return (
    <div className="home-page">
      {items.map((publicacion, indice) => {
        const esUltimo = indice === items.length - 1
        return (
          <div key={publicacion.id} ref={esUltimo ? centinelaRef : undefined}>
            <PublicacionCard publicacion={publicacion} />
          </div>
        )
      })}

      {cargando && (
        <>
          <Skeleton height="200px" />
          <Skeleton height="200px" />
        </>
      )}

      {!cargando && !hayMas && items.length > 0 && <p>No hay más publicaciones.</p>}
    </div>
  )
}
