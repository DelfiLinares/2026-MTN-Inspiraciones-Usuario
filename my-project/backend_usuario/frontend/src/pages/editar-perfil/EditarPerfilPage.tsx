import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../services/AuthContext'
import { usePerfilEdicion } from '../../services/usePerfilEdicion'

/**
 * `EditarPerfilPage`: formulario de edición de perfil del usuario
 * autenticado.
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-035: sin
 * campo de contraseña, con enlace a un flujo separado de cambio de
 * contraseña; FR-036: bloqueo de envío con campos obligatorios vacíos;
 * FR-037: reflejar el perfil actualizado sin recargar; FR-038: advertir
 * ante abandono con cambios sin guardar; FR-039: previsualizar la nueva
 * foto de perfil) y specs/001-user-interactions/contracts/api-contracts.md
 * (`PATCH /api/usuarios/me`, B7 confirmado vía `/speckit.clarify`: campos
 * editables `usuario`, `fotoUrl`, `bannerUrl`, `mail`, fecha de nacimiento
 * día/mes/año, redes sociales dinámicas; contraseña excluida).
 *
 * Delega todo el estado y la lógica de envío en `usePerfilEdicion` (T063);
 * esta página solo arma el formulario y conecta el flag
 * `hayCambiosSinGuardar` con el evento `beforeunload` del navegador para
 * advertir ante un cierre/recarga con cambios sin guardar (FR-038). No
 * incluye ningún campo de contraseña (FR-035): en su lugar ofrece un
 * enlace "Cambiar contraseña" hacia el flujo separado documentado en el
 * contrato (`POST /api/auth/cambiar-password` /
 * `POST /api/auth/recuperar-password`), fuera del alcance de esta tarea.
 */
export function EditarPerfilPage() {
  const { usuario } = useAuth()
  const [redSocialNueva, setRedSocialNueva] = useState('')
  const [guardadoExitoso, setGuardadoExitoso] = useState(false)

  // El formulario solo tiene sentido con un usuario autenticado; `RutaProtegida`
  // (T021) ya garantiza esto al proteger la ruta `/editar-perfil`.
  if (usuario === null) {
    return null
  }

  return <EditarPerfilFormulario usuario={usuario} redSocialNueva={redSocialNueva} setRedSocialNueva={setRedSocialNueva} guardadoExitoso={guardadoExitoso} setGuardadoExitoso={setGuardadoExitoso} />
}

