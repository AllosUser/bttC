import { useRef } from 'react'
import { useGSAP } from '../hooks/useGSAP'

const STEPS = [
  {
    id: '01',
    title: 'Discovery',
    desc: 'Deep-dive into your goals, users, and technical constraints.',
  },
  {
    id: '02',
    title: 'Architecture',
    desc: 'Technical planning, stack selection, and development roadmap.',
  },
  {
    id: '03',
    title: 'Build',
    desc: 'Agile development with weekly check-ins and live previews.',
  },
  {
    id: '04',
    title: 'Launch & Scale',
    desc: 'QA, deployment, and ongoing performance optimization.',
  },
]

export default function Process() {
  const sectionRef = useRef(null)
  const cardsRef = useRef([])

  useGSAP(({ gsap, ScrollTrigger }) => {
    const section = sectionRef.current
    if (!section) return
    const cards = gsap.utils.toArray('.process-card', section)
    if (!cards.length) return

    const isMobile = window.innerWidth <= 768
    const n = cards.length

    if (isMobile) {
      // ── MOBILE: No pinning, simple scroll-in reveals ──
      cards.forEach((card) => {
        gsap.set(card, { opacity: 0, y: 50, rotate: 2 })

        ScrollTrigger.create({
          trigger: card,
          start: 'top 85%',
          end: 'top 50%',
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate(self) {
            const p = self.progress
            gsap.set(card, {
              opacity: p,
              y: 50 * (1 - p),
              rotate: 2 * (1 - p),
            })
          },
          onEnter() {
            card.classList.add('is-active')
          },
          onLeave() {
            card.classList.remove('is-active')
            card.classList.add('is-past')
          },
          onEnterBack() {
            card.classList.add('is-active')
            card.classList.remove('is-past')
          },
          onLeaveBack() {
            card.classList.remove('is-active')
            card.classList.remove('is-past')
          },
        })
      })
    } else {
      // ── DESKTOP: Pinned section, scrub-based sequential reveal ──
      // Total scroll distance for the pinned section
      const scrollDist = window.innerHeight * (n - 1) * 0.7

      // Initial hidden state
      gsap.set(cards, { opacity: 0, y: 80, rotate: 4 })
      // Show first card immediately when pin starts
      gsap.set(cards[0], { opacity: 1, y: 0, rotate: 0 })
      cards[0].classList.add('is-active')

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `+=${scrollDist}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const p = self.progress
          // Which card should be active based on scroll progress
          // progress 0 = card 0 active, progress 1 = last card active
          const activeIdx = Math.min(Math.floor(p * n * 1.02), n - 1)

          cards.forEach((card, i) => {
            if (i <= activeIdx) {
              // Reveal this card if not yet visible
              gsap.to(card, {
                opacity: 1,
                y: 0,
                rotate: 0,
                duration: 0.4,
                ease: 'power2.out',
                overwrite: 'auto',
              })

              card.classList.toggle('is-active', i === activeIdx)
              card.classList.toggle('is-past', i < activeIdx)
            } else {
              // Hide cards that haven't been reached yet
              card.classList.remove('is-active')
              card.classList.remove('is-past')
            }
          })
        },
      })

      // Connecting line animations
      const lines = section.querySelectorAll('.process-line')
      lines.forEach((line, i) => {
        const length = line.getTotalLength?.() ?? 200
        gsap.set(line, {
          strokeDasharray: length,
          strokeDashoffset: length,
        })
        gsap.to(line, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: `top+=${((i + 0.5) / n) * scrollDist} top`,
            end: `top+=${((i + 1.2) / n) * scrollDist} top`,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
      })
    }
  }, [], sectionRef)

  return (
    <section ref={sectionRef} className="process-section" aria-label="Our process">
      <div className="process-section__inner">
        <header className="process-header">
          <span className="section-label">How We Build</span>
          <h2 className="process-title">A process refined by precision.</h2>
          <p className="process-sub">
            Four phases, no shortcuts. Every BuildTomorrow project moves through this rhythm.
          </p>
        </header>

        <div className="process-grid">
          <svg className="process-svg" aria-hidden="true">
            {STEPS.slice(0, -1).map((_, i) => (
              <line
                key={i}
                className="process-line"
                x1={`${(i + 1) * (100 / STEPS.length) - (50 / STEPS.length) + 4}%`}
                y1="50%"
                x2={`${(i + 1) * (100 / STEPS.length) + (50 / STEPS.length) - 4}%`}
                y2="50%"
                stroke="#c8f542"
                strokeWidth="1"
                strokeOpacity="0.3"
              />
            ))}
          </svg>

          {STEPS.map((s, i) => (
            <article
              key={s.id}
              className="process-card"
              ref={el => (cardsRef.current[i] = el)}
            >
              <span className="process-card__num">{s.id}</span>
              <h3 className="process-card__title">{s.title}</h3>
              <p className="process-card__desc">{s.desc}</p>
              <span className="process-card__tick" aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .process-section {
          position: relative;
          width: 100vw;
          min-height: 100vh;
          background: var(--surface);
          overflow: hidden;
          border-top: 1px solid var(--dim);
          border-bottom: 1px solid var(--dim);
        }
        .process-section__inner {
          position: relative;
          width: 100%;
          height: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: clamp(4rem, 10vh, 8rem) 5vw;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: clamp(3rem, 8vh, 6rem);
        }
        .process-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 720px;
        }
        .process-title {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: clamp(2.2rem, 4.5vw, 3.6rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: var(--white);
        }
        .process-sub {
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 1rem;
          line-height: 1.6;
          color: var(--muted);
          max-width: 520px;
        }
        .process-grid {
          position: relative;
          display: grid;
          grid-template-columns: repeat(${STEPS.length}, 1fr);
          gap: 1.5rem;
        }
        .process-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }
        .process-card {
          position: relative;
          z-index: 2;
          background: var(--surface2);
          border: 1px solid var(--dim);
          padding: 1.6rem 1.6rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          min-height: 240px;
          transition: border-color 0.4s var(--ease-out-expo), opacity 0.4s var(--ease-out-expo), background 0.4s var(--ease-out-expo);
          will-change: transform, opacity;
        }
        .process-card.is-active {
          border-color: var(--accent);
          background: var(--surface3);
        }
        .process-card.is-active .process-card__num {
          color: var(--accent);
          text-shadow: 0 0 30px rgba(200, 245, 66, 0.4);
        }
        .process-card.is-past {
          opacity: 0.4;
        }
        .process-card__num {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 2.4rem;
          line-height: 1;
          color: var(--muted);
          letter-spacing: -0.02em;
          transition: color 0.4s var(--ease-out-expo), text-shadow 0.4s var(--ease-out-expo);
        }
        .process-card__title {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.4rem;
          line-height: 1.1;
          color: var(--white);
          letter-spacing: -0.01em;
        }
        .process-card__desc {
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 0.92rem;
          line-height: 1.55;
          color: var(--muted);
        }
        .process-card__tick {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--accent);
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.6s var(--ease-out-expo);
        }
        .process-card.is-active .process-card__tick {
          transform: scaleX(1);
        }

        /* ── Mobile Responsive ── */
        @media (max-width: 900px) {
          .process-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .process-svg {
            display: none;
          }
        }
        @media (max-width: 768px) {
          .process-section {
            min-height: auto;
            height: auto;
          }
          .process-section__inner {
            padding: 3rem 5vw;
            gap: 2rem;
          }
          .process-title {
            font-size: clamp(1.6rem, 7vw, 2.4rem);
          }
          .process-sub {
            font-size: 0.9rem;
          }
          .process-card {
            min-height: 180px;
            padding: 1.2rem 1.2rem 1.6rem;
          }
          .process-card__num {
            font-size: 1.8rem;
          }
          .process-card__title {
            font-size: 1.15rem;
          }
          .process-card__desc {
            font-size: 0.85rem;
          }
        }
        @media (max-width: 560px) {
          .process-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .process-card {
            min-height: auto;
            padding: 1.2rem;
          }
        }
      `}</style>
    </section>
  )
}
