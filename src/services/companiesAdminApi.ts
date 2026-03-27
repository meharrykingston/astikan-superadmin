import { apiGet, apiPost } from "./api"

export type CompanyAdminRecord = {
  id: string
  name: string
  hrName: string
  email: string
  phone: string
  status: string
}

export type CompanyAdminMeta = {
  total: number
  active: number
  pending: number
  inactive: number
}

export type CompaniesAdminResponse = {
  rows: CompanyAdminRecord[]
  meta: CompanyAdminMeta
}

export function fetchCompaniesAdmin(limit = 50, offset = 0) {
  return apiGet<CompaniesAdminResponse>(`/superadmin/companies?limit=${limit}&offset=${offset}`)
}

export type RegisterCompanyPayload = {
  name: string
  email?: string
  contact_name?: string
  contact_phone?: string
  billing_email?: string
  employee_count?: number
  plan?: string
  requested_credits?: number
}

export function registerCompany(payload: RegisterCompanyPayload) {
  return apiPost<{ companyId: string }, RegisterCompanyPayload>("/companies/register", payload)
}
