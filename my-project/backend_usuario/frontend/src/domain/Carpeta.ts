/**
 * Representa una carpeta personal de posts guardados. Pública en el
 * perfil del usuario dueño (clarificación de spec), con límite duro de
 * 100 carpetas por usuario.
 *
 * Fuente de verdad: specs/001-user-interactions/data-model.md (Entidad
 * `Carpeta`) y specs/001-user-interactions/spec.md (FR-043, FR-047,
 * US-9 AC-06).
 */
export class Carpeta {
  readonly id: string
  readonly nombre: string
  readonly propietarioId: string
  readonly cantidadPosts: number

  constructor(datos: {
    id: string
    nombre: string
    propietarioId: string
    cantidadPosts: number
  }) {
    this.id = datos.id
    this.nombre = datos.nombre
    this.propietarioId = datos.propietarioId
    this.cantidadPosts = datos.cantidadPosts
  }

  /**
   * `true` solo si el usuario actual es el propietario de la carpeta.
   * FR-043
   */
  puedeEliminar(usuarioActualId: string): boolean {
    return usuarioActualId !== '' && this.propietarioId === usuarioActualId
  }

  /**
   * Misma regla que `puedeEliminar()`. FR-043
   */
  puedeRenombrar(usuarioActualId: string): boolean {
    return this.puedeEliminar(usuarioActualId)
  }

  /**
   * Regla a nivel de colección (no de instancia): `false` si ya existen
   * 100 o más carpetas, para impedir superar el límite duro.
   * FR-047, US-9 AC-06
   */
  static puedeCrearNuevaCarpeta(carpetasActuales: Carpeta[]): boolean {
    return carpetasActuales.length < 100
  }
}
