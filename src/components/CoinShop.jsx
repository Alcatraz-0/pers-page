import { useState } from 'react'
import { getCoins, addCoins, getUnlockedPalettes } from '../utils/coins'
import { playSuccess } from '../utils/sound'

const LOCKED_PALETTES = [
  { id: 'synthwave', label: 'SYNTHWAVE', c1: '#ec4899' },
  { id: 'aurora',    label: 'AURORA',    c1: '#a78bfa' },
  { id: 'ember',     label: 'EMBER',     c1: '#fb923c' },
  { id: 'neon',      label: 'NEON',      c1: '#f97316' },
  { id: 'teal',      label: 'TEAL',      c1: '#0d9488' },
]

const UPGRADES = [
  { id: 'cursor-rainbow', label: 'RAINBOW CURSOR', cost: 100, desc: '2× sparkle effects' },
  { id: 'guestbook-vip',  label: 'VIP BADGE',      cost: 25,  desc: '★VIP on guestbook posts' },
]

export default function CoinShop({ onClose }) {
  const [coins, setCoins] = useState(getCoins)
  const [ownedPalettes, setOwnedPalettes] = useState(getUnlockedPalettes)
  const [ownedUpgrades, setOwnedUpgrades] = useState(() =>
    UPGRADES.filter(u => localStorage.getItem(u.id) === '1').map(u => u.id)
  )

  const buyPalette = (id) => {
    const next = addCoins(-50)
    setCoins(next)
    const updated = [...ownedPalettes, id]
    localStorage.setItem('unlocked-palettes', JSON.stringify(updated))
    setOwnedPalettes(updated)
    window.dispatchEvent(new Event('palette-unlocked'))
    playSuccess()
  }

  const buyUpgrade = (upgrade) => {
    const next = addCoins(-upgrade.cost)
    setCoins(next)
    localStorage.setItem(upgrade.id, '1')
    setOwnedUpgrades(prev => [...prev, upgrade.id])
    playSuccess()
  }

  return (
    <div className="w98-dialog-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w98-dialog">
        <div className="w98-dialog-titlebar">
          <span className="w98-dialog-title">☆ COIN SHOP</span>
          <button className="w98-ctrl w98-close-sm" onClick={onClose}>✕</button>
        </div>

        <div className="w98-dialog-body" style={{ flexDirection: 'column', gap: '0.25rem' }}>
          <p style={{ fontFamily: 'var(--pixel)', fontSize: '0.5rem', color: 'var(--c1)' }}>
            ★ BALANCE: {coins} COINS
          </p>

          <p className="shop-section-title">PALETTES</p>
          {LOCKED_PALETTES.map(p => {
            const owned = ownedPalettes.includes(p.id)
            const canAfford = coins >= 50
            return (
              <div key={p.id} className="shop-row">
                <span className="shop-swatch" style={{ background: p.c1 }} />
                <span style={{ fontFamily: 'var(--pixel)', fontSize: '0.45rem', flex: 1 }}>{p.label}</span>
                {owned
                  ? <span className="shop-owned">✓ OWNED</span>
                  : <button
                      className="shop-buy-btn"
                      disabled={!canAfford}
                      onClick={() => buyPalette(p.id)}
                    >BUY 50★</button>
                }
              </div>
            )
          })}

          <p className="shop-section-title">UPGRADES</p>
          {UPGRADES.map(u => {
            const owned = ownedUpgrades.includes(u.id)
            const canAfford = coins >= u.cost
            return (
              <div key={u.id} className="shop-row">
                <span style={{ fontFamily: 'var(--pixel)', fontSize: '0.45rem', flex: 1 }}>
                  {u.label} — {u.desc}
                </span>
                {owned
                  ? <span className="shop-owned">✓ OWNED</span>
                  : <button
                      className="shop-buy-btn"
                      disabled={!canAfford}
                      onClick={() => buyUpgrade(u)}
                    >BUY {u.cost}★</button>
                }
              </div>
            )
          })}
        </div>

        <div className="w98-dialog-footer">
          <button className="w98-btn-ok" onClick={onClose}>CLOSE</button>
        </div>
      </div>
    </div>
  )
}
