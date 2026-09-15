import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import { authService, CODIGO_EMAIL_YA_REGISTRADO } from '../../services/authService'
import { registroForm } from '../../services/registroForm'
import { ApiError } from '../../infrastructure/httpClient'

/**
 * `RegistroPage`: formulario completo de registro (nombre, apellido,
 * mail, contraseña, confirmación de contraseña), con indicador de
 * fortaleza de contraseña en tiempo real y registro social (Google,
 * GitHub).
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-031:
 * solicitar nombre/apellido/mail/contraseña/confirmación e indicar en
 * tiempo real si la contraseña cumple los criterios mínimos; FR-032:
 * error claro ante mail ya registrado) y
 * specs/001-user-interactions/contracts/api-contracts.md (sección "1.
 * Autenticación", `POST /api/auth/register`).
 *
 * Confirmado (B1) vía `/speckit.clarify`: criterios de fortaleza de
 * contraseña — mínimo 8 caracteres, una mayúscula y un símbolo
 * (`registroForm.cumpleCriteriosPassword`).
 *
 * Orquesta `authService.registrar()` (T058) para ejecutar el registro y
 * `useAuth()` (`AuthContext`, T020) para iniciar sesión automáticamente
 * tras un registro exitoso (mismo shape de `Usuario` que login),
 * navegando luego al cuestionario de onboarding (FR-033, `CuestionarioPage`,
 * T060). El registro social (Google/GitHub) reutiliza
 * `authService.iniciarSesionConOAuth`, igual que `LoginPage` (T054).
 */
export function RegistroPage() {
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [mail, setMail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmacionPassword, setConfirmacionPassword] = useState('')
  const [errorMail, setErrorMail] = useState<string | null>(null)

  const cumpleCriteriosPassword = registroForm.cumpleCriteriosPassword(password)
  const puedeEnviar = registroForm.puedeEnviarRegistro({
    nombre,
    apellido,
    mail,
    password,
    confirmacionPassword,
  })

  const manejarEnvio = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (!puedeEnviar) {
      return
    }
    setErrorMail(null)
    try {
      const usuario = await authService.registrar({ nombre, apellido, email: mail, password })
      iniciarSesion(usuario)
      navigate('/cuestionario', { replace: true })
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 409 &&
        (error.body as { codigo?: string } | null)?.codigo === CODIGO_EMAIL_YA_REGISTRADO
      ) {
        setErrorMail('Ese mail ya está registrado.')
        return
      }
      throw error
    }
  }

  return (
    <div className="registro-page">
      <form onSubmit={manejarEnvio}>
        <label>
          Nombre
          <input
            type="text"
            value={nombre}
            onChange={(evento) => setNombre(evento.target.value)}
            autoComplete="given-name"
          />
        </label>
        <label>
          Apellido
          <input
            type="text"
            value={apellido}
            onChange={(evento) => setApellido(evento.target.value)}
            autoComplete="family-name"
          />
        </label>
        <label>
          Mail
          <input
            type="email"
            value={mail}
            onChange={(evento) => {
              setMail(evento.target.value)
              setErrorMail(null)
            }}
            autoComplete="email"
          />
        </label>
        {errorMail && <p role="alert">{errorMail}</p>}
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(evento) => setPassword(evento.target.value)}
            autoComplete="new-password"
          />
        </label>
        <p aria-live="polite">
          {cumpleCriteriosPassword
            ? 'La contraseña cumple los criterios mínimos.'
            : 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un símbolo.'}
        </p>
        <label>
          Confirmar contraseña
          <input
            type="password"
            value={confirmacionPassword}
            onChange={(evento) => setConfirmacionPassword(evento.target.value)}
            autoComplete="new-password"
          />
        </label>
        <button type="submit" disabled={!puedeEnviar}>
          Registrarme
        </button>
      </form>

      <button type="button" onClick={() => authService.iniciarSesionConOAuth('google')}>
        Registrarme con Google
      </button>
      <button type="button" onClick={() => authService.iniciarSesionConOAuth('github')}>
        Registrarme con GitHub
      </button>
    </div>
  )
}
