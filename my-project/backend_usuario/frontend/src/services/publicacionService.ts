import { useCallback, useRef, useState } from 'react'
import { httpClient } from '../infrastructure/httpClient'
import { Publicacion } from '../domain/Publicacion'

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

export const publicacionService = {
  useLikePublicacion,
}
