import { useEffect, useRef, useState, useCallback } from 'react'
import { addCoins } from '../utils/coins'
import { playSuccess } from '../utils/sound'

const SPIDER_SRC = '/sprites/animated_spider_48x48.gif'
const SPAWN_INTERVAL = 2200   // ms between spawns
const BUG_LIFETIME   = 3800   // ms before bug escapes
const MAX_BUGS       = 5

let nextId = 1

function spawnEdgePos() {
  const edge = Math.floor(Math.random() * 4)  // 0=top 1=right 2=bottom 3=left
  const vw = window.innerWidth, vh = window.innerHeight
  switch (edge) {
    case 0: return { x: Math.random() * (vw - 80) + 40,  y: -48, edge }
    case 1: return { x: vw + 4,                           y: Math.random() * (vh - 80) + 40, edge }
    case 2: return { x: Math.random() * (vw - 80) + 40,  y: vh + 4, edge }
    case 3: return { x: -52,                              y: Math.random() * (vh - 80) + 40, edge }
    default: return { x: 0, y: 0, edge: 0 }
  }
}

function targetPos(edge) {
  const vw = window.innerWidth, vh = window.innerHeight
  const margin = 80 + Math.random() * 120
  switch (edge) {
    case 0: return { x: null, y: margin }
    case 1: return { x: vw - margin, y: null }
    case 2: return { x: null, y: vh - margin }
    case 3: return { x: margin, y: null }
    default: return { x: null, y: null }
  }
}

export default function WhackABug({ active }) {
  const [bugs, setBugs] = useState([])
  const [score, setScore] = useState(0)
  const [squashed, setSquashed] = useState([])  // [{id, x, y}]
  const spawnRef = useRef(null)
  const splatsRef = useRef([])

  const removeBug = useCallback((id) => {
    setBugs(prev => prev.filter(b => b.id !== id))
  }, [])

  const squashBug = useCallback((id, x, y) => {
    playSuccess()
    addCoins(3)
    setScore(s => s + 1)
    setSquashed(prev => [...prev, { id, x, y }])
    const t = setTimeout(() => setSquashed(prev => prev.filter(s => s.id !== id)), 600)
    splatsRef.current.push(t)
    removeBug(id)
    const total = Number(localStorage.getItem('wab-total-bugs') || 0) + 1
    localStorage.setItem('wab-total-bugs', total)
    if (total === 10) {
      window.dispatchEvent(new CustomEvent('achievement', {
        detail: { id: 'bug-slayer', title: 'BUG SLAYER', desc: '10 bugs squashed total!' }
      }))
    }
  }, [removeBug])

  // Save best session score when deactivated
  useEffect(() => {
    if (!active && score > 0) {
      const prev = Number(localStorage.getItem('wab-best') || 0)
      if (score > prev) localStorage.setItem('wab-best', score)
    }
  }, [active, score])

  // Spawn loop
  useEffect(() => {
    if (!active) { setBugs([]); return }

    spawnRef.current = setInterval(() => {
      setBugs(prev => {
        if (prev.length >= MAX_BUGS) return prev
        const { x, y, edge } = spawnEdgePos()
        const target = targetPos(edge)
        return [...prev, {
          id: nextId++,
          x, y,
          targetX: target.x ?? x + (Math.random() - 0.5) * 60,
          targetY: target.y ?? y + (Math.random() - 0.5) * 60,
          born: Date.now(),
        }]
      })
    }, SPAWN_INTERVAL)

    return () => {
      clearInterval(spawnRef.current)
      splatsRef.current.forEach(clearTimeout)
      splatsRef.current = []
    }
  }, [active])

  // Expire bugs that weren't clicked
  useEffect(() => {
    if (!active || bugs.length === 0) return
    const id = setInterval(() => {
      const now = Date.now()
      setBugs(prev => {
        const next = prev.filter(b => now - b.born < BUG_LIFETIME)
        return next.length === prev.length ? prev : next
      })
    }, 500)
    return () => clearInterval(id)
  }, [active, bugs.length])

  if (!active) return null

  return (
    <>
      {/* Score badge */}
      <div className="wab-score" aria-live="polite">
        🕷 BUGS SQUASHED: {score}
      </div>

      {/* Bugs */}
      {bugs.map(bug => {
        const progress = Math.min(1, (Date.now() - bug.born) / BUG_LIFETIME)
        const x = bug.x + (bug.targetX - bug.x) * Math.min(1, progress * 1.6)
        const y = bug.y + (bug.targetY - bug.y) * Math.min(1, progress * 1.6)
        return (
          <button
            key={bug.id}
            className="wab-bug"
            style={{ transform: `translate(${x}px, ${y}px)` }}
            onClick={() => squashBug(bug.id, x, y)}
            aria-label="Squash the bug!"
          >
            <img src={SPIDER_SRC} alt="spider" width={48} height={48} />
          </button>
        )
      })}

      {/* Squash splats */}
      {squashed.map(s => (
        <div key={s.id} className="wab-splat"
             style={{ left: `${s.x}px`, top: `${s.y}px` }}>
          +3 🪙
        </div>
      ))}
    </>
  )
}
