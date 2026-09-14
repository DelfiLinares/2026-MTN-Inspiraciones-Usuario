import type { ReactNode } from 'react'

/**
 * Componente de presentación `EmptyState`: mensaje de estado vacío genérico,
 * usado cuando una lista/búsqueda no arroja resultados, para no dejar la
 * pantalla en blanco.
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (CB-04: "La
 * búsqueda devuelve un resultado vacío por filtros muy restrictivos. La
 * pantalla no debe quedar en blanco: debe mostrar un mensaje de estado
 * vacío con opción de limpiar filtros").
 *
 * Componente puro de presentación (Principio III): no invoca `fetch` ni
 * conoce ningún caso de uso; recibe el mensaje y la acción opcional por
 * props, dejando que la pantalla que lo use decida qué hacer (por ejemplo,
 * limpiar filtros) en `onAccionClick`.
 */
export interface EmptyStateProps {
  /** Mensaje principal a mostrar. */
  mensaje: string
  /** Texto del botón de acción opcional (ej. "Limpiar filtros"). */
  textoAccion?: string
  /** Callback invocado al hacer clic en el botón de acción, si se provee `textoAccion`. */
  onAccionClick?: () => void
  /** Ícono o ilustración opcional a mostrar sobre el mensaje. */
  icono?: ReactNode
}

export function EmptyState({ mensaje, textoAccion, onAccionClick, icono }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      {icono}
      <p>{mensaje}</p>
      {textoAccion && onAccionClick && (
        <button type="button" onClick={onAccionClick}>
          {textoAccion}
        </button>
      )}
    </div>
  )
}
