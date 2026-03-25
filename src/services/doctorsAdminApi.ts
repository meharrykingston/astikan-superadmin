import { apiGet, apiPut } from "./api"

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

export function fetchDoctorsAdmin() {
  return apiGet<DoctorAdminRecord[]>("/superadmin/doctors")
}

export function updateDoctorAdmin(id: string, payload: Partial<DoctorAdminRecord>) {
  return apiPut<{ id: string }, Partial<DoctorAdminRecord>>(`/superadmin/doctors/${id}`, payload)
}
