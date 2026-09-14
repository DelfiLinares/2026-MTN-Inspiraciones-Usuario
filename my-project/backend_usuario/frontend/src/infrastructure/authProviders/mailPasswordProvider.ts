import { httpClient } from '../httpClient'
import { Usuario } from '../../domain/Usuario'
import { RolUsuario } from '../../domain/enums/RolUsuario'

/**
 * Proveedor de autenticación mail/contraseña.
 *
 * Fuente de verdad: specs/001-user-interactions/contracts/api-contracts.md
 * (sección "1. Autenticación", `POST /api/auth/login`) y
 * specs/001-user-interactions/spec.md (FR-025, FR-027).
 *
 * A diferencia de `googleProvider`/`githubProvider` (T051, T052), esta
 * estrategia NO depende de la ambigüedad B2 (contrato de callback OAuth):
 * el contrato de `POST /api/auth/login` está completamente especificado
 * (ver tasks.md T050: "estrategia mail/contraseña, no afectado por B2").
 *
 * El token de sesión se setea como cookie `httpOnly` en la respuesta; este
 * módulo nunca lo lee ni lo manipula directamente (Principio de
 * `httpClient`: `credentials: 'include'`).
 */

interface LoginResponseDto {
  usuario: {
    id: string
    nombre: string
    apellido: string
    fotoUrl: string | null
  }
}

function mapearUsuario(dto: LoginResponseDto['usuario']): Usuario {
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
 * Inicia sesión con mail y contraseña (`POST /api/auth/login`).
 *
 * Ante `401 { codigo: "CREDENCIALES_INVALIDAS" }`, `httpClient` lanza
 * `ApiError`; el mensaje genérico ante credenciales incorrectas (FR-027)
 * se muestra en la capa de presentación (`LoginPage`, T054), sin exponer
 * el campo específico.
 */
async function iniciarSesion(email: string, password: string): Promise<Usuario> {
  const dto = await httpClient.post<LoginResponseDto>('/auth/login', { email, password })
  return mapearUsuario(dto.usuario)
}

export const mailPasswordProvider = {
  iniciarSesion,
}
