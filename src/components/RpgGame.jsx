import { useState, useCallback } from 'react'
import { addCoins } from '../utils/coins'
import { playClick, playSuccess, playGameOver, playEat, playBlip } from '../utils/sound'

const PLAYER = {
  name: 'ANAND',
  class: 'ML ENGINEER',
  maxHp: 120,
  maxMp: 80,
  atk: 18,
}

const ENEMIES = [
  { name: 'SEGFAULT BUG',    hp: 60,  atk: 12, reward: 10, icon: '🐛', desc: 'A wild null pointer!' },
  { name: 'MERGE CONFLICT',  hp: 80,  atk: 15, reward: 15, icon: '⚔',  desc: 'HEAD diverged from origin.' },
  { name: 'PROD OUTAGE',     hp: 100, atk: 20, reward: 25, icon: '🔥', desc: 'P0 incident. All hands!' },
  { name: 'MEMORY LEAK',     hp: 120, atk: 18, reward: 30, icon: '💧', desc: '5.7 GB and growing fast.' },
  { name: 'OVERFITTING GOD', hp: 150, atk: 25, reward: 50, icon: '🧠', desc: 'Train acc 99%. Test acc 41%.' },
]

const SKILLS = [
  { name: 'PYTHON STRIKE',  mp: 0,  dmg: [15, 25], desc: 'Basic attack', icon: '🐍' },
  { name: 'RAG BLAST',      mp: 15, dmg: [30, 45], desc: 'Retrieve and destroy', icon: '📚' },
  { name: 'DEPLOY SHIELD',  mp: 20, dmg: [0, 0],   desc: 'Restore 25 HP', icon: '🛡', heal: 25 },
  { name: 'CUDA OVERDRIVE', mp: 30, dmg: [50, 70], desc: 'GPU-accelerated nuke', icon: '⚡' },
  { name: 'K8S CLUSTER',    mp: 25, dmg: [35, 55], desc: 'Distributed attack', icon: '☸' },
]

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

const initState = (enemyIdx = 0) => ({
  playerHp: PLAYER.maxHp,
  playerMp: PLAYER.maxMp,
  enemyHp: ENEMIES[enemyIdx].hp,
  enemyIdx,
  log: [`[BATTLE START] ${ENEMIES[enemyIdx].name} appeared! ${ENEMIES[enemyIdx].desc}`],
  phase: 'player', // player | enemy | win | lose | victory
  totalCoins: 0,
  enemiesDefeated: 0,
})

