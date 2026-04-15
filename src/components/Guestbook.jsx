import { useState } from 'react'
import { playClick, playSuccess } from '../utils/sound'

const KEY = 'guestbook'
const MAX = 20

function loadEntries() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export default function Guestbook({ onClose }) {
  const [entries, setEntries] = useState(loadEntries)
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !msg.trim()) return
    const entry = {
      name: name.trim().slice(0, 20),
      msg: msg.trim().slice(0, 80),
      date: new Date().toLocaleDateString(),
    }
    const next = [...entries, entry].slice(-MAX)
    setEntries(next)
    localStorage.setItem(KEY, JSON.stringify(next))
    setName('')
    setMsg('')
    setSubmitted(true)
    playSuccess()
    setTimeout(() => setSubmitted(false), 2000)
  }

  return (
    <div className="snake-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="snake-modal guestbook-modal">
        <div className="snake-header">
          <span className="snake-title">✉ GUESTBOOK</span>
          <button className="snake-close" onClick={onClose}>✕</button>
        </div>
        <div className="guestbook-body">
          <form className="guestbook-form" onSubmit={handleSubmit}>
            <input
              className="guestbook-input"
              placeholder="YOUR NAME (max 20)"
              maxLength={20}
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <textarea
              className="guestbook-input guestbook-textarea"
              placeholder="LEAVE A MESSAGE (max 80 chars)"
              maxLength={80}
              rows={2}
              value={msg}
              onChange={e => setMsg(e.target.value)}
            />
            <button type="submit" className="w98-btn-ok guestbook-submit" onClick={playClick}>
              {submitted ? '★ SIGNED!' : 'SIGN'}
            </button>
          </form>
          <div className="guestbook-entries">
            {entries.length === 0 && <p className="guestbook-empty">No entries yet. Be the first!</p>}
            {[...entries].reverse().map((e, i) => (
              <div key={i} className="guestbook-note">
                <span className="guestbook-note-name">{e.name}</span>
                <span className="guestbook-note-date">{e.date}</span>
                <p className="guestbook-note-msg">{e.msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
