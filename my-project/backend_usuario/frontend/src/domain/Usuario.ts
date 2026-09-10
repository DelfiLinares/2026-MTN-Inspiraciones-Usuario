import { RolUsuario } from './enums/RolUsuario'

/**
 * Representa a un usuario registrado (rol único USER en este módulo).
 * Encapsula el estado de sesión y la relación de "seguir" respecto a otros
 * usuarios.
 *
 * Fuente de verdad: specs/001-user-interactions/data-model.md
 *
 * Nota de diseño: los métodos de mutación (aplicarSeguirOptimista,
 * aplicarDejarDeSeguirOptimista, revertirCambioSeguimiento) retornan una nueva
 * instancia inmutable en vez de mutar el objeto, para facilitar su uso directo
 * como valor de estado en React (setState) sin efectos colaterales inesperados.
 */
export class Usuario {
  readonly id: string
  readonly nombre: string
  readonly apellido: string
  readonly bio: string | null
  readonly fotoUrl: string | null
  readonly rol: RolUsuario
  readonly cantidadSeguidores: number
  readonly sigoAEsteUsuario: boolean

  constructor(datos: {
    id: string
    nombre: string
    apellido: string
    bio: string | null
    fotoUrl: string | null
    rol: RolUsuario
    cantidadSeguidores: number
    sigoAEsteUsuario: boolean
  }) {
    this.id = datos.id
    this.nombre = datos.nombre
    this.apellido = datos.apellido
    this.bio = datos.bio
    this.fotoUrl = datos.fotoUrl
    this.rol = datos.rol
    this.cantidadSeguidores = datos.cantidadSeguidores
    this.sigoAEsteUsuario = datos.sigoAEsteUsuario
  }

  /**
   * `true` si este usuario es el mismo que el usuario actualmente autenticado.
   * Base de las reglas de UI (ocultar "Seguir", habilitar edición).
   */
  esPropio(usuarioActualId: string): boolean {
    return this.id === usuarioActualId
  }

  /**
   * `false` si es el perfil propio o si el visitante no está autenticado.
   * FR-040, US-8 AC-08.5
   */
  puedeVerBotonSeguir(usuarioActualId: string, estaAutenticado: boolean): boolean {
    if (!estaAutenticado) {
      return false
    }
    return !this.esPropio(usuarioActualId)
  }

  /**
   * Retorna una copia con `sigoAEsteUsuario = true` y `cantidadSeguidores + 1`,
   * sin llamar a la API. FR-042, US-8 AC-08.3
   */
  aplicarSeguirOptimista(): Usuario {
    return new Usuario({
      ...this,
      sigoAEsteUsuario: true,
      cantidadSeguidores: this.cantidadSeguidores + 1,
    })
  }

  /**
   * Retorna una copia inversa a `aplicarSeguirOptimista`. FR-042
   */
  aplicarDejarDeSeguirOptimista(): Usuario {
    return new Usuario({
      ...this,
      sigoAEsteUsuario: false,
      cantidadSeguidores: Math.max(0, this.cantidadSeguidores - 1),
    })
  }

  /**
   * Restaura el estado anterior ante error de API. FR-042, US-8 AC-08.4
   */
  revertirCambioSeguimiento(previo: Usuario): Usuario {
    return new Usuario({ ...previo })
  }
}
