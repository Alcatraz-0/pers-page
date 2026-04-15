import { useEffect, useRef, useState } from 'react'
import PixelSprite from './PixelSprite'

export default function ScrollWalker() {
  const wrapRef = useRef(null)
  const [bubble, setBubble] = useState(null)
  const [jumping, setJumping] = useState(false)
  const lastMilestone = useRef(null)
  const bubbleTimer = useRef(null)
  const jumpTimer = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return
    const el = wrapRef.current
    if (!el) return

    const TOP_OFFSET = 80, BOT_OFFSET = 120

    const showBubble = (text) => {
      clearTimeout(bubbleTimer.current)
      clearTimeout(jumpTimer.current)
      setBubble(text)
      setJumping(true)
      bubbleTimer.current = setTimeout(() => setBubble(null), 2500)
      jumpTimer.current = setTimeout(() => setJumping(false), 400)
    }

    const onScroll = () => {
      const scrolled = window.scrollY
      const total = document.body.scrollHeight - window.innerHeight
      if (total <= 0) return
      const progress = Math.min(1, Math.max(0, scrolled / total))
      const top = TOP_OFFSET + progress * (window.innerHeight - TOP_OFFSET - BOT_OFFSET)
      el.style.transform = `translateY(${top}px)${progress < 0.5 ? ' scaleX(1)' : ' scaleX(-1)'}`

      const pct = Math.round(progress * 100)
      if (pct >= 50 && pct < 55 && lastMilestone.current !== 50) {
        lastMilestone.current = 50
        showBubble('HALFWAY THERE!')
      } else if (pct >= 98 && lastMilestone.current !== 100) {
        lastMilestone.current = 100
        showBubble('YOU MADE IT! ★')
      } else if (pct < 5) {
        lastMilestone.current = 0
      }
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(bubbleTimer.current)
      clearTimeout(jumpTimer.current)
    }
  }, [])

  return (
    <div ref={wrapRef} className={`scroll-walker${jumping ? ' walker-jumping' : ''}`}
      title="Scroll walker" aria-hidden="true">
      {bubble && <div className="walker-bubble">{bubble}</div>}
      <PixelSprite />
    </div>
  )
}
