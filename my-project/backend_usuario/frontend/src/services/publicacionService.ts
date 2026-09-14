import { useCallback, useRef, useState } from 'react'
import { httpClient, ApiError, BASE_URL } from '../infrastructure/httpClient'
import { Publicacion } from '../domain/Publicacion'
import type { TipoContenido } from '../domain/enums/TipoContenido'
import type { EstadoPublicacion } from '../domain/enums/EstadoPublicacion'

/** 
 * Servicio de aplicación para publicaciones.
 *
 * Fuente de verdad: specs/001-user-interactions/contracts/api-contracts.md
 * (sección "2. Publicaciones — Like y Reporte") y
 * specs/001-user-interactions/spec.md (FR-001, FR-002, CB-02).
 * 
 * `useLikePublicacion` aplica la actualización optimista de
 * `Publicacion.aplicarLikeOptimista()`/`revertirLikeOptimista()` (T013) y
 * llama a `POST`/`DELETE /api/publicaciones/{id}/like`. Serializa clics
 * rápidos (CB-02) cancelando la request en curso vía `AbortController` antes
 * de disparar la siguiente, para que solo la última acción del usuario
 * determine el estado final.
 */

interface LikeResponseDto {
  cantidadLikes: number
}

export interface UseLikePublicacionResult {
  /** Publicación con el estado de like más reciente (optimista o confirmado). */
  publicacion: Publicacion
  /** `true` mientras hay una solicitud de like/unlike en curso. */
  enviando: boolean
  /** Alterna el estado de like de la publicación actual. */
  alternarLike: () => Promise<void>
}

export function useLikePublicacion(publicacionInicial: Publicacion): UseLikePublicacionResult {
  const [publicacion, setPublicacion] = useState(publicacionInicial)
  const [enviando, setEnviando] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const alternarLike = useCallback(async () => {
    // CB-02: cancela cualquier solicitud de like/unlike en curso antes de
    // iniciar la siguiente, para serializar clics rápidos.
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    const anterior = publicacion
    const yaLikeada = anterior.likeadaPorMi

    // Aplica el cambio optimista correspondiente a la acción solicitada
    // (FR-001, US-1 AC-01.3), sin esperar la respuesta de la API.
    const optimista = yaLikeada ? anterior.revertirLikeOptimista() : anterior.aplicarLikeOptimista()
    setPublicacion(optimista)
    setEnviando(true)

    try {
      const dto = yaLikeada
        ? await httpClient.delete<LikeResponseDto>(`/publicaciones/${anterior.id}/like`, {
            signal: controller.signal,
          })
        : await httpClient.post<LikeResponseDto>(
            `/publicaciones/${anterior.id}/like`,
            undefined,
            { signal: controller.signal },
          )

      setPublicacion(
        (actual) => new Publicacion({ ...actual, cantidadLikes: dto.cantidadLikes }),
      )
    } catch (error) {
      if (controller.signal.aborted) {
        return
      }
      // FR-002: revertir el estado de like ante error de API.
      setPublicacion(anterior)
      throw error
    } finally {
      if (!controller.signal.aborted) {
        setEnviando(false)
      }
    }
  }, [publicacion])

  return { publicacion, enviando, alternarLike }
}

/**
 * DTO de respuesta de `POST /api/publicaciones` (contract, sección "3.
 * Publicaciones — Creación con tags").
 */
interface PublicacionCreadaDto {
  id: string
  autorId: string
  tipoContenido: TipoContenido
  estado: EstadoPublicacion
  tags: string[]
  urlContenido: string
  cantidadLikes: number
  likeadaPorMi: boolean
  reportadaPorMi: boolean
  creadaEn: string
}

function mapearPublicacionCreada(dto: PublicacionCreadaDto): Publicacion {
  return new Publicacion({
    id: dto.id,
    autorId: dto.autorId,
    tipoContenido: dto.tipoContenido,
    estado: dto.estado,
    tags: dto.tags,
    urlContenido: dto.urlContenido,
    cantidadLikes: dto.cantidadLikes,
    likeadaPorMi: dto.likeadaPorMi,
    reportadaPorMi: dto.reportadaPorMi,
    creadaEn: new Date(dto.creadaEn),
  })
}

export interface DatosNuevaPublicacion {
  archivo: File
  tipoContenido: TipoContenido
  tagIds: string[]
}

/**
 * Resultado de `crearPublicacion`: expone el estado y el porcentaje de
 * progreso de la subida (FR-009) como valor de retorno. La barra de
 * progreso visual se implementa en T040; este servicio solo entrega los
 * datos necesarios para construirla.
 */
export interface ResultadoCrearPublicacion {
  publicacion: Publicacion
  porcentajeProgreso: number
}

/**
 * Crea una publicación subiendo el archivo asociado (multipart/form-data)
 * a `POST /api/publicaciones` (FR-009, US-2).
 *
 * `fetch` nativo no expone eventos de progreso de subida, por lo que se usa
 * `XMLHttpRequest` únicamente en esta función (httpClient.ts permanece
 * exclusivamente basado en `fetch` para el resto de operaciones JSON).
 *
 * @param onProgreso callback opcional invocado con el porcentaje (0-100)
 * de avance de la subida.
 */
export async function crearPublicacion(
  datos: DatosNuevaPublicacion,
  onProgreso?: (porcentajeProgreso: number) => void,
): Promise<ResultadoCrearPublicacion> {
  const formData = new FormData()
  formData.append('archivo', datos.archivo)
  formData.append('tipoContenido', datos.tipoContenido)
  datos.tagIds.forEach((tagId) => formData.append('tagIds', tagId))

  return new Promise<ResultadoCrearPublicacion>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${BASE_URL}/publicaciones`)
    xhr.withCredentials = true

    xhr.upload.addEventListener('progress', (evento) => {
      if (evento.lengthComputable) {
        const porcentaje = Math.round((evento.loaded / evento.total) * 100)
        onProgreso?.(porcentaje)
      }
    })

    xhr.addEventListener('load', () => {
      let body: unknown = null
      try {
        body = xhr.responseText ? JSON.parse(xhr.responseText) : null
      } catch {
        body = xhr.responseText
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        onProgreso?.(100)
        resolve({
          publicacion: mapearPublicacionCreada(body as PublicacionCreadaDto),
          porcentajeProgreso: 100,
        })
        return
      }

      reject(new ApiError(`Error al crear la publicación (status ${xhr.status})`, xhr.status, body))
    })

    xhr.addEventListener('error', () => {
      reject(new ApiError('Error de red al crear la publicación', 0, null))
    })

    xhr.addEventListener('abort', () => {
      reject(new ApiError('Subida de publicación cancelada', 0, null))
    })

    xhr.send(formData)
  })
}

export const publicacionService = {
  useLikePublicacion,
  crearPublicacion,
}

