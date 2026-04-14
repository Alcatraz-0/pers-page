import { useScrollReveal } from '../hooks/useScrollReveal'
import { EDUCATION, EXPERIENCE } from '../data/index'

const S = '/sprites/'

function TimelineItem({ date, org, role, bullets, icon }) {
  return (
    <div className="timeline-item">
      <img src={icon} className="tl-sprite px-sprite" alt="" />
      <div className="tl-content">
        <span className="timeline-date">{date}</span>
        <p className="timeline-org">{org}</p>
        <p className="timeline-role">{role}</p>
        {bullets.length > 0 && (
          <ul className="timeline-desc">
            {bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        )}
      </div>
    </div>
  )
}

const EDU_ICON  = `${S}animated_spell_book_48x48.gif`
const EXP_ICONS = [
  `${S}animated_control_room_server_48x48.gif`,
  `${S}animated_control_room_screens_48x48.gif`,
  `${S}animated_TV_reportage_48x48.gif`,
  `${S}animated_amplifier_48x48.gif`,
  `${S}animated_cuckoo_clock_48x48.gif`,
]

export default function Timeline() {
  const [ref, visible] = useScrollReveal()

  return (
    <section id="resume" ref={ref} className={`section-reveal${visible ? ' visible' : ''}`}>
      <p className="section-label">// GAME HISTORY</p>
      <h2 className="section-title">RESUME</h2>

      <div className="timeline-layout">
        {/* Escalator progress bar on the side */}
        <div className="tl-escalator">
          <img src={`${S}animated_escalator_up_48x48.gif`} className="px-sprite" alt="" />
          <div className="tl-progress-track">
            <div className="tl-progress-fill" />
          </div>
          <img src={`${S}animated_sprout_48x48.gif`} className="px-sprite" alt="" />
        </div>

        <div className="timeline">
          <h3 className="timeline-section-head">
            <img src={`${S}animated_spell_book_48x48.gif`} className="px-sprite section-head-icon" alt="" />
            EDUCATION
          </h3>
          {EDUCATION.map((e, i) => (
            <TimelineItem key={i} {...e} icon={EDU_ICON} />
          ))}

          <h3 className="timeline-section-head" style={{ marginTop: '2rem' }}>
            <img src={`${S}animated_control_room_server_48x48.gif`} className="px-sprite section-head-icon" alt="" />
            EXPERIENCE
          </h3>
          {EXPERIENCE.map((e, i) => (
            <TimelineItem key={i} {...e} icon={EXP_ICONS[i % EXP_ICONS.length]} />
          ))}
        </div>
      </div>
    </section>
  )
}
