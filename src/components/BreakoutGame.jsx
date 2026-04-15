import { useEffect, useRef, useState } from 'react'
import { addCoins } from '../utils/coins'
import { playEat, playSuccess, playGameOver } from '../utils/sound'

const W=400,H=320,PW=60,PH=8
const BCOLS=8,BROWS=4,BW=44,BH=18,BP=4
const LABELS=['var','// TODO','any','console.log','!important','goto','magic#','spaghetti']
const COLORS=['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6','#1abc9c','#e74c3c']

function GameInstance({ onClose, onRetry }) {
  const canvasRef = useRef(null)
  const [info, setInfo] = useState({ lives: 3, score: 0, status: 'idle' })

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf = null, padX = W/2-PW/2, bx = W/2, by = H-60, bdx = 2.5, bdy = -2.5
    let launched = false, lives = 3, score = 0, level = 1
    const makeBricks = () => {
      const b = []
      for (let r = 0; r < BROWS; r++)
        for (let c = 0; c < BCOLS; c++)
          b.push({ r, c, alive: true, x: BP + c*(BW+BP)+2, y: 30 + r*(BH+BP) })
      return b
    }
    let bs = makeBricks()
    const keys = {}

    const onKey = e => {
      keys[e.key] = e.type === 'keydown'
      if (e.key === ' ' && e.type === 'keydown') {
        launched = true
        setInfo(i => ({ ...i, status: 'playing' }))
      }
    }
    const onMouse = e => {
      const r = canvas.getBoundingClientRect()
      padX = Math.min(W-PW, Math.max(0, e.clientX - r.left - PW/2))
      if (!launched) { launched = true; setInfo(i => ({ ...i, status: 'playing' })) }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
    canvas.addEventListener('mousemove', onMouse)
    canvas.addEventListener('click', onMouse)

    const reset = (keepLevel = false) => {
      padX = W/2-PW/2; bx = padX+PW/2; by = H-60
      const spd = 2.5 + (level-1) * 0.4
      bdx = spd * (Math.random() < 0.5 ? 1 : -1); bdy = -spd
      launched = false
      if (!keepLevel) { bs = makeBricks(); level = 1 }
    }
    reset()

    const loop = () => {
      ctx.fillStyle = '#1a1612'; ctx.fillRect(0, 0, W, H)
      ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'
      bs.forEach(b => {
        if (!b.alive) return
        ctx.fillStyle = COLORS[b.c % COLORS.length]; ctx.fillRect(b.x, b.y, BW, BH)
        ctx.fillStyle = '#000'
        ctx.fillText(LABELS[b.c % LABELS.length], b.x+BW/2, b.y+13)
      })
      if (launched) {
        if (keys['ArrowLeft'])  padX = Math.max(0, padX - 18)
        if (keys['ArrowRight']) padX = Math.min(W-PW, padX + 18)
        bx += bdx; by += bdy
        if (bx <= 4 || bx >= W-4) bdx *= -1
        if (by <= 4) bdy *= -1
        if (by >= H-28 && bx >= padX && bx <= padX+PW) {
          bdy = -Math.abs(bdy)
          bdx = (bx - (padX+PW/2)) / (PW/2) * 3.5
        }
        if (by > H) {
          lives--
          setInfo(i => ({ ...i, lives }))
          if (lives <= 0) {
            setInfo(i => ({ ...i, status: 'dead' }))
            playGameOver()
            raf = null; return
          }
          reset(true)
        }
        bs.forEach(b => {
          if (!b.alive) return
          if (bx >= b.x && bx <= b.x+BW && by >= b.y && by <= b.y+BH) {
            b.alive = false; bdy *= -1; score += 10
            setInfo(i => ({ ...i, score: i.score+10 })); addCoins(1); playEat()
          }
        })
        if (bs.every(b => !b.alive)) {
          level++; addCoins(10); playSuccess()
          bs = makeBricks(); reset(true)
        }
      } else { bx = padX+PW/2 }
      ctx.fillStyle = '#00ff88'; ctx.fillRect(padX, H-20, PW, PH)
      ctx.fillStyle = '#fff'; ctx.fillRect(bx-4, by-4, 8, 8)
      ctx.fillStyle = '#aaa'; ctx.font = '8px monospace'; ctx.textAlign = 'left'
      ctx.fillText(`\u2665${lives} SCORE:${score} LVL:${level}`, 6, 18)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKey)
      canvas.removeEventListener('mousemove', onMouse)
      canvas.removeEventListener('click', onMouse)
    }
  }, [])

  return (
    <div className="snake-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="snake-modal breakout-modal">
        <div className="snake-header">
          <span className="snake-title">▦ TECH DEBT SMASHER</span>
          <span className="snake-scores">♥{info.lives} · {info.score}pts</span>
          <button className="snake-close" onClick={onClose}>✕</button>
        </div>
        <canvas ref={canvasRef} width={W} height={H} className="breakout-canvas" />
        {info.status === 'idle' && (
          <p className="snake-hint">CLICK OR SPACE TO LAUNCH · ←→ MOVE PADDLE</p>
        )}
        {info.status === 'dead' && (
          <div style={{ textAlign: 'center', padding: '0.5rem' }}>
            <p className="snake-hint">GAME OVER</p>
            <button className="w98-btn-ok" onClick={onRetry}>RETRY</button>
          </div>
        )}
      </div>
    </div>
  )
}

// Wrapper holds a remount key so RETRY fully re-initialises the canvas effect
export default function BreakoutGame({ onClose }) {
  const [runKey, setRunKey] = useState(0)
  return (
    <GameInstance
      key={runKey}
      onClose={onClose}
      onRetry={() => setRunKey(k => k + 1)}
    />
  )
}
