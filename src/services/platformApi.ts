import { apiGet, apiPost, apiPut } from './api'

export function fetchPlatformLogs(query?: { service?: string; severity?: string; module?: string; search?: string; limit?: number }) {
  const params = new URLSearchParams()
  if (query?.service) params.set('service', query.service)
  if (query?.severity) params.set('severity', query.severity)
  if (query?.module) params.set('module', query.module)
  if (query?.search) params.set('search', query.search)
  if (query?.limit) params.set('limit', String(query.limit))
  const suffix = params.toString() ? `?${params.toString()}` : ''
  return apiGet<any[]>(`/logs${suffix}`)
}

export function fetchIntegrations() {
  return apiGet<{ providers: any[]; logs: any[] }>('/integrations/providers')
}

export function updateIntegration(providerKey: string, body: any) {
  return apiPut<{ providerKey: string }, any>(`/integrations/providers/${providerKey}`, body)
}

export function reloadIntegration(providerKey: string) {
  return apiPost<{ runId: string; providerKey: string }, Record<string, never>>(`/integrations/providers/${providerKey}/reload`, {})
}

export function testIntegration(providerKey: string) {
  return apiPost<{ runId: string; providerKey: string }, Record<string, never>>(`/integrations/providers/${providerKey}/test`, {})
}
