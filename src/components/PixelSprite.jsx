import { useEffect, useRef } from 'react'

const FRAMES = [
  [
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,0,1,1,0,1,1],
    [1,1,1,1,1,1,1,1],
    [0,0,1,0,0,1,0,0],
    [0,1,0,1,1,0,1,0],
    [1,0,0,0,0,0,0,1],
  ],
  [
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,0,1,1,0,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,0,0,1,1,0],
    [1,0,1,1,1,1,0,1],
    [0,1,0,0,0,0,1,0],
  ],
]

const PX = 4
const FPS = 12
const FRAME_MS = 1000 / FPS

export default function PixelSprite() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const cols = FRAMES[0][0].length
    const rows = FRAMES[0].length
    canvas.width = cols * PX
    canvas.height = rows * PX

    let frame = 0
    let tick = 0
    let raf = null
    let visible = true
    let lastFrame = 0

    // Read once, update only when palette changes
    let c1 = getComputedStyle(document.documentElement).getPropertyValue('--c1').trim() || '#2563eb'
    const attrObs = new MutationObserver(() => {
      c1 = getComputedStyle(document.documentElement).getPropertyValue('--c1').trim() || '#2563eb'
    })
    attrObs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-palette'],
    })

    function draw(ts) {
      if (!visible) { raf = null; return }
      if (ts - lastFrame < FRAME_MS) { raf = requestAnimationFrame(draw); return }
      lastFrame = ts

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = c1
      FRAMES[frame].forEach((row, y) => {
        row.forEach((on, x) => {
          if (on) ctx.fillRect(x * PX, y * PX, PX, PX)
        })
      })

      tick++
      if (tick % 4 === 0) frame = (frame + 1) % 2
      raf = requestAnimationFrame(draw)
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !raf) raf = requestAnimationFrame(draw)
    }, { threshold: 0 })
    io.observe(canvas)

    raf = requestAnimationFrame(draw)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      raf = null
      io.disconnect()
      attrObs.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{ imageRendering: 'pixelated', display: 'block' }}
    />
  )
}
