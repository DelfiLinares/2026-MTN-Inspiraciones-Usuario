import { httpClient, ApiError } from './httpClient'
import { Usuario } from '../domain/Usuario'
import { RolUsuario } from '../domain/enums/RolUsuario'

/**
 * Verificación de sesión contra el backend (`GET /api/auth/me`).
 *
 * Fuente de verdad: specs/001-user-interactions/research.md (sección
 * "Almacenamiento del token de sesión").
 *
 * El token de sesión se almacena en una cookie `httpOnly` seteada por el
 * backend; este módulo NO lee ni manipula el token directamente desde
 * JavaScript. El estado "¿está logueado?" se deriva exclusivamente de la
 * respuesta de este endpoint, llamado al montar la aplicación.
 */

interface UsuarioActualDto {
  id: string
  nombre: string
  apellido: string
  bio: string | null
  fotoUrl: string | null
  cantidadSeguidores: number
}

function mapearUsuarioActual(dto: UsuarioActualDto): Usuario {
  return new Usuario({
    id: dto.id,
    nombre: dto.nombre,
    apellido: dto.apellido,
    bio: dto.bio,
    fotoUrl: dto.fotoUrl,
    rol: RolUsuario.USER,
    cantidadSeguidores: dto.cantidadSeguidores,
    sigoAEsteUsuario: false,
  })
}

/**
 * Consulta `GET /api/auth/me` para verificar si existe una sesión activa.
 * Retorna el `Usuario` autenticado, o `null` si no hay sesión (401), sin
 * lanzar error en ese caso. Ante cualquier otro error HTTP o de red, la
 * excepción se propaga para que la capa de servicios decida cómo manejarla.
 */
async function verificarSesion(): Promise<Usuario | null> {
  try {
    const dto = await httpClient.get<UsuarioActualDto>('/auth/me')
    return mapearUsuarioActual(dto)
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null
    }
    throw error
  }
}

export const tokenStorage = {
  verificarSesion,
}
