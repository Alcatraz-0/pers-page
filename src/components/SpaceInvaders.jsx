import { useEffect, useRef, useState } from 'react'
import { addCoins } from '../utils/coins'
import { playEat, playSuccess, playGameOver, playBlip } from '../utils/sound'

const W = 400, H = 300, PW = 28, INV_COLS = 8, INV_ROWS = 4

function drawBug(ctx, x, y, frame) {
  ctx.fillStyle = '#ff6644'
  ctx.fillRect(x + 2, y + 2, 10, 8)
  ctx.fillStyle = '#fff'
  ctx.fillRect(x + 3, y + 3, 2, 2); ctx.fillRect(x + 9, y + 3, 2, 2)
  ctx.fillStyle = '#ff6644'
  if (frame % 2 === 0) { ctx.fillRect(x + 1, y, 2, 3); ctx.fillRect(x + 11, y, 2, 3) }
  else { ctx.fillRect(x, y + 1, 3, 2); ctx.fillRect(x + 11, y + 1, 3, 2) }
  ctx.fillRect(x, y + 7, 3, 2); ctx.fillRect(x + 4, y + 9, 6, 2); ctx.fillRect(x + 11, y + 7, 3, 2)
}

function GameCanvas({ onClose, onOver }) {
  const canvasRef = useRef(null)
  const [ui, setUi] = useState({ lives: 3, score: 0 })

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf = null, playerX = W / 2 - PW / 2, bullets = [], bombs = [], invFrame = 0, invTimer = 0
    let invDX = 1.2, lives = 3, score = 0, wave = 1, bombTimer = 0

    const makeInvaders = () => {
      const a = []
      for (let r = 0; r < INV_ROWS; r++)
        for (let c = 0; c < INV_COLS; c++)
          a.push({ x: 24 + c * 42, y: 30 + r * 32, alive: true })
      return a
    }
    let inv = makeInvaders()

    const keys = {}
    const onKey = e => {
      keys[e.key] = e.type === 'keydown'
      if (e.key === ' ' && e.type === 'keydown' && bullets.length < 3) {
        bullets.push({ x: playerX + PW / 2, y: H - 40 })
        playBlip(880)
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)

    let last = 0
    const die = () => { onOver(score); playGameOver() }

    const loop = ts => {
      const dt = Math.min(32, ts - last); last = ts
      ctx.fillStyle = '#0a0a14'; ctx.fillRect(0, 0, W, H)

      if (keys['ArrowLeft']) playerX = Math.max(0, playerX - 3)
      if (keys['ArrowRight']) playerX = Math.min(W - PW, playerX + 3)

      invTimer += dt
      if (invTimer > 400) { invFrame++; invTimer = 0 }

      let alive = inv.filter(i => i.alive)

      if (!alive.length) {
        addCoins(15); playSuccess(); wave++
        inv = makeInvaders(); invDX = 1.2 + wave * 0.2
        alive = inv.filter(i => i.alive)
      }

      // Bounce off walls then advance
      const lm = Math.min(...alive.map(i => i.x))
      const rm = Math.max(...alive.map(i => i.x + 14))
      if (rm > W - 4 || lm < 4) { inv.forEach(i => i.y += 16); invDX *= -1 }
      inv.forEach(i => { if (i.alive) i.x += invDX })

      if (alive.some(i => i.y > H - 60)) {
        lives--
        setUi(u => ({ ...u, lives: lives }))
        if (lives <= 0) { die(); return }
        inv = makeInvaders()
      }

      bombTimer += dt
      if (bombTimer > 1200 / wave && alive.length) {
        bombTimer = 0
        const sh = alive[Math.floor(Math.random() * alive.length)]
        bombs.push({ x: sh.x + 7, y: sh.y + 14 })
      }
      bombs.forEach(b => b.y += 2.5)
      let playerHit = false
      bombs = bombs.filter(b => {
        if (b.y > H - 20 && b.x > playerX && b.x < playerX + PW) {
          lives--; setUi(u => ({ ...u, lives: lives })); playBlip(200)
          if (lives <= 0) playerHit = true
          return false
        }
        return b.y < H
      })
      if (playerHit) { die(); return }

      bullets.forEach(b => b.y -= 5)
      bullets = bullets.filter(b => {
        if (b.y < 0) return false
        let hit = false
        inv.forEach(i => {
          if (!i.alive) return
          if (b.x > i.x && b.x < i.x + 14 && b.y > i.y && b.y < i.y + 14) {
            i.alive = false; hit = true; score += 20
            setUi(u => ({ ...u, score: u.score + 20 }))
            addCoins(2); playEat()
          }
        })
        return !hit
      })

      inv.forEach(i => { if (i.alive) drawBug(ctx, i.x, i.y, invFrame) })

      ctx.fillStyle = '#00ff88'
      ctx.fillRect(playerX, H - PW - 8, PW, 12)
      ctx.fillRect(playerX + PW / 2 - 3, H - PW - 14, 6, 6)

      ctx.fillStyle = '#ffff00'
      bullets.forEach(b => ctx.fillRect(b.x - 1, b.y, 3, 8))

      ctx.fillStyle = '#ff4444'
      bombs.forEach(b => ctx.fillRect(b.x - 1, b.y, 3, 8))

      ctx.fillStyle = '#888'; ctx.font = '8px monospace'; ctx.textAlign = 'left'
      ctx.fillText(`♥${lives}  SCORE:${score}  WAVE:${wave}`, 6, 14)
      ctx.fillText('←→ MOVE · SPACE SHOOT', 6, H - 4)

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKey)
    }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="snake-header">
        <span className="snake-title">👾 BUG BLASTER</span>
        <span className="snake-scores">♥{ui.lives} · {ui.score}pts</span>
        <button className="snake-close" onClick={onClose}>✕</button>
      </div>
      <canvas ref={canvasRef} width={W} height={H} />
    </>
  )
}

export default function SpaceInvaders({ onClose }) {
  const [gameKey, setGameKey] = useState(0)
  const [finalScore, setFinalScore] = useState(null)

  const handleRetry = () => { setFinalScore(null); setGameKey(k => k + 1) }

  return (
    <div className="snake-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="snake-modal invaders-modal">
        {finalScore === null
          ? <GameCanvas key={gameKey} onClose={onClose} onOver={setFinalScore} />
          : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p className="snake-title">👾 BUG BLASTER</p>
              <p className="snake-hint" style={{ margin: '0.75rem 0' }}>GAME OVER — {finalScore}pts</p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button className="w98-btn-ok" onClick={handleRetry}>RETRY</button>
                <button className="w98-btn-ok" onClick={onClose}>CLOSE</button>
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}
