import { useCallback, useEffect, useRef, useState } from 'react'
import { addCoins } from '../utils/coins'

const COLS = 20, ROWS = 16, CELL = 18

function randPos(snake) {
  let pos
  do {
    pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  } while (snake.some(s => s.x === pos.x && s.y === pos.y))
  return pos
}

const initState = () => ({
  snake: [{ x: 10, y: 8 }, { x: 9, y: 8 }, { x: 8, y: 8 }],
  dir: { x: 1, y: 0 },
  nextDir: { x: 1, y: 0 },
  food: { x: 15, y: 8 },
  score: 0,
  best: 0,
  state: 'idle', // idle | running | dead
})

export default function SnakeGame({ onClose }) {
  const canvasRef = useRef(null)
  const gameRef = useRef(initState())
  const loopRef = useRef(null)
  const coinsPaidRef = useRef(false)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem('snake-best') || 0))
  const [phase, setPhase] = useState('idle') // idle | running | dead

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const g = gameRef.current
    const c1 = getComputedStyle(document.documentElement).getPropertyValue('--c1').trim() || '#14b8a6'

    ctx.fillStyle = '#050c10'
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL)

    // Grid dots
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    for (let x = 0; x < COLS; x++)
      for (let y = 0; y < ROWS; y++)
        ctx.fillRect(x * CELL + CELL/2 - 1, y * CELL + CELL/2 - 1, 2, 2)

    // Food — pulsing
    const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.008)
    ctx.fillStyle = `rgba(255,80,80,${pulse})`
    ctx.fillRect(g.food.x * CELL + 2, g.food.y * CELL + 2, CELL - 4, CELL - 4)

    // Snake
    g.snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? c1 : `rgba(20,184,166,${0.9 - i * 0.04})`
      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2)
    })
  }, [])

  const endGame = useCallback((score) => {
    const newBest = Math.max(score, best)
    setBest(newBest)
    localStorage.setItem('snake-best', String(newBest))
    if (score > 0 && !coinsPaidRef.current) {
      coinsPaidRef.current = true
      addCoins(score * 2)
    }
    if (score > 5) window.dispatchEvent(new CustomEvent('achievement', {
      detail: { id: 'snake-charmer', title: 'SNAKE CHARMER', desc: 'Score > 5 in Snake' }
    }))
  }, [best])

  const tick = useCallback(() => {
    const g = gameRef.current
    if (g.state !== 'running') return

    g.dir = g.nextDir
    const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y }

    const wallHit = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS
    const selfHit = g.snake.some(s => s.x === head.x && s.y === head.y)
    if (wallHit || selfHit) {
      g.state = 'dead'
      setPhase('dead')
      endGame(g.score)
      return
    }

    const ate = head.x === g.food.x && head.y === g.food.y
    g.snake = [head, ...g.snake]
    if (!ate) g.snake.pop()
    else {
      g.score++
      g.food = randPos(g.snake)
      setScore(g.score)
    }
  }, [endGame])

  const startGame = () => {
    const s = initState()
    s.food = randPos(s.snake)
    s.state = 'running'
    gameRef.current = s
    coinsPaidRef.current = false
    setScore(0)
    setPhase('running')
  }

  // Input — keyboard + touch swipe
  useEffect(() => {
    const setDir = (nd) => {
      const g = gameRef.current
      // Prevent reversing into self
      if (nd.x !== -g.dir.x || nd.y !== -g.dir.y) g.nextDir = nd
    }

    const onKey = (e) => {
      const map = {
        ArrowUp:    { x: 0,  y: -1 },
        ArrowDown:  { x: 0,  y: 1  },
        ArrowLeft:  { x: -1, y: 0  },
        ArrowRight: { x: 1,  y: 0  },
        w: { x: 0,  y: -1 },
        s: { x: 0,  y: 1  },
        a: { x: -1, y: 0  },
        d: { x: 1,  y: 0  },
      }
      const nd = map[e.key]
      if (nd) { e.preventDefault(); setDir(nd) }
    }
    window.addEventListener('keydown', onKey)

    // Touch swipe — direction picked from dominant axis once threshold crossed
    const canvas = canvasRef.current
    const SWIPE_MIN = 24  // px before we commit to a direction
    let tx = 0, ty = 0, active = false
    const onTouchStart = (e) => {
      const t = e.touches[0]
      tx = t.clientX; ty = t.clientY; active = true
    }
    const onTouchMove = (e) => {
      if (!active) return
      e.preventDefault()
      const t = e.touches[0]
      const dx = t.clientX - tx, dy = t.clientY - ty
      if (Math.abs(dx) < SWIPE_MIN && Math.abs(dy) < SWIPE_MIN) return
      if (Math.abs(dx) > Math.abs(dy)) setDir({ x: dx > 0 ? 1 : -1, y: 0 })
      else                              setDir({ x: 0, y: dy > 0 ? 1 : -1 })
      tx = t.clientX; ty = t.clientY  // reset so a second swipe in same gesture works
    }
    const onTouchEnd = () => { active = false }
    canvas?.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas?.addEventListener('touchmove',  onTouchMove,  { passive: false })
    canvas?.addEventListener('touchend',   onTouchEnd,   { passive: true })

    return () => {
      window.removeEventListener('keydown', onKey)
      canvas?.removeEventListener('touchstart', onTouchStart)
      canvas?.removeEventListener('touchmove',  onTouchMove)
      canvas?.removeEventListener('touchend',   onTouchEnd)
    }
  }, [])

  // Game loop
  useEffect(() => {
    let last = 0
    const SPEED = 120 // ms per tick
    const frame = (ts) => {
      if (ts - last >= SPEED) { tick(); last = ts }
      draw()
      loopRef.current = requestAnimationFrame(frame)
    }
    loopRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(loopRef.current)
  }, [tick, draw])

  return (
    <div className="snake-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="snake-modal">
        <div className="snake-header">
          <span className="snake-title">◆ SNAKE ◆</span>
          <span className="snake-scores">SCORE: {score} · BEST: {best}</span>
          <button className="snake-close" onClick={onClose}>✕</button>
        </div>

        <canvas
          ref={canvasRef}
          width={COLS * CELL}
          height={ROWS * CELL}
          className="snake-canvas"
        />

        {phase !== 'running' && (
          <div className="snake-overlay-msg">
            {phase === 'dead' && <p className="snake-dead">GAME OVER — SCORE: {score}</p>}
            {phase === 'idle' && <p className="snake-idle">PRESS START</p>}
            <button className="btn btn-primary" onClick={startGame}>
              {phase === 'dead' ? 'PLAY AGAIN' : 'START GAME'}
            </button>
          </div>
        )}

        <p className="snake-hint">ARROWS / WASD / SWIPE · ESC TO CLOSE</p>
      </div>
    </div>
  )
}
