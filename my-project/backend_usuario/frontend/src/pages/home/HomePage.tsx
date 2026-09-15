import { useCallback, useState } from 'react'
import { useInfiniteList } from '../../services/useInfiniteList'
import { feedService } from '../../services/feedService'
import { publicacionesPropiasStore } from '../../services/publicacionesPropiasStore'
import { PublicacionCard } from '../../components/publicacion/PublicacionCard'
import { Skeleton } from '../../components/comunes/Skeleton'
import { PublicacionForm } from '../../components/publicacion/PublicacionForm'
import type { Publicacion } from '../../domain/Publicacion'

/**
 * `HomePage`: feed principal, alimentado por `feedService` (T088) y
 * `useInfiniteList` (T026), renderizando cada resultado con
 * `PublicacionCard` (T030) y mostrando `Skeleton` (T022) mientras carga.
 *
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T031, T041),
 * specs/001-user-interactions/spec.md (US-3 AC-03.7: skeletons en vez de
 * pantalla en blanco durante la carga).
 *
 * T041: integra el botón "Nueva publicación", que abre el modal
 * `PublicacionForm` (T040). Al crearse una publicación exitosamente
 * (FR-011), se antepone al feed local sin recargar la página, y además se
 * registra en `publicacionesPropiasStore` (T087) para que `PerfilPage`
 * también la muestre sin recargar, sin depender de un endpoint de listado
 * de publicaciones por usuario (inexistente en `contracts/api-contracts.md`).
 */
export function HomePage() {
  const cargarPagina = useCallback((cursor: string | null) => feedService.obtenerPagina(cursor), [])
  const { items, cargando, hayMas, centinelaRef } = useInfiniteList(cargarPagina)
  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [publicacionesPropias, setPublicacionesPropias] = useState<Publicacion[]>([])

  const manejarPublicacionCreada = useCallback((publicacion: Publicacion) => {
    setPublicacionesPropias((actual) => [publicacion, ...actual])
    publicacionesPropiasStore.registrarPublicacionCreada(publicacion)
  }, [])

  return (
    <div className="home-page">
      <button type="button" onClick={() => setFormularioAbierto(true)}>
        Nueva publicación
      </button>

      <PublicacionForm
        abierto={formularioAbierto}
        onCerrar={() => setFormularioAbierto(false)}
        onPublicacionCreada={manejarPublicacionCreada}
      />

      {publicacionesPropias.map((publicacion) => (
        <PublicacionCard key={publicacion.id} publicacion={publicacion} />
      ))}

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

