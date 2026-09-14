import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hook de scroll infinito (FR-016), usado por `HomePage` y
 * `useDescubrirFiltros` para paginar resultados sin exponer detalles de
 * `IntersectionObserver` a los componentes de presentación.
 *
 * Fuente de verdad: specs/001-user-interactions/research.md (sección
 * "Scroll infinito vs. paginación clásica").
 *
 * El hook es agnóstico del servicio concreto: recibe una función
 * `cargarPagina` (paginación por cursor) y expone el estado (`items`,
 * `cargando`, `hayMas`, `error`) más una `ref` de "centinela" a asignar al
 * elemento final de la lista para disparar la carga de la siguiente
 * página cuando entra en el viewport.
 */
export interface PaginaResultado<T> {
  items: T[]
  siguienteCursor: string | null
}

export interface UseInfiniteListResult<T> {
  items: T[]
  cargando: boolean
  hayMas: boolean
  error: unknown
  /** Ref a asignar al elemento centinela (último de la lista renderizada). */
  centinelaRef: (nodo: Element | null) => void
}

export function useInfiniteList<T>(
  cargarPagina: (cursor: string | null) => Promise<PaginaResultado<T>>,
): UseInfiniteListResult<T> {
  const [items, setItems] = useState<T[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [hayMas, setHayMas] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const cargarPaginaRef = useRef(cargarPagina)
  cargarPaginaRef.current = cargarPagina

  const observerRef = useRef<IntersectionObserver | null>(null)
  const enCurso = useRef(false)

  const cargarSiguiente = useCallback(async () => {
    if (enCurso.current || !hayMas) {
      return
    }
    enCurso.current = true
    setCargando(true)
    setError(null)

    try {
      const resultado = await cargarPaginaRef.current(cursor)
      setItems((previos) => [...previos, ...resultado.items])
      setCursor(resultado.siguienteCursor)
      setHayMas(resultado.siguienteCursor !== null)
    } catch (errorCapturado) {
      setError(errorCapturado)
    } finally {
      setCargando(false)
      enCurso.current = false
    }
  }, [cursor, hayMas])

  useEffect(() => {
    cargarSiguiente()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const centinelaRef = useCallback(
    (nodo: Element | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      if (!nodo) {
        return
      }

      observerRef.current = new IntersectionObserver((entradas) => {
        if (entradas[0]?.isIntersecting) {
          cargarSiguiente()
        }
      })

      observerRef.current.observe(nodo)
    },
    [cargarSiguiente],
  )

  return { items, cargando, hayMas, error, centinelaRef }
}
