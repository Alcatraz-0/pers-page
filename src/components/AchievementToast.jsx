import { useEffect, useRef, useState } from 'react'

const ACHIEVEMENTS = [
  { sectionId: 'projects',  title: 'CODE ARCHAEOLOGIST', desc: 'Unearthed 6 projects' },
  { sectionId: 'skills',    title: 'SKILL TREE MAXED',   desc: 'Full stack detected' },
  { sectionId: 'research',  title: 'SCHOLAR DETECTED',   desc: 'Research papers found' },
  { sectionId: 'resume',    title: 'LORE UNLOCKED',      desc: 'Full timeline explored' },
  { sectionId: 'contact',   title: 'FINAL BOSS REACHED', desc: 'You made it to the end!' },
]

export default function AchievementToast() {
  const [toasts, setToasts] = useState([])
  const seenRef = useRef(new Set())

  useEffect(() => {
    const observers = ACHIEVEMENTS.map(ach => {
      const el = document.getElementById(ach.sectionId)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !seenRef.current.has(ach.sectionId)) {
            seenRef.current.add(ach.sectionId)
            setToasts(q => [...q, { ...ach, id: Date.now() + Math.random() }])
          }
        },
        { threshold: 0.25 }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(o => o?.disconnect())
  }, [])

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
