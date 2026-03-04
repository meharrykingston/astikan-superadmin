import { useMemo, useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AppLayout } from "./app/AppLayout"
import { AccessControlPage } from "./pages/AccessControl"
import { AIGovernancePage } from "./pages/AIGovernance"
import { BillingSettlementPage } from "./pages/BillingSettlement"
import { CatalogGovernancePage } from "./pages/CatalogGovernance"
import { CompliancePage } from "./pages/Compliance"
import { DashboardPage } from "./pages/Dashboard"
import { DataQualityPage } from "./pages/DataQuality"
import { IntegrationsPage } from "./pages/Integrations"
import { LoginPage } from "./pages/Login"
import { ObservabilityPage } from "./pages/Observability"
import { SupportOverridesPage } from "./pages/SupportOverrides"
import { TenantManagementPage } from "./pages/TenantManagement"

type UserSession = {
  name: string
  email: string
}

function App() {
  const [session, setSession] = useState<UserSession | null>(null)
  const [authError, setAuthError] = useState("")

  const appTitle = useMemo(() => "Astikan Super Admin", [])

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
                onLogin={(email, password) => {
                  if (!email.trim() || !password.trim()) {
                    setAuthError("Enter email and password.")
                    return
                  }
                  setAuthError("")
                  setSession({
                    name: "Platform Admin",
                    email,
                  })
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
                onLogout={() => setSession(null)}
              />
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
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
