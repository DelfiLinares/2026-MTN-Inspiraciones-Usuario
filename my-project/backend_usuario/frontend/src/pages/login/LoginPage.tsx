import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import { authService } from '../../services/authService'
import { loginForm } from '../../services/loginForm'
import { obtenerRutaDestinoTrasLogin } from '../../routes'

/**
 * `LoginPage`: formulario base de inicio de sesión con las tres opciones
 * (mail/contraseña, Google, GitHub), con validación en cliente de campos
 * vacíos/mail inválido (FR-026).
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-025: soportar
 * los tres proveedores de autenticación; FR-026: validación en cliente
 * antes de enviar; CB-06: conservar el destino original para volver tras
 * autenticarse) y specs/001-user-interactions/contracts/api-contracts.md
 * (sección "1. Autenticación").
 *
 * Orquesta `authService` (T053) para ejecutar el login y `useAuth()`
 * (`AuthContext`, T020) para actualizar el estado de sesión de la
 * aplicación tras un login exitoso (Principio III: `LoginPage` no invoca
 * `fetch` directamente ni mantiene su propio estado de sesión).
 *
 * Tras un login exitoso con mail/contraseña, navega a la ruta original
 * conservada por `RutaProtegida` en `location.state.desde` (CB-06, T056),
 * usando `obtenerRutaDestinoTrasLogin`; si no hay destino conservado,
 * navega al home.
 *
 * Nota de alcance (T054): esta tarea implementa el formulario base y la
 * validación de FR-026. El mensaje de error genérico ante credenciales
 * incorrectas (FR-027, T091) y la deshabilitación del botón durante el
 * envío (FR-028, T092) se implementan en tareas posteriores sobre este
 * mismo archivo.
 *
 * T093: si el visitante ya tiene una sesión activa (`estaAutenticado`) al
 * acceder a `/login`, redirige al home (FR-029) sin renderizar el
 * formulario, en vez de permitir un segundo inicio de sesión superpuesto.
 * Mientras `AuthContext` (T020) todavía está determinando el estado de
 * sesión (`cargando`), no se redirige ni se renderiza el formulario, para
 * evitar un parpadeo del formulario antes de confirmar que no hay sesión.
 */
export function LoginPage() {
  const { iniciarSesion, estaAutenticado, cargando } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mail, setMail] = useState('')
  const [password, setPassword] = useState('')

  const puedeEnviar = loginForm.puedeEnviarLogin(mail, password)

  if (cargando) {
    return null
  }

  if (estaAutenticado) {
    // FR-029: un usuario ya autenticado que accede a /login es redirigido al home.
    return <Navigate to="/" replace />
  }

  const manejarEnvio = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (!puedeEnviar) {
      return
    }
    const usuario = await authService.iniciarSesionConMail(mail, password)
    iniciarSesion(usuario)
    navigate(obtenerRutaDestinoTrasLogin(location.state), { replace: true })
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
