const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ?? '/api'

type ApiEnvelope<T> = {
  status: 'ok' | 'error'
  data?: T
  message?: string
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const headers: HeadersInit = { ...(init.headers ?? {}) }
  if (init.body && !(init.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...init,
  })
  const raw = await response.text()
  const payload = raw.trim() ? (JSON.parse(raw) as ApiEnvelope<T>) : null
  if (!response.ok || !payload || payload.status !== 'ok' || typeof payload.data === 'undefined') {
    throw new Error(payload?.message || response.statusText || 'Request failed')
  }
  return payload.data
}

export function apiGet<T>(path: string) {
  return request<T>(path, { method: 'GET' })
}

export function apiPost<T, B>(path: string, body: B) {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

export function apiPut<T, B>(path: string, body: B) {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) })
}

export function apiDelete<T>(path: string, body: Record<string, unknown> = {}) {
  return request<T>(path, { method: 'DELETE', body: JSON.stringify(body) })
}
