import { useEffect } from 'react'

export default function Cursor() {
  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return

    document.body.classList.add('custom-cursor')

    // Pixel trail (follows behind the Win98 cursor)
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

    const onMove = (e) => { mx = e.clientX; my = e.clientY }

    let raf
    function loop() {
      positions.unshift({ x: mx, y: my })
      positions.length = TRAIL_LEN
      trails.forEach((el, i) => {
        el.style.transform = `translate(${positions[i].x - 2}px, ${positions[i].y - 2}px)`
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
    }
  }, [])

  return null
}
