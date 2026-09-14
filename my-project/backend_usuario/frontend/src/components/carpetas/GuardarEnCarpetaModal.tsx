import { useEffect, useState } from 'react'
import { carpetaService } from '../../services/carpetaService'
import { Carpeta } from '../../domain/Carpeta'
import { useAuth } from '../../services/AuthContext'

/**
 * Componente `GuardarEnCarpetaModal`.
 *
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T079),
 * specs/001-user-interactions/spec.md (FR-044: "Al guardar un post, el
 * sistema DEBE permitir seleccionar una carpeta existente o crear una
 * nueva en el mismo flujo, sin salir de la publicación") y
 * specs/001-user-interactions/contracts/api-contracts.md (sección "8.
 * Carpetas (HU-09)").
 *
 * Al abrirse, carga las carpetas del usuario autenticado vía
 * `carpetaService.obtenerCarpetas` (T077). Permite elegir una carpeta
 * existente o, en el mismo flujo, crear una nueva (bloqueando la opción
 * de creación al alcanzar el límite de 100 mediante
 * `Carpeta.puedeCrearNuevaCarpeta()`, FR-047, T076) y guarda el post en la
 * carpeta elegida sin salir de la publicación.
 *
 * Este componente no decide si el botón "Guardar en carpeta" debe
 * mostrarse (esa integración vive en `PublicacionCard`, T081); solo
 * orquesta el flujo de selección/creación de carpeta y guardado del post.
 */
export interface GuardarEnCarpetaModalProps {
  abierto: boolean
  publicacionId: string
  onCerrar: () => void
  /** Invocado tras guardar el post exitosamente en una carpeta. */
  onGuardado?: () => void
}

export function GuardarEnCarpetaModal({
  abierto,
  publicacionId,
  onCerrar,
  onGuardado,
}: GuardarEnCarpetaModalProps) {
  const { usuario } = useAuth()
  const [carpetas, setCarpetas] = useState<Carpeta[]>([])
  const [carpetaSeleccionadaId, setCarpetaSeleccionadaId] = useState<string | null>(null)
  const [creandoNueva, setCreandoNueva] = useState(false)
  const [nombreNuevaCarpeta, setNombreNuevaCarpeta] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [confirmado, setConfirmado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!abierto || !usuario) {
      return
    }

    setCarpetaSeleccionadaId(null)
    setCreandoNueva(false)
    setNombreNuevaCarpeta('')
    setConfirmado(false)
    setError(null)

    carpetaService
      .obtenerCarpetas(usuario.id)
      .then(setCarpetas)
      .catch(() => {
        setError('No se pudieron cargar las carpetas. Intentá de nuevo.')
      })
  }, [abierto, usuario])

  if (!abierto) {
    return null
  }

  const puedeCrearNuevaCarpeta = Carpeta.puedeCrearNuevaCarpeta(carpetas)

  const manejarGuardado = async () => {
    if (!usuario) {
      return
    }

    setGuardando(true)
    setError(null)

    try {
      let carpetaDestinoId = carpetaSeleccionadaId

      if (creandoNueva) {
        // FR-044: crear una nueva carpeta en el mismo flujo de guardado.
        const nuevaCarpeta = await carpetaService.crearCarpeta(nombreNuevaCarpeta, usuario.id)
        carpetaDestinoId = nuevaCarpeta.id
      }

      if (carpetaDestinoId === null) {
        // No se seleccionó ni se creó una carpeta destino.
        setGuardando(false)
        return
      }

      await carpetaService.guardarPostEnCarpeta(carpetaDestinoId, publicacionId)
      setConfirmado(true)
      onGuardado?.()
    } catch {
      setError('No se pudo guardar el post en la carpeta. Intentá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const puedeConfirmar =
    !guardando &&
    ((creandoNueva && nombreNuevaCarpeta.trim().length > 0) ||
      (!creandoNueva && carpetaSeleccionadaId !== null))

  return (
    <div
      className="guardar-en-carpeta-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Guardar en carpeta"
    >
      <div className="guardar-en-carpeta-modal__contenido">
        <button type="button" onClick={onCerrar} aria-label="Cerrar" disabled={guardando}>
          ×
        </button>

        {confirmado ? (
          <p role="status">Post guardado en la carpeta.</p>
        ) : (
          <>
            <fieldset disabled={guardando}>
              <legend>Elegí una carpeta</legend>
              {carpetas.map((carpeta) => (
                <label key={carpeta.id}>
                  <input
                    type="radio"
                    name="carpetaDestino"
                    value={carpeta.id}
                    checked={!creandoNueva && carpetaSeleccionadaId === carpeta.id}
                    onChange={() => {
                      setCreandoNueva(false)
                      setCarpetaSeleccionadaId(carpeta.id)
                    }}
                  />
                  {carpeta.nombre}
                </label>
              ))}

              {puedeCrearNuevaCarpeta && (
                <label>
                  <input
                    type="radio"
                    name="carpetaDestino"
                    value="__nueva__"
                    checked={creandoNueva}
                    onChange={() => {
                      setCreandoNueva(true)
                      setCarpetaSeleccionadaId(null)
                    }}
                  />
                  Crear nueva carpeta
                </label>
              )}

              {creandoNueva && (
                <input
                  type="text"
                  aria-label="Nombre de la nueva carpeta"
                  value={nombreNuevaCarpeta}
                  onChange={(evento) => setNombreNuevaCarpeta(evento.target.value)}
                />
              )}
            </fieldset>

            {error && <p role="alert">{error}</p>}

            <button type="button" onClick={manejarGuardado} disabled={!puedeConfirmar}>
              Guardar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
