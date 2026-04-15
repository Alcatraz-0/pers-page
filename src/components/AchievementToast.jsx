import { useCallback, useEffect, useState } from 'react'

const ACHIEVEMENTS = [
  { sectionId: 'projects',  title: 'CODE ARCHAEOLOGIST', desc: 'Unearthed 6 projects' },
  { sectionId: 'skills',    title: 'SKILL TREE MAXED',   desc: 'Full stack detected' },
  { sectionId: 'research',  title: 'SCHOLAR DETECTED',   desc: 'Research papers found' },
  { sectionId: 'resume',    title: 'LORE UNLOCKED',      desc: 'Full timeline explored' },
  { sectionId: 'contact',   title: 'FINAL BOSS REACHED', desc: 'You made it to the end!' },
]

export default function AchievementToast() {
  const [toasts, setToasts] = useState([])

  const fire = useCallback((id, title, desc) => {
    const seen = JSON.parse(localStorage.getItem('seen-achievements') || '[]')
    if (seen.includes(id)) return
    localStorage.setItem('seen-achievements', JSON.stringify([...seen, id]))
    setToasts(q => [...q, { id: Date.now() + Math.random(), title, desc }])
  }, [])

  useEffect(() => {
    const observers = ACHIEVEMENTS.map(ach => {
      const el = document.getElementById(ach.sectionId)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) fire(ach.sectionId, ach.title, ach.desc)
        },
        { threshold: 0.25 }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(o => o?.disconnect())
  }, [fire])

  useEffect(() => {
    const handler = (e) => {
      const coins = e.detail
      if (coins >= 25)  fire('penny-collector', 'PENNY COLLECTOR', '25 coins earned')
      if (coins >= 100) fire('coin-hoarder', 'COIN HOARDER', '100 coins stashed')
      if (coins >= 300) fire('coin-king', 'COIN KING', "300 coins — you're filthy rich")
    }
    window.addEventListener('coins-update', handler)
    return () => window.removeEventListener('coins-update', handler)
  }, [fire])

  useEffect(() => {
    const handler = (e) => {
      const { id, title, desc } = e.detail
      fire(id, title, desc)
    }
    window.addEventListener('achievement', handler)
    return () => window.removeEventListener('achievement', handler)
  }, [fire])

  const dismiss = (id) => setToasts(q => q.filter(t => t.id !== id))

  return (
    <div className="achievement-stack">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDone={() => dismiss(toast.id)} />
      ))}
    </div>
  )
}

function Toast({ toast, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="achievement-toast">
      <div className="toast-header">▶ ACHIEVEMENT UNLOCKED</div>
      <div className="toast-title">{toast.title}</div>
      <div className="toast-desc">{toast.desc}</div>
    </div>
  )
}
