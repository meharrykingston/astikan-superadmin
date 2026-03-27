import { useState } from "react"
import "./login.css"

type LoginPageProps = {
  title: string
  error: string
  onLogin: (username: string, password: string) => void
}

export function LoginPage({ title, error, onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <h1>{title}</h1>

        <label>
          Username
          <input
            className="admin-input"
            type="text"
            placeholder="superadmin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
          onClick={() => onLogin(username, password)}
        >
          Sign In
        </button>

        {error && <p className="admin-login-error">{error}</p>}
      </section>
    </main>
  )
}
