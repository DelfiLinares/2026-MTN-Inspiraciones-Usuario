import { useEffect, useState, type FormEvent } from 'react'
import { useDescubrirFiltros } from '../../services/useDescubrirFiltros'
import { filtroOpcionesService, type OpcionesFiltro } from '../../services/filtroOpcionesService'
import { geolocationClient } from '../../infrastructure/geolocationClient'
import { Filtro } from '../../domain/Filtro'
import { PublicacionCard } from '../../components/publicacion/PublicacionCard'
import { FiltroPanel } from '../../components/filtros/FiltroPanel'
import { Skeleton } from '../../components/comunes/Skeleton'
import { EmptyState } from '../../components/comunes/EmptyState'

const OPCIONES_FILTRO_VACIAS: OpcionesFiltro = { estilos: [], tecnicas: [] }

/**
 * `DescubrirPage`: pantalla de búsqueda de publicaciones con texto libre y
 * filtros (estilo, técnica, tipo de contenido, distancia), con scroll
 * infinito, skeletons durante la carga y estado vacío con opción de
 * limpiar filtros.
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (US-3: FR-013 a
 * FR-018; CB-04: estado vacío con opción de limpiar filtros; CB-05) y
 * specs/001-user-interactions/quickstart.md (Escenario C).
 *
 * Orquesta `useDescubrirFiltros` (T047, que a su vez orquesta `Filtro`
 * T043, `busquedaService` T044 y `useInfiniteList` T026) y
 * `filtroOpcionesService` (T089) para poblar `FiltroPanel` (T045) con el
 * catálogo de estilos/técnicas embebido en la respuesta de búsqueda (B6
 * confirmado). La activación de geolocalización (FR-018) se resuelve vía
 * `geolocationClient`, sin que este componente acceda a `navigator`
 * directamente (Principio III).
 */
export function DescubrirPage() {
  const { items, cargando, hayMas, error, centinelaRef, filtro, aplicarFiltro } =
    useDescubrirFiltros()
  const [opcionesFiltro, setOpcionesFiltro] = useState<OpcionesFiltro>(OPCIONES_FILTRO_VACIAS)
  const [textoBusqueda, setTextoBusqueda] = useState('')

  useEffect(() => {
    let cancelado = false
    filtroOpcionesService.obtenerOpcionesFiltro().then((opciones) => {
      if (!cancelado) {
        setOpcionesFiltro(opciones)
      }
    })
    return () => {
      cancelado = true
    }
  }, [])

  const manejarEnvioBusqueda = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    aplicarFiltro(new Filtro({ ...filtro, texto: textoBusqueda === '' ? null : textoBusqueda }))
  }

  const manejarActivarGeolocalizacion = async () => {
    try {
      await geolocationClient.obtenerPosicionActual()
      aplicarFiltro(new Filtro({ ...filtro, geolocalizacionActiva: true }))
    } catch {
      // FR-018/CB-10: si falla u obtenerla no está disponible, el filtro de
      // distancia permanece deshabilitado; no se muestra ningún feedback
      // bloqueante adicional.
    }
  }

  const manejarLimpiarFiltros = () => {
    setTextoBusqueda('')
    aplicarFiltro(
      new Filtro({
        texto: null,
        estilo: null,
        tecnica: null,
        tipoContenido: null,
        distanciaKm: null,
        geolocalizacionActiva: filtro.geolocalizacionActiva,
      }),
    )
  }

  const mostrarEstadoVacio = !cargando && !error && items.length === 0

  return (
    <div className="descubrir-page">
      <form onSubmit={manejarEnvioBusqueda} className="descubrir-page__busqueda">
        <label>
          Buscar
          <input
            type="text"
            value={textoBusqueda}
            onChange={(evento) => setTextoBusqueda(evento.target.value)}
          />
        </label>
        <button type="submit">Buscar</button>
      </form>

      {!filtro.geolocalizacionActiva && (
        <button type="button" onClick={manejarActivarGeolocalizacion}>
          Activar geolocalización
        </button>
      )}

      <FiltroPanel
        filtro={filtro}
        opcionesFiltro={opcionesFiltro}
        geolocalizacionDeshabilitada={!filtro.distanciaHabilitada()}
        onCambiarFiltro={aplicarFiltro}
      />

      {mostrarEstadoVacio && (
        <EmptyState
          mensaje="No se encontraron publicaciones con los filtros aplicados."
          textoAccion="Limpiar filtros"
          onAccionClick={manejarLimpiarFiltros}
        />
      )}

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

      {!cargando && !hayMas && items.length > 0 && <p>No hay más resultados.</p>}
    </div>
  )
}
