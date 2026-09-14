import { TipoFiltro } from './enums/TipoFiltro'
import type { TipoContenido } from './enums/TipoContenido'

/**
 * Representa el conjunto de criterios de búsqueda activos en la pantalla
 * Descubrir. Encapsula la serialización hacia parámetros de consulta de la
 * API, evitando que cada componente construya el query string manualmente
 * (Principio IV).
 *
 * Fuente de verdad: specs/001-user-interactions/data-model.md (Entidad
 * `Filtro`) y specs/001-user-interactions/spec.md (FR-013, FR-015,
 * FR-018).
 *
 * Nota de diseño: los métodos de mutación (`quitarFiltro`) retornan una
 * nueva instancia inmutable en vez de mutar el objeto, siguiendo la misma
 * convención que `Publicacion` y `Usuario`.
 */
export class Filtro {
  readonly texto: string | null
  readonly estilo: string | null
  readonly tecnica: string | null
  readonly tipoContenido: TipoContenido | null
  readonly distanciaKm: number | null
  readonly geolocalizacionActiva: boolean

  constructor(datos: {
    texto: string | null
    estilo: string | null
    tecnica: string | null
    tipoContenido: TipoContenido | null
    distanciaKm: number | null
    geolocalizacionActiva: boolean
  }) {
    this.texto = datos.texto
    this.estilo = datos.estilo
    this.tecnica = datos.tecnica
    this.tipoContenido = datos.tipoContenido
    this.distanciaKm = datos.distanciaKm
    this.geolocalizacionActiva = datos.geolocalizacionActiva
  }

  /**
   * `true` solo si `geolocalizacionActiva === true`. FR-018, US-3 AC-03.8,
   * CB-10.
   */
  distanciaHabilitada(): boolean {
    return this.geolocalizacionActiva === true
  }

  /**
   * `true` si al menos un campo (excepto `texto`) no es `null`. Determina
   * si se muestran chips de filtro (FR-015).
   */
  tieneAlgunFiltroActivo(): boolean {
    return (
      this.estilo !== null ||
      this.tecnica !== null ||
      this.tipoContenido !== null ||
      this.distanciaKm !== null
    )
  }

  /**
   * Devuelve la lista de filtros activos representables como chips
   * removibles (US-3 AC-03.4), excluyendo el texto libre.
   */
  listaDeChips(): { tipo: TipoFiltro; etiqueta: string }[] {
    const chips: { tipo: TipoFiltro; etiqueta: string }[] = []

    if (this.estilo !== null) {
      chips.push({ tipo: TipoFiltro.ESTILO, etiqueta: this.estilo })
    }
    if (this.tecnica !== null) {
      chips.push({ tipo: TipoFiltro.TECNICA, etiqueta: this.tecnica })
    }
    if (this.tipoContenido !== null) {
      chips.push({ tipo: TipoFiltro.TIPO_CONTENIDO, etiqueta: this.tipoContenido })
    }
    if (this.distanciaKm !== null) {
      chips.push({ tipo: TipoFiltro.DISTANCIA, etiqueta: `${this.distanciaKm} km` })
    }

    return chips
  }

  /**
   * Retorna copia con ese campo en `null` (US-3 AC-03.4).
   */
  quitarFiltro(tipo: TipoFiltro): Filtro {
    switch (tipo) {
      case TipoFiltro.ESTILO:
        return new Filtro({ ...this, estilo: null })
      case TipoFiltro.TECNICA:
        return new Filtro({ ...this, tecnica: null })
      case TipoFiltro.TIPO_CONTENIDO:
        return new Filtro({ ...this, tipoContenido: null })
      case TipoFiltro.DISTANCIA:
        return new Filtro({ ...this, distanciaKm: null })
      default:
        return new Filtro({ ...this })
    }
  }

  /**
   * Serializa los campos no nulos a parámetros de query para la API
   * (nunca filtra en memoria). FR-013, Principio VIII.
   *
   * `distanciaKm` solo se incluye si la geolocalización está activa
   * (`distanciaHabilitada()`), consistente con FR-018.
   */
  aQueryParams(): Record<string, string> {
    const params: Record<string, string> = {}

    if (this.texto !== null) {
      params.texto = this.texto
    }
    if (this.estilo !== null) {
      params.estilo = this.estilo
    }
    if (this.tecnica !== null) {
      params.tecnica = this.tecnica
    }
    if (this.tipoContenido !== null) {
      params.tipoContenido = this.tipoContenido
    }
    if (this.distanciaKm !== null && this.distanciaHabilitada()) {
      params.distanciaKm = String(this.distanciaKm)
    }

    return params
  }
}
