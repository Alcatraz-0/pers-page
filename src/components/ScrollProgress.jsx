import { useEffect, useRef } from 'react'

export default function ScrollProgress() {
  const fillRef = useRef(null)

  useEffect(() => {
    const el = document.documentElement
    let total = el.scrollHeight - el.clientHeight
    let raf = 0
    let ticking = false

    const recomputeTotal = () => { total = el.scrollHeight - el.clientHeight }
    recomputeTotal()

    const write = () => {
      ticking = false
      if (!fillRef.current) return
      const pct = total > 0 ? (window.scrollY / total) * 100 : 0
      fillRef.current.style.width = pct + '%'
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      raf = requestAnimationFrame(write)
    }
    const onResize = () => { recomputeTotal(); onScroll() }

    write()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="scroll-progress-track">
      <div ref={fillRef} className="scroll-progress-fill" />
    </div>
  )
}
