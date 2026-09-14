/**
 * Cliente HTTP único de la aplicación (wrapper delgado sobre `fetch` nativo).
 *
 * Fuente de verdad: specs/001-user-interactions/research.md (sección
 * "Cliente HTTP: fetch nativo vs. Axios") y
 * specs/001-user-interactions/plan.md.
 *
 * Centraliza:
 * - Base URL configurable vía `VITE_API_BASE_URL`.
 * - Envío de credenciales (`credentials: 'include'`) para que el navegador
 *   adjunte automáticamente la cookie de sesión (FR de autenticación).
 * - Manejo uniforme de errores HTTP mediante `ApiError`.
 * - Soporte de cancelación de requests vía `AbortController` (CB-02).
 *
 * Principio III: ningún componente de presentación debe invocar `fetch`
 * directamente; toda comunicación con el backend pasa por este módulo.
 */

export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

/**
 * Error uniforme lanzado por `httpClient` ante respuestas HTTP no exitosas
 * o fallas de red, para que las capas superiores (`services/`) manejen los
 * errores de forma consistente sin depender de los detalles de `fetch`.
 */
export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export interface HttpRequestOptions {
  /** Query params, headers o cuerpo adicionales a fusionar con los por defecto. */
  headers?: Record<string, string>
  /** Señal para cancelar la request (ver `AbortController`). */
  signal?: AbortSignal
}

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return response.json().catch(() => null)
  }
  return response.text().catch(() => null)
}

async function request<T>(
  path: string,
  init: RequestInit,
  options: HttpRequestOptions = {},
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    signal: options.signal,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
      ...init.headers,
    },
  })

  const body = await parseBody(response)

  if (!response.ok) {
    throw new ApiError(
      `Error HTTP ${response.status} al solicitar ${path}`,
      response.status,
      body,
    )
  }

  return body as T
}

export const httpClient = {
  get<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return request<T>(path, { method: 'GET' }, options)
  },

  post<T>(path: string, data?: unknown, options?: HttpRequestOptions): Promise<T> {
    return request<T>(
      path,
      { method: 'POST', body: data !== undefined ? JSON.stringify(data) : undefined },
      options,
    )
  },

  patch<T>(path: string, data?: unknown, options?: HttpRequestOptions): Promise<T> {
    return request<T>(
      path,
      { method: 'PATCH', body: data !== undefined ? JSON.stringify(data) : undefined },
      options,
    )
  },

  put<T>(path: string, data?: unknown, options?: HttpRequestOptions): Promise<T> {
    return request<T>(
      path,
      { method: 'PUT', body: data !== undefined ? JSON.stringify(data) : undefined },
      options,
    )
  },

  delete<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return request<T>(path, { method: 'DELETE' }, options)
  },
}
