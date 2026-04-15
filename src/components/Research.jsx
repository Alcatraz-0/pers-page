import { useScrollReveal } from '../hooks/useScrollReveal'
import { RESEARCH } from '../data/index'

const S = '/sprites/'
const L = '/scenes/library/'

// Library sprites to use as background tiles — pick varied items
// Scattered positions [top%, left%] for each library tile
const LIB_POSITIONS = [
  [2,2],[2,14],[2,28],[2,72],[2,86],[2,96],
  [30,0],[30,92],[30,98],
  [55,1],[55,91],[55,97],
  [78,2],[78,14],[78,72],[78,86],[78,96],[78,98],
]

export default function Research() {
  const [ref, visible] = useScrollReveal()

  return (
    <section id="research" ref={ref} className={`section-reveal${visible ? ' visible' : ''}`} style={{ position: 'relative', overflow: 'hidden' }}>

      {/* ── Library backdrop — scattered scene sprites, very faded ── */}
      <div className="scene-bg research-lib-bg" aria-hidden="true">
        {LIB_POSITIONS.map(([top, left], i) => (
          <img key={i}
               src={`${L}Classroom_and_Library_Singles_48x48_${(i % 18) + 1}.png`}
               alt="" className="lib-tile"
               style={{ top: `${top}%`, left: `${left}%` }} />
        ))}
      </div>

      <p className="section-label">// RESEARCH LOG</p>
      <h2 className="section-title">RESEARCH</h2>

      {/* Ambient research lab sprites */}
      <div className="research-deco-row" aria-hidden="true">
        <img src={`${S}animated_control_room_screens_48x48.gif`}          className="px-sprite px-sprite-lg" alt="" title="Data dashboards" />
        <img src={`${S}animated_control_room_server_48x48.gif`}           className="px-sprite px-sprite-lg" alt="" title="HPC cluster" />
        <img src={`${S}animated_old_tv_48x48.gif`}                        className="px-sprite px-sprite-lg" alt="" title="Terminal" />
        <img src={`${S}animated_museum_laser_front_48x48.gif`}            className="px-sprite px-sprite-lg" alt="" title="Laser precision" />
        <img src={`${S}animated_coffee_48x48.gif`}                        className="px-sprite px-sprite-lg" alt="" title="Researcher fuel" />
        <img src={`${S}animated_spell_book_48x48.gif`}                    className="px-sprite px-sprite-lg" alt="" title="Research papers" />
        <img src={`${S}animated_TV_reportage_48x48.gif`}                  className="px-sprite px-sprite-lg" alt="" title="Publication" />
        <img src={`${S}animated_control_room_facebook_scrolling_48x48.gif`} className="px-sprite px-sprite-lg" alt="" title="Data feed" />
      </div>

      <div className="research-grid">
        {RESEARCH.map((r, i) => (
          <div key={i} className="card research-card">
            <div className="research-status">
              <div className={`status-dot ${r.status}`} />
              <span className="status-text">{r.statusLabel}</span>
            </div>
            <h3 className="research-title">{r.title}</h3>
            <p className="research-venue">{r.venue}</p>
            <p className="research-abstract">{r.abstract}</p>
            <div className="research-actions">
              {r.actions.map(a =>
                a.href ? (
                  <a
                    key={a.label}
                    href={a.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn ${a.primary ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {a.label}
                  </a>
                ) : (
                  <span
                    key={a.label}
                    className="btn btn-outline"
                    style={{ cursor: 'default', opacity: 0.6 }}
                  >
                    {a.label}
                  </span>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
