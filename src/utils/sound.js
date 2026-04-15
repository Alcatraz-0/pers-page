// Web Audio sound utilities — no assets required, all synthesized
let actx = null
function getCtx() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)()
  if (actx.state === 'suspended') actx.resume()
  return actx
}
function note(freq, type, dur, vol = 0.06, when = 0) {
  try {
    const ac = getCtx(), t = ac.currentTime + when
    const osc = ac.createOscillator(), gain = ac.createGain()
    osc.connect(gain); gain.connect(ac.destination)
    osc.type = type; osc.frequency.value = freq
    gain.gain.setValueAtTime(vol, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur)
    osc.start(t); osc.stop(t + dur + 0.01)
  } catch {}
}
export const playClick   = () => note(660, 'square', 0.07, 0.05)
export const playCoin    = () => { note(523,'square',0.08,0.07,0); note(659,'square',0.1,0.07,0.09); note(784,'square',0.14,0.07,0.18) }
export const playSuccess = () => [523,659,784,1047].forEach((f,i) => note(f,'square',0.1,0.06,i*0.08))
export const playGameOver= () => [440,392,349,294].forEach((f,i) => note(f,'sawtooth',0.18,0.07,i*0.11))
export const playEat     = () => note(880, 'square', 0.04, 0.04)
export const playBlip    = (freq=440) => note(freq, 'square', 0.05, 0.04)

// ── Ambient chiptune loop ──────────────────────────────────────────────────
let ambientNodes = []
let ambientTimer = null
let ambientActive = false

const MELODY = [
  [523, 0.12], [587, 0.12], [659, 0.12], [784, 0.18],
  [698, 0.12], [659, 0.12], [523, 0.12], [440, 0.24],
]
const BPM = 90
const BEAT = 60 / BPM
const LOOP_DUR = MELODY.length * BEAT * 1000

function playAmbientNote(freq, dur, when) {
  try {
    const ac = getCtx()
    const t = ac.currentTime + when
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain); gain.connect(ac.destination)
    osc.type = 'square'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.03, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.9)
    osc.start(t); osc.stop(t + dur + 0.01)
    ambientNodes.push(osc)
  } catch {}
}

function scheduleLoop() {
  if (!ambientActive) return
  ambientNodes = []
  MELODY.forEach(([freq, dur], i) => playAmbientNote(freq, dur, i * BEAT))
  ambientTimer = setTimeout(scheduleLoop, LOOP_DUR)
}

export function startAmbient() {
  if (ambientActive) return
  ambientActive = true
  getCtx()
  scheduleLoop()
}

export function stopAmbient() {
  ambientActive = false
  if (ambientTimer) { clearTimeout(ambientTimer); ambientTimer = null }
  ambientNodes.forEach(n => { try { n.stop() } catch {} })
  ambientNodes = []
}
