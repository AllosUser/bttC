import { useRef, useState, useEffect } from 'react'
import { useGSAP } from '../hooks/useGSAP'

const STEPS = [
  { id: '01', title: 'Discovery',     desc: 'Deep-dive into your goals, users, and technical constraints.' },
  { id: '02', title: 'Architecture',  desc: 'Technical planning, stack selection, and development roadmap.' },
  { id: '03', title: 'Build',         desc: 'Agile development with weekly check-ins and live previews.' },
  { id: '04', title: 'Launch & Scale',desc: 'QA, deployment, and ongoing performance optimization.' },
]

export default function Process() {
  const sectionRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  /* ── Desktop: pinned section with scrub card reveal ── */
  useGSAP(({ gsap, ScrollTrigger }) => {
    const section = sectionRef.current
    if (!section) return
    if (window.innerWidth < 1024) return

    const cards = gsap.utils.toArray('.process-card', section)
    if (!cards.length) return

    const n = cards.length
    const scrollDist = window.innerHeight * (n - 1) * 0.7

    gsap.set(cards, { opacity: 0, y: 80, rotate: 4 })
    gsap.set(cards[0], { opacity: 1, y: 0, rotate: 0 })
    cards[0].classList.add('is-active')

    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: `+=${scrollDist}`,
      pin: true, pinSpacing: true, anticipatePin: 1, scrub: 0.8,
      invalidateOnRefresh: true,
      onUpdate(self) {
        const activeIdx = Math.min(Math.floor(self.progress * n * 1.02), n - 1)
        cards.forEach((card, i) => {
          if (i <= activeIdx) {
            gsap.to(card, { opacity: 1, y: 0, rotate: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' })
            card.classList.toggle('is-active', i === activeIdx)
            card.classList.toggle('is-past', i < activeIdx)
          } else {
            card.classList.remove('is-active', 'is-past')
          }
        })
      },
    })

    const lines = section.querySelectorAll('.process-line')
    lines.forEach((line, i) => {
      const length = line.getTotalLength?.() ?? 200
      gsap.set(line, { strokeDasharray: length, strokeDashoffset: length })
      gsap.to(line, {
        strokeDashoffset: 0, ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: `top+=${((i + 0.5) / n) * scrollDist} top`,
          end:   `top+=${((i + 1.2) / n) * scrollDist} top`,
          scrub: 1, invalidateOnRefresh: true,
        },
      })
    })
  }, [isMobile], sectionRef)

  /* ── Mobile: staggered scroll-in per card with inner reveals ── */
  useGSAP(({ gsap, ScrollTrigger }) => {
    if (window.innerWidth >= 1024) return
    const section = sectionRef.current
    if (!section) return
    const EASE = 'expo.out'

    // Header animation
    const header = section.querySelector('.process-header')
    if (header) {
      const label = header.querySelector('.section-label')
      const title = header.querySelector('.process-title')
      const sub   = header.querySelector('.process-sub')
      if (label) gsap.set(label, { opacity: 0, y: 16 })
      if (title) gsap.set(title, { opacity: 0, y: 30 })
      if (sub)   gsap.set(sub,   { opacity: 0, y: 20 })

      ScrollTrigger.create({
        trigger: header, start: 'top 88%', once: true,
        onEnter() {
          const tl = gsap.timeline()
          if (label) tl.to(label, { opacity: 1, y: 0, duration: 0.6, ease: EASE }, 0)
          if (title) tl.to(title, { opacity: 1, y: 0, duration: 0.8, ease: EASE }, 0.1)
          if (sub)   tl.to(sub,   { opacity: 1, y: 0, duration: 0.6, ease: EASE }, 0.25)
        },
      })
    }

    // Card-by-card staggered reveals
    const cards = gsap.utils.toArray('.process-card-mob', section)
    cards.forEach((card) => {
      gsap.set(card, { y: 50, opacity: 0 })
      const dot   = card.querySelector('.process-card-mob__dot')
      const num   = card.querySelector('.process-card-mob__num')
      const title = card.querySelector('.process-card-mob__title')
      const desc  = card.querySelector('.process-card-mob__desc')

      if (dot) gsap.set(dot, { scale: 0 })
      if (num) gsap.set(num, { opacity: 0, scale: 0.6 })
      if (title) gsap.set(title, { opacity: 0, x: -16 })
      if (desc) gsap.set(desc, { opacity: 0, y: 12 })

      ScrollTrigger.create({
        trigger: card, start: 'top 90%', once: true, invalidateOnRefresh: true,
        onEnter() {
          const tl = gsap.timeline()
          tl.to(card, { y: 0, opacity: 1, duration: 0.7, ease: EASE }, 0)
          if (dot) tl.to(dot, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, 0.1)
          if (num) tl.to(num, { opacity: 0.6, scale: 1, duration: 0.6, ease: EASE }, 0.15)
          if (title) tl.to(title, { opacity: 1, x: 0, duration: 0.6, ease: EASE }, 0.2)
          if (desc) tl.to(desc, { opacity: 1, y: 0, duration: 0.5, ease: EASE }, 0.3)
        },
      })
    })
  }, [isMobile], sectionRef)

  return (
    <section ref={sectionRef} className="process-section" aria-label="Our process">
      <div className="process-inner">
        <header className="process-header">
          <span className="section-label">How We Build</span>
          <h2 className="process-title">A process refined by precision.</h2>
          <p className="process-sub">Four phases, no shortcuts. Every BuildTomorrow project moves through this rhythm.</p>
        </header>

        {/* ── Desktop grid (hidden on mobile) ── */}
        {!isMobile && (
          <div className="process-grid">
            <svg className="process-svg" aria-hidden="true">
              {STEPS.slice(0,-1).map((_,i) => (
                <line key={i} className="process-line"
                  x1={`${(i+1)*(100/STEPS.length)-(50/STEPS.length)+4}%`} y1="50%"
                  x2={`${(i+1)*(100/STEPS.length)+(50/STEPS.length)-4}%`} y2="50%"
                  stroke="#c8f542" strokeWidth="1" strokeOpacity="0.3" />
              ))}
            </svg>
            {STEPS.map((s, i) => (
              <article key={s.id} className="process-card">
                <span className="process-card__num">{s.id}</span>
                <h3 className="process-card__title">{s.title}</h3>
                <p className="process-card__desc">{s.desc}</p>
                <span className="process-card__tick" aria-hidden="true" />
              </article>
            ))}
          </div>
        )}

        {/* ── Mobile timeline (hidden on desktop) ── */}
        {isMobile && (
          <div className="process-timeline">
            <div className="process-timeline__line" aria-hidden="true" />
            {STEPS.map((s, i) => (
              <article key={s.id} className="process-card-mob">
                <div className="process-card-mob__dot" aria-hidden="true" />
                <div className="process-card-mob__body">
                  <span className="process-card-mob__num">{s.id}</span>
                  <h3 className="process-card-mob__title">{s.title}</h3>
                  <p className="process-card-mob__desc">{s.desc}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .process-section {
          position: relative;
          width: 100vw;
          min-height: 100vh;
          background: var(--surface);
          border-top: 1px solid var(--dim);
          border-bottom: 1px solid var(--dim);
          overflow: hidden;
        }
        .process-inner {
          position: relative;
          width: 100%; max-width: 1600px; margin: 0 auto;
          padding: clamp(3.5rem, 8vh, 8rem) 1.25rem;
          display: flex; flex-direction: column;
          gap: clamp(2rem, 5vh, 6rem);
        }
        @media (min-width: 1024px) {
          .process-inner { padding: clamp(4rem, 10vh, 8rem) 5vw; height: 100vh; justify-content: center; }
        }

        .process-header { display: flex; flex-direction: column; gap: 0.75rem; max-width: 720px; }
        .process-title {
          font-family: var(--font-display); font-weight: 800; letter-spacing: -0.02em;
          font-size: clamp(1.8rem, 6vw, 3.6rem); line-height: 1.05; color: var(--white);
        }
        .process-sub { font-family: var(--font-body); font-weight: 300; font-size: 0.9rem; line-height: 1.6; color: var(--muted); max-width: 520px; }
        @media (min-width: 768px) { .process-sub { font-size: 1rem; } }

        /* ── Desktop grid ── */
        .process-grid {
          position: relative;
          display: grid;
          grid-template-columns: repeat(${STEPS.length}, 1fr);
          gap: 1.5rem;
        }
        .process-svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }

        .process-card {
          position: relative; z-index: 2;
          background: var(--surface2); border: 1px solid var(--dim);
          padding: 1.6rem 1.6rem 2rem;
          display: flex; flex-direction: column; gap: 0.9rem; min-height: 240px;
          transition: border-color .4s, opacity .4s, background .4s; will-change: transform, opacity;
        }
        .process-card.is-active { border-color: var(--accent); background: var(--surface3); }
        .process-card.is-active .process-card__num { color: var(--accent); text-shadow: 0 0 30px rgba(200,245,66,0.4); }
        .process-card.is-past { opacity: 0.4; }
        .process-card__num {
          font-family: var(--font-display); font-weight: 800;
          font-size: 2.4rem; line-height: 1; color: var(--muted); letter-spacing: -0.02em;
          transition: color .4s, text-shadow .4s;
        }
        .process-card__title { font-family: var(--font-display); font-weight: 800; font-size: 1.4rem; line-height: 1.1; color: var(--white); letter-spacing: -0.01em; }
        .process-card__desc  { font-family: var(--font-body); font-weight: 300; font-size: 0.92rem; line-height: 1.55; color: var(--muted); }
        .process-card__tick  { position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: var(--accent); transform: scaleX(0); transform-origin: left; transition: transform .6s; }
        .process-card.is-active .process-card__tick { transform: scaleX(1); }

        /* ── Mobile timeline ── */
        .process-timeline {
          position: relative;
          display: flex; flex-direction: column; gap: 0;
          padding-left: 2rem;
        }
        .process-timeline__line {
          position: absolute;
          left: 7px; top: 8px; bottom: 8px; width: 2px;
          background: var(--dim); border-radius: 2px;
        }
        .process-card-mob {
          position: relative;
          display: flex; align-items: flex-start; gap: 1.25rem;
          padding: 0 0 2.5rem 0.5rem;
          will-change: transform, opacity;
        }
        .process-card-mob__dot {
          position: absolute;
          left: -2rem; top: 6px;
          width: 16px; height: 16px; border-radius: 50%;
          background: var(--surface); border: 2px solid var(--accent);
          flex-shrink: 0; z-index: 1;
          box-shadow: 0 0 10px rgba(200,245,66,0.3);
        }
        .process-card-mob__body {
          display: flex; flex-direction: column; gap: 0.5rem; flex: 1;
          background: var(--surface2); border: 1px solid var(--dim);
          border-left: 2px solid var(--accent);
          padding: 1.25rem 1rem;
          border-radius: 0 2px 2px 0;
        }
        .process-card-mob__num {
          font-family: var(--font-display); font-weight: 800;
          font-size: 1.8rem; line-height: 1; color: var(--muted);
          -webkit-text-stroke: 1px rgba(200,245,66,0.2); opacity: 0.6;
        }
        .process-card-mob__title { font-family: var(--font-display); font-weight: 700; font-size: 1.05rem; color: var(--white); }
        .process-card-mob__desc  { font-family: var(--font-body); font-weight: 300; font-size: 0.875rem; line-height: 1.6; color: var(--muted); }
      `}</style>
    </section>
  )
}
