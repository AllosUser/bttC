import { useRef } from 'react'
import { useGSAP } from '../hooks/useGSAP'
import { PROJECTS } from '../data/projects'

const ACCENTS = {
  cyan:  { color: 'var(--bt-cyan)',  glow: 'rgba(0,217,255,0.22)' },
  blue:  { color: 'var(--bt-blue)',  glow: 'rgba(8,123,255,0.26)' },
  green: { color: 'var(--bt-green)', glow: 'rgba(0,227,154,0.20)' },
}

/* ---------- Abstract visual (stands in for a project image) ---------- */
function WorkVisual({ project }) {
  const accent = ACCENTS[project.accent] ?? ACCENTS.cyan
  return (
    <div className="work-visual" style={{ '--work-glow': accent.glow }} aria-hidden="true">
      <div className="work-visual__grid" />
      <span className="work-visual__num">{project.id}</span>
      <svg className="work-visual__lines" viewBox="0 0 200 100" preserveAspectRatio="none">
        <path d="M0 78 C40 70 60 40 100 46 S160 22 200 14" stroke="url(#work-grad)" strokeWidth="1" fill="none" />
        <path d="M0 90 C50 84 80 66 120 70 S170 52 200 48" stroke={accent.color} strokeOpacity="0.35" strokeWidth="1" fill="none" />
      </svg>
    </div>
  )
}

function WorkCard({ project }) {
  const accent = ACCENTS[project.accent] ?? ACCENTS.cyan
  const Tag = project.href ? 'a' : 'article'
  const linkProps = project.href ? { href: project.href, target: '_blank', rel: 'noopener noreferrer' } : {}

  return (
    <Tag className={`work-card ${project.href ? 'work-card--link' : ''}`} {...linkProps}>
      <WorkVisual project={project} />
      <div className="work-card__body">
        <div className="work-card__meta">
          <span className="work-card__cat" style={{ color: accent.color }}>{project.category}</span>
          <span className="work-card__year">{project.year}</span>
        </div>
        <h3 className="work-card__title">
          <span className="work-card__title-mask">
            <span className="work-card__title-word">{project.title}</span>
          </span>
        </h3>
        <p className="work-card__client">{project.client}</p>
        <p className="work-card__summary">{project.summary}</p>
        {project.stack?.length > 0 && (
          <div className="work-card__stack">
            {project.stack.map(s => <span key={s} className="work-card__kw">{s}</span>)}
          </div>
        )}
        {project.placeholder && <span className="work-card__sample">Sample</span>}
      </div>
      <span className="work-card__tick" aria-hidden="true" />
    </Tag>
  )
}

