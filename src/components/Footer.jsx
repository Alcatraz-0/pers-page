import { useEffect, useState } from 'react'
import FooterLandscape from './FooterLandscape'

function VisitorCounter() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    const STORE_KEY = 'visitor-count'
    const SESSION_KEY = 'visitor-counted'
    let n = Number(localStorage.getItem(STORE_KEY) || 0)
    if (!sessionStorage.getItem(SESSION_KEY)) {
      n += 1
      localStorage.setItem(STORE_KEY, String(n))
      sessionStorage.setItem(SESSION_KEY, 'true')
    }
    setCount(n)
  }, [])

  if (count === null) return null
  return (
    <p className="visitor-counter">
      YOU ARE VISITOR #{String(count).padStart(6, '0')}
    </p>
  )
}

export default function Footer() {
  return (
    <footer>
      <FooterLandscape />

      <div className="footer-text">
        <p className="footer-coin">► INSERT COIN TO CONTINUE ◄</p>
        <VisitorCounter />
        <p className="footer-copy">© 2026 ANAND MEENA · BUILT WITH REACT + VITE</p>
      </div>
    </footer>
  )
}
