import { useEffect, useState } from 'react'
import { reporteService } from '../../services/reporteService'
import type { MotivoReporte } from '../../domain/enums/MotivoReporte'

/**
 * Componente `ReportarModal`.
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-022: requiere
 * la selección de un motivo antes de permitir el envío; FR-024: confirmación
 * no bloqueante tras un reporte enviado exitosamente, sin exponer al
 * usuario el resultado del proceso de moderación) y
 * specs/001-user-interactions/contracts/api-contracts.md (sección "2.
 * Publicaciones — Like y Reporte", `GET .../reporte-motivos`,
 * `POST .../reportes`).
 *
 * Al abrirse, obtiene el vocabulario de motivos vía `reporteService`
 * (T066) y bloquea el envío hasta que se seleccione uno (FR-022). Al
 * confirmar exitosamente, muestra un mensaje de confirmación no
 * bloqueante (FR-024) y se cierra, sin revelar detalles del proceso de
 * moderación (por ejemplo, no expone si el reporte fue "aceptado" o
 * "revisado", solo que fue enviado).
 *
 * Este componente no decide si el reporte es posible (esa regla vive en
 * `Publicacion.puedeReportar()`, usada por `ReportButton`, T067); solo
 * orquesta el flujo de selección y envío del motivo.
 */
export interface ReportarModalProps {
  abierto: boolean
  publicacionId: string
  onCerrar: () => void
  /** Invocado tras un envío de reporte exitoso (FR-024). */
  onReporteEnviado?: () => void
}

export function ReportarModal({
  abierto,
  publicacionId,
  onCerrar,
  onReporteEnviado,
}: ReportarModalProps) {
  const [motivos, setMotivos] = useState<MotivoReporte[]>([])
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [confirmado, setConfirmado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!abierto) {
      return
    }

    setMotivoSeleccionado(null)
    setConfirmado(false)
    setError(null)

    reporteService
      .obtenerMotivos(publicacionId)
      .then(setMotivos)
      .catch(() => {
        setError('No se pudieron cargar los motivos de reporte. Intentá de nuevo.')
      })
  }, [abierto, publicacionId])

  if (!abierto) {
    return null
  }

  const manejarEnvio = async () => {
    if (motivoSeleccionado === null) {
      // FR-022: no se permite el envío sin motivo seleccionado.
      return
    }

    setEnviando(true)
    setError(null)

    try {
      await reporteService.enviarReporte(publicacionId, motivoSeleccionado)
      // FR-024: confirmación no bloqueante, sin exponer el resultado del
      // proceso de moderación.
      setConfirmado(true)
      onReporteEnviado?.()
    } catch {
      setError('No se pudo enviar el reporte. Intentá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="reportar-modal" role="dialog" aria-modal="true" aria-label="Reportar publicación">
      <div className="reportar-modal__contenido">
        <button type="button" onClick={onCerrar} aria-label="Cerrar" disabled={enviando}>
          ×
        </button>

        {confirmado ? (
          <p role="status">Reporte enviado. Gracias por avisarnos.</p>
        ) : (
          <>
            <fieldset disabled={enviando}>
              <legend>Seleccioná un motivo</legend>
              {motivos.map((motivo) => (
                <label key={motivo.codigo}>
                  <input
                    type="radio"
                    name="motivoReporte"
                    value={motivo.codigo}
                    checked={motivoSeleccionado === motivo.codigo}
                    onChange={() => setMotivoSeleccionado(motivo.codigo)}
                  />
                  {motivo.etiqueta}
                </label>
              ))}
            </fieldset>

            {error && <p role="alert">{error}</p>}

            <button
              type="button"
              onClick={manejarEnvio}
              disabled={motivoSeleccionado === null || enviando}
            >
              Enviar reporte
            </button>
          </>
        )}
      </div>
    </div>
  )
}
