import { useEffect } from 'react'

const SPARKLE_COLORS = ['#00e5cc', '#ffe066', '#ff6eaf', '#88ff88', '#a0c4ff']

export default function Cursor() {
  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return

    document.body.classList.add('custom-cursor')

    // ── Pixel trail ───────────────────────────────────────────────────────────
    const TRAIL_LEN = 6
    const trails = Array.from({ length: TRAIL_LEN }, (_, i) => {
      const el = document.createElement('div')
      el.className = 'cursor-trail'
      el.style.opacity = String(0.5 - i * 0.07)
      el.style.width = el.style.height = `${4 - i * 0.4}px`
      document.body.appendChild(el)
      return el
    })

    let mx = -100, my = -100
    const positions = Array.from({ length: TRAIL_LEN }, () => ({ x: -100, y: -100 }))

    // ── Sparkle particles ─────────────────────────────────────────────────────
    let particles = []

    function spawnSparkle(x, y) {
      for (let i = 0; i < 2; i++) {
        const el = document.createElement('div')
        el.className = 'cursor-sparkle'
        const size = 2 + Math.random() * 3 | 0
        el.style.cssText = `width:${size}px;height:${size}px;background:${
          SPARKLE_COLORS[Math.random() * SPARKLE_COLORS.length | 0]
        };image-rendering:pixelated;`
        document.body.appendChild(el)
        particles.push({
          el,
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 2.5,
          vy: -(Math.random() * 2 + 1),
          alpha: 0.9 + Math.random() * 0.1,
          decay: 0.04 + Math.random() * 0.03,
        })
      }
    }

    let lastSpawnX = -99, lastSpawnY = -99
    const onMove = (e) => {
      mx = e.clientX; my = e.clientY
      const dx = mx - lastSpawnX, dy = my - lastSpawnY
      if (dx * dx + dy * dy > 64) {   // spawn every ~8px of movement
        spawnSparkle(mx, my)
        lastSpawnX = mx; lastSpawnY = my
      }
    }

    let raf
    function loop() {
      // Trail
      positions.unshift({ x: mx, y: my })
      positions.length = TRAIL_LEN
      trails.forEach((el, i) => {
        el.style.transform = `translate(${positions[i].x - 2}px, ${positions[i].y - 2}px)`
      })

      // Sparkles
      particles = particles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.alpha -= p.decay
        if (p.alpha <= 0) { p.el.remove(); return false }
        p.el.style.transform = `translate(${p.x}px, ${p.y}px)`
        p.el.style.opacity = String(p.alpha)
        return true
      })

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      document.body.classList.remove('custom-cursor')
      trails.forEach(el => el.remove())
      particles.forEach(p => p.el.remove())
    }
  }, [])

  return null
}
