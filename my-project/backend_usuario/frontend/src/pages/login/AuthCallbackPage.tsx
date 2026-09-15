import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import { authService, type ProveedorOAuth } from '../../services/authService'

/**
 * `AuthCallbackPage`: maneja el retorno de OAuth Google/GitHub en la ruta
 * propia del frontend (`/auth/callback/:provider`).
 *
 * Fuente de verdad: specs/001-user-interactions/contracts/api-contracts.md
 * (sección "1. Autenticación", `GET /api/auth/oauth/{provider}/callback?code=...`:
 * "`AuthCallbackPage` (T055) renderiza esta pantalla de 'procesando login'
 * mientras se completa el flujo") y
 * specs/001-user-interactions/spec.md (FR-025, FR-034).
 *
 * Confirmado (B2) vía `/speckit.clarify`: el frontend implementa su propia
 * ruta de callback (`/auth/callback/:provider`), responsable de completar
 * el flujo (invocando al backend para intercambiar el código/confirmar la
 * sesión, vía `authService.completarCallbackOAuth`, T053) antes de
 * redirigir al usuario al home.
 *
 * Lee `:provider` de la ruta y `code` del query string, delega en
 * `authService` (que a su vez delega en `googleProvider`/`githubProvider`,
 * T051/T052), actualiza `AuthContext` (T020) con `iniciarSesion()` y
 * redirige al home. Ante error, muestra un mensaje y un enlace de vuelta a
 * `/login`.
 */
export function AuthCallbackPage() {
  const { provider } = useParams<{ provider: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { iniciarSesion } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const enCurso = useRef(false)

  useEffect(() => {
    if (enCurso.current) {
      return
    }
    enCurso.current = true

    const code = searchParams.get('code')
    const proveedorValido = provider === 'google' || provider === 'github'

    if (!proveedorValido || !code) {
      setError('No se pudo completar el inicio de sesión.')
      return
    }

    authService
      .completarCallbackOAuth(provider as ProveedorOAuth, code)
      .then((usuario) => {
        iniciarSesion(usuario)
        navigate('/', { replace: true })
      })
      .catch(() => {
        setError('No se pudo completar el inicio de sesión.')
      })
  }, [provider, searchParams, iniciarSesion, navigate])

  if (error) {
    return (
      <div className="auth-callback-page">
        <p>{error}</p>
        <a href="/login">Volver a iniciar sesión</a>
      </div>
    )
  }

  return (
    <div className="auth-callback-page">
      <p>Procesando inicio de sesión…</p>
    </div>
  )
}
