import { useEffect, useRef, useState } from 'react'
import { getCoins } from '../utils/coins'

const TIPS = [
  'Try the Konami code (↑↑↓↓←→←→BA) for 50 free coins!',
  'Click the coffee cup in the footer for 5 coins.',
  'The RPG shop lets you spend coins on permanent upgrades.',
  'Unlock palettes in ☆ SHOP — synthwave costs 50 coins.',
  'Scroll to 100% XP in the bottom bar to see the HIRE ME prompt.',
  'Press ESC to close any game.',
  "Try 'help' to see all commands.",
  'The library backdrop in Research section uses 18 pixel sprites.',
]

const ACHIEVEMENTS = [
  { id: 'projects',        label: 'CODE ARCHAEOLOGIST — Unearthed 6 projects' },
  { id: 'skills',          label: 'SKILL TREE MAXED — Full stack detected' },
  { id: 'research',        label: 'SCHOLAR DETECTED — Research section explored' },
  { id: 'resume',          label: 'LORE UNLOCKED — Resume downloaded' },
  { id: 'contact',         label: 'FINAL BOSS REACHED — Contact section opened' },
  { id: 'penny-collector', label: 'PENNY COLLECTOR — First coins earned' },
  { id: 'coin-hoarder',    label: 'COIN HOARDER — 100 coins stashed' },
  { id: 'coin-king',       label: 'COIN KING — 500 coins collected' },
  { id: 'snake-charmer',   label: 'SNAKE CHARMER — Snake high score reached' },
  { id: 'grid-master',     label: 'GRID MASTER — 2048 tile achieved' },
  { id: 'bug-slayer',      label: 'BUG SLAYER — Whack-a-Bug champion' },
]

const COMMANDS = {
  help: () => [
    { text: 'AVAILABLE COMMANDS:', cls: 'c2' },
    { text: '  about        who is Anand?' },
    { text: '  skills       tech stack breakdown' },
    { text: '  projects     what has been built' },
    { text: '  research     published & ongoing work' },
    { text: '  contact      how to reach me' },
    { text: '  whoami       ??' },
    { text: '  coins        check your coin balance' },
    { text: '  shop         browse the palette shop' },
    { text: '  scores       view game high scores' },
    { text: '  achievements see unlocked achievements' },
    { text: '  tip          get a random tip' },
    { text: '  clear        clear the terminal' },
    { text: '  exit         close this window' },
    { text: '  ...          there may be other commands', cls: 'muted' },
  ],
  about: () => [
    { text: 'ANAND MEENA', cls: 'c1' },
    { text: 'Software Engineer & MS CS @ UIC  (GPA 4.0)' },
    { text: 'SAMPL Lab · Cloud · ML · Distributed Systems' },
    { text: 'Building at the intersection of hardware' },
    { text: 'and intelligence.' },
  ],
  skills: () => [
    { text: 'TOP SKILLS:', cls: 'c2' },
    { text: '  [██████████] Python        95%', cls: 'ok' },
    { text: '  [████████░░] Hugging Face  88%', cls: 'ok' },
    { text: '  [████████░░] RAG / LLM     85%', cls: 'ok' },
    { text: '  [████████░░] AWS Stack     82%', cls: 'ok' },
    { text: '  [███████░░░] Hadoop/HDFS   75%', cls: 'ok' },
    { text: '  [███████░░░] K8s / Docker  72%', cls: 'ok' },
  ],
  projects: () => [
    { text: 'PROJECTS:', cls: 'c2' },
    { text: '  [001]  Multi-Modal RAG · SEC 10-K Analysis' },
    { text: '  [002]  SF Property Tax & Gentrification Risk' },
    { text: '  [003]  Chicago Traffic Safety Analytics' },
    { text: '  [004]  Fairness in Targeted Advertisements' },
    { text: '  [005]  Distributed AI Pipeline (CS441)' },
    { text: '  [006]  Multi-Cloud IaaS for LLM Inferencing' },
  ],
  research: () => [
    { text: 'RESEARCH:', cls: 'c2' },
    { text: '  [PUBLISHED]  Cross-Language QA System', cls: 'ok' },
    { text: '               Springer CCIS 2234' },
    { text: '  [ONGOING]    ML Multi-Qubit State Reconstruction' },
    { text: '               SAMPL Lab @ UIC' },
    { text: '  [COMPLETED]  Fairness in Ads — ACM Paper (11pp)' },
  ],
  contact: () => [
    { text: 'CONTACT:', cls: 'c2' },
    { text: '  @    anand.01ntgy@gmail.com' },
    { text: '  in   linkedin.com/in/anandm01' },
    { text: '  </>  github.com/Alcatraz-0' },
    { text: '  ◎    Chicago, IL' },
  ],
  whoami: () => [
    { text: 'Checking identity...', cls: 'muted' },
    { text: 'PLAYER ONE', cls: 'c1' },
    { text: 'Clearance: FULL ACCESS', cls: 'ok' },
    { text: 'Status: READY TO HIRE', cls: 'c2' },
  ],
  sudo: () => [{ text: 'Nice try. You cannot sudo rm -rf me.', cls: 'err' }],
  coffee: () => [
    { text: 'Brewing...', cls: 'muted' },
    { text: '  ( (  ', cls: 'c2' },
    { text: "   ) ) ", cls: 'c2' },
    { text: ' .____. ', cls: 'c2' },
    { text: ' |    | ', cls: 'c2' },
    { text: " '----' ", cls: 'c2' },
    { text: 'Coffee ready. +5 focus. -3 sleep.', cls: 'ok' },
  ],
  hack: () => [
    { text: 'Initialising hack sequence...', cls: 'muted' },
    { text: 'Bypassing firewall........... DONE', cls: 'ok' },
    { text: 'Accessing mainframe............. ACCESS DENIED', cls: 'err' },
    { text: "Just kidding. I don't do that.", cls: 'c1' },
    { text: 'Try: skills, projects, research', cls: 'muted' },
  ],
  matrix: () => [
    { text: '01001000 01100101 01101100 01101100 01101111', cls: 'c2' },
    { text: '01010111 01101111 01110010 01101100 01100100', cls: 'c2' },
    { text: 'Decoding...', cls: 'muted' },
    { text: '"Hello World" — still the most powerful program.', cls: 'ok' },
  ],
  ls: () => [
    { text: 'projects/  skills/  research/  contact/', cls: 'c2' },
  ],
  pwd: () => [{ text: '/home/anand/portfolio', cls: 'ok' }],
  date: () => [{ text: new Date().toDateString().toUpperCase(), cls: 'c1' }],
  clear: () => '__CLEAR__',
  exit:  () => '__EXIT__',
  close: () => '__EXIT__',
  coins: () => {
    const bal = getCoins()
    return [
      { text: `★ BALANCE: ${bal} COINS`, cls: 'c1' },
      { text: 'Earn more: Snake (score×2), Quiz (15/correct), RPG (up to 130), 2048 (1/merge), Breakout (1/brick)...' },
      { text: 'Spend: open ☆ SHOP or ⚔ RPG for items', cls: 'muted' },
    ]
  },
  shop: () => [
    { text: 'PALETTE SHOP:', cls: 'c2' },
    { text: '  synthwave  — 50 ★' },
    { text: '  aurora     — 50 ★' },
    { text: '  ember      — 50 ★' },
    { text: '  neon       — 50 ★' },
    { text: '  teal       — 50 ★' },
    { text: 'UPGRADES:', cls: 'c2' },
    { text: '  Rainbow Cursor — 100 ★' },
    { text: '  VIP Badge      — 25 ★' },
    { text: '> Click ☆ SHOP button (bottom-right) to purchase', cls: 'muted' },
  ],
  scores: () => {
    const get = (key) => localStorage.getItem(key)
    const fmt = (val, suffix) => val !== null ? `${val} ${suffix}` : '---'
    return [
      { text: 'HIGH SCORES', cls: 'c2' },
      { text: `  Snake:       ${fmt(get('snake-best'), 'pts')}` },
      { text: `  2048:        ${fmt(get('game2048-best'), 'tile')}` },
      { text: `  Breakout:    ${fmt(get('breakout-best'), 'pts')}` },
      { text: `  Invaders:    ${fmt(get('invaders-best'), 'pts')}` },
      { text: `  Quiz:        ${fmt(get('quiz-best'), '/8 correct')}` },
      { text: `  RPG:         ${fmt(get('rpg-best'), 'coins earned')}` },
      { text: `  Code Typer:  ${fmt(get('ctyper-best'), 'wpm')}` },
      { text: `  Whack-a-Bug: ${fmt(get('wab-best'), 'bugs')}` },
    ]
  },
  achievements: () => {
    const seen = new Set(JSON.parse(localStorage.getItem('seen-achievements') || '[]'))
    return [
      { text: 'ACHIEVEMENTS', cls: 'c2' },
      ...ACHIEVEMENTS.map(({ id, label }) => {
        const unlocked = seen.has(id)
        return { text: `  [${unlocked ? '✓' : '✗'}] ${label}`, cls: unlocked ? 'ok' : 'muted' }
      }),
    ]
  },
  tip: () => [
    { text: 'TIP:', cls: 'c2' },
    { text: `  ${TIPS[Math.floor(Math.random() * TIPS.length)]}` },
  ],
}

