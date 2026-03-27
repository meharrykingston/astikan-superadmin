import { apiGet, apiPut, apiPost, apiDelete } from "./api"

export type DoctorAdminRecord = {
  id: string
  name: string
  username: string
  password: string
  email: string
  phone: string
  specialty: string
  status: string
  image: string | null
}

export type DoctorAdminMeta = {
  total: number
  active: number
  pending: number
  kyc: number
  inactive: number
}

export type DoctorsAdminResponse = {
  rows: DoctorAdminRecord[]
  meta: DoctorAdminMeta
}

export function fetchDoctorsAdmin(limit = 50, offset = 0) {
  return apiGet<DoctorsAdminResponse>(`/superadmin/doctors?limit=${limit}&offset=${offset}`)
}

export type DoctorAdminDetail = DoctorAdminRecord & {
  highestQualification?: string
  experienceYears?: number | null
  shortBio?: string
  practiceAddress?: string
  consultationFeeInr?: number | null
  medicalCouncilNumber?: string
  governmentIdNumber?: string
  verificationStatus?: string
  specializations?: string[]
  languages?: string[]
  availability?: {
    virtualAvailable?: boolean
    physicalAvailable?: boolean
    opdDays?: string[]
    opdFrom?: string
    opdTo?: string
    teleSlots?: string[]
  }
  documents?: {
    governmentIdDocumentId?: string | null
    licenseDocumentId?: string | null
  }
  documentList?: Array<{
    id: string | null
    type: string
    fileName: string
    storageKey: string
    status: string
    downloadUrl?: string
  }>
}

export function fetchDoctorAdminDetail(id: string) {
  return apiGet<DoctorAdminDetail>(`/superadmin/doctors/${id}`)
}

export function updateDoctorAdminFull(id: string, payload: Partial<DoctorAdminDetail>) {
  return apiPut<{ id: string }, Partial<DoctorAdminDetail>>(`/superadmin/doctors/${id}/full`, payload)
}

export function createDoctorAdmin(payload: Partial<DoctorAdminDetail>) {
  return apiPost<{ id: string }, Partial<DoctorAdminDetail>>(`/superadmin/doctors`, payload)
}

export function deleteDoctorAdmin(id: string) {
  return apiDelete<{ id: string }>(`/superadmin/doctors/${id}`, {})
}
