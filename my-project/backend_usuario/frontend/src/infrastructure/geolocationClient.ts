/**
 * Wrapper de `navigator.geolocation` para uso exclusivo desde la capa de
 * `services/` (Principio III: ningún componente de presentación accede a
 * APIs del navegador directamente).
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-017/FR-018,
 * CB-10 — filtro de distancia deshabilitado sin geolocalización activada) y
 * `.env.example` (`VITE_ENABLE_GEOLOCATION`).
 */

export interface Coordenadas {
  latitud: number
  longitud: number
}

/**
 * Error uniforme lanzado por `geolocationClient` ante fallas al obtener la
 * posición (permiso denegado, no disponible, timeout, etc.).
 */
export class GeolocationError extends Error {
  readonly code: number

  constructor(message: string, code: number) {
    super(message)
    this.name = 'GeolocationError'
    this.code = code
  }
}

/**
 * `true` si el navegador soporta la API de geolocalización.
 */
function estaSoportada(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator
}

/**
 * Solicita la posición actual del usuario. Rechaza con `GeolocationError` si
 * la API no está soportada, el permiso fue denegado, o la solicitud falla.
 */
function obtenerPosicionActual(): Promise<Coordenadas> {
  if (!estaSoportada()) {
    return Promise.reject(
      new GeolocationError('La geolocalización no está soportada en este navegador', 0),
    )
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        resolve({
          latitud: posicion.coords.latitude,
          longitud: posicion.coords.longitude,
        })
      },
      (error) => {
        reject(new GeolocationError(error.message, error.code))
      },
    )
  })
}

export const geolocationClient = {
  estaSoportada,
  obtenerPosicionActual,
}
