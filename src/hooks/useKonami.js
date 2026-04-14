import { useEffect } from 'react'

const SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

export function useKonami(onActivate) {
  useEffect(() => {
    let i = 0
    const onKey = (e) => {
      if (e.key === SEQ[i]) {
        i++
        if (i === SEQ.length) { i = 0; onActivate() }
      } else {
        i = e.key === SEQ[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onActivate])
}
