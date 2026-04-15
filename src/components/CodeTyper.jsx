import { useState, useEffect, useRef, useCallback } from 'react'
import { addCoins } from '../utils/coins'
import { playSuccess, playGameOver, playBlip } from '../utils/sound'

const SNIPPETS = [
  { lang: 'PYTHON', code: `def fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        yield a\n        a, b = b, a + b` },
  { lang: 'JAVASCRIPT', code: `const debounce = (fn, delay) => {\n  let timer\n  return (...args) => {\n    clearTimeout(timer)\n    timer = setTimeout(() => fn(...args), delay)\n  }\n}` },
  { lang: 'SQL', code: `SELECT u.name, COUNT(o.id) AS orders\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nGROUP BY u.name\nHAVING orders > 5;` },
  { lang: 'BASH', code: `#!/bin/bash\nfor file in *.log; do\n  echo "Processing: $file"\n  gzip "$file"\ndone` },
  { lang: 'PYTHON', code: `import asyncio\n\nasync def fetch_all(urls):\n    tasks = [fetch(url) for url in urls]\n    return await asyncio.gather(*tasks)` },
  { lang: 'JAVASCRIPT', code: `async function retry(fn, n = 3) {\n  for (let i = 0; i < n; i++) {\n    try { return await fn() }\n    catch (e) { if (i === n - 1) throw e }\n  }\n}` },
]

export default function CodeTyper({ onClose }) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * SNIPPETS.length))
  const [typed, setTyped] = useState('')
  const [timeLeft, setTimeLeft] = useState(30)
  const [status, setStatus] = useState('idle')
  const [wpm, setWpm] = useState(0)
  const coinsEarned = Math.max(1, Math.floor(wpm / 10))
  const inputRef = useRef(null)
  const startRef = useRef(null)
  const timerRef = useRef(null)
  const snippet = SNIPPETS[idx]

  const start = useCallback(() => {
    setTyped(''); setTimeLeft(30); setStatus('playing')
    startRef.current = Date.now()
    inputRef.current?.focus()
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setStatus('lost'); playGameOver(); return 0 }
        return t - 1
      })
    }, 1000)
  }, [])

  useEffect(() => () => clearInterval(timerRef.current), [])

  const handleChange = (e) => {
    if (status !== 'playing') return
    const val = e.target.value
    if (val.length > typed.length) playBlip(660)
    setTyped(val)
    if (val === snippet.code) {
      clearInterval(timerRef.current)
      const elapsed = (Date.now() - startRef.current) / 60000
      const calcWpm = Math.round(snippet.code.split(/\s+/).length / elapsed)
      setWpm(calcWpm)
      setStatus('won')
      addCoins(Math.max(1, Math.floor(calcWpm / 10)))
      playSuccess()
    }
  }

  const next = () => { setIdx(i => (i + 1) % SNIPPETS.length); setTyped(''); setTimeLeft(30); setStatus('idle'); clearInterval(timerRef.current) }

  const chars = snippet.code.split('').map((ch, i) => {
    let color = 'var(--muted)'
    if (i < typed.length) color = typed[i] === ch ? '#00ff88' : '#ff4444'
    return <span key={i} style={{ color, whiteSpace: 'pre' }}>{ch}</span>
  })

  return (
    <div className="snake-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="snake-modal ctyper-modal">
        <div className="snake-header">
          <span className="snake-title">⌨ CODE TYPER</span>
          <span className="snake-scores">{status === 'playing' ? `⏱${timeLeft}s` : status === 'won' ? `${wpm}WPM` : 'READY'}</span>
          <button className="snake-close" onClick={onClose}>✕</button>
        </div>
        <div className="ctyper-body">
          <div className="ctyper-lang">{snippet.lang}</div>
          <div className="ctyper-code">{chars}</div>
          {status === 'idle' && <button className="w98-btn-ok" onClick={start}>START</button>}
          {status === 'playing' && (
            <textarea ref={inputRef} className="ctyper-input" value={typed} onChange={handleChange}
              rows={4} spellCheck={false} autoCorrect="off" autoCapitalize="off" placeholder="Type the code above..." />
          )}
          {status === 'won' && <div className="ctyper-result"><p>★ {wpm} WPM · +{coinsEarned} COINS</p><button className="w98-btn-ok" onClick={next}>NEXT</button></div>}
          {status === 'lost' && <div className="ctyper-result"><p>TIME UP!</p><button className="w98-btn-ok" onClick={next}>RETRY</button></div>}
        </div>
      </div>
    </div>
  )
}