export default function RpgGame({ onClose }) {
  const [gs, setGs] = useState(() => initState(0))

  const enemy = ENEMIES[gs.enemyIdx]

  const addLog = (msg, prev) => [msg, ...prev].slice(0, 8)

  const useSkill = useCallback((skill) => {
    if (gs.phase !== 'player') return
    if (gs.playerMp < skill.mp) { playBlip(200); return }
    playClick()

    setGs(prev => {
      let { playerHp, playerMp, enemyHp, log } = prev
      playerMp -= skill.mp
      let msg = ''

      if (skill.heal) {
        const healed = Math.min(skill.heal, PLAYER.maxHp - playerHp)
        playerHp += healed
        msg = `> ${skill.icon} ${skill.name}: Restored ${healed} HP!`
      } else {
        const dmg = rand(skill.dmg[0], skill.dmg[1])
        enemyHp = Math.max(0, enemyHp - dmg)
        msg = `> ${skill.icon} ${skill.name}: ${dmg} DMG to ${enemy.name}!`
      }

      log = addLog(msg, log)

      // Enemy defeated?
      if (enemyHp <= 0) {
        const reward = enemy.reward
        const totalCoins = prev.totalCoins + reward
        const enemiesDefeated = prev.enemiesDefeated + 1
        const nextEnemyIdx = prev.enemyIdx + 1
        playSuccess()

        if (nextEnemyIdx >= ENEMIES.length) {
          addCoins(totalCoins)
          return { ...prev, playerHp, playerMp, enemyHp: 0, log: addLog(`★ VICTORY! All enemies defeated! +${totalCoins} coins!`, log), phase: 'victory', totalCoins, enemiesDefeated }
        }

        const nextEnemy = ENEMIES[nextEnemyIdx]
        return {
          ...prev, playerHp, playerMp,
          enemyHp: nextEnemy.hp,
          enemyIdx: nextEnemyIdx,
          log: addLog(`★ ${enemy.name} defeated! +${reward} coins! Next: ${nextEnemy.name}`, log),
          phase: 'player', totalCoins, enemiesDefeated,
        }
      }

      // Enemy turn
      const eDmg = rand(Math.floor(enemy.atk * 0.6), enemy.atk)
      playerHp = Math.max(0, playerHp - eDmg)
      log = addLog(`< ${enemy.icon} ${enemy.name}: ${eDmg} DMG!`, log)

      // Restore a bit of MP each turn
      playerMp = Math.min(PLAYER.maxMp, playerMp + 8)

      if (playerHp <= 0) {
        playGameOver()
        return { ...prev, playerHp: 0, playerMp, enemyHp, log: addLog('✕ GAME OVER — You were defeated!', log), phase: 'lose' }
      }

      return { ...prev, playerHp, playerMp, enemyHp, log, phase: 'player' }
    })
  }, [gs.phase, gs.playerMp, enemy])

  const restart = () => { setGs(initState(0)) }

  const hpPct   = (gs.playerHp / PLAYER.maxHp) * 100
  const mpPct   = (gs.playerMp / PLAYER.maxMp) * 100
  const eHpPct  = (gs.enemyHp  / enemy.hp)     * 100

  return (
    <div className="snake-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rpg-modal">
        <div className="snake-header">
          <span className="snake-title">⚔ RPG BATTLE ⚔</span>
          <span className="snake-scores">ENEMIES: {gs.enemiesDefeated}/{ENEMIES.length} · ★{gs.totalCoins}</span>
          <button className="snake-close" onClick={onClose}>✕</button>
        </div>

        <div className="rpg-body">
          {/* Enemy */}
          <div className="rpg-combatant rpg-enemy">
            <div className="rpg-name">{enemy.icon} {enemy.name}</div>
            <div className="rpg-hp-row">
              <span className="rpg-hp-label">HP</span>
              <div className="rpg-bar-track">
                <div className="rpg-bar-fill rpg-enemy-fill" style={{ width: `${eHpPct}%` }} />
              </div>
              <span className="rpg-hp-val">{gs.enemyHp}/{enemy.hp}</span>
            </div>
          </div>

          {/* Player */}
          <div className="rpg-combatant rpg-player">
            <div className="rpg-name">🧑‍💻 {PLAYER.name} · {PLAYER.class}</div>
            <div className="rpg-hp-row">
              <span className="rpg-hp-label">HP</span>
              <div className="rpg-bar-track">
                <div className="rpg-bar-fill rpg-player-fill" style={{ width: `${hpPct}%`, background: hpPct > 50 ? 'var(--c2)' : hpPct > 25 ? '#f97316' : '#ef4444' }} />
              </div>
              <span className="rpg-hp-val">{gs.playerHp}/{PLAYER.maxHp}</span>
            </div>
            <div className="rpg-hp-row">
              <span className="rpg-hp-label">MP</span>
              <div className="rpg-bar-track">
                <div className="rpg-bar-fill" style={{ width: `${mpPct}%`, background: 'var(--c1)' }} />
              </div>
              <span className="rpg-hp-val">{gs.playerMp}/{PLAYER.maxMp}</span>
            </div>
          </div>

          {/* Skills */}
          {(gs.phase === 'player') && (
            <div className="rpg-skills">
              {SKILLS.map(s => (
                <button
                  key={s.name}
                  className={`rpg-skill-btn${gs.playerMp < s.mp ? ' disabled' : ''}`}
                  onClick={() => useSkill(s)}
                  title={s.desc}
                >
                  <span>{s.icon} {s.name}</span>
                  {s.mp > 0 && <span className="rpg-skill-mp">{s.mp}MP</span>}
                </button>
              ))}
            </div>
          )}

          {/* End states */}
          {(gs.phase === 'win' || gs.phase === 'victory' || gs.phase === 'lose') && (
            <div className="rpg-end">
              {gs.phase === 'victory' && <p className="rpg-end-title">★ VICTORY! ★</p>}
              {gs.phase === 'lose'    && <p className="rpg-end-title rpg-lose">✕ GAME OVER</p>}
              <p className="rpg-end-coins">★ {gs.totalCoins} COINS EARNED</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                <button className="btn btn-primary" onClick={restart}>PLAY AGAIN</button>
                <button className="btn btn-outline" onClick={onClose}>CLOSE</button>
              </div>
            </div>
          )}

          {/* Battle log */}
          <div className="rpg-log">
            {gs.log.map((l, i) => (
              <p key={i} className="rpg-log-line" style={{ opacity: 1 - i * 0.1 }}>{l}</p>
            ))}
          </div>
        </div>
        <p className="snake-hint">MP RESTORES +8/TURN · DEFEAT ALL {ENEMIES.length} ENEMIES TO WIN</p>
      </div>
    </div>
  )
}
