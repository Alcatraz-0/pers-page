import { getCoins } from '../utils/coins'

const GAMES = [
  { label: 'SNAKE',      key: 'snake-best',    unit: 'pts'  },
  { label: '2048',       key: 'game2048-best', unit: 'tile' },
  { label: 'BREAKOUT',   key: 'breakout-best', unit: 'pts'  },
  { label: 'INVADERS',   key: 'invaders-best', unit: 'pts'  },
  { label: 'QUIZ',       key: 'quiz-best',     unit: '/8'   },
  { label: 'RPG',        key: 'rpg-best',      unit: '★'    },
  { label: 'CODE TYPER', key: 'ctyper-best',   unit: 'wpm'  },
  { label: 'WHACK-A-BUG',key: 'wab-best',      unit: 'bugs' },
]

export default function Leaderboard({ onClose }) {
  const coins = getCoins()

  return (
    <div className="w98-dialog-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w98-dialog">
        <div className="w98-dialog-titlebar">
          <span>⬛ HIGH SCORES</span>
          <button className="w98-close-sm" onClick={onClose}>✕</button>
        </div>
        <div className="w98-dialog-body" style={{ flexDirection: 'column' }}>
          <table className="lb-table">
            <tbody>
              {GAMES.map(({ label, key, unit }) => {
                const val = localStorage.getItem(key)
                return (
                  <tr key={key} className="lb-row">
                    <td className="lb-cell">{label}</td>
                    <td className="lb-cell">
                      {val != null
                        ? <span className="lb-score">{val}</span>
                        : <span className="lb-empty">---</span>}
                    </td>
                    <td className="lb-cell lb-empty">{unit}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p style={{ fontFamily: 'var(--pixel)', fontSize: '0.45rem', color: 'var(--c1)', margin: '0.75rem 0 0' }}>
            ★ TOTAL COINS: {coins}
          </p>
        </div>
        <div className="w98-dialog-footer">
          <button className="btn btn-primary" onClick={onClose}>CLOSE</button>
        </div>
      </div>
    </div>
  )
}
