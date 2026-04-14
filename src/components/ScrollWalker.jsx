import { useEffect, useRef } from 'react'
import PixelSprite from './PixelSprite'

export default function ScrollWalker() {
  const wrapRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return  // skip touch devices

    const el = wrapRef.current
    if (!el) return

    // Top/bottom margins (px) — so the character doesn't clip into nav or footer
    const TOP_OFFSET = 80
    const BOT_OFFSET = 120

    function onScroll() {
      const scrolled = window.scrollY
      const total    = document.body.scrollHeight - window.innerHeight
      if (total <= 0) return

      const progress = Math.min(1, Math.max(0, scrolled / total))
      const available = window.innerHeight - TOP_OFFSET - BOT_OFFSET
      const top = TOP_OFFSET + progress * available

      el.style.transform = `translateY(${top}px)`
      // Flip sprite to face the direction of scroll (down = face-right, up = face-left)
      el.style.transform += progress < 0.5 ? ' scaleX(1)' : ' scaleX(-1)'
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      ref={wrapRef}
      className="scroll-walker"
      title="Scroll walker — I follow your progress!"
      aria-hidden="true"
    >
      <PixelSprite />
    </div>
  )
}
