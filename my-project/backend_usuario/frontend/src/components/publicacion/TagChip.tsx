/**
 * Componente presentacional `TagChip`.
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-006: "cada tag
 * seleccionado se muestra como chip removible individualmente").
 *
 * Representa un único tag seleccionado en el formulario de publicación,
 * con un botón para quitarlo de la selección.
 */
export interface TagChipProps {
  nombre: string
  onQuitar: () => void
}

export function TagChip({ nombre, onQuitar }: TagChipProps) {
  return (
    <span className="tag-chip">
      {nombre}
      <button type="button" onClick={onQuitar} aria-label={`Quitar tag ${nombre}`}>
        ×
      </button>
    </span>
  )
}
