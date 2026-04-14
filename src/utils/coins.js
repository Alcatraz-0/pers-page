const KEY = 'portfolio-coins'

export const getCoins = () => Number(localStorage.getItem(KEY) || 0)

export const addCoins = (n) => {
  const next = getCoins() + n
  localStorage.setItem(KEY, String(next))
  window.dispatchEvent(new CustomEvent('coins-update', { detail: next }))
  return next
}

export const spendCoins = (n) => {
  const cur = getCoins()
  if (cur < n) return false
  const next = cur - n
  localStorage.setItem(KEY, String(next))
  window.dispatchEvent(new CustomEvent('coins-update', { detail: next }))
  return true
}
