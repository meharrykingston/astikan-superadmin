import { apiDelete, apiGet, apiPost } from "./api"

export type CompanyAdminRecord = {
  id: string
  name: string
  hrName: string
  email: string
  phone: string
  companyCode: string
  username: string
  password: string
  applicationId?: string
  metadata?: Record<string, unknown>
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

export type CorporateRegistrationPayload = {
  companyName: string
  pan: string
  gstNo: string
  address: string
  entityType: string
  incorporationDate: string
  employeeCount?: number
  referralCode?: string
  contactName: string
  contactEmail: string
  contactPhone: string
  documents: {
    gst: { name: string; type: string; size: number; dataUrl: string }
    pan: { name: string; type: string; size: number; dataUrl: string }
    incorporation: { name: string; type: string; size: number; dataUrl: string }
    insurer?: { name: string; type: string; size: number; dataUrl: string } | null
    msme?: { name: string; type: string; size: number; dataUrl: string } | null
    labourCompliance?: { name: string; type: string; size: number; dataUrl: string } | null
  }
  authorizedSignature: { name: string; type: string; size: number; dataUrl: string }
  signedAgreement: { name: string; type: string; size: number; dataUrl: string }
  agreementText: string
}

export type CorporateRegistrationResponse = {
  applicationId: string
  companyId: string
  status: string
  submittedAt: string
}

export function submitCorporateRegistration(payload: CorporateRegistrationPayload) {
  return apiPost<CorporateRegistrationResponse, CorporateRegistrationPayload>("/corporate/registrations", payload)
}

export function deleteCompanyAdmin(id: string) {
  return apiDelete<{ id: string }>(`/superadmin/companies/${id}`, {})
}

export type ApproveCompanyPayload = {
  transactionId?: string
  chequeUpload?: { name?: string; type?: string; size?: number; dataUrl?: string } | null
  paymentNotes?: string
}

export type ApproveCompanyResponse = {
  id: string
  companyCode: string
  username: string
  password: string
  status: string
}

export function approveCompanyAdmin(id: string, payload: ApproveCompanyPayload) {
  return apiPost<ApproveCompanyResponse, ApproveCompanyPayload>(`/superadmin/companies/${id}/approve`, payload)
}
