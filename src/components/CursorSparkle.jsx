import { useEffect } from 'react'

const POOL_SIZE = 20
const DURATION  = 500 // ms

export default function CursorSparkle() {
  useEffect(() => {
    // Skip entirely on touch / coarse-pointer devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    const rainbow = localStorage.getItem('cursor-rainbow') === '1'

    const pool = []
    for (let i = 0; i < POOL_SIZE; i++) {
      const el = document.createElement('div')
      el.style.cssText =
        'position:fixed;top:0;left:0;pointer-events:none;z-index:9999;width:4px;height:4px;' +
        'border-radius:1px;opacity:0;will-change:transform,opacity'
      document.body.appendChild(el)
      pool.push(el)
    }

    // Mutated in-place — avoids object allocation on every mousemove / spawn
    const latest   = { x: 0, y: 0 }
    const lastSpawn = { x: -999, y: -999 }
    let poolIdx = 0

    const onMove = (e) => {
      latest.x = e.clientX
      latest.y = e.clientY
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    function spawnParticle(x, y) {
      const el = pool[poolIdx % POOL_SIZE]
      poolIdx++
      el.style.animation  = 'none'
      el.style.transform  = `translate(${x - 2}px, ${y - 2}px)`
      el.style.background = poolIdx % 2 === 0 ? 'var(--c1)' : 'var(--c2)'
      void el.offsetWidth
      el.style.animation  = `sparkle-drift ${DURATION}ms ease forwards`
    }

    let rafId
    function loop() {
      const { x, y } = latest
      const dx = x - lastSpawn.x, dy = y - lastSpawn.y

      if (dx * dx + dy * dy > 4) { // moved more than 2px since last spawn
        spawnParticle(x, y)
        if (rainbow) spawnParticle(x, y)
        lastSpawn.x = x
        lastSpawn.y = y
      }

      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
      pool.forEach(el => el.remove())
    }
  }, [])

  return null
}
