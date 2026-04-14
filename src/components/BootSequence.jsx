import { useEffect, useState, useCallback } from 'react'

const LINES = [
  { text: 'ANAND_OS v2026.03 BIOS', cls: 'c1' },
  { text: 'COPYRIGHT (C) 2026 ANAND MEENA — ALL RIGHTS RESERVED', cls: 'muted' },
  { text: '' },
  { text: '> INITIALIZING SYSTEMS...', cls: '' },
  { text: '> CPU ........ PYTHON 3.11 @ 95% EFFICIENCY     [OK]', cls: 'ok' },
  { text: '> RAM ........ 4.0 GPA · MS CS @ UIC            [OK]', cls: 'ok' },
  { text: '> GPU ........ NVIDIA DGX + XILINX RFSOC FPGA   [OK]', cls: 'ok' },
  { text: '> STORAGE ... 6+ RESEARCH PROJECTS              [OK]', cls: 'ok' },
  { text: '> NET ........ MULTI-CLOUD INFRA ONLINE          [OK]', cls: 'ok' },
  { text: '> KERNEL ..... SAMPL LAB v1.0 LOADED            [OK]', cls: 'ok' },
  { text: '' },
  { text: '> BOOTING ANAND.EXE ...', cls: 'c2' },
  { text: '' },
  { text: '[ PRESS ANY KEY TO CONTINUE ]', cls: 'blink' },
]

// CRT unblank takes 750ms, then text starts rolling fast
const CRT_DURATION  = 750
const LINE_INTERVAL = 80

export default function BootSequence({ onDone }) {
  const [powered, setPowered]       = useState(false)
  const [visibleCount, setVisibleCount] = useState(0)
  const [fading, setFading]         = useState(false)
  const [gone, setGone]             = useState(false)

  const dismiss = useCallback(() => {
    if (fading || gone) return
    setFading(true)
    setTimeout(() => setGone(true), 550)
    setTimeout(onDone, 550)
  }, [fading, gone, onDone])

  // CRT unblank — wait for expand animation, then start text
  useEffect(() => {
    const t = setTimeout(() => setPowered(true), CRT_DURATION)
    return () => clearTimeout(t)
  }, [])

  // Advance lines one by one (only after CRT animation)
  useEffect(() => {
    if (!powered || visibleCount >= LINES.length) return
    const t = setTimeout(() => setVisibleCount(v => v + 1), LINE_INTERVAL)
    return () => clearTimeout(t)
  }, [powered, visibleCount])

  // Auto-dismiss 1.2s after last line
  useEffect(() => {
    if (visibleCount < LINES.length) return
    const t = setTimeout(dismiss, 1200)
    return () => clearTimeout(t)
  }, [visibleCount, dismiss])

  // Any key or click skips / dismisses
  useEffect(() => {
    const handler = () => {
      if (!powered) {
        setPowered(true)
      } else if (visibleCount < LINES.length) {
        setVisibleCount(LINES.length)
      } else {
        dismiss()
      }
    }
    window.addEventListener('keydown', handler)
    window.addEventListener('click', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      window.removeEventListener('click', handler)
    }
  }, [powered, visibleCount, dismiss])

  if (gone) return null

  return (
    <div className={`boot-overlay${fading ? ' boot-fade-out' : ''}`}>
      {/* CRT screen — expands from center line, sits on top of the black overlay */}
      <div className="boot-screen">
        <div className="boot-crt-overlay" />
        <div className="boot-lines">
          {LINES.slice(0, visibleCount).map((line, i) => (
            <span key={i} className={`boot-line ${line.cls || ''}`}>
              {line.text || '\u00a0'}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