export default function Terminal({ onClose }) {
  const [lines, setLines] = useState([
    { text: 'ANAND_OS TERMINAL v1.0 — type "help" to start', cls: 'c1' },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const outputRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (outputRef.current)
      outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [lines])

  useEffect(() => { inputRef.current?.focus() }, [])

  const run = (cmd) => {
    const trimmed = cmd.trim().toLowerCase()
    if (!trimmed) return
    setHistory(h => [trimmed, ...h])
    setHistIdx(-1)
    const echo = { text: `$ ${trimmed}`, cls: 'cmd' }
    const key = trimmed.split(' ')[0]
    const fn = COMMANDS[trimmed] || COMMANDS[key]
    if (!fn) {
      setLines(l => [...l, echo, { text: `command not found: ${trimmed}. try "help"`, cls: 'err' }])
      return
    }
    const result = fn()
    if (result === '__EXIT__') { onClose(); return }
    if (result === '__CLEAR__') { setLines([]); return }
    setLines(l => [...l, echo, ...result])
  }

  const onKey = (e) => {
    if (e.key === 'Enter') {
      run(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = Math.min(histIdx + 1, history.length - 1)
      setHistIdx(idx)
      setInput(history[idx] || '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = Math.max(histIdx - 1, -1)
      setHistIdx(idx)
      setInput(idx === -1 ? '' : history[idx])
    }
  }

  return (
    <div className="terminal-widget">
      <div className="terminal-titlebar">
        <span>ANAND@UIC:~$</span>
        <button className="terminal-close" onClick={onClose}>✕</button>
      </div>
      <div className="terminal-output" ref={outputRef}>
        {lines.map((line, i) => (
          <span key={i} className={`terminal-line ${line.cls || ''}`}>{line.text}</span>
        ))}
      </div>
      <div className="terminal-input-row">
        <span className="terminal-prompt">$</span>
        <input
          ref={inputRef}
          className="terminal-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          placeholder="type a command..."
        />
      </div>
    </div>
  )
}
