import { httpClient, BASE_URL } from '../httpClient'
import { Usuario } from '../../domain/Usuario'
import { RolUsuario } from '../../domain/enums/RolUsuario'

/**
 * Proveedor de autenticación OAuth con GitHub.
 *
 * Fuente de verdad: specs/001-user-interactions/contracts/api-contracts.md
 * (sección "1. Autenticación": `GET /api/auth/oauth/{provider}/redirect`,
 * `GET /api/auth/oauth/{provider}/callback?code=...`) y
 * specs/001-user-interactions/spec.md (FR-025, FR-034).
 *
 * Confirmado (B2) vía `/speckit.clarify`: el frontend implementa su propia
 * ruta de callback (`/auth/callback/github`, ver `VITE_OAUTH_GITHUB_REDIRECT_PATH`
 * en `.env.example`), en vez de que el backend redirija directamente. Ese
 * flujo es:
 * 1. `iniciarRedireccion()`: navega el navegador a
 *    `GET /api/auth/oauth/github/redirect` (no es una llamada `fetch`).
 * 2. El proveedor OAuth redirige de vuelta a la ruta propia del frontend
 *    (`/auth/callback/github`), que `AuthCallbackPage` (T055) renderiza.
 * 3. `completarCallback(code)`: invoca a
 *    `GET /api/auth/oauth/github/callback?code=...` para intercambiar el
 *    código y confirmar la sesión (cookie `httpOnly`), devolviendo el
 *    `Usuario` autenticado (mismo shape que `mailPasswordProvider`/`googleProvider`).
 */

interface OAuthCallbackResponseDto {
  usuario: {
    id: string
    nombre: string
    apellido: string
    fotoUrl: string | null
  }
}

function mapearUsuario(dto: OAuthCallbackResponseDto['usuario']): Usuario {
  return new Usuario({
    id: dto.id,
    nombre: dto.nombre,
    apellido: dto.apellido,
    bio: null,
    fotoUrl: dto.fotoUrl,
    rol: RolUsuario.USER,
    cantidadSeguidores: 0,
    sigoAEsteUsuario: false,
  })
}

/**
 * Navega el navegador a `GET /api/auth/oauth/github/redirect` para iniciar
 * el flujo OAuth. No es una llamada `fetch` (Principio III no aplica: es
 * una navegación de documento completo, no comunicación con el backend
 * desde JS).
 */
function iniciarRedireccion(): void {
  window.location.href = `${BASE_URL}/auth/oauth/github/redirect`
}

/**
 * Completa el flujo OAuth desde la ruta propia de callback del frontend
 * (`/auth/callback/github`, B2 confirmado), intercambiando el `code`
 * recibido por una sesión autenticada.
 */
async function completarCallback(code: string): Promise<Usuario> {
  const query = `?code=${encodeURIComponent(code)}`
  const dto = await httpClient.get<OAuthCallbackResponseDto>(`/auth/oauth/github/callback${query}`)
  return mapearUsuario(dto.usuario)
}

export const githubProvider = {
  iniciarRedireccion,
  completarCallback,
}
