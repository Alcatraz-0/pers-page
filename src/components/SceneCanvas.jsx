import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react'

const FPS = 30
const FRAME_MS = 1000 / FPS

function rand(min, max) { return min + Math.random() * (max - min) }
function randInt(min, max) { return Math.floor(rand(min, max + 1)) }

// Pixel-art star + shooting-star overlay for night skies
// Storm mode: rain + lightning
// Day mode draws nothing — the PNG handles it
const SceneCanvas = forwardRef(function SceneCanvas({ mode = 'night' }, ref) {
  const canvasRef       = useRef(null)
  const modeRef         = useRef(mode)
  const reinitRef       = useRef(false)
  const meteorShowerRef = useRef(false)   // set true to trigger burst next frame

  useEffect(() => {
    if (modeRef.current !== mode) {
      modeRef.current = mode
      reinitRef.current = true
    }
  }, [mode])

  useImperativeHandle(ref, () => ({
    triggerMeteorShower() { meteorShowerRef.current = true },
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let W = 0, H = 0, time = 0
    let raf = null, lastFrame = 0, visible = true

    // ── Night: stars ──────────────────────────────────────────────────────────
    let stars = [], shooters = [], nextShoot = 0, nightDrops = []

    function initStars() {
      stars = []
      // bright
      for (let i = 0; i < 55; i++) stars.push({
        x: Math.floor(rand(0, W)), y: Math.floor(rand(0, H * 0.82)),
        size: 2, alpha: rand(0.7, 1), twinkle: rand(0.03, 0.06), phase: rand(0, Math.PI * 2),
      })
      // mid
      for (let i = 0; i < 90; i++) stars.push({
        x: Math.floor(rand(0, W)), y: Math.floor(rand(0, H * 0.82)),
        size: 1, alpha: rand(0.4, 0.75), twinkle: rand(0.02, 0.05), phase: rand(0, Math.PI * 2),
      })
      // dim
      for (let i = 0; i < 120; i++) stars.push({
        x: Math.floor(rand(0, W)), y: Math.floor(rand(0, H * 0.82)),
        size: 1, alpha: rand(0.15, 0.4), twinkle: rand(0.01, 0.03), phase: rand(0, Math.PI * 2),
      })
      shooters = []
      nextShoot = time + randInt(80, 200)
      // Sparse night rain — light mist that doesn't overpower the stars
      nightDrops = Array.from({ length: 45 }, () => ({
        x: rand(0, W), y: rand(-H, H),
        speed: rand(3, 7), len: randInt(2, 5),
        alpha: rand(0.04, 0.13),
      }))
    }

    function drawNightRain() {
      ctx.lineWidth = 1
      nightDrops.forEach(d => {
        const dx = d.speed * 0.15
        ctx.globalAlpha = d.alpha
        ctx.strokeStyle = 'rgba(160,190,255,0.6)'
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + dx, d.y + d.len); ctx.stroke()
        d.x += dx; d.y += d.speed
        if (d.y > H + 10) { d.y = rand(-30, -5); d.x = rand(0, W) }
        if (d.x > W + 10) d.x -= W
      })
      ctx.globalAlpha = 1
    }

    function drawStars() {
      stars.forEach(s => {
        const a = s.alpha * (0.5 + 0.5 * Math.sin(time * s.twinkle + s.phase))
        ctx.fillStyle = `rgba(220, 235, 255, ${a})`
        ctx.fillRect(s.x, s.y, s.size, s.size)
      })
    }

    function spawnShooter() {
      const angle = rand(Math.PI / 10, Math.PI / 3.5)
      const spd   = rand(8, 16)
      shooters.push({
        x: rand(W * 0.05, W * 0.8),
        y: rand(H * 0.02, H * 0.28),
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0, maxLife: randInt(20, 38),
        trail: [],
      })
      nextShoot = time + randInt(150, 400)
    }

    function drawShooters() {
      shooters = shooters.filter(s => s.life < s.maxLife)
      shooters.forEach(s => {
        s.trail.push({ x: Math.floor(s.x), y: Math.floor(s.y) })
        if (s.trail.length > 18) s.trail.shift()
        s.x += s.vx; s.y += s.vy; s.life++

        const prog = 1 - s.life / s.maxLife
        s.trail.forEach((p, i) => {
          const t = (i + 1) / s.trail.length
          ctx.fillStyle = `rgba(255, 255, 240, ${t * prog * 0.85})`
          const sz = t > 0.7 ? 2 : 1
          ctx.fillRect(p.x, p.y, sz, sz)
        })
        ctx.fillStyle = `rgba(255, 255, 255, ${prog})`
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y), 2, 2)
      })
    }

    // ── Storm: rain + lightning ───────────────────────────────────────────────
    let drops = [], lightning = null, nextLightning = 0

    function initRain() {
      drops = Array.from({ length: 220 }, () => ({
        x: rand(0, W),
        y: rand(-H, H),
        speed: rand(14, 26),
        len: randInt(6, 14),
        alpha: rand(0.25, 0.55),
      }))
      lightning = null
      nextLightning = time + randInt(60, 180)
    }

    function drawRain() {
      ctx.strokeStyle = 'rgba(180, 210, 255, 0.45)'
      ctx.lineWidth = 1
      drops.forEach(d => {
        // slight diagonal
        const dx = d.speed * 0.18
        ctx.globalAlpha = d.alpha
        ctx.beginPath()
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x + dx, d.y + d.len)
        ctx.stroke()
        d.x += dx
        d.y += d.speed
        if (d.y > H + 20) {
          d.y = rand(-40, -10)
          d.x = rand(0, W)
        }
        if (d.x > W + 20) d.x -= W
      })
      ctx.globalAlpha = 1
    }

    // Draw a jagged lightning bolt from (sx,sy) downward
    function drawLightningBolt(sx, sy, targetY, alpha) {
      const segments = 12
      const segH = (targetY - sy) / segments
      let cx = sx, cy = sy
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      for (let i = 0; i < segments; i++) {
        const nx = cx + rand(-30, 30)
        const ny = cy + segH
        ctx.lineTo(nx, ny)
        cx = nx; cy = ny
      }
      ctx.strokeStyle = `rgba(200, 230, 255, ${alpha})`
      ctx.lineWidth = alpha > 0.7 ? 2 : 1
      ctx.shadowBlur = 12 * alpha
      ctx.shadowColor = 'rgba(150, 200, 255, 0.9)'
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    function spawnLightning() {
      const x = rand(W * 0.1, W * 0.9)
      lightning = {
        x,
        y: rand(0, H * 0.15),
        targetY: H * rand(0.5, 0.85),
        life: 0,
        // phases: flash (0-3), bright (3-8), fade (8-18)
        maxLife: 18,
      }
      nextLightning = time + randInt(90, 280)
    }

    function drawLightning() {
      if (!lightning) return
      const { life, maxLife, x, y, targetY } = lightning
      lightning.life++

      let alpha = 0
      if (life < 3)       alpha = life / 3           // flash in
      else if (life < 8)  alpha = 1                  // bright
      else                alpha = 1 - (life - 8) / (maxLife - 8) // fade out

      if (alpha <= 0) { lightning = null; return }

      // Full-canvas flash
      ctx.fillStyle = `rgba(200, 220, 255, ${alpha * 0.08})`
      ctx.fillRect(0, 0, W, H)

      drawLightningBolt(x, y, targetY, alpha)
      // Second branch
      if (alpha > 0.4) {
        const branchX = x + rand(-60, 60)
        const branchY = y + (targetY - y) * rand(0.3, 0.6)
        drawLightningBolt(branchX, branchY, branchY + (targetY - branchY) * 0.6, alpha * 0.6)
      }
    }

    // ── Evening: fireflies + soft rain ────────────────────────────────────────
    let flies = [], softDrops = []

    function initEvening() {
      flies = Array.from({ length: 28 }, () => ({
        x: rand(W * 0.05, W * 0.95),
        y: rand(H * 0.3, H * 0.92),
        vx: rand(-0.4, 0.4),
        vy: rand(-0.25, 0.25),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.04, 0.09),
        size: randInt(2, 3),
      }))
      softDrops = Array.from({ length: 60 }, () => ({
        x: rand(0, W),
        y: rand(-H, H),
        speed: rand(4, 9),
        len: randInt(3, 7),
        alpha: rand(0.08, 0.22),
      }))
    }

    function drawEvening() {
      // Soft rain
      ctx.lineWidth = 1
      softDrops.forEach(d => {
        const dx = d.speed * 0.12
        ctx.globalAlpha = d.alpha
        ctx.strokeStyle = 'rgba(180,200,240,0.5)'
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + dx, d.y + d.len); ctx.stroke()
        d.x += dx; d.y += d.speed
        if (d.y > H + 10) { d.y = rand(-30, -5); d.x = rand(0, W) }
        if (d.x > W + 10) d.x -= W
      })
      ctx.globalAlpha = 1

      // Fireflies — small glowing squares that pulse and drift
      flies.forEach(f => {
        f.x += f.vx; f.y += f.vy
        f.phase += f.speed
        // Wrap around
        if (f.x < 0) f.x = W; if (f.x > W) f.x = 0
        if (f.y < H * 0.25) f.vy += 0.02
        if (f.y > H * 0.95) f.vy -= 0.02

        const pulse = 0.4 + 0.6 * Math.abs(Math.sin(f.phase))
        const alpha = pulse * 0.9

        // Glow halo
        ctx.fillStyle = `rgba(180, 255, 140, ${alpha * 0.18})`
        ctx.fillRect(Math.floor(f.x) - 2, Math.floor(f.y) - 2, f.size + 4, f.size + 4)
        // Core pixel
        ctx.fillStyle = `rgba(220, 255, 160, ${alpha})`
        ctx.fillRect(Math.floor(f.x), Math.floor(f.y), f.size, f.size)
      })
    }

    // ── Init dispatcher ───────────────────────────────────────────────────────
    function init() {
      if (modeRef.current === 'night') initStars()
      else if (modeRef.current === 'storm') initRain()
      else if (modeRef.current === 'evening') initEvening()
    }

    // ── Main loop ─────────────────────────────────────────────────────────────
    function draw(ts) {
      if (!visible) { raf = null; return }
      if (ts - lastFrame < FRAME_MS) { raf = requestAnimationFrame(draw); return }
      lastFrame = ts

      if (reinitRef.current) { reinitRef.current = false; init() }

      // Meteor shower burst — spawn 10 shooters at once
      if (meteorShowerRef.current) {
        meteorShowerRef.current = false
        if (modeRef.current === 'night' || modeRef.current === 'evening') {
          // shooters[] is shared between night and evening — no need to reinit stars
          for (let i = 0; i < 10; i++) {
            const angle = rand(Math.PI / 10, Math.PI / 3.5)
            const spd   = rand(10, 20)
            shooters.push({
              x: rand(W * 0.02, W * 0.75),
              y: rand(H * 0.01, H * 0.22),
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              life: 0, maxLife: randInt(22, 42),
              trail: [],
            })
          }
          nextShoot = time + randInt(200, 400)
        }
      }

      ctx.clearRect(0, 0, W, H)

      if (modeRef.current === 'night') {
        drawStars()
        drawNightRain()
        if (time >= nextShoot) spawnShooter()
        drawShooters()
      } else if (modeRef.current === 'storm') {
        drawRain()
        if (time >= nextLightning) spawnLightning()
        drawLightning()
      } else if (modeRef.current === 'evening') {
        drawEvening()
        if (shooters.length > 0) drawShooters()   // meteor shower burst visible in evening too
      }

      time++
      raf = requestAnimationFrame(draw)
    }

    function resize() {
      W = canvas.offsetWidth; H = canvas.offsetHeight
      canvas.width = W; canvas.height = H
      init()
    }

    const resizeObs = new ResizeObserver(resize)
    resizeObs.observe(canvas)
    resize()

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) raf = requestAnimationFrame(draw)
    }, { threshold: 0 })
    io.observe(canvas)
    raf = requestAnimationFrame(draw)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      raf = null; io.disconnect(); resizeObs.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}
    />
  )
})

export default SceneCanvas
