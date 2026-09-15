import { useState, type FormEvent } from 'react'
import { useAuth } from '../../services/AuthContext'
import { authService } from '../../services/authService'
import { loginForm } from '../../services/loginForm'

/**
 * `LoginPage`: formulario base de inicio de sesión con las tres opciones
 * (mail/contraseña, Google, GitHub), con validación en cliente de campos
 * vacíos/mail inválido (FR-026).
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-025: soportar
 * los tres proveedores de autenticación; FR-026: validación en cliente
 * antes de enviar) y
 * specs/001-user-interactions/contracts/api-contracts.md (sección "1.
 * Autenticación").
 *
 * Orquesta `authService` (T053) para ejecutar el login y `useAuth()`
 * (`AuthContext`, T020) para actualizar el estado de sesión de la
 * aplicación tras un login exitoso (Principio III: `LoginPage` no invoca
 * `fetch` directamente ni mantiene su propio estado de sesión).
 *
 * Nota de alcance (T054): esta tarea implementa el formulario base y la
 * validación de FR-026. El mensaje de error genérico ante credenciales
 * incorrectas (FR-027, T091), la deshabilitación del botón durante el
 * envío (FR-028, T092) y la redirección si ya hay sesión activa (FR-029,
 * T093) se implementan en tareas posteriores sobre este mismo archivo.
 */
export function LoginPage() {
  const { iniciarSesion } = useAuth()
  const [mail, setMail] = useState('')
  const [password, setPassword] = useState('')

  const puedeEnviar = loginForm.puedeEnviarLogin(mail, password)

  const manejarEnvio = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (!puedeEnviar) {
      return
    }
    const usuario = await authService.iniciarSesionConMail(mail, password)
    iniciarSesion(usuario)
  }

  return (
    <div className="login-page">
      <form onSubmit={manejarEnvio}>
        <label>
          Mail
          <input
            type="email"
            value={mail}
            onChange={(evento) => setMail(evento.target.value)}
            autoComplete="email"
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(evento) => setPassword(evento.target.value)}
            autoComplete="current-password"
          />
        </label>
        <button type="submit" disabled={!puedeEnviar}>
          Iniciar sesión
        </button>
      </form>

      <button type="button" onClick={() => authService.iniciarSesionConOAuth('google')}>
        Continuar con Google
      </button>
      <button type="button" onClick={() => authService.iniciarSesionConOAuth('github')}>
        Continuar con GitHub
      </button>
    </div>
  )
}