function EditarPerfilFormulario({
  usuario,
  redSocialNueva,
  setRedSocialNueva,
  guardadoExitoso,
  setGuardadoExitoso,
}: {
  usuario: NonNullable<ReturnType<typeof useAuth>['usuario']>
  redSocialNueva: string
  setRedSocialNueva: (valor: string) => void
  guardadoExitoso: boolean
  setGuardadoExitoso: (valor: boolean) => void
}) {
  const {
    estado,
    puedeEnviar,
    hayCambiosSinGuardar,
    establecerNombre,
    establecerApellido,
    establecerUsuario,
    establecerBio,
    establecerMail,
    establecerFechaNacimiento,
    establecerRedesSociales,
    establecerFoto,
    establecerBanner,
    enviar,
  } = usePerfilEdicion(usuario)

  // FR-038: advertir ante abandono (cierre de pestaña/recarga) con cambios
  // sin guardar. La confirmación de navegación interna (p. ej. cambiar de
  // ruta con el router) queda fuera del alcance de esta tarea, ya que
  // requeriría un bloqueador de navegación no contemplado en T063.
  useEffect(() => {
    const manejarBeforeUnload = (evento: BeforeUnloadEvent) => {
      if (hayCambiosSinGuardar) {
        evento.preventDefault()
        evento.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', manejarBeforeUnload)
    return () => window.removeEventListener('beforeunload', manejarBeforeUnload)
  }, [hayCambiosSinGuardar])

  const manejarEnvio = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setGuardadoExitoso(false)
    const resultado = await enviar()
    if (resultado) {
      // FR-037: el perfil se refleja de inmediato; no se requiere recarga.
      setGuardadoExitoso(true)
    }
  }

  const agregarRedSocial = () => {
    if (redSocialNueva.trim() === '') {
      return
    }
    establecerRedesSociales([...estado.redesSociales, redSocialNueva.trim()])
    setRedSocialNueva('')
  }

  const quitarRedSocial = (indice: number) => {
    establecerRedesSociales(estado.redesSociales.filter((_, i) => i !== indice))
  }

  return (
    <div className="editar-perfil-page">
      <h1>Editar perfil</h1>
      <form onSubmit={manejarEnvio}>
        <label>
          Nombre
          <input
            type="text"
            value={estado.nombre}
            onChange={(evento) => establecerNombre(evento.target.value)}
          />
        </label>
        <label>
          Apellido
          <input
            type="text"
            value={estado.apellido}
            onChange={(evento) => establecerApellido(evento.target.value)}
          />
        </label>
        <label>
          Usuario
          <input
            type="text"
            value={estado.usuario}
            onChange={(evento) => establecerUsuario(evento.target.value)}
          />
        </label>
        <label>
          Bio
          <textarea value={estado.bio} onChange={(evento) => establecerBio(evento.target.value)} />
        </label>
        <label>
          Mail
          <input
            type="email"
            value={estado.mail}
            onChange={(evento) => establecerMail(evento.target.value)}
          />
        </label>

        <fieldset>
          <legend>Fecha de nacimiento</legend>
          <label>
            Día
            <input
              type="number"
              min={1}
              max={31}
              value={estado.diaNacimiento ?? ''}
              onChange={(evento) =>
                establecerFechaNacimiento(
                  Number(evento.target.value),
                  estado.mesNacimiento ?? 0,
                  estado.anioNacimiento ?? 0,
                )
              }
            />
          </label>
          <label>
            Mes
            <input
              type="number"
              min={1}
              max={12}
              value={estado.mesNacimiento ?? ''}
              onChange={(evento) =>
                establecerFechaNacimiento(
                  estado.diaNacimiento ?? 0,
                  Number(evento.target.value),
                  estado.anioNacimiento ?? 0,
                )
              }
            />
          </label>
          <label>
            Año
            <input
              type="number"
              value={estado.anioNacimiento ?? ''}
              onChange={(evento) =>
                establecerFechaNacimiento(
                  estado.diaNacimiento ?? 0,
                  estado.mesNacimiento ?? 0,
                  Number(evento.target.value),
                )
              }
            />
          </label>
        </fieldset>

        <label>
          Foto de perfil
          <input
            type="file"
            accept="image/*"
            onChange={(evento) => establecerFoto(evento.target.files?.[0] ?? null)}
          />
        </label>
        {estado.fotoPreviewUrl && (
          <img src={estado.fotoPreviewUrl} alt="Previsualización de la nueva foto de perfil" />
        )}

        <label>
          Banner
          <input
            type="file"
            accept="image/*"
            onChange={(evento) => establecerBanner(evento.target.files?.[0] ?? null)}
          />
        </label>
        {estado.bannerPreviewUrl && (
          <img src={estado.bannerPreviewUrl} alt="Previsualización del nuevo banner" />
        )}

        <fieldset>
          <legend>Redes sociales</legend>
          {estado.redesSociales.map((red, indice) => (
            <div key={indice}>
              <span>{red}</span>
              <button type="button" onClick={() => quitarRedSocial(indice)}>
                Quitar
              </button>
            </div>
          ))}
          <input
            type="text"
            placeholder="Link a red social"
            value={redSocialNueva}
            onChange={(evento) => setRedSocialNueva(evento.target.value)}
          />
          <button type="button" onClick={agregarRedSocial}>
            +
          </button>
        </fieldset>

        {estado.error && <p role="alert">{estado.error}</p>}
        {guardadoExitoso && <p role="status">Perfil actualizado correctamente.</p>}

        <button type="submit" disabled={!puedeEnviar || estado.enviando}>
          Guardar cambios
        </button>
      </form>

      {/* FR-035: sin campo de contraseña; enlace a un flujo separado. */}
      <a href="/cambiar-password">Cambiar contraseña</a>
    </div>
  )
}
