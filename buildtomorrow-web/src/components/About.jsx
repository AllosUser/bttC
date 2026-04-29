import { useRef, useState } from 'react'
import { useGSAP } from '../hooks/useGSAP'
import { useReducedMotion } from '../hooks/useMediaQuery'

function Stat({ target, suffix = '', label, refSetter }) {
  const numRef = useRef(null)
  const [val, setVal] = useState(0)

  useGSAP(({ gsap, ScrollTrigger }) => {
    const obj = { val: 0 }
    const tween = gsap.to(obj, {
      val: target,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => setVal(Math.round(obj.val)),
      paused: true,
    })

    const trigger = ScrollTrigger.create({
      trigger: numRef.current,
      start: 'top 85%',
      once: true,
      onEnter: () => tween.play(),
      invalidateOnRefresh: true,
    })

    return () => {
      tween.kill()
      trigger.kill()
    }
  }, [target])

  return (
    <div className="stat" ref={el => { numRef.current = el; refSetter?.(el) }}>
      <span className="stat__num">
        {val}
        {suffix}
      </span>
      <span className="stat__label">{label}</span>
    </div>
  )
}

function StaticStat({ value, label }) {
  return (
    <div className="stat">
      <span className="stat__num">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  )
}

export default function About() {
  const sectionRef = useRef(null)
  const bgTextRef = useRef(null)
  const gridRef = useRef(null)
  const drawLineRef = useRef(null)
  const reduced = useReducedMotion()

  useGSAP(({ gsap, ScrollTrigger }) => {
    const section = sectionRef.current
    if (!section) return

    // Layer 1: background slow scroll
    if (bgTextRef.current) {
      gsap.to(bgTextRef.current, {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
    }

    // Layer 2: mid grid
    if (gridRef.current) {
      gsap.to(gridRef.current, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
    }

    // Draw line
    if (drawLineRef.current) {
      gsap.fromTo(
        drawLineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: drawLineRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      )
    }

    // Headline word reveal
    const headline = section.querySelector('.about-headline')
    if (headline) {
      gsap.from(headline.querySelectorAll('.about-headline__word'), {
        yPercent: 100,
        opacity: 0,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: headline,
          start: 'top 80%',
          once: true,
        },
      })
    }
  }, [], sectionRef)

  const headlineWords = ['Turning', 'vision', 'into', 'software', 'that', 'matters']

  return (
    <section id="about" ref={sectionRef} className="about" aria-label="About BuildTomorrow">
      <div className="about__bg" ref={bgTextRef} aria-hidden="true">
        BUILDTOMORROW
      </div>

      <svg className="about__grid" ref={gridRef} aria-hidden="true" preserveAspectRatio="none">
        <defs>
          <pattern id="bt-diag" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="80" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bt-diag)" />
      </svg>

      <div className="about__inner">
        <div className="about-grid">
          <div className="about-left">
            <span className="section-label">Our Mission</span>
            <h2 className="about-headline">
              {headlineWords.map((w, i) => {
                const isAccent = w === 'vision'
                return (
                  <span key={i} className="about-headline__word-wrap">
                    <span className={`about-headline__word ${isAccent ? 'is-accent' : ''}`}>
                      {isAccent ? <em>{w}</em> : w}
                    </span>
                  </span>
                )
              })}
            </h2>
            <div ref={drawLineRef} className="draw-line" />
          </div>

          <div className="about-right">
            <p>
              We are a Cyprus-based studio building products at the intersection of
              engineering rigor and design ambition. Our work spans web, mobile,
              cybersecurity, and complex systems for companies that refuse the average.
            </p>
            <p>
              Every line of code is written with intent. Every interface earns its place.
              We don't ship templates — we build the infrastructure of tomorrow, one
              precise decision at a time.
            </p>

            <div className="stats-row">
              {reduced ? (
                <>
                  <StaticStat value="50+" label="Projects shipped" />
                  <StaticStat value="100%" label="Client satisfaction" />
                  <StaticStat value="EU" label="Based & operating" />
                </>
              ) : (
                <>
                  <Stat target={50} suffix="+" label="Projects shipped" />
                  <Stat target={100} suffix="%" label="Client satisfaction" />
                  <StaticStat value="EU" label="Based & operating" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .about {
          position: relative;
          width: 100vw;
          padding: clamp(8rem, 18vh, 14rem) 0;
          background: var(--black);
          overflow: hidden;
        }
        .about__bg {
          position: absolute;
          left: 0;
          right: 0;
          top: 30%;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: clamp(5rem, 12vw, 12rem);
          letter-spacing: -0.04em;
          line-height: 1;
          text-align: center;
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.04);
          color: transparent;
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
          z-index: 1;
          will-change: transform;
        }
        .about__grid {
          position: absolute;
          inset: -10% 0;
          width: 100%;
          height: 120%;
          z-index: 1;
          opacity: 0.5;
          pointer-events: none;
        }
        .about__inner {
          position: relative;
          z-index: 3;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 5vw;
        }
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(2rem, 6vw, 6rem);
          align-items: start;
        }
        @media (max-width: 900px) {
          .about-grid { grid-template-columns: 1fr; }
        }
        .about-left {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          position: sticky;
          top: 120px;
        }
        @media (max-width: 900px) {
          .about-left { position: static; }
        }
        .about-headline {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: var(--white);
          display: flex;
          flex-wrap: wrap;
          gap: 0.18em 0.3em;
        }
        .about-headline__word-wrap {
          display: inline-block;
          overflow: hidden;
          padding-bottom: 0.05em;
        }
        .about-headline__word {
          display: inline-block;
          will-change: transform;
        }
        .about-headline__word em {
          font-style: normal;
          color: var(--accent);
        }
        .draw-line {
          width: 100%;
          height: 1px;
          background: var(--dim);
          transform-origin: left center;
          transform: scaleX(0);
        }
        .about-right {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 1.05rem;
          line-height: 1.7;
          color: var(--muted);
        }
        .about-right p {
          max-width: 560px;
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--dim);
        }
        @media (max-width: 600px) {
          .stats-row { grid-template-columns: 1fr; }
        }
        .stat {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .stat__num {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: clamp(2rem, 3.5vw, 2.6rem);
          line-height: 1;
          color: var(--white);
          letter-spacing: -0.02em;
        }
        .stat__label {
          font-family: var(--font-body);
          font-weight: 400;
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
        }
      `}</style>
    </section>
  )
}
