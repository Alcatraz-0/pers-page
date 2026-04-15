import { useState, useEffect, useRef, useCallback } from 'react'
import { useTypewriter } from '../hooks/useTypewriter'
import { STATS } from '../data/index'
import SceneCanvas from './SceneCanvas'

const ROLES = [
  'SOFTWARE ENGINEER @ UIC SAMPL LAB',
  'ML · CLOUD INFRA · DISTRIBUTED SYSTEMS',
  'MS COMPUTER SCIENCE · GPA 4.0 / 4.0',
]

const HERO_TAGS = ['PYTHON', 'AWS', 'HUGGING FACE', 'KUBERNETES', 'HADOOP', 'FPGA / HLS4ML', 'RAG / LLM', 'DJANGO']

const SKY_STATES = [
  { id: 'night',     label: 'NIGHT',     icon: '◐', dark: true,  canvas: 'night',
    variants: ['/sky/night.png', '/sky/night_2.png', '/sky/night_3.png'] },
  { id: 'dawn',      label: 'DAWN',      icon: '◑', dark: true,  canvas: 'none',
    variants: ['/sky/dawn.png', '/sky/dawn_2.png', '/sky/dawn_3.png', '/sky/dawn_4.png'] },
  { id: 'day',       label: 'DAY',       icon: '○', dark: false, canvas: 'none',
    variants: ['/sky/day.png', '/sky/day_2.png', '/sky/day_3.png', '/sky/day_4.png'] },
  { id: 'afternoon', label: 'AFTERNOON', icon: '◔', dark: false, canvas: 'none',
    variants: ['/sky/afternoon.png', '/sky/afternoon_2.png', '/sky/afternoon_3.png', '/sky/afternoon_4.png'] },
  { id: 'sunset',    label: 'SUNSET',    icon: '◕', dark: true,  canvas: 'none',
    variants: ['/sky/sunset.png', '/sky/sunset_2.png', '/sky/sunset_3.png', '/sky/sunset_4.png'] },
  { id: 'evening',   label: 'EVENING',   icon: '●', dark: true,  canvas: 'evening',
    variants: ['/sky/evening.png', '/sky/evening_2.png', '/sky/evening_3.png', '/sky/evening_4.png'] },
  { id: 'storm',     label: 'STORM',     icon: '⚡', dark: true,  canvas: 'storm',
    variants: ['/sky/storm.png', '/sky/storm_2.png'] },
]

const N = SKY_STATES.length
const SCROLL_ROOM_VH = 0.5  // extra scroll room as fraction of hero height

function skyIdxFromTime() {
  const h = new Date().getHours()
  if (h < 5)  return 0
  if (h < 7)  return 1
  if (h < 16) return 2
  if (h < 18) return 3
  if (h < 20) return 4
  if (h < 22) return 5
  return 0
}

const BUTTERFLIES = [
  { src: '/sprites/animated_butterfly_48x48.gif',   style: { top: '12%', left: '8%',  animationDelay: '0s',   animationDuration: '14s' } },
  { src: '/sprites/animated_butterfly_2_48x48.gif', style: { top: '22%', left: '72%', animationDelay: '-4s',  animationDuration: '18s' } },
  { src: '/sprites/animated_butterfly_3_48x48.gif', style: { top: '8%',  left: '55%', animationDelay: '-8s',  animationDuration: '16s' } },
  { src: '/sprites/animated_butterfly_4_48x48.gif', style: { top: '35%', left: '18%', animationDelay: '-2s',  animationDuration: '20s' } },
  { src: '/sprites/animated_butterfly_5_48x48.gif', style: { top: '18%', left: '40%', animationDelay: '-11s', animationDuration: '15s' } },
  { src: '/sprites/animated_butterfly_6_48x48.gif', style: { top: '42%', left: '82%', animationDelay: '-6s',  animationDuration: '17s' } },
]

function randVariant(idx) {
  return Math.floor(Math.random() * SKY_STATES[idx].variants.length)
}
function nextVariant(idx, curV) {
  const len = SKY_STATES[idx].variants.length
  if (len <= 1) return 0
  let next
  do { next = Math.floor(Math.random() * len) } while (next === curV % len)
  return next
}

