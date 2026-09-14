import { TipoFiltro } from '../../domain/enums/TipoFiltro'

/**
 * Componente presentacional `FiltroChip`.
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-015: "El
 * sistema DEBE mostrar cada filtro activo como chip removible
 * individualmente") y specs/001-user-interactions/data-model.md
 * (`Filtro.listaDeChips()`, US-3 AC-03.4).
 *
 * Representa un único filtro activo de la pantalla Descubrir (estilo,
 * técnica, tipo de contenido o distancia), con un botón para quitarlo.
 * Quien lo instancie debe invocar `Filtro.quitarFiltro(tipo)` (T043) en
 * `onQuitar` para obtener la nueva instancia inmutable de `Filtro`.
 */
export interface FiltroChipProps {
  tipo: TipoFiltro
  etiqueta: string
  onQuitar: () => void
}

export function FiltroChip({ tipo, etiqueta, onQuitar }: FiltroChipProps) {
  return (
    <span className="filtro-chip" data-tipo={tipo}>
      {etiqueta}
      <button type="button" onClick={onQuitar} aria-label={`Quitar filtro ${etiqueta}`}>
        ×
      </button>
    </span>
  )
}
