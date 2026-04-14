import { useEffect, useRef, useState } from 'react'
import { useIsDark } from '../hooks/useIsDark'
import { CONTACT_ITEMS } from '../data/index'
import PixelSprite from './PixelSprite'
import { addCoins } from '../utils/coins'
import { playSuccess } from '../utils/sound'

const FPS = 24
const FRAME_MS = 1000 / FPS
const S = '/sprites/'
const T = '/tiles/'

function rand(min, max) { return min + Math.random() * (max - min) }

// ── Firefly canvas ────────────────────────────────────────────────────────────
function useFireflyCanvas(dark) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W = canvas.offsetWidth, H = canvas.offsetHeight
    canvas.width = W; canvas.height = H

    let raf = null, lastFrame = 0, time = 0, visible = true, flies = []

    function init() {
      if (!dark) { flies = []; return }
      flies = Array.from({ length: 26 }, () => ({
        x: rand(W * 0.08, W * 0.92), y: rand(H * 0.05, H * 0.65),
        vx: rand(-0.14, 0.14), vy: rand(-0.08, -0.01),
        phase: rand(0, Math.PI * 2), speed: rand(0.03, 0.08), r: rand(1.5, 2.8),
      }))
    }

    function draw(ts) {
      if (!visible) { raf = null; return }
      if (ts - lastFrame < FRAME_MS) { raf = requestAnimationFrame(draw); return }
      lastFrame = ts
      ctx.clearRect(0, 0, W, H)
      flies.forEach(f => {
        f.x += f.vx + 0.22 * Math.sin(time * 0.018 + f.phase)
        f.y += f.vy + 0.12 * Math.cos(time * 0.014 + f.phase)
        if (f.x < W * 0.05) f.x = W * 0.88
        if (f.x > W * 0.95) f.x = W * 0.12
        if (f.y < H * 0.04) f.y = H * 0.6
        if (f.y > H * 0.7)  f.y = H * 0.2
        const g = 0.45 + 0.55 * Math.sin(time * f.speed + f.phase)
        ctx.save()
        ctx.shadowBlur = 9 + g * 13; ctx.shadowColor = '#aaff55'
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(170,255,80,${0.4 + 0.6 * g})`; ctx.fill()
        ctx.restore()
      })
      time++; raf = requestAnimationFrame(draw)
    }

    function resize() {
      W = canvas.offsetWidth; H = canvas.offsetHeight
      canvas.width = W; canvas.height = H
      init()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) raf = requestAnimationFrame(draw)
    }, { threshold: 0 })
    io.observe(canvas); raf = requestAnimationFrame(draw)
    return () => { if (raf) cancelAnimationFrame(raf); io.disconnect(); ro.disconnect() }
  }, [dark])
  return ref
}

// ── Contact island ────────────────────────────────────────────────────────────
function ContactIsland({ dark }) {
  return (
    <div className="contact-island">
      <div className="island-frame">
        <img src={`${T}grass_platform_top_left_corner.png`}  alt="" className="island-corner" />
        <div className="island-edge island-edge-top" />
        <img src={`${T}grass_platform_top_right_corner.png`} alt="" className="island-corner" />
        <div className="island-edge island-edge-left" />
        <div className="island-interior">
          {CONTACT_ITEMS.map(item => {
            const inner = (
              <><span className="card-icon">{item.icon}</span>
                <span className="card-label">{item.label}</span>
                <span className="card-value">{item.value}</span></>
            )
            return item.href ? (
              <a key={item.label} href={item.href}
                className={`island-card${dark ? ' dark' : ''}`}
                target="_blank" rel="noopener noreferrer">{inner}</a>
            ) : (
              <div key={item.label} className={`island-card${dark ? ' dark' : ''}`}>{inner}</div>
            )
          })}
        </div>
        <div className="island-edge island-edge-right" />
        <img src={`${T}grass_platform_bottom_left_corner.png`}  alt="" className="island-corner" />
        <div className="island-edge island-edge-bottom" />
        <img src={`${T}grass_platform_bottom_right_corner.png`} alt="" className="island-corner" />
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function FooterLandscape() {
  const dark = useIsDark()
  const fireflyRef = useFireflyCanvas(dark)
  const [catBubble, setCatBubble] = useState(false)

  const handleCatClick = () => {
    if (catBubble) return
    playSuccess(); addCoins(5); setCatBubble(true)
    setTimeout(() => setCatBubble(false), 1800)
  }

  const skyBg = dark
    ? 'linear-gradient(to bottom, #020810 0%, #04101e 50%, #081828 100%)'
    : 'linear-gradient(to bottom, #87ceeb 0%, #b0d8f0 50%, #c8e8fb 100%)'

  // Tree selection: day=Cherry Blossom + Cedar, night=Dragonwood + Crystal Birch
  const treeL = dark ? `${T}Dragonwood Tree stage 5.png`       : `${T}Cherry Blossom Tree stage 6.png`
  const treeR = dark ? `${T}Crystal Birch Tree stage 5.png`    : `${T}Cedar Tree stage 6.png`
  const treeBgA = dark ? `${T}Fir Tree stage 5.png`            : `${T}Birch Tree 1 stage 5.png`
  const treeBgB = dark ? `${T}Birch Tree 1 stage 5.png`        : `${T}Hazel Tree stage 5.png`
  const treeBgC = dark ? `${T}Cedar Tree stage 5.png`          : `${T}Fir Tree stage 5.png`

  return (
    <div className="footer-landscape" style={{ background: skyBg }}>

      {/* ── z:2 — Firefly canvas ── */}
      <canvas ref={fireflyRef} className="landscape-canvas" />

      {/* ── z:3 — Background trees + shrine (distant layer) ── */}
      <div className="fl-bg-trees" aria-hidden="true">
        <img src={treeBgA} className="fl-bg-tree" style={{ left: '10%' }} />
        <img src={treeBgC} className="fl-bg-tree" style={{ left: '28%' }} />
        <img src={treeBgB} className="fl-bg-tree" style={{ right: '26%' }} />
        <img src={treeBgA} className="fl-bg-tree" style={{ right: '8%', transform: 'scaleX(-1) translateX(0)' }} />
        {/* Japanese shrine — distant landmark */}
        <img src={`${S}animated_japanese_shrine_48x48.gif`} alt="" className="fl-shrine" />
        {/* Night: candles flanking shrine */}
        {dark && <>
          <img src={`${S}animated_candle_48x48.gif`}      alt="" className="fl-candle fl-candle-l" />
          <img src={`${S}animated_wall_candle_48x48.gif`} alt="" className="fl-candle fl-candle-r" />
        </>}
      </div>

      {/* ── z:4 — Contact island (floats in clearing) ── */}
      <ContactIsland dark={dark} />

      {/* ── z:5 — Foreground trees (full size, frame the scene) ── */}
      <img src={treeL} alt="" className="fl-tree-fore fl-tree-fore-l" />
      <img src={treeR} alt="" className="fl-tree-fore fl-tree-fore-r" />

      {/* ── z:6 — Ground sprite row ── */}
      <div className="fl-ground-sprites">
        {/* Frog trio — varied sizes for depth */}
        <img src={`${S}animated_frog_2_idle_48x48.gif`} alt="" className="fl-sprite fl-frog fl-frog-sm" />
        <img src={`${S}animated_frog_idle_48x48.gif`}   alt="" className="fl-sprite fl-frog fl-frog-md" />
        <div className="fl-cat-wrap" onClick={handleCatClick}>
          <img src={`${S}animated_cat_48x48.gif`} alt="cat" className="fl-sprite fl-cat" />
          {catBubble && <span className="cat-bubble">MEOW! +5 🪙</span>}
        </div>
        <img src={`${S}animated_frog_3_idle_48x48.gif`} alt="" className="fl-sprite fl-frog fl-frog-md" />
        <img src={`${S}animated_frog_4_idle_48x48.gif`} alt="" className="fl-sprite fl-frog fl-frog-sm" />
        {/* Day: sprout easter egg / Night: candle */}
        {!dark
          ? <img src={`${S}animated_sprout_48x48.gif`}   alt="" className="fl-sprite fl-frog-sm" style={{ opacity: 0.85 }} />
          : <img src={`${S}animated_candle_48x48.gif`}   alt="" className="fl-sprite fl-frog-sm" style={{ opacity: 0.9 }} />
        }
      </div>

      {/* Day-only: butterflies floating in the clearing */}
      {!dark && (
        <div className="fl-butterflies" aria-hidden="true">
          <img src={`${S}animated_butterfly_3_48x48.gif`} alt="" className="fl-butterfly" style={{ left: '24%',  animationDuration: '14s' }} />
          <img src={`${S}animated_butterfly_5_48x48.gif`} alt="" className="fl-butterfly" style={{ left: '50%',  animationDuration: '18s', animationDelay: '-5s'  }} />
          <img src={`${S}animated_butterfly_2_48x48.gif`} alt="" className="fl-butterfly" style={{ right: '22%', animationDuration: '16s', animationDelay: '-9s'  }} />
        </div>
      )}

      {/* ── z:7 — Ground strip (covers all tree roots cleanly) ── */}
      <div className="fl-ground">
        <div className="fl-grass-edge" />
        <div className="fl-dirt" />
      </div>

      {/* ── z:8 — Pixel sprite walker ── */}
      <div className="footer-sprite">
        <div className="sprite-walker"><PixelSprite /></div>
      </div>

    </div>
  )
}
