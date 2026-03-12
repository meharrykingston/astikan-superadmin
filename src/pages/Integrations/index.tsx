import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, KeyRound, RefreshCcw, Save, ShieldCheck, TestTubeDiagonal } from "lucide-react"
import { fetchIntegrations, reloadIntegration, testIntegration, updateIntegration } from "../../services/platformApi"
import "./integrations.css"

type ProviderConfig = {
  provider: string
  providerKey: string
  status: "Connected" | "Warning"
  env: {
    appId?: string
    apiKey?: string
    secret?: string
    endpoint?: string
    modelId?: string
  }
  updatedAt: string
}

function toProviderConfig(row: any): ProviderConfig {
  const secrets = Array.isArray(row.provider_integration_secrets) ? row.provider_integration_secrets : []
  const secretMap = Object.fromEntries(secrets.map((item: any) => [item.key_name, item.secret_ref]))
  return {
    provider: row.display_name,
    providerKey: row.provider_key,
    status: row.status === 'active' ? 'Connected' : 'Warning',
    env: {
      appId: secretMap.APP_ID,
      apiKey: secretMap.API_KEY,
      secret: secretMap.SECRET,
      endpoint: secretMap.ENDPOINT ?? row.base_url,
      modelId: secretMap.MODEL_ID,
    },
    updatedAt: row.updated_at ? new Date(row.updated_at).toLocaleString('en-IN') : '--',
  }
}

export function IntegrationsPage() {
  const [providers, setProviders] = useState<ProviderConfig[]>([])
  const [selectedProvider, setSelectedProvider] = useState("")
  const [notice, setNotice] = useState("Environment values can be updated and reloaded without redeploy.")
  const [changeLog, setChangeLog] = useState<string[]>([])

  useEffect(() => {
    let active = true
    void fetchIntegrations()
      .then((payload) => {
        if (!active) return
        const mapped = payload.providers.map(toProviderConfig)
        setProviders(mapped)
        setSelectedProvider(mapped[0]?.providerKey ?? "")
        setChangeLog(
          payload.logs.slice(0, 8).map((entry) => `${new Date(entry.startedAt ?? Date.now()).toLocaleString('en-IN')} - ${entry.providerKey} ${entry.syncType}`),
        )
      })
      .catch(() => {
        if (!active) return
        setProviders([])
      })
    return () => {
      active = false
    }
  }, [])

  const activeProvider = useMemo(
    () => providers.find((item) => item.providerKey === selectedProvider) ?? providers[0],
    [providers, selectedProvider]
  )

  function updateEnvField(field: keyof ProviderConfig["env"], value: string) {
    setProviders((prev) =>
      prev.map((item) =>
        item.providerKey === selectedProvider
          ? { ...item, env: { ...item.env, [field]: value } }
          : item
      )
    )
  }

  async function saveProviderConfig() {
    if (!activeProvider) return
    await updateIntegration(activeProvider.providerKey, {
      displayName: activeProvider.provider,
      status: activeProvider.status === 'Connected' ? 'active' : 'testing',
      environment: 'prod',
      baseUrl: activeProvider.env.endpoint,
      env: activeProvider.env,
    })
    setNotice(`${activeProvider.provider} environment values updated. Provider reload can be triggered safely.`)
  }

  async function reloadProviderApis() {
    if (!activeProvider) return
    await reloadIntegration(activeProvider.providerKey)
    setNotice(`${activeProvider.provider} reload requested. Active requests will move to new env config automatically.`)
  }

  async function runHealthTest() {
    if (!activeProvider) return
    await testIntegration(activeProvider.providerKey)
    setNotice(`${activeProvider.provider} health test queued. Env IDs and credentials validation in progress.`)
  }

  return (
    <div className="integrations-page">
      <section className="integrations-head">
        <div>
          <h1>Provider Integrations Control Tower</h1>
          <p>Manage provider env IDs, API credentials and runtime reload actions from a single panel.</p>
        </div>
        <span className="integ-chip"><ShieldCheck size={14} /> Runtime-safe config</span>
      </section>

      <section className="integrations-kpi-grid">
        <article className="integrations-kpi">
          <strong>{providers.length}</strong>
          <span>Providers Managed</span>
        </article>
        <article className="integrations-kpi">
          <strong>{providers.filter((item) => item.status === "Connected").length}</strong>
          <span>Healthy Connectors</span>
        </article>
        <article className="integrations-kpi">
          <strong>{changeLog.length}</strong>
          <span>Mongo Sync Logs Loaded</span>
        </article>
      </section>

      <section className="integrations-body">
        <article className="integrations-provider-list">
          <h2>Connected Providers</h2>
          <div className="provider-list">
            {providers.map((item) => (
              <button
                type="button"
                key={item.providerKey}
                className={`provider-row ${selectedProvider === item.providerKey ? "active" : ""}`}
                onClick={() => setSelectedProvider(item.providerKey)}
              >
                <div>
                  <strong>{item.provider}</strong>
                  <small>Last updated: {item.updatedAt}</small>
                </div>
                <span className={`status-chip ${item.status === "Connected" ? "ok" : "warn"}`}>
                  {item.status}
                </span>
              </button>
            ))}
          </div>
        </article>

        {activeProvider ? (
          <article className="integrations-config-card">
            <div className="config-head">
              <h2>{activeProvider.provider} Environment Config</h2>
              <p>Update env IDs and credentials. Use save before reload.</p>
            </div>

            <div className="config-grid">
              <label>
                Provider APP_ID
                <input value={activeProvider.env.appId ?? ""} onChange={(event) => updateEnvField("appId", event.target.value)} placeholder="Enter APP_ID" />
              </label>
              <label>
                API Key
                <input value={activeProvider.env.apiKey ?? ""} onChange={(event) => updateEnvField("apiKey", event.target.value)} placeholder="Enter API key" />
              </label>
              <label>
                Secret / Certificate
                <input value={activeProvider.env.secret ?? ""} onChange={(event) => updateEnvField("secret", event.target.value)} placeholder="Enter secret or certificate" />
              </label>
              <label>
                API Endpoint
                <input value={activeProvider.env.endpoint ?? ""} onChange={(event) => updateEnvField("endpoint", event.target.value)} placeholder="https://provider.endpoint" />
              </label>
              <label>
                Model / Engine ID
                <input value={activeProvider.env.modelId ?? ""} onChange={(event) => updateEnvField("modelId", event.target.value)} placeholder="Optional model/engine id" />
              </label>
            </div>

            <div className="config-actions">
              <button type="button" className="btn-primary" onClick={() => void saveProviderConfig()}><Save size={14} /> Save Env Values</button>
              <button type="button" className="btn-ghost" onClick={() => void reloadProviderApis()}><RefreshCcw size={14} /> Reload APIs</button>
              <button type="button" className="btn-ghost" onClick={() => void runHealthTest()}><TestTubeDiagonal size={14} /> Test Connection</button>
            </div>

            <p className="config-notice"><CheckCircle2 size={14} /> {notice}</p>
          </article>
        ) : null}
      </section>

      <section className="integrations-log-card">
        <h2><KeyRound size={16} /> Env Change & Reload Log</h2>
        <ul>
          {changeLog.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
