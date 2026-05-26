import { useEffect } from 'react'

const POOL_SIZE = 20
const DURATION  = 500 // ms

export default function CursorSparkle() {
  useEffect(() => {
    // Skip on touch / coarse-pointer devices and when user prefers reduced motion
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

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

    const lastSpawn = { x: -999, y: -999 }
    let poolIdx = 0
    let pending = false
    let raf = 0
    let pendingX = 0, pendingY = 0

    function spawnParticle(x, y) {
      const el = pool[poolIdx % POOL_SIZE]
      poolIdx++
      el.style.animation  = 'none'
      el.style.transform  = `translate(${x - 2}px, ${y - 2}px)`
      el.style.background = poolIdx % 2 === 0 ? 'var(--c1)' : 'var(--c2)'
      void el.offsetWidth
      el.style.animation  = `sparkle-drift ${DURATION}ms ease forwards`
    }

    function flush() {
      pending = false
      raf = 0
      const dx = pendingX - lastSpawn.x, dy = pendingY - lastSpawn.y
      if (dx * dx + dy * dy > 4) {
        spawnParticle(pendingX, pendingY)
        if (rainbow) spawnParticle(pendingX, pendingY)
        lastSpawn.x = pendingX
        lastSpawn.y = pendingY
      }
    }

    const onMove = (e) => {
      pendingX = e.clientX
      pendingY = e.clientY
      if (pending || document.hidden) return
      pending = true
      raf = requestAnimationFrame(flush)
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      if (raf) cancelAnimationFrame(raf)
      pool.forEach(el => el.remove())
    }
  }, [])

  return null
}
