import { useState, useEffect, useCallback } from 'react'
import { addCoins } from '../utils/coins'
import { playSuccess, playGameOver, playEat } from '../utils/sound'

function newGrid() {
  const g = Array(16).fill(0)
  return addRandom(addRandom(g))
}
function addRandom(grid) {
  const empty = grid.map((v, i) => v === 0 ? i : -1).filter(i => i >= 0)
  if (!empty.length) return grid
  const next = [...grid]
  next[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4
  return next
}
function slide(row) {
  const filtered = row.filter(v => v !== 0)
  const merged = []
  let score = 0
  let i = 0
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const val = filtered[i] * 2
      merged.push(val)
      score += val
      i += 2
    } else {
      merged.push(filtered[i])
      i++
    }
  }
  while (merged.length < 4) merged.push(0)
  return { row: merged, score }
}
function move(grid, dir) {
  let g = [...grid]
  let totalScore = 0
  const rows = [0,1,2,3].map(r => [g[r*4],g[r*4+1],g[r*4+2],g[r*4+3]])
  const cols = [0,1,2,3].map(c => [g[c],g[c+4],g[c+8],g[c+12]])

  if (dir === 'left') {
    rows.forEach((row, r) => {
      const { row: s, score } = slide(row)
      totalScore += score
      s.forEach((v, c) => { g[r*4+c] = v })
    })
  } else if (dir === 'right') {
    rows.forEach((row, r) => {
      const { row: s, score } = slide([...row].reverse())
      totalScore += score
      s.reverse().forEach((v, c) => { g[r*4+c] = v })
    })
  } else if (dir === 'up') {
    cols.forEach((col, c) => {
      const { row: s, score } = slide(col)
      totalScore += score
      s.forEach((v, r) => { g[r*4+c] = v })
    })
  } else if (dir === 'down') {
    cols.forEach((col, c) => {
      const { row: s, score } = slide([...col].reverse())
      totalScore += score
      s.reverse().forEach((v, r) => { g[r*4+c] = v })
    })
  }
  return { grid: g, score: totalScore }
}
function hasWon(grid) { return grid.some(v => v >= 2048) }
function isGameOver(grid) {
  if (grid.some(v => v === 0)) return false
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    const v = grid[r*4+c]
    if (c < 3 && v === grid[r*4+c+1]) return false
    if (r < 3 && v === grid[(r+1)*4+c]) return false
  }
  return true
}

const TILE_COLORS = {
  0: 'transparent', 2: '#eee4da', 4: '#ede0c8', 8: '#f2b179',
  16: '#f59563', 32: '#f67c5f', 64: '#f65e3b',
  128: '#edcf72', 256: '#edcc61', 512: '#edc850',
  1024: '#edc53f', 2048: '#edc22e',
}

export default function Game2048({ onClose }) {
  const [grid, setGrid] = useState(newGrid)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem('2048-best') || 0))
  const [won, setWon] = useState(false)
  const [over, setOver] = useState(false)

  const handleMove = useCallback((dir) => {
    if (over) return
    setGrid(prev => {
      const { grid: next, score: gained } = move(prev, dir)
      const changed = next.some((v, i) => v !== prev[i])
      if (!changed) return prev
      const withNew = addRandom(next)
      if (gained > 0) {
        playEat()
        addCoins(1)
        setScore(s => {
          const ns = s + gained
          setBest(b => { const nb = Math.max(b, ns); localStorage.setItem('2048-best', nb); return nb })
          return ns
        })
      }
      if (hasWon(withNew) && !won) {
        setWon(true)
        addCoins(25)
        playSuccess()
      }
      if (isGameOver(withNew)) {
        setOver(true)
        playGameOver()
      }
      return withNew
    })
  }, [over, won])

  useEffect(() => {
    const onKey = (e) => {
      const map = { ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down' }
      if (map[e.key]) { e.preventDefault(); handleMove(map[e.key]) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleMove])

  const reset = () => { setGrid(newGrid()); setScore(0); setWon(false); setOver(false) }

  return (
    <div className="snake-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="snake-modal game2048-modal">
        <div className="snake-header">
          <span className="snake-title">◈ 2048</span>
          <span className="snake-scores">SCORE: {score} · BEST: {best}</span>
          <button className="snake-close" onClick={onClose}>✕</button>
        </div>
        <div className="game2048-body">
          {(won || over) && (
            <div className="game2048-overlay-msg">
              <p>{won ? '★ YOU WIN! +25 COINS ★' : 'GAME OVER'}</p>
              <button className="w98-btn-ok" onClick={reset}>NEW GAME</button>
            </div>
          )}
          <div className="game2048-grid">
            {grid.map((v, i) => (
              <div key={i} className="game2048-cell"
                   style={{ background: TILE_COLORS[v] || '#3c3a32', color: v > 4 ? '#f9f6f2' : '#776e65' }}>
                {v > 0 && <span>{v}</span>}
              </div>
            ))}
          </div>
          <p className="snake-hint">↑↓←→ ARROW KEYS · MERGE TILES · GET 2048</p>
        </div>
      </div>
    </div>
  )
}
