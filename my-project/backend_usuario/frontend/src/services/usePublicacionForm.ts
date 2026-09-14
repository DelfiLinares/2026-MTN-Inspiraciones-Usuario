/**
 * Servicio de aplicación para el formulario de nueva publicación.
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-007: bloqueo de
 * envío sin archivo adjunto; FR-012: "El sistema DEBE conservar los datos
 * ingresados en el formulario de publicación cuando el envío falla,
 * mostrando un mensaje de error descriptivo").
 *
 * `puedeEnviarPublicacion` (T034) cubre exclusivamente la regla de bloqueo
 * de envío sin archivo adjunto. `usePublicacionForm` (T038) implementa el
 * estado completo del formulario (archivo, tipo de contenido, tags,
 * progreso de subida) y conserva los datos ingresados ante un error de
 * envío (FR-012), delegando la subida a `crearPublicacion` (T037).
 */

import { useCallback, useState } from 'react'
import type { TipoContenido } from '../domain/enums/TipoContenido'
import type { Publicacion } from '../domain/Publicacion'
import { crearPublicacion } from './publicacionService'

/**
 * `true` si el formulario puede enviarse: requiere al menos un archivo
 * adjunto. FR-007
 */
export function puedeEnviarPublicacion(archivo: File | null): boolean {
  return archivo !== null
}

export interface EstadoPublicacionForm {
  archivo: File | null
  tipoContenido: TipoContenido | null
  tagIds: string[]
  enviando: boolean
  porcentajeProgreso: number
  error: string | null
}

const ESTADO_INICIAL: EstadoPublicacionForm = {
  archivo: null,
  tipoContenido: null,
  tagIds: [],
  enviando: false,
  porcentajeProgreso: 0,
  error: null,
}

export interface UsePublicacionFormResult {
  estado: EstadoPublicacionForm
  /** `true` si el formulario puede enviarse (FR-007). */
  puedeEnviar: boolean
  establecerArchivo: (archivo: File | null) => void
  establecerTipoContenido: (tipoContenido: TipoContenido | null) => void
  establecerTags: (tagIds: string[]) => void
  /** Envía el formulario. Ante error, conserva los datos ingresados y expone
   * un mensaje descriptivo en `estado.error` (FR-012). */
  enviar: () => Promise<Publicacion | null>
}

/**
 * Estado y envío del formulario de nueva publicación (US-2). Ante un error
 * de envío, conserva `archivo`, `tipoContenido` y `tagIds` (FR-012) y
 * expone un mensaje de error descriptivo; solo se reinicia el estado tras
 * un envío exitoso.
 */
export function usePublicacionForm(): UsePublicacionFormResult {
  const [estado, setEstado] = useState<EstadoPublicacionForm>(ESTADO_INICIAL)

  const establecerArchivo = useCallback((archivo: File | null) => {
    setEstado((actual) => ({ ...actual, archivo, error: null }))
  }, [])

  const establecerTipoContenido = useCallback((tipoContenido: TipoContenido | null) => {
    setEstado((actual) => ({ ...actual, tipoContenido, error: null }))
  }, [])

  const establecerTags = useCallback((tagIds: string[]) => {
    setEstado((actual) => ({ ...actual, tagIds, error: null }))
  }, [])

  const enviar = useCallback(async (): Promise<Publicacion | null> => {
    const { archivo, tipoContenido, tagIds } = estado

    if (archivo === null || tipoContenido === null || !puedeEnviarPublicacion(archivo)) {
      setEstado((actual) => ({
        ...actual,
        error: 'Adjuntá un archivo para poder publicar.',
      }))
      return null
    }

    setEstado((actual) => ({ ...actual, enviando: true, error: null, porcentajeProgreso: 0 }))

    try {
      const { publicacion } = await crearPublicacion(
        {
          archivo,
          tipoContenido,
          tagIds,
        },
        (porcentajeProgreso) => {
          setEstado((actual) => ({ ...actual, porcentajeProgreso }))
        },
      )

      // Envío exitoso (FR-011/FR-012): se reinicia el estado del formulario.
      setEstado(ESTADO_INICIAL)
      return publicacion
    } catch {
      // FR-012: conservar los datos ingresados y mostrar un mensaje de
      // error descriptivo ante un envío fallido.
      setEstado((actual) => ({
        ...actual,
        enviando: false,
        porcentajeProgreso: 0,
        error: 'No se pudo publicar. Verificá el archivo y volvé a intentarlo.',
      }))
      return null
    }
  }, [estado])

  return {
    estado,
    puedeEnviar: puedeEnviarPublicacion(estado.archivo),
    establecerArchivo,
    establecerTipoContenido,
    establecerTags,
    enviar,
  }
}

export const usePublicacionFormReglas = {
  puedeEnviarPublicacion,
}

