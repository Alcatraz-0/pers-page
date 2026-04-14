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
export const playHover   = () => note(440, 'square', 0.04, 0.03)
export const playClick   = () => note(660, 'square', 0.07, 0.05)
export const playCoin    = () => { note(523,'square',0.08,0.07,0); note(659,'square',0.1,0.07,0.09); note(784,'square',0.14,0.07,0.18) }
export const playSuccess = () => [523,659,784,1047].forEach((f,i) => note(f,'square',0.1,0.06,i*0.08))
export const playGameOver= () => [440,392,349,294].forEach((f,i) => note(f,'sawtooth',0.18,0.07,i*0.11))
export const playEat     = () => note(880, 'square', 0.04, 0.04)
export const playBlip    = (freq=440) => note(freq, 'square', 0.05, 0.04)
