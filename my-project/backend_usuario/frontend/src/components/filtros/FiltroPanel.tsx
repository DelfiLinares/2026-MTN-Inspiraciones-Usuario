import { Filtro } from '../../domain/Filtro'
import { TipoFiltro } from '../../domain/enums/TipoFiltro'
import { TipoContenido } from '../../domain/enums/TipoContenido'
import { FiltroChip } from './FiltroChip'

/**
 * Componente presentacional `FiltroPanel`.
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-013: filtros de
 * estilo, técnica, tipo de contenido y distancia, resueltos siempre contra
 * la API; FR-014: actualización sin recarga ni acción adicional; FR-015:
 * chips removibles; FR-018: distancia deshabilitada sin geolocalización) y
 * specs/001-user-interactions/data-model.md (entidad `Filtro`).
 *
 * Confirmado (B6) vía `/speckit.clarify`: el catálogo de estilos/técnicas
 * (`opcionesFiltro`) llega embebido en la respuesta de
 * `GET /api/publicaciones/buscar`, sin endpoint separado. Este componente
 * es puramente presentacional/controlado (Principio III): recibe el
 * `filtro` activo y las `opcionesFiltro` ya resueltas (obtenidas por quien
 * lo instancie, ej. `useDescubrirFiltros`, T047, vía
 * `filtroOpcionesService`, T089) y notifica los cambios mediante
 * callbacks, sin invocar servicios HTTP directamente.
 *
 * Los chips de filtros activos se renderizan reutilizando `FiltroChip`
 * (T046) a partir de `Filtro.listaDeChips()` (FR-015).
 */
export interface OpcionesFiltroPanel {
  estilos: string[]
  tecnicas: string[]
}

export interface FiltroPanelProps {
  /** Filtro activo actual (FR-013). */
  filtro: Filtro
  /** Catálogo de estilos/técnicas embebido en la respuesta de búsqueda (B6). */
  opcionesFiltro: OpcionesFiltroPanel
  /** `true` mientras la geolocalización no está activa (FR-018). */
  geolocalizacionDeshabilitada: boolean
  /** Notifica el nuevo `Filtro` resultante ante cualquier cambio (FR-014). */
  onCambiarFiltro: (filtro: Filtro) => void
}

const TIPOS_CONTENIDO_DISPONIBLES = Object.values(TipoContenido)

export function FiltroPanel({
  filtro,
  opcionesFiltro,
  geolocalizacionDeshabilitada,
  onCambiarFiltro,
}: FiltroPanelProps) {
  const manejarCambioEstilo = (valor: string) => {
    onCambiarFiltro(new Filtro({ ...filtro, estilo: valor === '' ? null : valor }))
  }

  const manejarCambioTecnica = (valor: string) => {
    onCambiarFiltro(new Filtro({ ...filtro, tecnica: valor === '' ? null : valor }))
  }

  const manejarCambioTipoContenido = (valor: string) => {
    onCambiarFiltro(
      new Filtro({ ...filtro, tipoContenido: valor === '' ? null : (valor as TipoContenido) }),
    )
  }

  const manejarCambioDistancia = (valor: string) => {
    const numero = valor === '' ? null : Number(valor)
    onCambiarFiltro(new Filtro({ ...filtro, distanciaKm: numero }))
  }

  const manejarQuitarChip = (tipo: TipoFiltro) => {
    onCambiarFiltro(filtro.quitarFiltro(tipo))
  }

  return (
    <aside className="filtro-panel" aria-label="Filtros de búsqueda">
      <div className="filtro-panel__chips">
        {filtro.listaDeChips().map((chip) => (
          <FiltroChip
            key={chip.tipo}
            tipo={chip.tipo}
            etiqueta={chip.etiqueta}
            onQuitar={() => manejarQuitarChip(chip.tipo)}
          />
        ))}
      </div>

      <label className="filtro-panel__campo">
        Estilo
        <select value={filtro.estilo ?? ''} onChange={(evento) => manejarCambioEstilo(evento.target.value)}>
          <option value="">Todos</option>
          {opcionesFiltro.estilos.map((estilo) => (
            <option key={estilo} value={estilo}>
              {estilo}
            </option>
          ))}
        </select>
      </label>

      <label className="filtro-panel__campo">
        Técnica
        <select value={filtro.tecnica ?? ''} onChange={(evento) => manejarCambioTecnica(evento.target.value)}>
          <option value="">Todas</option>
          {opcionesFiltro.tecnicas.map((tecnica) => (
            <option key={tecnica} value={tecnica}>
              {tecnica}
            </option>
          ))}
        </select>
      </label>

      <label className="filtro-panel__campo">
        Tipo de contenido
        <select
          value={filtro.tipoContenido ?? ''}
          onChange={(evento) => manejarCambioTipoContenido(evento.target.value)}
        >
          <option value="">Todos</option>
          {TIPOS_CONTENIDO_DISPONIBLES.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </label>

      <label className="filtro-panel__campo">
        Distancia (km)
        <input
          type="number"
          min={0}
          disabled={geolocalizacionDeshabilitada}
          value={filtro.distanciaKm ?? ''}
          onChange={(evento) => manejarCambioDistancia(evento.target.value)}
        />
        {geolocalizacionDeshabilitada && (
          <span className="filtro-panel__aviso-distancia">
            Activá la geolocalización para filtrar por distancia.
          </span>
        )}
      </label>
    </aside>
  )
}
