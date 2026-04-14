// Chiptune music sequencer — synthesized via Web Audio
const BPM = 132
const B = 60 / BPM  // one beat in seconds

// Original 8-bit melody (freq, beats). 0 = rest
const SEQ = [
  [784,0.5],[659,0.5],[523,0.5],[587,0.5],[659,1],[0,0.5],[784,0.5],
  [784,0.5],[784,0.5],[659,0.5],[659,0.5],[523,1],[0,1],
  [659,0.5],[784,0.5],[880,0.5],[784,0.5],[659,1],[0,0.5],[523,0.5],
  [523,0.5],[587,0.5],[659,0.5],[523,0.5],[392,1],[0,1],
  [784,0.5],[784,0.5],[880,0.5],[988,0.5],[1047,1],[0,0.5],[880,0.5],
  [784,0.5],[659,0.5],[523,0.5],[659,0.5],[784,1],[0,1],
  [659,0.5],[523,0.5],[392,0.5],[440,0.5],[494,1],[0,0.5],[440,0.5],
  [392,0.5],[330,0.5],[294,0.5],[330,0.5],[392,2],[0,0],
]

// Bass line
const BASS = [
  [131,1],[131,1],[175,1],[147,1],
  [131,1],[131,1],[175,1],[175,1],
  [131,1],[131,1],[175,1],[147,1],
  [196,1],[175,1],[131,1],[131,1],
]

export function createPlayer() {
  let ac = null, playing = false, idx = 0, bassIdx = 0, nextT = 0, nextBassT = 0
  let timer = null

  function sched() {
    if (!playing || !ac) return
    const lookahead = 0.3
    while (nextT < ac.currentTime + lookahead) {
      const [freq, beats] = SEQ[idx % SEQ.length]
      const dur = beats * B
      if (freq) {
        const osc = ac.createOscillator(), g = ac.createGain()
        osc.connect(g); g.connect(ac.destination)
        osc.type = 'square'; osc.frequency.value = freq
        g.gain.setValueAtTime(0.04, nextT)
        g.gain.exponentialRampToValueAtTime(0.001, nextT + dur * 0.85)
        osc.start(nextT); osc.stop(nextT + dur)
      }
      nextT += dur
      idx++
    }
    while (nextBassT < ac.currentTime + lookahead) {
      const [freq, beats] = BASS[bassIdx % BASS.length]
      const dur = beats * B
      if (freq) {
        const osc = ac.createOscillator(), g = ac.createGain()
        osc.connect(g); g.connect(ac.destination)
        osc.type = 'triangle'; osc.frequency.value = freq
        g.gain.setValueAtTime(0.025, nextBassT)
        g.gain.exponentialRampToValueAtTime(0.001, nextBassT + dur * 0.7)
        osc.start(nextBassT); osc.stop(nextBassT + dur)
      }
      nextBassT += dur
      bassIdx++
    }
    timer = setTimeout(sched, 100)
  }

  return {
    start() {
      if (playing) return
      ac = new (window.AudioContext || window.webkitAudioContext)()
      playing = true; idx = 0; bassIdx = 0
      nextT = ac.currentTime + 0.1
      nextBassT = ac.currentTime + 0.1
      sched()
    },
    stop() {
      playing = false
      clearTimeout(timer)
      try { ac?.close() } catch {}
      ac = null
    },
    get isPlaying() { return playing },
  }
}
