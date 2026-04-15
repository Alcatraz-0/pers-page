import { useState, useCallback } from 'react'
import { addCoins, getCoins } from '../utils/coins'
import { playClick, playSuccess, playGameOver, playEat, playBlip } from '../utils/sound'

/* ── Constants ─────────────────────────────────────────────── */
const BASE_PLAYER = {
  name: 'ANAND',
  class: 'ML ENGINEER',
  maxHp: 120,
  maxMp: 80,
  atk: 18,
  mpRegen: 8,
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

const CONSUMABLES = [
  { id: 'health-potion', name: 'HEALTH POTION',  cost: 5,  desc: '+30 HP',           icon: '🧪' },
  { id: 'super-potion',  name: 'SUPER POTION',   cost: 15, desc: '+60 HP',           icon: '💊' },
  { id: 'mp-elixir',     name: 'MP ELIXIR',      cost: 20, desc: '+30 MP',           icon: '🔵' },
  { id: 'coffee-break',  name: 'COFFEE BREAK',   cost: 8,  desc: '+20 MP',           icon: '☕' },
  { id: 'inn-night',     name: 'INN NIGHT',      cost: 10, desc: 'Full HP+MP restore', icon: '🏨' },
]

const EQUIPMENT = [
  { id: 'iron-sword',    name: 'IRON SWORD',        cost: 25, desc: '+3 ATK permanently',      icon: '⚔' },
  { id: 'mithril-armor', name: 'MITHRIL ARMOR',     cost: 40, desc: '-20% incoming damage',    icon: '🛡' },
  { id: 'ancient-rune',  name: 'ANCIENT RUNE',      cost: 50, desc: '+15 max HP (→135)',       icon: '🔮' },
  { id: 'devs-guide',    name: "DEVELOPER'S GUIDE", cost: 30, desc: '+2 MP/turn regen (→10)',  icon: '📖' },
  { id: 'neural-cache',  name: 'NEURAL CACHE',      cost: 60, desc: '+10 max MP (→90)',        icon: '🧠' },
]

const EQ_KEY = 'rpg-equipment'

/* ── Helpers ───────────────────────────────────────────────── */
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function loadEquipment() {
  try { return JSON.parse(localStorage.getItem(EQ_KEY) || '[]') } catch { return [] }
}

function saveEquipment(arr) {
  localStorage.setItem(EQ_KEY, JSON.stringify(arr))
}

function buildPlayerStats(owned) {
  const p = { ...BASE_PLAYER }
  if (owned.includes('iron-sword'))    p.atk     += 3
  if (owned.includes('ancient-rune'))  p.maxHp    = 135
  if (owned.includes('devs-guide'))    p.mpRegen  = 10
  if (owned.includes('neural-cache'))  p.maxMp    = 90
  p.armorFlag = owned.includes('mithril-armor')
  return p
}

const initState = (enemyIdx = 0, equipment = []) => {
  const p = buildPlayerStats(equipment)
  return {
    playerHp: p.maxHp,
    playerMp: p.maxMp,
    enemyHp: ENEMIES[enemyIdx].hp,
    enemyIdx,
    log: [],
    phase: 'shop',
    totalCoins: 0,
    enemiesDefeated: 0,
    inventory: [],
  }
}

/* ── Component ─────────────────────────────────────────────── */
export default function RpgGame({ onClose }) {
  const [equipment, setEquipment] = useState(loadEquipment)
  const [gs, setGs] = useState(() => { const eq = loadEquipment(); return initState(0, eq) })
  const [bagOpen, setBagOpen] = useState(false)

  const player = buildPlayerStats(equipment)
  const enemy  = ENEMIES[gs.enemyIdx]

  const addLog = (msg, prev) => [msg, ...prev].slice(0, 8)

  /* ── Shop: buy item ─────────────────────────────────── */
  const buyItem = useCallback((item, isEquip) => {
    const coins = getCoins()
    if (coins < item.cost) { playBlip(200); return }

    playSuccess()
    addCoins(-item.cost)

    if (isEquip) {
      const next = [...equipment, item.id]
      saveEquipment(next)
      setEquipment(next)
    } else {
      setGs(prev => ({ ...prev, inventory: [...prev.inventory, item] }))
    }
  }, [equipment])

  /* ── Shop: enter battle ─────────────────────────────── */
  const startBattle = useCallback(() => {
    playClick()
    const p = buildPlayerStats(equipment)
    setGs(prev => ({
      ...prev,
      phase: 'player',
      log: [`[BATTLE START] ${ENEMIES[prev.enemyIdx].name} appeared! ${ENEMIES[prev.enemyIdx].desc}`],
      playerHp: Math.min(prev.playerHp, p.maxHp),
      playerMp: Math.min(prev.playerMp, p.maxMp),
    }))
  }, [equipment])

  /* ── Battle: use skill ──────────────────────────────── */
  const useSkill = useCallback((skill) => {
    if (gs.phase !== 'player') return
    if (gs.playerMp < skill.mp) { playBlip(200); return }
    playClick()

    setGs(prev => {
      const p = buildPlayerStats(equipment)
      let { playerHp, playerMp, enemyHp, log, totalCoins, enemiesDefeated, inventory } = prev
      playerMp -= skill.mp
      let msg = ''

      if (skill.heal) {
        const healed = Math.min(skill.heal, p.maxHp - playerHp)
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
        totalCoins += reward
        enemiesDefeated += 1
        const nextEnemyIdx = prev.enemyIdx + 1
        playSuccess()

        if (nextEnemyIdx >= ENEMIES.length) {
          addCoins(totalCoins)
          return {
            ...prev, playerHp, playerMp, enemyHp: 0, totalCoins, enemiesDefeated,
            log: addLog(`★ ALL ENEMIES DEFEATED! +${totalCoins} coins!`, log),
            phase: 'victory', inventory,
          }
        }

        // Go to shop before next enemy
        const nextEnemy = ENEMIES[nextEnemyIdx]
        return {
          ...prev, playerHp, playerMp,
          enemyHp: nextEnemy.hp,
          enemyIdx: nextEnemyIdx,
          totalCoins, enemiesDefeated, inventory,
          log: addLog(`★ ${enemy.name} defeated! +${reward} coins! VISIT THE SHOP!`, log),
          phase: 'shop',
        }
      }

      // Enemy turn
      let eDmg = rand(Math.floor(enemy.atk * 0.6), enemy.atk)
      if (p.armorFlag) eDmg = Math.max(1, Math.floor(eDmg * 0.8))
      playerHp = Math.max(0, playerHp - eDmg)
      log = addLog(`< ${enemy.icon} ${enemy.name}: ${eDmg} DMG!`, log)

      // MP regen
      playerMp = Math.min(p.maxMp, playerMp + p.mpRegen)

      if (playerHp <= 0) {
        playGameOver()
        return { ...prev, playerHp: 0, playerMp, enemyHp, log: addLog('✕ GAME OVER — You were defeated!', log), phase: 'lose', inventory }
      }

      return { ...prev, playerHp, playerMp, enemyHp, log, phase: 'player', inventory }
    })
  }, [gs.phase, gs.playerMp, enemy, equipment])

  /* ── Battle: use consumable from bag ───────────────── */
  const useConsumable = useCallback((item, idx) => {
    playEat()
    setGs(prev => {
      const p = buildPlayerStats(equipment)
      let { playerHp, playerMp, inventory, log } = prev
      const next = inventory.filter((_, i) => i !== idx)
      let msg = ''

      if (item.id === 'health-potion') {
        const gain = Math.min(30, p.maxHp - playerHp); playerHp += gain
        msg = `> 🧪 HEALTH POTION: +${gain} HP!`
      } else if (item.id === 'super-potion') {
        const gain = Math.min(60, p.maxHp - playerHp); playerHp += gain
        msg = `> 💊 SUPER POTION: +${gain} HP!`
      } else if (item.id === 'mp-elixir') {
        const gain = Math.min(30, p.maxMp - playerMp); playerMp += gain
        msg = `> 🔵 MP ELIXIR: +${gain} MP!`
      } else if (item.id === 'coffee-break') {
        const gain = Math.min(20, p.maxMp - playerMp); playerMp += gain
        msg = `> ☕ COFFEE BREAK: +${gain} MP!`
      } else if (item.id === 'inn-night') {
        playerHp = p.maxHp; playerMp = p.maxMp
        msg = `> 🏨 INN NIGHT: Full HP+MP restored!`
      }

      return { ...prev, playerHp, playerMp, inventory: next, log: addLog(msg, log) }
    })
  }, [equipment])

  const restart = () => {
    const eq = loadEquipment()
    setEquipment(eq)
    setGs(initState(0, eq))
    setBagOpen(false)
  }

  /* ── Derived values ─────────────────────────────────── */
  const hpPct     = (gs.playerHp / player.maxHp) * 100
  const mpPct     = (gs.playerMp / player.maxMp) * 100
  const eHpPct    = (gs.enemyHp  / enemy.hp)     * 100
  const shopCoins = getCoins()

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div className="snake-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="rpg-modal">
        <div className="snake-header">
          <span className="snake-title">⚔ RPG BATTLE ⚔</span>
          <span className="snake-scores">ENEMIES: {gs.enemiesDefeated}/{ENEMIES.length} · ★{gs.totalCoins}</span>
          <button className="snake-close" onClick={onClose}>✕</button>
        </div>

        <div className="rpg-body">
          {/* ── Shop Phase ── */}
          {gs.phase === 'shop' && (
            <div className="rpg-shop">
              <div className="rpg-shop-header">
                <span>🏪 ITEM SHOP</span>
                <span className="rpg-shop-enemy">Next: {enemy.icon} {enemy.name}</span>
              </div>
              <div className="rpg-shop-stats">
                HP: {gs.playerHp}/{player.maxHp} &nbsp;·&nbsp;
                MP: {gs.playerMp}/{player.maxMp} &nbsp;·&nbsp;
                ATK: {player.atk} &nbsp;·&nbsp;
                ★ COINS: {shopCoins}
              </div>

              <div className="rpg-shop-section">CONSUMABLES</div>
              <div className="rpg-shop-grid">
                {CONSUMABLES.map(item => {
                  const canAfford = shopCoins >= item.cost
                  return (
                    <div key={item.id} className={`rpg-shop-item${!canAfford ? ' dimmed' : ''}`}>
                      <span className="rpg-shop-icon">{item.icon}</span>
                      <div className="rpg-shop-info">
                        <div className="rpg-shop-name">{item.name}</div>
                        <div className="rpg-shop-desc">{item.desc}</div>
                      </div>
                      <div className="rpg-shop-right">
                        <div className="rpg-shop-cost">★{item.cost}</div>
                        <button className="rpg-shop-btn" disabled={!canAfford} onClick={() => buyItem(item, false)}>BUY</button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="rpg-shop-section">EQUIPMENT</div>
              <div className="rpg-shop-grid">
                {EQUIPMENT.map(item => {
                  const owned     = equipment.includes(item.id)
                  const canAfford = shopCoins >= item.cost
                  return (
                    <div key={item.id} className={`rpg-shop-item${(!canAfford && !owned) ? ' dimmed' : ''}`}>
                      <span className="rpg-shop-icon">{item.icon}</span>
                      <div className="rpg-shop-info">
                        <div className="rpg-shop-name">{item.name}</div>
                        <div className="rpg-shop-desc">{item.desc}</div>
                      </div>
                      <div className="rpg-shop-right">
                        <div className="rpg-shop-cost">★{item.cost}</div>
                        {owned
                          ? <span className="rpg-shop-owned">✓ OWNED</span>
                          : <button className="rpg-shop-btn" disabled={!canAfford} onClick={() => buyItem(item, true)}>BUY</button>
                        }
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button className="btn btn-primary" onClick={startBattle}>FIGHT →</button>
              </div>
            </div>
          )}

          {/* ── Battle Phase ── */}
          {gs.phase === 'player' && (<>
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
              <div className="rpg-name">🧑‍💻 {player.name} · {player.class}</div>
              <div className="rpg-hp-row">
                <span className="rpg-hp-label">HP</span>
                <div className="rpg-bar-track">
                  <div className="rpg-bar-fill rpg-player-fill" style={{ width: `${hpPct}%`, background: hpPct > 50 ? 'var(--c2)' : hpPct > 25 ? '#f97316' : '#ef4444' }} />
                </div>
                <span className="rpg-hp-val">{gs.playerHp}/{player.maxHp}</span>
              </div>
              <div className="rpg-hp-row">
                <span className="rpg-hp-label">MP</span>
                <div className="rpg-bar-track">
                  <div className="rpg-bar-fill" style={{ width: `${mpPct}%`, background: 'var(--c1)' }} />
                </div>
                <span className="rpg-hp-val">{gs.playerMp}/{player.maxMp}</span>
              </div>
            </div>

            {/* Skills + Bag */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <div className="rpg-skills" style={{ flex: 1 }}>
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
              <button
                className="rpg-bag-btn"
                onClick={() => { playClick(); setBagOpen(o => !o) }}
                title="Open bag"
              >
                👜 BAG {gs.inventory.length > 0 && <span className="rpg-bag-count">{gs.inventory.length}</span>}
              </button>
            </div>

            {/* Bag panel */}
            {bagOpen && (
              <div className="rpg-bag-panel">
                <div className="rpg-shop-section">BAG — USE ITEMS</div>
                {gs.inventory.length === 0
                  ? <p className="rpg-bag-empty">Bag is empty.</p>
                  : gs.inventory.map((item, i) => (
                    <div key={i} className="rpg-bag-row">
                      <span>{item.icon} {item.name}</span>
                      <span className="rpg-shop-desc">{item.desc}</span>
                      <button className="rpg-shop-btn" onClick={() => useConsumable(item, i)}>USE</button>
                    </div>
                  ))
                }
              </div>
            )}
          </>)}

          {/* ── End States ── */}
          {(gs.phase === 'victory' || gs.phase === 'lose') && (
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
          {gs.phase === 'player' && (
            <div className="rpg-log">
              {gs.log.map((l, i) => (
                <p key={i} className="rpg-log-line" style={{ opacity: 1 - i * 0.1 }}>{l}</p>
              ))}
            </div>
          )}
        </div>

        <p className="snake-hint">
          {gs.phase === 'shop'
            ? 'BUY ITEMS BEFORE THE FIGHT · EQUIPMENT IS PERMANENT'
            : `MP RESTORES +${player.mpRegen}/TURN · DEFEAT ALL ${ENEMIES.length} ENEMIES TO WIN`
          }
        </p>
      </div>
    </div>
  )
}
