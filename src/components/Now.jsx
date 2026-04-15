import { useScrollReveal } from '../hooks/useScrollReveal'

const NOW_ITEMS = [
  { icon: '⚙', label: 'CURRENTLY BUILDING', value: 'AI inference pipeline on multi-cloud GPU infra (Oplexa)' },
  { icon: '📖', label: 'CURRENTLY LEARNING',  value: 'FPGA HLS4ML optimization + Rust systems programming' },
  { icon: '🔖', label: 'CURRENTLY READING',   value: 'Designing Data-Intensive Applications — Kleppmann' },
]

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
          </div>
        ))}
      </div>
    </section>
  )
}