export default function Hero() {
  const role = useTypewriter(ROLES)
  const [skyIdx, setSkyIdx] = useState(skyIdxFromTime)
  const [variantIdx, setVariantIdx] = useState(() => randVariant(skyIdxFromTime()))
  const [variantFading, setVariantFading] = useState(false)

  const heroVisibleRef = useRef(true)
  const skyIdxRef      = useRef(skyIdx)
  const variantIdxRef  = useRef(variantIdx)
  const manualRef      = useRef(false)
  const writingThemeRef = useRef(false)  // prevents observer ↔ effect loop
  const heroRef       = useRef(null)
  const skyStackRef   = useRef(null)   // parallax target — the bg stack
  const heroInnerRef  = useRef(null)
  const sliderRef     = useRef(null)
  const horizonRef    = useRef(null)
  const sceneRef      = useRef(null)   // SceneCanvas imperative handle
  const scrollYRef    = useRef(0)
  const mouseOffRef   = useRef({ x: 0, y: 0 })
  const cloudFarRef   = useRef(null)
  const cloudMidRef   = useRef(null)
  const cloudNearRef  = useRef(null)

  const sky = SKY_STATES[skyIdx]
  const currentBg = sky.variants[variantIdx % sky.variants.length]

  useEffect(() => { skyIdxRef.current = skyIdx },        [skyIdx])
  useEffect(() => { variantIdxRef.current = variantIdx }, [variantIdx])

  // Preload all sky images
  useEffect(() => {
    SKY_STATES.forEach(s => s.variants.forEach(v => { new Image().src = v }))
  }, [])

  // 60s tick — cycle variant, optionally advance sky state
  useEffect(() => {
    const tick = () => {
      const target = manualRef.current ? skyIdxRef.current : skyIdxFromTime()
      setSkyIdx(target)
      setVariantIdx(nextVariant(target, variantIdxRef.current))
    }
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  // Sky → page theme: when sky.dark changes, update data-theme
  // Guard with writingThemeRef so the MutationObserver below ignores our own write
  useEffect(() => {
    const root = document.documentElement
    const isDark = root.getAttribute('data-theme') === 'dark'
    if (sky.dark === isDark) return          // already in sync, nothing to do
    writingThemeRef.current = true
    root.setAttribute('data-theme', sky.dark ? 'dark' : 'light')
    Promise.resolve().then(() => { writingThemeRef.current = false })
  }, [sky.dark])

  // Theme toggle → sky: when App.jsx changes data-theme externally, sync sky
  useEffect(() => {
    const obs = new MutationObserver(() => {
      if (writingThemeRef.current) return    // we triggered this write — skip
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
      setSkyIdx(prev => {
        if (SKY_STATES[prev].dark === isDark) return prev
        manualRef.current = true
        return isDark ? 0 : 2
      })
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  // rAF loop — scroll parallax on sky bg + content fade-out + horizon reveal
  useEffect(() => {
    const onScroll = () => { scrollYRef.current = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })

    const hero = heroRef.current
    const onMouse = (e) => {
      const r = hero.getBoundingClientRect()
      mouseOffRef.current = {
        x: e.clientX - r.left - r.width / 2,
        y: e.clientY - r.top  - r.height / 2,
      }
    }
    const onLeave = () => { mouseOffRef.current = { x: 0, y: 0 } }
    hero.addEventListener('mousemove', onMouse)
    hero.addEventListener('mouseleave', onLeave)

    // Pause drawing work when hero is fully off-screen
    const heroObs = new IntersectionObserver(
      ([entry]) => { heroVisibleRef.current = entry.isIntersecting },
      { rootMargin: '200px 0px -200px 0px' }
    )
    heroObs.observe(hero)

    let raf
    function tick() {
      if (!heroVisibleRef.current) { raf = requestAnimationFrame(tick); return }

      const sY = scrollYRef.current
      const { x, y } = mouseOffRef.current
      const heroH = hero.offsetHeight
      const scrollRoom = heroH * SCROLL_ROOM_VH
      const prog = Math.min(1, Math.max(0, sY / scrollRoom))

      // Sky background: gentle parallax scroll (0.06×) + hair-thin mouse nudge
      const stack = skyStackRef.current
      if (stack) {
        stack.style.transform =
          `translateX(${-x * 0.003}px) translateY(${-(sY * 0.06) - (y * 0.002)}px)`
      }

      // Cloud layers: mouse parallax + scroll depth (near moves faster than far)
      if (cloudFarRef.current)  cloudFarRef.current.style.transform  = `translateX(${-x * 0.008}px) translateY(${-y * 0.004 + sY * 0.04}px)`
      if (cloudMidRef.current)  cloudMidRef.current.style.transform  = `translateX(${-x * 0.014}px) translateY(${-y * 0.007 + sY * 0.08}px)`
      if (cloudNearRef.current) cloudNearRef.current.style.transform = `translateX(${x  * 0.006}px) translateY(${y  * 0.003 + sY * 0.13}px)`

      // Hero content: fade + lift — starts at 40% scroll, fully gone at 95%
      const inner = heroInnerRef.current
      if (inner) {
        const fadeProg = Math.max(0, (prog - 0.4) / 0.55)
        inner.style.opacity = String(Math.max(0, 1 - fadeProg))
        inner.style.transform = `translateY(${-prog * 50}px)`
      }

      // Slider: fade out from 20% scroll
      const slider = sliderRef.current
      if (slider) slider.style.opacity = String(Math.max(0, 1 - prog * 2.5))

      // Horizon: rise from bottom
      const horizon = horizonRef.current
      if (horizon) {
        horizon.style.opacity = String(Math.min(1, prog * 2.2))
        horizon.style.transform = `translateY(${(1 - prog) * 40}px)`
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', onScroll)
      hero.removeEventListener('mousemove', onMouse)
      hero.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf)
      heroObs.disconnect()
    }
  }, [])

  const handleManualSelect = (i) => {
    manualRef.current = true
    if (i === skyIdx) {
      setVariantFading(true)
      setTimeout(() => {
        setVariantIdx(v => nextVariant(i, v))
        setVariantFading(false)
      }, 260)
    } else {
      setSkyIdx(i)
      setVariantIdx(randVariant(i))
    }
  }

  const showButterflies = skyIdx === 2 || skyIdx === 3
  // Only night and evening have a star-field canvas — moon is only meaningful there
  const showMoon = sky.id === 'night' || sky.id === 'evening'

  // Parallax cloud set — maps each sky state to its cloud folder prefix
  const cloudSet = sky.id

  const handleMoonClick = useCallback(() => {
    sceneRef.current?.triggerMeteorShower()
  }, [])

  return (
    <div className="hero-scroll-space">
      <section id="hero" data-sky={sky.id} ref={heroRef}>

        {/* Sky PNG crossfade stack — parallax target */}
        <div className="sky-bg-stack" ref={skyStackRef}>
          {SKY_STATES.map((s, i) => {
            const isActive = i === skyIdx
            const bg = isActive ? currentBg : s.variants[0]
            const opacity = isActive ? (variantFading ? 0 : 1) : 0
            return (
              <div
                key={s.id}
                className="sky-bg-layer"
                style={{
                  backgroundImage: `url('${bg}')`,
                  opacity,
                  transition: isActive && variantFading
                    ? 'opacity 0.26s ease'
                    : 'opacity 2s ease-in-out',
                }}
              />
            )
          })}
        </div>

        {/* Parallax cloud layers — 3 depths, auto-scroll at different speeds */}
        <div className="hero-parallax-clouds" aria-hidden="true">
          <div ref={cloudFarRef}  className="hpc-layer hpc-far"  style={{ backgroundImage: `url('/clouds/${cloudSet}_far.png')`  }} />
          <div ref={cloudMidRef}  className="hpc-layer hpc-mid"  style={{ backgroundImage: `url('/clouds/${cloudSet}_mid.png')`  }} />
          <div ref={cloudNearRef} className="hpc-layer hpc-near" style={{ backgroundImage: `url('/clouds/${cloudSet}_near.png')` }} />
        </div>

        {/* Dawn fog */}
        {sky.id === 'dawn' && <div className="dawn-fog" />}

        {/* Horizon reveal — rises from bottom on scroll */}
        <div className="hero-horizon" ref={horizonRef} data-sky={sky.id} />

        {/* Stars / fireflies / rain canvas */}
        <SceneCanvas ref={sceneRef} mode={sky.canvas} />

        {/* Clickable moon — night and evening only, pure CSS white circle */}
        {showMoon && (
          <button
            className="hero-moon"
            onClick={handleMoonClick}
            title="Click for meteor shower"
            aria-label="Trigger meteor shower"
          />
        )}

        {showButterflies && BUTTERFLIES.map((b, i) => (
          <img key={i} src={b.src} alt="" className="hero-butterfly-gif" style={b.style} />
        ))}

        <div className="hero-inner" ref={heroInnerRef}>
          <p className="hero-eyebrow">// PLAYER ONE — READY</p>

          <h1 className="hero-name">ANAND<br />MEENA</h1>

          <p className="hero-role">
            {role}
            <span className="tw-cursor" />
          </p>

          <p className="hero-bio">
            Software Engineer and MS CS student at the University of Illinois Chicago.
            I build at the intersection of machine learning, cloud infrastructure, and distributed systems —
            from FPGA-based inference pipelines on quantum hardware to multi-cloud LLM platforms
            and RAG systems for financial document analysis.
          </p>

          <div className="hero-tags">
            {HERO_TAGS.map(t => <span key={t} className="tag">{t}</span>)}
          </div>

          <div className="hero-cta">
            <a href="#projects" className="btn btn-primary">VIEW PROJECTS</a>
            <a href="#contact" className="btn btn-outline">GET IN TOUCH</a>
            <a href="mailto:anand.01ntgy@gmail.com" className="btn btn-outline">EMAIL ME</a>
          </div>

          <div className="hero-stats">
            {STATS.map(s => (
              <div key={s.value} className="stat-card">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Time-of-day slider */}
        <div className="sky-slider-wrap" ref={sliderRef}>
          <div className="sky-slider-track">
            {SKY_STATES.map((s, i) => (
              <button
                key={s.id}
                className={`sky-slider-stop${i === skyIdx ? ' active' : ''}`}
                onClick={() => handleManualSelect(i)}
                title={s.label}
              >
                <span className="sky-stop-icon">{s.icon}</span>
                <span className="sky-stop-label">{s.label}</span>
                {i === skyIdx && s.variants.length > 1 && (
                  <span className="sky-variant-dots">
                    {s.variants.map((_, vi) => (
                      <span key={vi} className={`sky-variant-dot${vi === variantIdx % s.variants.length ? ' on' : ''}`} />
                    ))}
                  </span>
                )}
              </button>
            ))}
            <div
              className="sky-slider-fill"
              style={{ width: `calc(${(skyIdx / (N - 1)) * 100}% - 6px)` }}
            />
          </div>
        </div>

      </section>
    </div>
  )
}
