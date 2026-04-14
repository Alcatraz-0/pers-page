import { useEffect, useState } from 'react'
import { getCoins } from '../utils/coins'

export default function CoinDisplay() {
  const [coins, setCoins] = useState(getCoins)
  const [bump, setBump]   = useState(false)

  useEffect(() => {
    const handler = (e) => {
      setCoins(e.detail)
      setBump(true)
      setTimeout(() => setBump(false), 400)
    }
    window.addEventListener('coins-update', handler)
    return () => window.removeEventListener('coins-update', handler)
  }, [])

  return (
    <div className={`coin-display${bump ? ' coin-bump' : ''}`} title="Your coin balance">
      <span className="coin-star">★</span>
      <span className="coin-count">{coins}</span>
      <span className="coin-label">COINS</span>
    </div>
  )
}