export default function Work() {
  const sectionRef = useRef(null)

  useGSAP(({ gsap, ScrollTrigger }) => {
    const section = sectionRef.current
    if (!section) return
    const EASE = 'expo.out'

    const header = section.querySelector('.work-header')
    if (header) {
      const label = header.querySelector('.section-label')
      const title = header.querySelector('.work-title')
      const sub   = header.querySelector('.work-sub')
      if (label) gsap.set(label, { opacity: 0, y: 16 })
      if (title) gsap.set(title, { opacity: 0, y: 30 })
      if (sub)   gsap.set(sub,   { opacity: 0, y: 20 })

      ScrollTrigger.create({
        trigger: header, start: 'top 85%', once: true,
        onEnter() {
          const tl = gsap.timeline()
          if (label) tl.to(label, { opacity: 1, y: 0, duration: 0.6, ease: EASE }, 0)
          if (title) tl.to(title, { opacity: 1, y: 0, duration: 0.8, ease: EASE }, 0.1)
          if (sub)   tl.to(sub,   { opacity: 1, y: 0, duration: 0.6, ease: EASE }, 0.25)
        },
      })
    }

    const cards = gsap.utils.toArray('.work-card', section)
    cards.forEach((card, i) => {
      const visual = card.querySelector('.work-visual')
      const meta   = card.querySelector('.work-card__meta')
      const word   = card.querySelector('.work-card__title-word')
      const rest   = card.querySelectorAll('.work-card__client, .work-card__summary, .work-card__stack')

      gsap.set(card, { opacity: 0, y: 60 })
      if (visual)      gsap.set(visual, { clipPath: 'inset(0 0 100% 0)' })
      if (meta)        gsap.set(meta,   { opacity: 0, y: 12 })
      if (word)        gsap.set(word,   { yPercent: 100 })
      if (rest.length) gsap.set(rest,   { opacity: 0, y: 16 })

      // Stagger cards that share a row on desktop
      const delay = window.innerWidth >= 1024 ? (i % 2) * 0.12 : 0

      ScrollTrigger.create({
        trigger: card, start: 'top 88%', once: true, invalidateOnRefresh: true,
        onEnter() {
          const tl = gsap.timeline({ delay })
          tl.to(card, { opacity: 1, y: 0, duration: 0.8, ease: EASE }, 0)
          if (visual)      tl.to(visual, { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: EASE }, 0.05)
          if (meta)        tl.to(meta,   { opacity: 1, y: 0, duration: 0.5, ease: EASE }, 0.25)
          if (word)        tl.to(word,   { yPercent: 0, duration: 0.75, ease: EASE }, 0.3)
          if (rest.length) tl.to(rest,   { opacity: 1, y: 0, duration: 0.6, ease: EASE, stagger: 0.08 }, 0.45)
        },
      })
    })
  }, [], sectionRef)

  return (
    <section id="work" ref={sectionRef} className="work-section" aria-label="Selected work">
      {/* Shared SVG gradient for card visuals */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="work-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00E39A" />
            <stop offset="45%" stopColor="#00D9FF" />
            <stop offset="100%" stopColor="#087BFF" />
          </linearGradient>
        </defs>
      </svg>

      <div className="work-inner">
        <header className="work-header">
          <span className="section-label">Selected Work</span>
          <h2 className="work-title">Built to perform in the real world.</h2>
          <p className="work-sub">A look at the kind of platforms, AI systems, and security work we deliver for teams who can't afford to get it wrong.</p>
        </header>

        <div className="work-grid">
          {PROJECTS.map(p => <WorkCard key={p.id} project={p} />)}
        </div>
      </div>

      <style>{`
        .work-section {
          position: relative;
          width: 100vw;
          background: var(--black);
          overflow: hidden;
        }
        .work-inner {
          width: 100%; max-width: 1600px; margin: 0 auto;
          padding: clamp(4rem, 10vh, 8rem) 1.25rem;
          display: flex; flex-direction: column;
          gap: clamp(2.5rem, 5vh, 4.5rem);
        }
        @media (min-width: 1024px) { .work-inner { padding-left: 5vw; padding-right: 5vw; } }

        .work-header { display: flex; flex-direction: column; gap: 0.75rem; max-width: 720px; }
        .work-title {
          font-family: var(--font-display); font-weight: 800; letter-spacing: -0.02em;
          font-size: clamp(1.8rem, 6vw, 3.6rem); line-height: 1.05; color: var(--white);
        }
        .work-sub { font-family: var(--font-body); font-weight: 300; font-size: 0.9rem; line-height: 1.6; color: var(--muted); max-width: 520px; }
        @media (min-width: 768px) { .work-sub { font-size: 1rem; } }

        /* ── Grid ── */
        .work-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media (min-width: 1024px) { .work-grid { grid-template-columns: repeat(2, 1fr); gap: 2rem; } }

        /* ── Card ── */
        .work-card {
          position: relative; display: flex; flex-direction: column;
          background: var(--surface2); border: 1px solid var(--dim);
          overflow: hidden;
          transition: border-color .4s, background .4s;
          will-change: transform, opacity;
        }
        .work-card:hover { border-color: var(--accent); background: var(--surface3); }
        .work-card__tick {
          position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: var(--bt-gradient); transform: scaleX(0); transform-origin: left;
          transition: transform .6s var(--ease-out-expo);
        }
        .work-card:hover .work-card__tick { transform: scaleX(1); }

        /* ── Visual ── */
        .work-visual {
          position: relative; aspect-ratio: 16 / 9; overflow: hidden;
          background:
            radial-gradient(ellipse at 70% 30%, var(--work-glow), transparent 60%),
            linear-gradient(160deg, var(--surface) 0%, var(--bt-black) 100%);
          border-bottom: 1px solid var(--dim);
        }
        .work-visual__grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,217,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,217,255,0.06) 1px, transparent 1px);
          background-size: 40px 40px;
          transition: transform .8s var(--ease-out-expo);
        }
        .work-card:hover .work-visual__grid { transform: scale(1.06); }
        .work-visual__num {
          position: absolute; left: 1.25rem; bottom: 0.5rem;
          font-family: var(--font-display); font-weight: 800; line-height: 1;
          font-size: clamp(4rem, 14vw, 7rem);
          color: transparent; -webkit-text-stroke: 1px rgba(244,247,251,0.12);
          user-select: none;
        }
        .work-visual__lines { position: absolute; inset: 0; width: 100%; height: 100%; }

        /* ── Body ── */
        .work-card__body { position: relative; display: flex; flex-direction: column; gap: 0.75rem; padding: 1.5rem 1.25rem 1.75rem; }
        @media (min-width: 1024px) { .work-card__body { padding: 1.75rem 1.75rem 2rem; } }
        .work-card__meta {
          display: flex; justify-content: space-between; align-items: center;
          font-family: var(--font-display); font-weight: 700;
          font-size: 0.65rem; letter-spacing: 0.22em; text-transform: uppercase;
        }
        .work-card__year { color: var(--muted); }
        .work-card__title {
          font-family: var(--font-display); font-weight: 800;
          font-size: clamp(1.4rem, 4vw, 2rem); line-height: 1.05; letter-spacing: -0.02em;
          color: var(--white);
        }
        .work-card__title-mask { display: block; overflow: hidden; padding-bottom: 0.04em; }
        .work-card__title-word { display: block; }
        .work-card__client { font-size: 0.8rem; color: var(--muted); }
        .work-card__summary { font-size: 0.92rem; line-height: 1.6; color: rgba(244,247,251,0.72); max-width: 560px; }
        .work-card__stack { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.25rem; }
        .work-card__kw {
          font-family: var(--font-display); font-weight: 600;
          font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase;
          padding: 5px 12px; border: 1px solid var(--dim); border-radius: 2px;
          white-space: nowrap; background: rgba(0,217,255,0.025); color: var(--bt-cyan); opacity: 0.85;
        }
        .work-card__sample {
          position: absolute; top: -0.9rem; right: 1.25rem;
          font-family: var(--font-display); font-weight: 700;
          font-size: 0.55rem; letter-spacing: 0.2em; text-transform: uppercase;
          padding: 4px 10px; background: var(--bt-black); color: var(--muted);
          border: 1px dashed var(--muted); border-radius: 2px;
        }
      `}</style>
    </section>
  )
}
