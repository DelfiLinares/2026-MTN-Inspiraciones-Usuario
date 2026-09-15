import { httpClient } from '../infrastructure/httpClient'
import { mailPasswordProvider } from '../infrastructure/authProviders/mailPasswordProvider'
import { googleProvider } from '../infrastructure/authProviders/googleProvider'
import { githubProvider } from '../infrastructure/authProviders/githubProvider'
import { Usuario } from '../domain/Usuario'

/**
 * Servicio de aplicación `authService`: orquesta los tres proveedores de
 * autenticación (`mailPasswordProvider` T050, `googleProvider` T051,
 * `githubProvider` T052), login/logout, y alimenta `AuthContext` (T020).
 *
 * Fuente de verdad: specs/001-user-interactions/contracts/api-contracts.md
 * (sección "1. Autenticación": `POST /api/auth/login`,
 * `POST /api/auth/logout`, `GET /api/auth/oauth/{provider}/...`) y
 * specs/001-user-interactions/spec.md (FR-025 a FR-029, FR-034).
 *
 * Este servicio es agnóstico de React: no invoca hooks directamente. Quien
 * lo consuma (`LoginPage` T054, `AuthCallbackPage` T055) es responsable de
 * llamar a `useAuth().iniciarSesion(usuario)` / `cerrarSesion()` (T020)
 * con el resultado de estas funciones, manteniendo `AuthContext` como la
 * única fuente de verdad del estado de sesión en la UI (Principio III).
 *
 * Confirmado (B2) vía `/speckit.clarify`: el flujo OAuth usa la ruta propia
 * de callback del frontend (`/auth/callback/:provider`); ver `googleProvider`
 * y `githubProvider` para el detalle de `iniciarRedireccion`/`completarCallback`.
 */

export type ProveedorOAuth = 'google' | 'github'

/**
 * Inicia sesión con mail y contraseña (`mailPasswordProvider`, T050).
 */
function iniciarSesionConMail(email: string, password: string): Promise<Usuario> {
  return mailPasswordProvider.iniciarSesion(email, password)
}

/**
 * Navega el navegador al proveedor OAuth solicitado para iniciar el flujo
 * de autenticación externa (`googleProvider`/`githubProvider`, T051/T052).
 */
function iniciarSesionConOAuth(proveedor: ProveedorOAuth): void {
  if (proveedor === 'google') {
    googleProvider.iniciarRedireccion()
    return
  }
  githubProvider.iniciarRedireccion()
}

/**
 * Completa el flujo OAuth desde la ruta propia de callback del frontend
 * (`/auth/callback/:provider`, B2 confirmado), delegando en el proveedor
 * correspondiente según el parámetro de ruta.
 */
function completarCallbackOAuth(proveedor: ProveedorOAuth, code: string): Promise<Usuario> {
  if (proveedor === 'google') {
    return googleProvider.completarCallback(code)
  }
  return githubProvider.completarCallback(code)
}

/**
 * Cierra la sesión (`POST /api/auth/logout`), invalidando la cookie de
 * sesión en el backend.
 */
async function cerrarSesion(): Promise<void> {
  await httpClient.post<void>('/auth/logout')
}

export const authService = {
  iniciarSesionConMail,
  iniciarSesionConOAuth,
  completarCallbackOAuth,
  cerrarSesion,
}
