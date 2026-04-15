import { useEffect, useState, useRef } from 'react'
import { getCoins } from '../utils/coins'

export default function HireMeXP() {
  const [xp, setXp] = useState(() => Number(localStorage.getItem('hire-xp') || 0))
  const xpRef = useRef(xp)
  const sectionsVisited = useRef(new Set())

  const computeXP = () => {
    const scrollXP = Math.min(40, Math.round(
      (window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight)) * 40
    ))
    const coinXP = Math.max(0, Math.min(40, Math.floor(Math.max(0, getCoins()) / 10) * 10))
    const sectionXP = Math.min(20, sectionsVisited.current.size * 4)
    return Math.min(100, scrollXP + coinXP + sectionXP)
  }

  useEffect(() => {
    const update = () => {
      const next = Math.max(xpRef.current, computeXP())
      if (next !== xpRef.current) {
        xpRef.current = next
        setXp(next)
        localStorage.setItem('hire-xp', String(next))
      }
    }

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('coins-update', update)

    const sections = ['projects', 'skills', 'research', 'resume', 'contact', 'now']
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { sectionsVisited.current.add(e.target.id); update() } })
    }, { threshold: 0.2 })
    sections.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('coins-update', update)
      obs.disconnect()
    }
  }, [])

  const done = xp >= 100

  return (
    <div className={`hire-xp-bar${done ? ' hire-xp-done' : ''}`}>
      <span className="hire-xp-label">EXP</span>
      <div className="hire-xp-track">
        <div className="hire-xp-fill" style={{ width: `${xp}%` }} />
      </div>
      <span className="hire-xp-pct">{xp}/100</span>
      {done && (
        <button className="hire-xp-cta" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
          ★ HIRE ME?
        </button>
      )}
    </div>
  )
}
