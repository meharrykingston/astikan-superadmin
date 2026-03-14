import { apiPost } from "./api"

export type SuperAdminLoginResponse = {
  userId: string
  role: string
  fullName?: string | null
  email?: string | null
}

export function loginSuperAdmin(username: string, password: string) {
  return apiPost<SuperAdminLoginResponse, { username: string; password: string }>(
    "/auth/superadmin/login",
    { username, password },
  )
}

