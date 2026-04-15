import { useEffect, useMemo, useState } from 'react'

export default function GitHubHeatmap() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    fetch('https://github-contributions-api.jogruber.de/v4/Alcatraz-0?y=last')
      .then(r => r.json())
      .then(d => setData(d.contributions || []))
      .catch(() => setError(true))
  }, [])

  const weeks = useMemo(() => {
    if (!data) return []
    const days = data.slice(-364)
    const result = []
    for (let i = 0; i < days.length; i += 7) result.push(days.slice(i, i + 7))
    return result
  }, [data])

  if (error) return <p className="heatmap-error">Could not load contribution data.</p>
  if (!data)  return <p className="heatmap-loading">Loading commit history...</p>

  return (
    <div className="heatmap-wrap">
      <p className="section-label">// COMMIT HISTORY — ALCATRAZ-0</p>
      <div className="heatmap-grid">
        {weeks.map((week, wi) => (
          <div key={wi} className="heatmap-col">
            {week.map((day, di) => (
              <div key={di} className={`heatmap-cell heatmap-l${day.level}`}
                onMouseEnter={e => setTooltip({ x: e.clientX, y: e.clientY, date: day.date, count: day.count })}
                onMouseLeave={() => setTooltip(null)} />
            ))}
          </div>
        ))}
      </div>
      {tooltip && (
        <div className="heatmap-tooltip" style={{ left: tooltip.x + 10, top: tooltip.y - 30 }}>
          {tooltip.date}: {tooltip.count} commit{tooltip.count !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
