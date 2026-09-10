import { EstadoPublicacion } from './enums/EstadoPublicacion'
import type { TipoContenido } from './enums/TipoContenido'
import type { Usuario } from './Usuario'

/**
 * Representa una publicación de contenido creada por un usuario. Encapsula
 * el estado de like propio, el estado de reporte propio, y todas las reglas
 * de habilitación de acciones sobre sí misma.
 *
 * Fuente de verdad: specs/001-user-interactions/data-model.md
 *
 * Nota de diseño: los métodos de mutación (aplicarLikeOptimista,
 * revertirLikeOptimista) retornan una nueva instancia inmutable en vez de
 * mutar el objeto, para facilitar su uso directo como valor de estado en
 * React (setState) sin efectos colaterales inesperados.
 */
export class Publicacion {
  readonly id: string
  readonly autorId: string
  readonly tipoContenido: TipoContenido
  readonly estado: EstadoPublicacion
  readonly tags: string[]
  readonly urlContenido: string
  readonly cantidadLikes: number
  readonly likeadaPorMi: boolean
  readonly reportadaPorMi: boolean
  readonly creadaEn: Date

  constructor(datos: {
    id: string
    autorId: string
    tipoContenido: TipoContenido
    estado: EstadoPublicacion
    tags: string[]
    urlContenido: string
    cantidadLikes: number
    likeadaPorMi: boolean
    reportadaPorMi: boolean
    creadaEn: Date
  }) {
    this.id = datos.id
    this.autorId = datos.autorId
    this.tipoContenido = datos.tipoContenido
    this.estado = datos.estado
    this.tags = datos.tags
    this.urlContenido = datos.urlContenido
    this.cantidadLikes = datos.cantidadLikes
    this.likeadaPorMi = datos.likeadaPorMi
    this.reportadaPorMi = datos.reportadaPorMi
    this.creadaEn = datos.creadaEn
  }

  /**
   * `autorId === usuarioActualId`. Base de las reglas de permisos.
   */
  esPropia(usuarioActualId: string): boolean {
    return this.autorId === usuarioActualId
  }

  /**
   * `false` si es propia, si no está autenticado, o si no está ACTIVA.
   * FR-003, FR-004, US-1 AC-01.5
   */
  puedeDarLike(usuarioActualId: string): boolean {
    if (!usuarioActualId) {
      return false
    }
    if (this.esPropia(usuarioActualId)) {
      return false
    }
    return this.estado === EstadoPublicacion.ACTIVA
  }

  /**
   * `false` si es propia, si ya fue reportada por mí, o si no está autenticado.
   * FR-021, FR-023, US-7 AC-04.2/04.6
   */
  puedeReportar(usuarioActualId: string): boolean {
    if (!usuarioActualId) {
      return false
    }
    if (this.esPropia(usuarioActualId)) {
      return false
    }
    return !this.reportadaPorMi
  }

  /**
   * `true` solo si el usuario actual es el autor.
   * (El frontend de usuario no contempla edición por ADMIN, ver Principio I).
   */
  puedeEditar(usuarioActual: Usuario): boolean {
    return usuarioActual.id === this.autorId
  }

  /**
   * Igual regla que `puedeEditar`.
   */
  puedeEliminar(usuarioActual: Usuario): boolean {
    return this.puedeEditar(usuarioActual)
  }

  /**
   * Retorna una copia con `likeadaPorMi = true` y `cantidadLikes + 1`,
   * sin llamar a la API. FR-001, US-1 AC-01.3
   */
  aplicarLikeOptimista(): Publicacion {
    return new Publicacion({
      ...this,
      likeadaPorMi: true,
      cantidadLikes: this.cantidadLikes + 1,
    })
  }

  /**
   * Retorna una copia revirtiendo el cambio de `aplicarLikeOptimista`.
   * FR-002, CB-02
   */
  revertirLikeOptimista(): Publicacion {
    return new Publicacion({
      ...this,
      likeadaPorMi: false,
      cantidadLikes: Math.max(0, this.cantidadLikes - 1),
    })
  }
}
