import { useEffect, useState } from 'react'

export function useTypewriter(texts, typeSpeed = 65, deleteSpeed = 35, pause = 2200) {
  const [idx, setIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = texts[idx]
    let timeout

    if (!deleting) {
      if (charIdx < current.length) {
        timeout = setTimeout(() => setCharIdx(c => c + 1), typeSpeed)
      } else {
        timeout = setTimeout(() => setDeleting(true), pause)
      }
    } else {
      if (charIdx > 0) {
        timeout = setTimeout(() => setCharIdx(c => c - 1), deleteSpeed)
      } else {
        setDeleting(false)
        setIdx(i => (i + 1) % texts.length)
      }
    }

    return () => clearTimeout(timeout)
  }, [charIdx, deleting, idx, texts, typeSpeed, deleteSpeed, pause])

  return texts[idx].slice(0, charIdx)
}
