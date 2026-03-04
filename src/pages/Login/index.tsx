import { useState } from "react"
import "./login.css"

type LoginPageProps = {
  title: string
  error: string
  onLogin: (email: string, password: string) => void
}

export function LoginPage({ title, error, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <p className="admin-login-kicker">Platform Access</p>
        <h1>{title}</h1>
        <p className="admin-login-sub">
          Manage tenants, providers, billing, and operations from one control plane.
        </p>

        <label>
          Email
          <input
            className="admin-input"
            type="email"
            placeholder="admin@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            className="admin-input"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button
          type="button"
          className="admin-login-btn"
          onClick={() => onLogin(email, password)}
        >
          Sign In
        </button>

        {error && <p className="admin-login-error">{error}</p>}
      </section>
    </main>
  )
}
