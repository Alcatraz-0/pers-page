import { useState } from 'react'
import { addCoins } from '../utils/coins'
import { playClick, playSuccess, playGameOver } from '../utils/sound'

const QUESTIONS = [
  {
    q: 'What GPA does Anand hold in his MS CS program?',
    opts: ['3.5', '3.9', '4.0', '3.8'],
    ans: 2,
  },
  {
    q: 'Which conference published Anand\'s cross-language QA paper?',
    opts: ['ICML', 'ICICBDA 2024', 'NeurIPS', 'ACL'],
    ans: 1,
  },
  {
    q: 'What speedup did the Hadoop NLP pipeline achieve vs single-node?',
    opts: ['2×', '5×', '3×', '10×'],
    ans: 2,
  },
  {
    q: 'How much memory was saved in the SF property tax pipeline?',
    opts: ['50%', '67%', '87.1%', '42%'],
    ans: 2,
  },
  {
    q: 'Which FPGA board is used in the quantum research project?',
    opts: ['Xilinx ZCU216 RFSoC', 'Intel Cyclone V', 'Altera Stratix', 'Xilinx Spartan 7'],
    ans: 0,
  },
  {
    q: 'What is Anand\'s current university?',
    opts: ['MIT', 'UIC', 'Stanford', 'CMU'],
    ans: 1,
  },
  {
    q: 'What accuracy did the facial recognition exam app achieve?',
    opts: ['80%', '90%', '95%', '99%'],
    ans: 2,
  },
  {
    q: 'How many property records were in the SF gentrification pipeline?',
    opts: ['1 million', '938 thousand', '3.7 million', '500 thousand'],
    ans: 2,
  },
]

const COINS_PER_Q = 15

export default function QuizGame({ onClose }) {
  const [idx, setIdx]         = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore]     = useState(0)
  const [phase, setPhase]     = useState('playing') // playing | done

  const q = QUESTIONS[idx]

  const choose = (i) => {
    if (selected !== null) return
    setSelected(i)
    playClick()
    const correct = i === q.ans
    if (correct) { playSuccess(); setScore(s => s + 1) }
    else playGameOver()

    // Award coins immediately per correct answer — avoids stale score state at game end
    addCoins(correct ? COINS_PER_Q : 0)

    setTimeout(() => {
      if (idx + 1 < QUESTIONS.length) {
        setIdx(idx + 1)
        setSelected(null)
      } else {
        setPhase('done')
      }
    }, 1100)
  }

  const restart = () => {
    setIdx(0); setSelected(null); setScore(0); setPhase('playing')
  }

  return (
    <div className="snake-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="quiz-modal">
        <div className="snake-header">
          <span className="snake-title">◆ TRIVIA QUEST ◆</span>
          <span className="snake-scores">
            {phase === 'playing'
              ? `Q ${idx + 1} / ${QUESTIONS.length} · SCORE: ${score}`
              : `FINAL: ${score} / ${QUESTIONS.length}`}
          </span>
          <button className="snake-close" onClick={onClose}>✕</button>
        </div>

        {phase === 'playing' ? (
          <div className="quiz-body">
            <div className="quiz-progress">
              <div className="quiz-progress-fill" style={{ width: `${(idx / QUESTIONS.length) * 100}%` }} />
            </div>
            <p className="quiz-question">{q.q}</p>
            <div className="quiz-opts">
              {q.opts.map((opt, i) => {
                let cls = 'quiz-opt'
                if (selected !== null) {
                  if (i === q.ans) cls += ' correct'
                  else if (i === selected) cls += ' wrong'
                }
                return (
                  <button key={i} className={cls} onClick={() => choose(i)}>
                    <span className="quiz-opt-letter">{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="quiz-done">
            <p className="quiz-result-title">
              {score >= 6 ? '★ EXCELLENT! ★' : score >= 4 ? '▶ GOOD JOB!' : '■ TRY AGAIN'}
            </p>
            <p className="quiz-result-score">{score} / {QUESTIONS.length} CORRECT</p>
            <p className="quiz-coins-earned">+ {score * COINS_PER_Q} ★ COINS EARNED</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={restart}>PLAY AGAIN</button>
              <button className="btn btn-outline" onClick={onClose}>CLOSE</button>
            </div>
          </div>
        )}
        <p className="snake-hint">EARN {COINS_PER_Q} ★ COINS PER CORRECT ANSWER · ESC TO CLOSE</p>
      </div>
    </div>
  )
}
