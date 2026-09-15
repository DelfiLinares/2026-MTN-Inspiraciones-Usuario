import { httpClient } from '../infrastructure/httpClient'
import { mailPasswordProvider } from '../infrastructure/authProviders/mailPasswordProvider'
import { googleProvider } from '../infrastructure/authProviders/googleProvider'
import { githubProvider } from '../infrastructure/authProviders/githubProvider'
import { Usuario } from '../domain/Usuario'
import { RolUsuario } from '../domain/enums/RolUsuario'

/**
 * Servicio de aplicación `authService`: orquesta los tres proveedores de
 * autenticación (`mailPasswordProvider` T050, `googleProvider` T051,
 * `githubProvider` T052), login/logout/registro, y alimenta `AuthContext`
 * (T020).
 *
 * Fuente de verdad: specs/001-user-interactions/contracts/api-contracts.md
 * (sección "1. Autenticación": `POST /api/auth/login`,
 * `POST /api/auth/register`, `POST /api/auth/logout`,
 * `GET /api/auth/oauth/{provider}/...`) y
 * specs/001-user-interactions/spec.md (FR-025 a FR-034).
 *
 * Este servicio es agnóstico de React: no invoca hooks directamente. Quien
 * lo consuma (`LoginPage` T054, `AuthCallbackPage` T055, `RegistroPage`
 * T059) es responsable de llamar a `useAuth().iniciarSesion(usuario)` /
 * `cerrarSesion()` (T020) con el resultado de estas funciones, manteniendo
 * `AuthContext` como la única fuente de verdad del estado de sesión en la
 * UI (Principio III).
 *
 * Confirmado (B2) vía `/speckit.clarify`: el flujo OAuth usa la ruta propia
 * de callback del frontend (`/auth/callback/:provider`); ver `googleProvider`
 * y `githubProvider` para el detalle de `iniciarRedireccion`/`completarCallback`.
 */

export type ProveedorOAuth = 'google' | 'github'

/** Código de error devuelto por `POST /api/auth/register` (FR-032). */
export const CODIGO_EMAIL_YA_REGISTRADO = 'EMAIL_YA_REGISTRADO'

interface RegistroResponseDto {
  usuario: {
    id: string
    nombre: string
    apellido: string
    fotoUrl: string | null
  }
}

function mapearUsuarioRegistro(dto: RegistroResponseDto['usuario']): Usuario {
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
 * Inicia sesión con mail y contraseña (`mailPasswordProvider`, T050).
 */
function iniciarSesionConMail(email: string, password: string): Promise<Usuario> {
  return mailPasswordProvider.iniciarSesion(email, password)
}

/**
 * Registra un nuevo usuario (`POST /api/auth/register`, mismo shape de
 * respuesta que login). Ante `409 { codigo: "EMAIL_YA_REGISTRADO" }`
 * (FR-032), `httpClient` lanza `ApiError` con ese código en `error.body`;
 * la capa de presentación (`RegistroPage`, T059) es responsable de
 * mostrar el mensaje claro correspondiente, sin revelar información
 * innecesaria.
 */
async function registrar(datos: {
  nombre: string
  apellido: string
  email: string
  password: string
}): Promise<Usuario> {
  const dto = await httpClient.post<RegistroResponseDto>('/auth/register', datos)
  return mapearUsuarioRegistro(dto.usuario)
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
  registrar,
  iniciarSesionConOAuth,
  completarCallbackOAuth,
  cerrarSesion,
}
