import { useScrollReveal } from '../hooks/useScrollReveal'
import { NOW_ITEMS } from '../data'

export default function Now() {
  const [ref, visible] = useScrollReveal()
  return (
    <section id="now" ref={ref} className={`section-reveal${visible ? ' visible' : ''}`}>
      <p className="section-label">// STATUS UPDATE</p>
      <h2 className="section-title">NOW</h2>
      <div className="now-grid">
        {NOW_ITEMS.map(item => (
          <div key={item.label} className="card now-card">
            <span className="now-icon">{item.icon}</span>
            <p className="now-label">{item.label}</p>
            <p className="now-value">{item.value}</p>
            <p className="now-detail">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
