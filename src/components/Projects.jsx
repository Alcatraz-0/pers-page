import { useState } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { PROJECTS, PROJECT_FILTERS } from '../data/index'
import { playClick } from '../utils/sound'

function ProjLink({ href, variant, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
       className={`btn ${variant} flip-link`} onClick={e => e.stopPropagation()}>
      {children}
    </a>
  )
}

function FlipCard({ p }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className={`flip-card${flipped ? ' flipped' : ''}`}
      onClick={() => { setFlipped(f => !f); playClick() }}
      title={flipped ? 'Click to flip back' : 'Click to see details'}
    >
      <div className="flip-card-inner">
        <div className="flip-card-front card project-card">
          <span className="project-file">FILE_{p.id}</span>
          <h3 className="project-name">{p.name}</h3>
          <span className="project-badge">{p.badge}</span>
          <p className="project-desc">{p.desc}</p>
          <div className="tech-tags">
            {p.tech.map(t => <span key={t} className="tech-tag">{t}</span>)}
          </div>
          <span className="flip-hint">[ CLICK TO FLIP ]</span>
        </div>
        <div className="flip-card-back card project-card">
          <span className="project-file">FILE_{p.id} · CASE STUDY</span>
          <h3 className="project-name">{p.name}</h3>

          <div className="flip-section">
            <span className="flip-section-label">IMPACT</span>
            <p className="flip-impact">{p.desc.split('.')[0]}.</p>
          </div>

          <div className="flip-section">
            <span className="flip-section-label">TECH STACK</span>
            <div className="flip-tech-list">
              {p.tech.map(t => (
                <div key={t} className="flip-tech-item">
                  <span className="flip-tech-dot">▶</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flip-section flip-links">
            {p.href && <ProjLink href={p.href} variant="btn-primary">LIVE DEMO</ProjLink>}
            {p.github && <ProjLink href={p.github} variant="btn-outline">GITHUB</ProjLink>}
          </div>

          <span className="flip-hint">[ CLICK TO FLIP BACK ]</span>
        </div>
      </div>
    </div>
  )
}

export default function Projects() {
  const [ref, visible] = useScrollReveal()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? PROJECTS : PROJECTS.filter(p => p.category === filter)

  return (
    <section id="projects" ref={ref} className={`section-reveal${visible ? ' visible' : ''}`}>
      <p className="section-label">// LOAD PROJECTS</p>
      <h2 className="section-title">PROJECTS</h2>

      <div className="filter-btns">
        {PROJECT_FILTERS.map(f => (
          <button
            key={f.value}
            className={`filter-btn${filter === f.value ? ' active' : ''}`}
            onClick={() => { setFilter(f.value); playClick() }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="projects-grid">
        {filtered.map(p => <FlipCard key={p.id} p={p} />)}
      </div>
    </section>
  )
}
