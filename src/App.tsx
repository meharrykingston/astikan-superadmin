import { useEffect, useMemo, useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AppLayout } from "./app/AppLayout"
import { AccessControlPage } from "./pages/AccessControl"
import { AIGovernancePage } from "./pages/AIGovernance"
import { BillingSettlementPage } from "./pages/BillingSettlement"
import { CatalogGovernancePage } from "./pages/CatalogGovernance"
import { CompliancePage } from "./pages/Compliance"
import { CorporateAccountsPage } from "./pages/CorporateAccounts"
import { DashboardPage } from "./pages/Dashboard"
import { DataQualityPage } from "./pages/DataQuality"
import { DoctorAnalyticsPage } from "./pages/DoctorAnalytics"
import { DoctorManagementPage } from "./pages/DoctorManagement"
import { DoctorProductsPage } from "./pages/DoctorProducts"
import { IntegrationsPage } from "./pages/Integrations"
import { LoginPage } from "./pages/Login"
import { ObservabilityPage } from "./pages/Observability"
import { OPDAnalyticsPage } from "./pages/OPDAnalytics"
import { PharmacyOperationsPage } from "./pages/PharmacyOperations"
import { PlatformLogsPage } from "./pages/PlatformLogs"
import { ProgramsManagementPage } from "./pages/ProgramsManagement"
import { SupportOverridesPage } from "./pages/SupportOverrides"
import { TeleconsultAnalyticsPage } from "./pages/TeleconsultAnalytics"
import { TenantManagementPage } from "./pages/TenantManagement"
import { loginSuperAdmin } from "./services/authApi"

type UserSession = {
  name: string
  email: string
}

function App() {
  const [session, setSession] = useState<UserSession | null>(null)
  const [authError, setAuthError] = useState("")
  const SESSION_KEY = "astikan_superadmin_session"

  const appTitle = useMemo(() => "Astikan Super Admin", [])

  useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as UserSession
      if (parsed?.email === "superadmin@astikan.local") {
        const updated = { ...parsed, email: "astikanworld@gmail.com" }
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated))
        setSession(updated)
        return
      }
      if (parsed?.email) setSession(parsed)
    } catch {
      // ignore
    }
  }, [])

  return (
    <BrowserRouter>
      {!session ? (
        <Routes>
          <Route
            path="*"
            element={
              <LoginPage
                title={appTitle}
                error={authError}
                onLogin={async (username, password) => {
                  if (!username.trim() || !password.trim()) {
                    setAuthError("Enter username and password.")
                    return
                  }
                  setAuthError("")
                  try {
                    const payload = await loginSuperAdmin(username.trim(), password)
                    const email =
                      payload.email === "superadmin@astikan.local"
                        ? "astikanworld@gmail.com"
                        : payload.email ?? username
                    const nextSession = {
                      name: payload.fullName ?? "Platform Admin",
                      email,
                    }
                    sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
                    setSession(nextSession)
                  } catch (error) {
                    setAuthError(error instanceof Error ? error.message : "Unable to sign in.")
                  }
                }}
              />
            }
          />
        </Routes>
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              <AppLayout
                title={appTitle}
                userEmail={session.email}
                onLogout={() => {
                  sessionStorage.removeItem(SESSION_KEY)
                  setSession(null)
                }}
              />
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="corporate-accounts" element={<CorporateAccountsPage />} />
            <Route path="doctor-management" element={<DoctorManagementPage />} />
            <Route path="doctor-products" element={<DoctorProductsPage />} />
            <Route path="pharmacy-operations" element={<PharmacyOperationsPage />} />
            <Route path="platform-logs" element={<PlatformLogsPage />} />
            <Route path="teleconsult-analytics" element={<TeleconsultAnalyticsPage />} />
            <Route path="doctor-analytics" element={<DoctorAnalyticsPage />} />
            <Route path="opd-analytics" element={<OPDAnalyticsPage />} />
            <Route path="programs-management" element={<ProgramsManagementPage />} />
            <Route path="tenant-management" element={<TenantManagementPage />} />
            <Route path="access-control" element={<AccessControlPage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route path="catalog-governance" element={<CatalogGovernancePage />} />
            <Route path="data-quality" element={<DataQualityPage />} />
            <Route path="billing-settlement" element={<BillingSettlementPage />} />
            <Route path="ai-governance" element={<AIGovernancePage />} />
            <Route path="observability" element={<ObservabilityPage />} />
            <Route path="compliance" element={<CompliancePage />} />
            <Route path="support-overrides" element={<SupportOverridesPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  )
}

export default App
