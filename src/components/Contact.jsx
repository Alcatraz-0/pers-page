import { useScrollReveal } from '../hooks/useScrollReveal'
import { CONTACT_ITEMS } from '../data/index'

export default function Contact() {
  const [ref, visible] = useScrollReveal()

  return (
    <section id="contact" ref={ref} className={`section-reveal${visible ? ' visible' : ''}`}>
      <p className="section-label">// INSERT COIN</p>
      <h2 className="section-title">CONTACT</h2>

      <div className="contact-grid">
        {CONTACT_ITEMS.map(item => (
          <div key={item.label} className="card contact-card">
            <div className="contact-icon">{item.icon}</div>
            <div>
              <p className="contact-label">{item.label}</p>
              {item.href ? (
                <a href={item.href} target={item.href.startsWith('mailto') ? undefined : '_blank'} rel="noopener noreferrer" className="contact-value">
                  {item.value}
                </a>
              ) : (
                <span className="contact-value">{item.value}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
