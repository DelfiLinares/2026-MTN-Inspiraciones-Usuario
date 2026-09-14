/**
 * Componente de presentación `Spinner`: indicador de carga genérico,
 * usado para acciones en curso (envíos de formulario, botones deshabilitados
 * mientras se espera respuesta de la API, etc.).
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (por ejemplo, US-4
 * AC-04.7: "el botón de submit permanece deshabilitado hasta que la
 * operación finalice") y specs/001-user-interactions/tasks.md (T083: pase
 * de accesibilidad, foco visible y `aria-live` en estados de carga).
 *
 * `aria-live="polite"` anuncia el estado de carga a tecnologías de
 * asistencia sin interrumpir al usuario, y `tabIndex={-1}` junto con la
 * clase `spinner--foco-visible` permite enfocar programáticamente el
 * indicador sin incorporarlo al orden de tabulación normal.
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
      className={['spinner', 'spinner--foco-visible', className].filter(Boolean).join(' ')}
      role="status"
      aria-live="polite"
      aria-label="Cargando"
      tabIndex={-1}
      style={{ width: size, height: size }}
    />
  )
}
