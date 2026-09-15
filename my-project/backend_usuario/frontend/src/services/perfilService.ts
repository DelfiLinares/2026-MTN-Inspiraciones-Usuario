import { ApiError, BASE_URL, httpClient } from '../infrastructure/httpClient'
import { Usuario } from '../domain/Usuario'
import { RolUsuario } from '../domain/enums/RolUsuario'

/**
 * Servicio de aplicación para la visualización y edición de perfil de
 * usuario (HU-06).
 *
 * Fuente de verdad: specs/001-user-interactions/contracts/api-contracts.md
 * (sección "6. Perfil y edición (HU-06)") y specs/001-user-interactions/spec.md
 * (FR-035..FR-039).
 *
 * Expone:
 * - `obtenerUsuario`: `GET /api/usuarios/{id}`, mapea al dominio `Usuario`
 *   (T011) para reutilizar `esPropio()`/`puedeVerBotonSeguir()` en
 *   `PerfilPage` (T065).
 * - `actualizarPerfil`: `PATCH /api/usuarios/me` — **B7 confirmado**: los
 *   campos editables son `usuario`, `fotoUrl`, `bannerUrl`, `mail`, fecha de
 *   nacimiento separada en día/mes/año y `redesSociales` (array dinámico,
 *   por defecto hasta 3 entradas con posibilidad de agregar más). La
 *   contraseña **no** se edita en este endpoint: se edita en el flujo
 *   separado `POST /api/auth/cambiar-password` /
 *   `POST /api/auth/recuperar-password` (fuera del alcance de esta tarea).
 *
 *   Cuando se incluye `foto` y/o `banner`, el contrato exige
 *   `multipart/form-data`; dado que `httpClient` únicamente serializa JSON
 *   (ver `infrastructure/httpClient.ts`), en ese caso se envía la request
 *   directamente con `fetch` nativo y `FormData`, siguiendo el mismo patrón
 *   ya establecido en `publicacionService.crearPublicacion` para subidas de
 *   archivos. Si no se incluyen archivos, se usa `httpClient.patch` con
 *   cuerpo JSON.
 */

interface UsuarioDto {
  id: string
  nombre: string
  apellido: string
  bio: string | null
  fotoUrl: string | null
  rol: string
  cantidadSeguidores: number
  sigoAEsteUsuario: boolean
}

function mapearUsuario(dto: UsuarioDto): Usuario {
  return new Usuario({
    id: dto.id,
    nombre: dto.nombre,
    apellido: dto.apellido,
    bio: dto.bio,
    fotoUrl: dto.fotoUrl,
    rol: dto.rol as RolUsuario,
    cantidadSeguidores: dto.cantidadSeguidores,
    sigoAEsteUsuario: dto.sigoAEsteUsuario,
  })
}

/**
 * Obtiene los datos públicos de un usuario (propio o ajeno), incluyendo
 * `sigoAEsteUsuario` cuando aplica.
 */
async function obtenerUsuario(id: string): Promise<Usuario> {
  const dto = await httpClient.get<UsuarioDto>(`/usuarios/${id}`)
  return mapearUsuario(dto)
}

/**
 * Campos editables del perfil del usuario autenticado (B7 confirmado).
 * La contraseña se excluye deliberadamente: se edita en un flujo separado.
 */
export interface DatosEdicionPerfil {
  usuario: string
  bio: string
  mail: string
  diaNacimiento: number
  mesNacimiento: number
  anioNacimiento: number
  redesSociales: string[]
  foto?: File
  banner?: File
}

/**
 * Envía la request `multipart/form-data` con `fetch` nativo, dado que
 * `httpClient` no soporta `FormData` (siempre serializa JSON). Mantiene el
 * mismo manejo de errores (`ApiError`) que `httpClient` para que las capas
 * superiores no deban distinguir el mecanismo de transporte usado.
 */
async function enviarActualizacionMultipart(datos: DatosEdicionPerfil): Promise<UsuarioDto> {
  const formData = new FormData()
  formData.append('usuario', datos.usuario)
  formData.append('bio', datos.bio)
  formData.append('mail', datos.mail)
  formData.append('diaNacimiento', String(datos.diaNacimiento))
  formData.append('mesNacimiento', String(datos.mesNacimiento))
  formData.append('anioNacimiento', String(datos.anioNacimiento))
  datos.redesSociales.forEach((red) => formData.append('redesSociales', red))
  if (datos.foto) {
    formData.append('foto', datos.foto)
  }
  if (datos.banner) {
    formData.append('banner', datos.banner)
  }

  const response = await fetch(`${BASE_URL}/usuarios/me`, {
    method: 'PATCH',
    credentials: 'include',
    body: formData,
  })

  const contentType = response.headers.get('content-type') ?? ''
  const body = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null)

  if (!response.ok) {
    throw new ApiError('Error HTTP al actualizar el perfil', response.status, body)
  }

  return body as UsuarioDto
}

/**
 * Actualiza el perfil del usuario autenticado (FR-035..FR-039, B7). Usa
 * `multipart/form-data` si se adjunta `foto` y/o `banner`; de lo contrario
 * envía JSON mediante `httpClient.patch`.
 */
async function actualizarPerfil(datos: DatosEdicionPerfil): Promise<Usuario> {
  const tieneArchivos = Boolean(datos.foto || datos.banner)

  if (tieneArchivos) {
    const dto = await enviarActualizacionMultipart(datos)
    return mapearUsuario(dto)
  }

  const dto = await httpClient.patch<UsuarioDto>('/usuarios/me', {
    usuario: datos.usuario,
    bio: datos.bio,
    mail: datos.mail,
    diaNacimiento: datos.diaNacimiento,
    mesNacimiento: datos.mesNacimiento,
    anioNacimiento: datos.anioNacimiento,
    redesSociales: datos.redesSociales,
  })
  return mapearUsuario(dto)
}

export const perfilService = {
  obtenerUsuario,
  actualizarPerfil,
}
