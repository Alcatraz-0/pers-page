import { useScrollReveal } from '../hooks/useScrollReveal'

const STATS = [
  { label: 'CUMULATIVE GPA',        value: '4.0 / 4.0',  sub: 'MS COMPUTER SCIENCE · UIC' },
  { label: 'ML MODEL ACCURACY',     value: '99.2%',       sub: 'FAIRNESS IN ADS — BEST RESULT' },
  { label: 'BIAS REDUCTION',        value: '93.4%',       sub: 'STATISTICAL PARITY DIFFERENCE' },
  { label: 'DATA PROCESSED',        value: '8 GB+',       sub: '45K TEXT CHUNKS · 12K TABLES' },
  { label: 'MEMORY OPTIMISATION',   value: '87.1%',       sub: '5.7 GB → 733 MB (SF PIPELINE)' },
  { label: 'TABLE RECALL@5',        value: '85%',         sub: 'RAG SEC 10-K SYSTEM' },
  { label: 'PIPELINE SPEEDUP',      value: '3×',          sub: 'HADOOP NLP vs SINGLE-NODE' },
  { label: 'INFERENCE LATENCY',     value: '<100 ms',     sub: 'GRPC + AWS LAMBDA + BEDROCK' },
  { label: 'PROPERTY RECORDS',      value: '3.7 M',       sub: 'SF GENTRIFICATION PIPELINE' },
  { label: 'CRASH RECORDS ANALYSED',value: '938 K',       sub: 'CHICAGO TRAFFIC SAFETY PROJECT' },
  { label: 'COST SAVINGS TARGET',   value: '30–60%',      sub: 'MULTI-CLOUD IAAS PLATFORM' },
  { label: 'PRODUCTION UPTIME',     value: '99.7%',       sub: 'AWS ELASTIC BEANSTALK DEPLOY' },
]

const BADGES = [
  { icon: '📄', label: 'SPRINGER PUBLICATION' },
  { icon: '🎓', label: 'GPA 4.0' },
  { icon: '🔬', label: 'QUANTUM RESEARCH' },
  { icon: '☁',  label: 'MULTI-CLOUD' },
  { icon: '🤖', label: 'LLM SYSTEMS' },
  { icon: '⚡', label: 'FPGA / HLS4ML' },
  { icon: '🗺', label: 'GEO ANALYTICS' },
  { icon: '⚖',  label: 'RESPONSIBLE AI' },
]

const RPG_ATTRS = [
  { key: 'INT', label: 'INTELLIGENCE', pct: 95, note: 'ML · NLP · Research' },
  { key: 'DEX', label: 'DEXTERITY',    pct: 88, note: 'Multi-stack delivery' },
  { key: 'STR', label: 'STRENGTH',     pct: 82, note: 'Cloud infra & scale' },
  { key: 'WIS', label: 'WISDOM',       pct: 85, note: 'System design & arch' },
]

export default function PlayerStats() {
  const [ref, visible] = useScrollReveal()

  return (
    <section
      id="stats"
      ref={ref}
      className={`section-reveal player-stats-section${visible ? ' visible' : ''}`}
    >
      <p className="section-label">// PLAYER PROFILE</p>
      <h2 className="section-title">STATS &amp; ACHIEVEMENTS</h2>

      {/* RPG attribute bars */}
      <div className="rpg-attrs">
        {RPG_ATTRS.map(a => (
          <div key={a.key} className="rpg-attr">
            <div className="rpg-attr-header">
              <span className="rpg-attr-key">{a.key}</span>
              <span className="rpg-attr-label">{a.label}</span>
              <span className="rpg-attr-note">{a.note}</span>
              <span className="rpg-attr-val">{a.pct}</span>
            </div>
            <div className="rpg-attr-track">
              <div
                className="rpg-attr-fill"
                style={{ transform: visible ? `scaleX(${a.pct / 100})` : 'scaleX(0)' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Quantitative stat cards */}
      <div className="pstat-grid">
        {STATS.map(s => (
          <div key={s.label} className="pstat-card">
            <span className="pstat-value">{s.value}</span>
            <span className="pstat-label">{s.label}</span>
            <span className="pstat-sub">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Achievement badges */}
      <div className="badge-row">
        {BADGES.map(b => (
          <div key={b.label} className="badge-item">
            <span className="badge-icon">{b.icon}</span>
            <span className="badge-label">{b.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
