import { useEffect, useRef } from 'react'

const POOL_SIZE = 20
const DURATION  = 500 // ms

export default function CursorSparkle() {
  const poolRef  = useRef([])
  const indexRef = useRef(0)

  useEffect(() => {
    const nodes = []
    for (let i = 0; i < POOL_SIZE; i++) {
      const el = document.createElement('div')
      el.style.cssText =
        'position:fixed;pointer-events:none;z-index:9999;width:4px;height:4px;' +
        'border-radius:1px;opacity:0;will-change:transform,opacity'
      document.body.appendChild(el)
      nodes.push(el)
    }
    poolRef.current = nodes

    const onMove = (e) => {
      const el = poolRef.current[indexRef.current % POOL_SIZE]
      indexRef.current++

      // Setting animation to 'none' then forcing a reflow is the standard
      // trick to restart a CSS animation on an element that may already be running it.
      el.style.animation  = 'none'
      el.style.left       = `${e.clientX - 2}px`
      el.style.top        = `${e.clientY - 2}px`
      el.style.background = indexRef.current % 2 === 0 ? 'var(--c1)' : 'var(--c2)'
      void el.offsetWidth
      el.style.animation  = `sparkle-drift ${DURATION}ms ease forwards`
    }

    window.addEventListener('mousemove', onMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      nodes.forEach(el => el.remove())
    }
  }, [])

  return null
}
