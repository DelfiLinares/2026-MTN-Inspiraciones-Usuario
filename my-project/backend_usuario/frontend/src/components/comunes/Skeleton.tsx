/**
 * Componente de presentación `Skeleton`: placeholder de carga genérico,
 * usado en lugar de una pantalla en blanco mientras se obtienen datos
 * (feed, resultados de búsqueda, etc.).
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (US-3 AC-03.7:
 * "se muestran skeletons o placeholders en lugar de una pantalla en
 * blanco").
 *
 * Componente puro de presentación (Principio III): no invoca `fetch` ni
 * conoce ningún caso de uso; solo recibe dimensiones y estilo por props.
 */
export interface SkeletonProps {
  /** Ancho del placeholder (CSS válido, ej. '100%', '240px'). Por defecto '100%'. */
  width?: string
  /** Alto del placeholder (CSS válido, ej. '1rem', '200px'). Por defecto '1rem'. */
  height?: string
  /** Radio de borde del placeholder. Por defecto '4px'. */
  borderRadius?: string
  /** Clase CSS adicional para estilos específicos del contexto de uso. */
  className?: string
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = '4px',
  className,
}: SkeletonProps) {
  return (
    <div
      className={['skeleton', className].filter(Boolean).join(' ')}
      role="status"
      aria-label="Cargando"
      style={{ width, height, borderRadius }}
    />
  )
}
