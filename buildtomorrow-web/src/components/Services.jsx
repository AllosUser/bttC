import { useRef, useState, useEffect } from 'react'
import { useGSAP } from '../hooks/useGSAP'

/* ---------- Icons ---------- */
const ICON_WEB = (
  <svg className="svc-icon" viewBox="0 0 44 44" fill="none" aria-hidden="true">
    <rect x="3" y="7" width="38" height="26" rx="2" stroke="#c8f542" strokeWidth="1.4" />
    <path d="M3 29h38v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3z" fill="#c8f542" fillOpacity=".15" />
    <path d="M14 21l-5 3 5 3M30 21l5 3-5 3M20 27l4-10" stroke="#c8f542" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)
const ICON_MOBILE = (
  <svg className="svc-icon" viewBox="0 0 44 44" fill="none" aria-hidden="true">
    <rect x="12" y="3" width="20" height="38" rx="3" stroke="#42f5b0" strokeWidth="1.4" />
    <circle cx="22" cy="37" r="2" fill="#42f5b0" fillOpacity=".4" />
    <path d="M18 12h8M16 17h12M18 22h8" stroke="#42f5b0" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)
const ICON_CYBER = (
  <svg className="svc-icon" viewBox="0 0 44 44" fill="none" aria-hidden="true">
    <path d="M22 4L7 9.5v11C7 29 13.5 37 22 40c8.5-3 15-11 15-19.5v-11L22 4z" stroke="#c8f542" strokeWidth="1.4" />
    <path d="M15 22l4 4 10-10" stroke="#c8f542" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const ICON_SYSTEMS = (
  <svg className="svc-icon" viewBox="0 0 44 44" fill="none" aria-hidden="true">
    <circle cx="22" cy="22" r="6" stroke="#42f5b0" strokeWidth="1.4" />
    <path d="M22 7v4M22 33v4M7 22h4M33 22h4M12.1 12.1l2.8 2.8M29.1 29.1l2.8 2.8M31.9 12.1l-2.8 2.8M14.9 29.1l-2.8 2.8" stroke="#42f5b0" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)
const ICON_AI = (
  <svg className="svc-icon" viewBox="0 0 44 44" fill="none" aria-hidden="true">
    <path d="M22 6L10 12v20l12 6 12-6V12L22 6z" stroke="#c8f542" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M22 14v16M14 22h16" stroke="#c8f542" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="22" cy="22" r="3" fill="#c8f542" fillOpacity=".2" stroke="#c8f542" strokeWidth="1.4" />
  </svg>
)

const SERVICES = [
  { id: '01', tag: 'Full Stack', titleLines: ['Web', 'Platforms'],
    desc: 'Performant, scalable web applications built with uncompromising engineering precision. We design and build high-performance web platforms with resilient architectures, seamless user experience, and cloud-native infrastructure ready for scale.',
    keywords: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Cloud'],
    color: '#09090c', accent: '#c8f542', icon: ICON_WEB },
  { id: '02', tag: 'Artificial Intelligence', titleLines: ['Applied', 'AI'],
    desc: 'Strategic AI systems that create real operational advantage. We integrate and deploy AI solutions, from LLMs to predictive systems, tailored to your data, workflows, and business logic.',
    keywords: ['LLMs', 'RAG', 'Automation', 'Machine Learning'],
    color: '#08080e', accent: '#42f5b0', icon: ICON_AI },
  { id: '03', tag: 'Protection & Compliance', titleLines: ['Security,', 'Governance', '& Risk'],
    desc: 'Security, compliance, and risk management for a complex digital world. We secure systems, ensure regulatory alignment, and perform AI risk assessments to protect your infrastructure and decision-making processes.',
    keywords: ['Security', 'AI Risk', 'GDPR', 'SOC2', 'Zero Trust'],
    color: '#0a0a09', accent: '#c8f542', icon: ICON_CYBER },
  { id: '04', tag: 'iOS & Android', titleLines: ['Mobile', 'Ecosystems'],
    desc: 'Mobile environments engineered for flawless execution and real-world performance. From native apps to cross-platform systems, we create mobile products that are fast, stable, and deeply integrated into modern digital ecosystems.',
    keywords: ['Swift', 'Kotlin', 'React Native', 'Mobile UX'],
    color: '#080b0a', accent: '#42f5b0', icon: ICON_MOBILE },
  { id: '05', tag: 'Enterprise Grade', titleLines: ['Systems', 'Architecture'],
    desc: 'Infrastructure and distributed systems designed for scale, resilience, and performance. We build the backbone of complex platforms using microservices, event-driven systems, and fault-tolerant infrastructure.',
    keywords: ['Kubernetes', 'Docker', 'APIs', 'Distributed Systems'],
    color: '#08090b', accent: '#c8f542', icon: ICON_SYSTEMS },
]

function ServicePanel({ service, mobile, total }) {
  return (
    <article
      className={`svc-panel ${mobile ? 'svc-panel--mobile' : ''}`}
      style={{ background: service.color }}
    >
      <span className="svc-num" aria-hidden="true">{service.id}</span>
      {mobile && (
        <div className="svc-counter" aria-label={`Service ${service.id} of ${String(total).padStart(2,'0')}`}>
          <span style={{ color: service.accent }}>{service.id}</span>
          <span style={{ color: 'var(--muted)' }}> / {String(total).padStart(2,'0')}</span>
        </div>
      )}
      <span className="svc-tag" style={{ color: service.accent, borderColor: `${service.accent}48` }}>{service.tag}</span>
      {service.icon}
      <h2 className="svc-h" style={{ color: service.accent }}>
        {service.titleLines.map((line, i) => (
          <span key={i} className="svc-title-mask">
            <span className="svc-title-word">{line}</span>
          </span>
        ))}
      </h2>
      <p className="svc-p">{service.desc}</p>
      {service.keywords && (
        <div className="svc-keywords">
          {service.keywords.map((kw, i) => (
            <span key={i} className="svc-kw" style={{ borderColor: `${service.accent}30`, color: `${service.accent}cc` }}>{kw}</span>
          ))}
        </div>
      )}
    </article>
  )
}

/* ---------- Mobile counter badge (01 / 04) ---------- */
function MobileCounter({ active, total }) {
  return (
    <div className="svc-mob-counter" aria-live="polite">
      <span style={{ color: 'var(--accent)' }}>{String(active).padStart(2,'0')}</span>
      <span style={{ color: 'var(--muted)' }}> / {String(total).padStart(2,'0')}</span>
    </div>
  )
}

export default function Services() {
  const sectionRef  = useRef(null)
  const trackRef    = useRef(null)
  const progressRef = useRef(null)
  const [activePanel, setActivePanel] = useState(1)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  /* ── Desktop: GSAP horizontal scroll ── */
  useGSAP(({ gsap, ScrollTrigger }) => {
    const track    = trackRef.current
    const section  = sectionRef.current
    const progress = progressRef.current
    if (!track || !section) return

    const desktop = window.innerWidth >= 1024
    if (!desktop) return

    const panels = gsap.utils.toArray('.svc-panel', track)
    const n = panels.length
    const EASE = 'expo.out', DUR = 0.75

    panels.forEach(panel => {
      gsap.set(panel.querySelector('.svc-tag'),          { opacity: 0, y: 20 })
      gsap.set(panel.querySelector('.svc-icon'),         { opacity: 0, scale: 0.6, y: 10 })
      gsap.set(panel.querySelectorAll('.svc-title-word'),{ yPercent: 100 })
      gsap.set(panel.querySelector('.svc-p'),            { opacity: 0, y: 24 })
    })

    const scrollTween = gsap.to(track, {
      x: () => -(window.innerWidth * (n - 1)),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerWidth * (n - 1)}`,
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          if (progress) progress.style.width = `${self.progress * 100}%`
        },
      },
    })

    const buildReveal = (panel, tl) => {
      tl.to(panel.querySelector('.svc-tag'),           { opacity:1, y:0, duration:DUR, ease:EASE }, 0)
        .to(panel.querySelector('.svc-icon'),          { opacity:1, scale:1, y:0, duration:DUR, ease:EASE }, 0.1)
        .to(panel.querySelectorAll('.svc-title-word'), { yPercent:0, duration:DUR, ease:EASE, stagger:0.08 }, 0.1)
        .to(panel.querySelector('.svc-p'),             { opacity:1, y:0, duration:DUR, ease:EASE }, 0.45)
    }

    buildReveal(panels[0], gsap.timeline({ delay: 0.5 }))

    panels.slice(1).forEach(panel => {
      buildReveal(panel, gsap.timeline({
        scrollTrigger: { trigger: panel, containerAnimation: scrollTween, start: 'left right', toggleActions: 'play none none none', invalidateOnRefresh: true },
      }))
    })
  }, [isMobile], sectionRef)

  /* ── Mobile: Pinned section, cards swap in-place on scroll ── */
  useGSAP(({ gsap, ScrollTrigger }) => {
    if (window.innerWidth >= 1024) return
    const section = sectionRef.current
    if (!section) return

    const cards = gsap.utils.toArray('.svc-panel--mobile', section)
    const n = cards.length
    if (!n) return
    const EASE = 'expo.out'

    // Stack all cards on top of each other via absolute positioning
    // First card visible, rest hidden
    cards.forEach((card, i) => {
      gsap.set(card, {
        position: 'absolute',
        top: 0, left: 0, width: '100%',
        opacity: i === 0 ? 1 : 0,
        y: i === 0 ? 0 : 40,
      })

      const counter = card.querySelector('.svc-counter')
      const tag = card.querySelector('.svc-tag')
      const icon = card.querySelector('.svc-icon')
      const titleWords = card.querySelectorAll('.svc-title-word')
      const desc = card.querySelector('.svc-p')
      const keywords = card.querySelector('.svc-keywords')

      if (counter) gsap.set(counter, { opacity: 0, y: 10 })
      if (tag) gsap.set(tag, { opacity: 0, y: 16 })
      if (icon) gsap.set(icon, { opacity: 0, scale: 0.5, y: 10 })
      if (titleWords.length) gsap.set(titleWords, { yPercent: 100 })
      if (desc) gsap.set(desc, { opacity: 0, y: 20 })
      if (keywords) gsap.set(keywords, { opacity: 0, y: 14 })
    })

    const revealCard = (card) => {
      const counter = card.querySelector('.svc-counter')
      const tag = card.querySelector('.svc-tag')
      const icon = card.querySelector('.svc-icon')
      const titleWords = card.querySelectorAll('.svc-title-word')
      const desc = card.querySelector('.svc-p')
      const keywords = card.querySelector('.svc-keywords')
      const tl = gsap.timeline()
      tl.to(card, { opacity: 1, y: 0, duration: 0.5, ease: EASE }, 0)
      if (counter) tl.to(counter, { opacity: 1, y: 0, duration: 0.4, ease: EASE }, 0)
      if (tag) tl.to(tag, { opacity: 1, y: 0, duration: 0.5, ease: EASE }, 0.05)
      if (icon) tl.to(icon, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: EASE }, 0.1)
      if (titleWords.length) tl.to(titleWords, { yPercent: 0, duration: 0.6, ease: EASE, stagger: 0.06 }, 0.1)
      if (desc) tl.to(desc, { opacity: 1, y: 0, duration: 0.5, ease: EASE }, 0.3)
      if (keywords) tl.to(keywords, { opacity: 1, y: 0, duration: 0.5, ease: EASE }, 0.4)
      return tl
    }

    const hideCard = (card) => {
      const tl = gsap.timeline()
      tl.to(card, { opacity: 0, y: -30, duration: 0.35, ease: 'power2.in' })
      return tl
    }

    let currentIdx = 0

    /*
     * Pin the section. Scroll distance = n panels × 150vh.
     * As user scrolls, cross-fade between cards.
     */
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: `+=${n * 500}vh`,
      pin: true,
      pinSpacing: true,
      scrub: 1.2,
      invalidateOnRefresh: true,
      onEnter() {
        // Reveal first card when section enters
        revealCard(cards[0])
        setActivePanel(1)
      },
      onUpdate(self) {
        const p = self.progress
        const targetIdx = Math.min(Math.floor(p * n * 1.02), n - 1)

        if (targetIdx !== currentIdx) {
          // Hide current card
          hideCard(cards[currentIdx])
          // Reset inner elements of new card
          const newCard = cards[targetIdx]
          gsap.set(newCard, { opacity: 0, y: 40 })
          const counter = newCard.querySelector('.svc-counter')
          const tag = newCard.querySelector('.svc-tag')
          const icon = newCard.querySelector('.svc-icon')
          const titleWords = newCard.querySelectorAll('.svc-title-word')
          const desc = newCard.querySelector('.svc-p')
          const keywords = newCard.querySelector('.svc-keywords')
          if (counter) gsap.set(counter, { opacity: 0, y: 10 })
          if (tag) gsap.set(tag, { opacity: 0, y: 16 })
          if (icon) gsap.set(icon, { opacity: 0, scale: 0.5, y: 10 })
          if (titleWords.length) gsap.set(titleWords, { yPercent: 100 })
          if (desc) gsap.set(desc, { opacity: 0, y: 20 })
          if (keywords) gsap.set(keywords, { opacity: 0, y: 14 })

          // Reveal new card
          revealCard(newCard)
          currentIdx = targetIdx
          setActivePanel(targetIdx + 1)
        }
      },
    })
  }, [isMobile], sectionRef)

  return (
    <section id="services" ref={sectionRef} className="svc-section" aria-label="Our services">

      {/* Desktop progress bar */}
      {!isMobile && <div ref={progressRef} className="svc-progress" />}

      <div className="svc-sticky">
        <div ref={trackRef} className="svc-track">
          {SERVICES.map(s => (
            <ServicePanel key={s.id} service={s} mobile={isMobile} total={SERVICES.length} />
          ))}
        </div>
      </div>

      <style>{`
        .svc-section { position: relative; width: 100vw; background: var(--black); }

        /* ── Desktop progress ── */
        .svc-progress {
          position: absolute; top: 0; left: 0;
          height: 2px; width: 0%; background: #c8f542; z-index: 100; pointer-events: none;
        }

        /* ── Mobile counter (inline in card) ── */
        .svc-counter {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.75rem;
          letter-spacing: 0.2em; text-transform: uppercase;
          margin-bottom: 1.25rem;
          align-self: flex-end;
        }
        @media (min-width: 1024px) { .svc-counter { display: none; } }

        /* ── Mobile: stacked container ── */
        .svc-sticky { position: relative; }
        .svc-track {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        @media (max-width: 1023px) {
          .svc-section {
            height: 100vh;
            overflow: hidden;
          }
          .svc-sticky {
            height: 100vh;
            position: relative;
          }
          .svc-track {
            position: relative;
            height: 100%;
          }
        }
        @media (min-width: 1024px) {
          .svc-sticky { height: 100vh; overflow: hidden; }
          .svc-track  { flex-direction: row; flex-wrap: nowrap; height: 100%; will-change: transform; }
        }

        /* ── Panel base ── */
        .svc-panel {
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        /* Mobile panel — stacked absolutely, centered */
        .svc-panel--mobile {
          padding: 2rem 1.25rem;
          width: 100%;
          height: 100vh;
          box-sizing: border-box;
          justify-content: center;
        }

        /* Desktop panel */
        @media (min-width: 1024px) {
          .svc-panel {
            flex: 0 0 100vw;
            width: 100vw;
            height: 100%;
            padding: 0 10vw;
          }
        }

        /* ── Ghost number ── */
        .svc-num {
          position: absolute;
          font-family: 'Syne', sans-serif; font-weight: 800;
          color: transparent; -webkit-text-stroke: 1px rgba(240,237,232,0.05);
          pointer-events: none; user-select: none; line-height: 1;
          font-size: clamp(5rem, 20vw, 8rem);
          right: 1rem; top: 1rem; opacity: 0.6;
        }
        @media (min-width: 1024px) {
          .svc-num {
            font-size: clamp(160px, 24vw, 320px);
            right: 4vw; top: 50%; transform: translateY(-50%); opacity: 1;
          }
        }

        /* ── Badge ── */
        .svc-tag {
          display: inline-block; align-self: flex-start;
          font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
          border: 1px solid; padding: 6px 14px; border-radius: 1px;
          margin-bottom: 20px; min-height: 32px;
        }
        @media (min-width: 1024px) { .svc-tag { margin-bottom: 28px; } }

        /* ── Icon ── */
        .svc-icon { width: 40px; height: 40px; margin-bottom: 24px; flex-shrink: 0; }
        @media (min-width: 1024px) { .svc-icon { width: 44px; height: 44px; margin-bottom: 32px; } }

        /* ── Title curtain ── */
        .svc-title-mask { display: block; overflow: hidden; padding-bottom: 0.04em; }
        .svc-title-word { display: block; }
        .svc-h {
          font-family: 'Syne', sans-serif; font-weight: 800;
          letter-spacing: -0.035em; line-height: 0.95; margin-bottom: 16px;
          font-size: clamp(2.2rem, 8vw, 3rem);
        }
        @media (min-width: 1024px) {
          .svc-h { font-size: clamp(44px, 7vw, 90px); margin-bottom: 28px; }
        }

        /* ── Description ── */
        .svc-p {
          font-size: 0.88rem; color: rgba(240,237,232,0.38);
          line-height: 1.65; font-weight: 300; max-width: 100%;
        }
        @media (min-width: 1024px) { .svc-p { font-size: 16px; max-width: 480px; } }

        /* ── Keywords ── */
        .svc-keywords {
          display: flex; flex-wrap: wrap; gap: 0.5rem;
          margin-top: 1.25rem;
        }
        .svc-kw {
          font-family: var(--font-display); font-weight: 600;
          font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase;
          padding: 5px 12px; border: 1px solid; border-radius: 2px;
          white-space: nowrap;
        }
      `}</style>
    </section>
  )
}
