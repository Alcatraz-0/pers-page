import { useCallback, useEffect, useState } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Research from './components/Research'
import Timeline from './components/Timeline'
import Footer from './components/Footer'
import BootSequence from './components/BootSequence'
import AchievementToast from './components/AchievementToast'
import Terminal from './components/Terminal'
import ScrollProgress from './components/ScrollProgress'
import Cursor from './components/Cursor'
import SnakeGame from './components/SnakeGame'
import QuizGame from './components/QuizGame'
import RpgGame from './components/RpgGame'
import PlayerStats from './components/PlayerStats'
import CoinDisplay from './components/CoinDisplay'
import { useKonami } from './hooks/useKonami'
import { addCoins } from './utils/coins'

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const [lightPalette, setLightPalette] = useState(
    () => localStorage.getItem('palette-light') || 'seafoam'
  )
  const [darkPalette, setDarkPalette] = useState(
    () => localStorage.getItem('palette-dark') || 'ocean'
  )
  const [booted, setBooted]       = useState(() => sessionStorage.getItem('booted') === 'true')
  const [termOpen, setTermOpen]   = useState(false)
  const [snakeOpen, setSnakeOpen] = useState(false)
  const [quizOpen, setQuizOpen]   = useState(false)
  const [rpgOpen, setRpgOpen]     = useState(false)
  const [konamiOn, setKonamiOn]   = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  const palette = dark ? darkPalette : lightPalette

  const setPalette = (id) => {
    if (dark) { setDarkPalette(id);  localStorage.setItem('palette-dark',  id) }
    else      { setLightPalette(id); localStorage.setItem('palette-light', id) }
  }

  const handleBootDone = () => {
    sessionStorage.setItem('booted', 'true')
    setBooted(true)
  }

  const toggleDark = () => {
    setTransitioning(true)
    setTimeout(() => {
      setDark(d => !d)
      setTransitioning(false)
    }, 180)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    document.documentElement.setAttribute('data-palette', palette)
  }, [palette])

  // First-visit coin gift
  useEffect(() => {
    if (!localStorage.getItem('first-visit-gift')) {
      localStorage.setItem('first-visit-gift', 'true')
      setTimeout(() => addCoins(10), 2500)
    }
  }, [])

  const activateKonami = useCallback(() => {
    addCoins(50)
    setKonamiOn(true)
    document.documentElement.classList.add('konami')
    setTimeout(() => {
      document.documentElement.classList.remove('konami')
      setKonamiOn(false)
    }, 6000)
  }, [])
  useKonami(activateKonami)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSnakeOpen(false)
        setQuizOpen(false)
        setRpgOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      {!booted && <BootSequence onDone={handleBootDone} />}
      {transitioning && <div className="theme-flash" />}

      <ScrollProgress />
      <Cursor />

      <Nav dark={dark} setDark={toggleDark} palette={palette} setPalette={setPalette} />

      <Hero />
      <div className="post-hero-content">
        <hr className="divider" />
        <Timeline />
        <hr className="divider" />
        <PlayerStats />
        <hr className="divider" />
        <Projects />
        <hr className="divider" />
        <Research />
        <hr className="divider" />
        <Skills />
        <Footer />
      </div>

      <AchievementToast />

      {/* Coin counter */}
      <CoinDisplay />

      {/* Theme toggle — above terminal */}
      <button
        className="theme-float-btn"
        onClick={toggleDark}
        title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle theme"
      >
        {dark ? '☀' : '🌙'}
      </button>

      {/* Terminal */}
      {termOpen && <Terminal onClose={() => setTermOpen(false)} />}
      <button
        className="terminal-toggle"
        onClick={() => setTermOpen(t => !t)}
        aria-label="Toggle terminal"
      >
        {termOpen ? '✕ TERM' : '>_ TERM'}
      </button>

      {/* Games */}
      {snakeOpen && <SnakeGame onClose={() => setSnakeOpen(false)} />}
      {quizOpen  && <QuizGame  onClose={() => setQuizOpen(false)}  />}
      {rpgOpen   && <RpgGame   onClose={() => setRpgOpen(false)}   />}

      {/* Game launcher buttons */}
      <div className="game-launcher-stack">
        <button
          className={`snake-launcher${konamiOn ? ' konami-active' : ''}`}
          onClick={() => setSnakeOpen(true)}
          title="Play Snake (earn coins)"
        >◆ SNAKE</button>
        <button
          className="snake-launcher"
          onClick={() => setQuizOpen(true)}
          title="Trivia quiz (earn coins)"
        >? QUIZ</button>
        <button
          className="snake-launcher"
          onClick={() => setRpgOpen(true)}
          title="RPG battle (earn coins)"
        >⚔ RPG</button>
      </div>
    </>
  )
}
