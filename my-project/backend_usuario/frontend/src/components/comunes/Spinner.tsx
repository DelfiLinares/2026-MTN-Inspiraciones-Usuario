/**
 * Componente de presentación `Spinner`: indicador de carga genérico,
 * usado para acciones en curso (envíos de formulario, botones deshabilitados
 * mientras se espera respuesta de la API, etc.).
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (por ejemplo, US-4
 * AC-04.7: "el botón de submit permanece deshabilitado hasta que la
 * operación finalice").
 *
 * Componente puro de presentación (Principio III): no invoca `fetch` ni
 * conoce ningún caso de uso; solo recibe tamaño y estilo por props.
 */
export interface SpinnerProps {
  /** Tamaño del spinner en píxeles. Por defecto 24. */
  size?: number
  /** Clase CSS adicional para estilos específicos del contexto de uso. */
  className?: string
}

export function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <div
      className={['spinner', className].filter(Boolean).join(' ')}
      role="status"
      aria-label="Cargando"
      style={{ width: size, height: size }}
    />
  )
}
