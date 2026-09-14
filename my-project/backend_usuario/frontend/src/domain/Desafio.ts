/**
 * Modelo de dominio mínimo de `Desafio`.
 *
 * Fuente de verdad: specs/001-user-interactions/data-model.md
 *
 * Referida transversalmente por pertenecer al mismo módulo de usuario
 * (pantalla "Desafíos"), fuera del detalle funcional de `spec.md` (que solo
 * cubre HU-01 a HU-09). Se modela aquí únicamente para respetar el Principio
 * III (toda entidad de dominio referida debe tener representación en la capa
 * de dominio) y soportar futuras specs sin romper la arquitectura de capas.
 *
 * El detalle completo de reglas de `Desafio` (participación, propuesta de
 * nuevos desafíos) queda fuera de alcance y deberá especificarse en un
 * documento de spec separado antes de planificar su implementación completa.
 */
export class Desafio {
  readonly id: string
  readonly titulo: string
  readonly descripcion: string
  readonly fechaInicio: Date
  readonly fechaFin: Date
  readonly participo: boolean

  constructor(datos: {
    id: string
    titulo: string
    descripcion: string
    fechaInicio: Date
    fechaFin: Date
    participo: boolean
  }) {
    this.id = datos.id
    this.titulo = datos.titulo
    this.descripcion = datos.descripcion
    this.fechaInicio = datos.fechaInicio
    this.fechaFin = datos.fechaFin
    this.participo = datos.participo
  }

  /**
   * `true` si `fechaActual` está entre `fechaInicio` y `fechaFin`.
   */
  estaVigente(fechaActual: Date): boolean {
    return fechaActual >= this.fechaInicio && fechaActual <= this.fechaFin
  }
}
