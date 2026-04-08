import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import "./login.css"

type LoginPageProps = {
  title: string
  error: string
  onLogin: (username: string, password: string) => void
}

export function LoginPage({ title, error, onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-login-title">
          <img className="admin-login-logo" src="/favicon.png" alt="Astikan" />
          <h1>{title}</h1>
        </div>

        <label>
          Username
          <input
            className="admin-input"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>

        <label>
          Password
          <div className="admin-input-wrap">
            <input
              className="admin-input"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="admin-eye-btn"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
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
