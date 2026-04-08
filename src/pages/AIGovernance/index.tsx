import React from "react"
import "./ai-governance.css"

export function AIGovernancePage() {
  const suggestions = [
    "Summarize corporate AI usage risks for Q2.",
    "Flag any high-risk prompts in the last 7 days.",
    "Show top 5 compliance overrides this week.",
    "Draft a safe-response template for medical disclaimers.",
  ]
  const [messages, setMessages] = React.useState([
    {
      id: "system",
      role: "assistant",
      text: "Hi! I manage AI governance. Ask me about prompt rules, compliance, or audit logs.",
      time: "Just now",
    },
  ])
  const [input, setInput] = React.useState("")

  const sendMessage = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text: trimmed, time: "Now" },
      {
        id: `ai-${Date.now() + 1}`,
        role: "assistant",
        text: "Acknowledged. I’m scanning policy + audit logs and will surface any compliance or safety issues.",
        time: "Now",
      },
    ])
    setInput("")
  }

  return (
    <div className="ai-governance-page">
      <header className="ai-governance-head">
        <div>
          <h1>AI Governance Chatbot</h1>
          <p>Manage prompts, compliance checks, and audit summaries with a guided assistant.</p>
        </div>
        <button className="primary">Update Prompt Rules</button>
      </header>

      <section className="ai-governance-grid">
        <aside className="ai-governance-panel">
          <h2>Quick actions</h2>
          <div className="ai-action-list">
            {suggestions.map((item) => (
              <button key={item} type="button" onClick={() => setInput(item)}>
                {item}
              </button>
            ))}
          </div>
          <div className="ai-policy-card">
            <h3>Active guardrails</h3>
            <ul>
              <li>Medical advice requires escalation to doctor.</li>
              <li>Redact all PHI in summary exports.</li>
              <li>Block disallowed drug recommendations.</li>
            </ul>
          </div>
        </aside>

        <div className="ai-chat-panel">
          <div className="ai-chat-thread">
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-bubble ${msg.role}`}>
                <span>{msg.text}</span>
                <small>{msg.time}</small>
              </div>
            ))}
          </div>
          <div className="ai-chat-input">
            <input
              placeholder="Ask about compliance, audits, or prompt changes"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage()
              }}
            />
            <button type="button" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </section>
    </div>
  )
}
