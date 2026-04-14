import { useEffect, useRef, useState } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { SKILL_GROUPS } from '../data/index'
import { playClick } from '../utils/sound'

const S = '/sprites/'

function SkillBar({ name, pct, animate }) {
  return (
    <div className="skill-item">
      <div className="skill-header">
        <span className="skill-name">{name}</span>
        <span className="skill-pct">{pct}%</span>
      </div>
      <div className="skill-bar-track">
        <div
          className="skill-bar-fill"
          style={{ transform: animate ? `scaleX(${pct / 100})` : 'scaleX(0)' }}
        />
      </div>
    </div>
  )
}

function SkillTreeNode({ name, pct, animate }) {
  const stars = Math.round(pct / 20) // 0–5 stars
  return (
    <div className={`skt-node${animate ? ' skt-in' : ''}`}>
      <div className="skt-ring" style={{ '--pct': `${pct}%` }}>
        <span className="skt-pct">{pct}</span>
      </div>
      <span className="skt-name">{name}</span>
      <span className="skt-stars">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < stars ? 'skt-star filled' : 'skt-star'}>★</span>
        ))}
      </span>
    </div>
  )
}

export default function Skills() {
  const [ref, visible] = useScrollReveal(0.15)
  const [animate, setAnimate] = useState(false)
  const [view, setView] = useState('bars') // 'bars' | 'tree'
  const triggered = useRef(false)

  useEffect(() => {
    if (visible && !triggered.current) {
      triggered.current = true
      const t = setTimeout(() => setAnimate(true), 100)
      return () => clearTimeout(t)
    }
  }, [visible])

  return (
    <section id="skills" ref={ref} className={`section-reveal${visible ? ' visible' : ''}`}>
      <p className="section-label">// STAT SCREEN</p>
      <h2 className="section-title">SKILLS</h2>

      {/* Sprite decorations flanking the toggle */}
      <div className="skills-deco-row">
        <img src={`${S}animated_control_room_server_48x48.gif`} className="px-sprite" alt="" title="Backend & Cloud" />
        <img src={`${S}animated_treadmill_48x48.gif`}           className="px-sprite" alt="" title="Always grinding" />
        <div className="skill-view-toggle">
          <button
            className={`filter-btn${view === 'bars' ? ' active' : ''}`}
            onClick={() => { setView('bars'); playClick() }}
          >
            BAR VIEW
          </button>
          <button
            className={`filter-btn${view === 'tree' ? ' active' : ''}`}
            onClick={() => { setView('tree'); playClick() }}
          >
            SKILL TREE
          </button>
        </div>
        <img src={`${S}animated_amplifier_48x48.gif`} className="px-sprite" alt="" title="Amplified skills" />
        <img src={`${S}animated_spell_book_48x48.gif`} className="px-sprite" alt="" title="Knowledge Base" />
      </div>

      {view === 'bars' ? (
        <div className="skills-grid">
          {SKILL_GROUPS.map(group => (
            <div key={group.label}>
              <p className="skills-group-title">{group.label}</p>
              {group.items.map(s => (
                <SkillBar key={s.name} name={s.name} pct={s.pct} animate={animate} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="skt-grid">
          {SKILL_GROUPS.map(group => (
            <div key={group.label} className="skt-group">
              <p className="skills-group-title">{group.label}</p>
              <div className="skt-nodes">
                {group.items.map(s => (
                  <SkillTreeNode key={s.name} name={s.name} pct={s.pct} animate={animate} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
