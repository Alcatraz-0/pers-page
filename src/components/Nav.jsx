import { useState, useEffect } from 'react'
import { useActiveSection } from '../hooks/useActiveSection'
import { playClick, playGameOver, startAmbient, stopAmbient } from '../utils/sound'

const NAV_IDS    = ['now', 'projects', 'skills', 'research', 'resume', 'contact']
const NAV_LABELS = ['NOW', 'PROJECTS', 'SKILLS', 'RESEARCH', 'RESUME', 'CONTACT']

function W98Dialog({ onClose }) {
  return (
    <div className="w98-dialog-backdrop">
      <div className="w98-dialog">
        <div className="w98-dialog-titlebar">
          <span className="w98-dialog-icon">⚠</span>
          <span className="w98-dialog-title">Portfolio.exe</span>
          <button className="w98-ctrl w98-close-sm" onClick={onClose}>✕</button>
        </div>
        <div className="w98-dialog-body">
          <span className="w98-dialog-big-icon">🚫</span>
          <div className="w98-dialog-text">
            <p>This operation cannot be completed.</p>
            <p>Cannot close <strong>Anand's Portfolio</strong>.</p>
            <p className="w98-dialog-sub">Error code: 0x000000HR (HIRE_ME_FIRST)</p>
          </div>
        </div>
        <div className="w98-dialog-footer">
          <button className="w98-btn-ok" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  )
}

function HelpDialog({ onClose }) {
  return (
    <div className="w98-dialog-backdrop">
      <div className="w98-dialog">
        <div className="w98-dialog-titlebar">
          <span className="w98-dialog-icon">❓</span>
          <span className="w98-dialog-title">Help — Portfolio.exe</span>
          <button className="w98-ctrl w98-close-sm" onClick={onClose}>✕</button>
        </div>
        <div className="w98-dialog-body" style={{ flexDirection: 'column', gap: '0.5rem' }}>
          <div className="w98-dialog-text" style={{ width: '100%' }}>
            <p><strong>KEYBOARD SHORTCUTS</strong></p>
            <p>↑↑↓↓←→←→BA — Secret rainbow mode</p>
            <p>ESC — Close dialogs &amp; games</p>
            <p>&nbsp;</p>
            <p><strong>FEATURES</strong></p>
            <p>◆ SNAKE — Play snake game (bottom-right)</p>
            <p>&gt;_ TERM — Interactive terminal</p>
            <p>□ — Minimize nav / restore</p>
            <p>&nbsp;</p>
            <p><strong>CONTACT</strong></p>
            <p>anand.01ntgy@gmail.com</p>
          </div>
        </div>
        <div className="w98-dialog-footer">
          <button className="w98-btn-ok" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  )
}

function ResumeBtn() {
  const [burst, setBurst] = useState(false)
  const handleClick = (e) => {
    e.preventDefault()
    setBurst(true)
    setTimeout(() => setBurst(false), 700)
    const link = document.createElement('a')
    link.href = '/resume.pdf'
    link.download = 'Anand_Meena_Resume.pdf'
    link.click()
  }
  return (
    <button
      className={`w98-menu-btn resume-dl-btn${burst ? ' coin-burst' : ''}`}
      onClick={handleClick}
      title="Download Resume"
    >
      {burst ? '★ GET!' : '↓ RESUME'}
    </button>
  )
}

function useClock() {
  const fmt = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setTime(prev => { const next = fmt(); return next === prev ? prev : next }), 30_000)
    return () => clearInterval(id)
  }, [])
  return time
}

export default function Nav({ dark, setDark, palette, setPalette }) {
  const [menuOpen, setMenuOpen]     = useState(false)
  const [minimized, setMinimized]   = useState(false)
  const [showClose, setShowClose]   = useState(false)
  const [showHelp, setShowHelp]     = useState(false)
  const active = useActiveSection(NAV_IDS)
  const time = useClock()

  const [musicOn, setMusicOn] = useState(() => localStorage.getItem('ambient-music') === 'on')

  useEffect(() => {
    if (musicOn) startAmbient()
    else stopAmbient()
    localStorage.setItem('ambient-music', musicOn ? 'on' : 'off')
  }, [musicOn])

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) stopAmbient()
      else if (musicOn) startAmbient()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [musicOn])

  const handleMusic = () => { playClick(); setMusicOn(m => !m) }

  const handleMinimize = () => {
    playClick()
    setMinimized(m => !m)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const handleTheme = () => {
    playClick()
    setDark(d => !d)
  }
  const handleHelp  = () => { playClick(); setShowHelp(true) }
  const handleClose = () => { playGameOver(); setShowClose(true) }

  return (
    <>
      <div className="w98-chrome">

        {/* ── Title bar ── */}
        <div className="w98-titlebar">
          <div className="w98-title-left">
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect x='1' y='1' width='6' height='6' fill='%23ff4444'/%3E%3Crect x='9' y='1' width='6' height='6' fill='%2344ff44'/%3E%3Crect x='1' y='9' width='6' height='6' fill='%234444ff'/%3E%3Crect x='9' y='9' width='6' height='6' fill='%23ffff44'/%3E%3C/svg%3E"
              alt=""
              className="w98-title-icon"
            />
            <span className="w98-title-text">
              Anand_Meena_Portfolio.exe
            </span>
          </div>
          <div className="w98-controls">
            <button className="w98-ctrl" onClick={handleMinimize} title={minimized ? 'Restore' : 'Minimize'}>
              {minimized ? '▲' : '_'}
            </button>
            <button
              className={`w98-ctrl${musicOn ? ' w98-theme-ctrl' : ''}`}
              onClick={handleMusic}
              title={musicOn ? 'Stop Music' : 'Play Chiptune Music'}
            >
              {musicOn ? '♪' : '♩'}
            </button>
            <button
              className="w98-ctrl w98-theme-ctrl"
              onClick={handleTheme}
              title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {dark ? '☀' : '🌙'}
            </button>
            <button className="w98-ctrl" onClick={handleHelp} title="Help">
              ?
            </button>
            <button className="w98-ctrl w98-close" onClick={handleClose} title="Close">
              ✕
            </button>
          </div>
        </div>

        {/* ── Menu bar ── */}
        {!minimized && (
          <div className="w98-menubar">
            <div className="w98-menubar-left">
              <a href="#hero" className="w98-logo">
                AM<span className="cursor" />
              </a>
              <div className="w98-sep" />
              <ul className={`w98-nav-links${menuOpen ? ' open' : ''}`}>
                {NAV_IDS.map((id, i) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className={`w98-nav-item${active === id ? ' active' : ''}`}
                      onClick={() => { setMenuOpen(false); playClick() }}
                    >
                      <span className="w98-underline-char">{NAV_LABELS[i][0]}</span>
                      {NAV_LABELS[i].slice(1)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w98-menubar-right">
              <div className="avail-badge">
                <span className="avail-dot" />
                <span className="avail-label">OPEN TO WORK</span>
              </div>
              <ResumeBtn />
              <div className="w98-tray">
                <span className="w98-tray-time">{time}</span>
              </div>
              <button className="w98-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
                {menuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        )}
      </div>

      {showClose && <W98Dialog onClose={() => setShowClose(false)} />}
      {showHelp  && <HelpDialog onClose={() => setShowHelp(false)} />}
    </>
  )
}
