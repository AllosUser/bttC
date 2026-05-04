import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '../hooks/useGSAP'
import { useReducedMotion } from '../hooks/useMediaQuery'

/* ---------- Stat counter sub-component (desktop count-up) ---------- */
function Stat({ target, suffix = '', label }) {
  const numRef = useRef(null)
  const [val, setVal] = useState(0)
  useGSAP(({ gsap: g, ScrollTrigger }) => {
    const obj = { val: 0 }
    const tw = g.to(obj, {
      val: target, duration: 1.2, ease: 'power2.out',
      onUpdate: () => setVal(Math.round(obj.val)), paused: true,
    })
    const st = ScrollTrigger.create({
      trigger: numRef.current, start: 'top 85%', once: true,
      onEnter: () => tw.play(), invalidateOnRefresh: true,
    })
    return () => { tw.kill(); st.kill() }
  }, [target])
  return (
    <div className="stat" ref={numRef}>
      <span className="stat__num">{val}{suffix}</span>
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

/* ---------- About ---------- */
export default function About() {
  const sectionRef  = useRef(null)
  const bgTextRef   = useRef(null)
  const gridRef     = useRef(null)
  const drawLineRef = useRef(null)
  const reduced     = useReducedMotion()

  /*
   * ── MOBILE: hide elements BEFORE the browser paints ──────────────────────
   * useLayoutEffect fires synchronously after DOM mutations, before paint,
   * so the user never sees a flash of visible content before the IO fires.
   */
  useLayoutEffect(() => {
    if (window.innerWidth >= 768) return
    if (reduced) return
    const section = sectionRef.current
    if (!section) return

    const label    = section.querySelector('.section-label')
    const headline = section.querySelector('.about-headline')
    const words    = headline ? headline.querySelectorAll('.about-headline__word') : []
    const paras    = section.querySelectorAll('.about-right p')
    const statsRow = section.querySelector('.stats-row')
    const stats    = statsRow ? statsRow.querySelectorAll('.stat') : []

    if (label)         gsap.set(label,            { opacity: 0, y: 16 })
    if (words.length)  gsap.set(Array.from(words), { yPercent: 100, opacity: 0 })
    if (paras.length)  gsap.set(Array.from(paras), { opacity: 0, y: 30 })
    if (statsRow)      gsap.set(statsRow,           { opacity: 0, y: 24 })
    if (stats.length)  gsap.set(Array.from(stats),  { opacity: 0, y: 20 })
    if (drawLineRef.current) gsap.set(drawLineRef.current, { scaleX: 0 })
  }, [reduced])

  /*
   * ── MOBILE: IntersectionObserver reveal ───────────────────────────────────
   * Observes .about-grid (the actual content box, not the padded outer
   * section wrapper). Fires only when 50 % of the content is on-screen —
   * completely immune to GSAP / Lenis scroll-position miscalculation.
   */
  useEffect(() => {
    if (window.innerWidth >= 768) return
    if (reduced) return
    const section = sectionRef.current
    if (!section) return

    const contentBox = section.querySelector('.about-grid')
    if (!contentBox) return

    const EASE = 'expo.out'
    let fired = false

    const runReveal = () => {
      if (fired) return
      fired = true

      const label    = section.querySelector('.section-label')
      const headline = section.querySelector('.about-headline')
      const words    = headline ? Array.from(headline.querySelectorAll('.about-headline__word')) : []
      const paras    = Array.from(section.querySelectorAll('.about-right p'))
      const statsRow = section.querySelector('.stats-row')
      const stats    = statsRow ? Array.from(statsRow.querySelectorAll('.stat')) : []
      const drawLine = drawLineRef.current

      if (label)      gsap.to(label,    { opacity: 1, y: 0, duration: 0.6, ease: EASE })
      if (words.length) gsap.to(words,  { yPercent: 0, opacity: 1, duration: 0.9, ease: EASE, stagger: 0.08, delay: 0.1 })
      if (drawLine)   gsap.to(drawLine, { scaleX: 1, duration: 1.2, ease: EASE, delay: 0.3 })
      paras.forEach((p, i) => gsap.to(p, { opacity: 1, y: 0, duration: 0.8, ease: EASE, delay: 0.5 + i * 0.1 }))
      if (statsRow)   gsap.to(statsRow, { opacity: 1, y: 0, duration: 0.8, ease: EASE, delay: 0.7 })
      stats.forEach((s, i) => gsap.to(s, { opacity: 1, y: 0, duration: 0.6, ease: EASE, delay: 0.85 + i * 0.1 }))
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          runReveal()
          io.disconnect()
        }
      },
      // threshold 0.5 = half the content grid must be visible before firing
      { threshold: 0.5, rootMargin: '0px' },
    )

    io.observe(contentBox)
    return () => io.disconnect()
  }, [reduced])

  /*
   * ── DESKTOP: GSAP ScrollTrigger (unchanged behavior) ────────────────────
   * Returns early on mobile so this block never interferes with the IO path.
   */
  useGSAP(({ gsap: g, ScrollTrigger }) => {
    const section = sectionRef.current
    if (!section) return
    if (window.innerWidth < 768) return   // mobile handled by IO above

    const EASE = 'expo.out'

    // Parallax bg layers
    if (bgTextRef.current) {
      g.to(bgTextRef.current, {
        yPercent: -30, ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
      })
    }
    if (gridRef.current) {
      g.to(gridRef.current, {
        yPercent: -15, ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
      })
    }

    // Draw line
    if (drawLineRef.current) {
      g.fromTo(drawLineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: EASE, scrollTrigger: { trigger: drawLineRef.current, start: 'top 85%', once: true } },
      )
    }

    // Headline words curtain
    const headline = section.querySelector('.about-headline')
    if (headline) {
      g.from(headline.querySelectorAll('.about-headline__word'), {
        yPercent: 100, opacity: 0, duration: 0.9, ease: EASE, stagger: 0.08,
        scrollTrigger: { trigger: headline, start: 'top 80%', once: true },
      })
    }

    // Section label
    const label = section.querySelector('.section-label')
    if (label) {
      g.fromTo(label,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: EASE, scrollTrigger: { trigger: label, start: 'top 90%', once: true } },
      )
    }

    // Paragraphs
    section.querySelectorAll('.about-right p').forEach((p, i) => {
      g.fromTo(p,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: EASE, delay: i * 0.1, scrollTrigger: { trigger: p, start: 'top 92%', once: true } },
      )
    })

    // Stats row
    const statsRow = section.querySelector('.stats-row')
    if (statsRow) {
      const stats = statsRow.querySelectorAll('.stat')
      g.fromTo(statsRow, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: EASE, scrollTrigger: { trigger: statsRow, start: 'top 94%', once: true } })
      stats.forEach((s, i) => {
        g.fromTo(s, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: EASE, delay: 0.15 + i * 0.1, scrollTrigger: { trigger: statsRow, start: 'top 94%', once: true } })
      })
    }
  }, [], sectionRef)

  const headlineWords = ['Turning', 'vision', 'into', 'software', 'that', 'matters']

  return (
    <section id="about" ref={sectionRef} className="about" aria-label="About BuildTomorrow">
      <div className="about__bg" ref={bgTextRef} aria-hidden="true">BUILDTOMORROW</div>
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
              {headlineWords.map((w, i) => (
                <span key={i} className="about-headline__word-wrap">
                  <span className={`about-headline__word${w === 'vision' ? ' is-accent' : ''}`}>
                    {w === 'vision' ? <em>{w}</em> : w}
                  </span>
                </span>
              ))}
            </h2>
            <div ref={drawLineRef} className="draw-line" />
          </div>

          <div className="about-right">
            <p>We are a Cyprus-based studio building products at the intersection of engineering rigor and design ambition. Our work spans web, mobile, artificial intelligence, and complex systems for companies that refuse the average.</p>
            <p>Every line of code is written with intent. With deep regulatory awareness, we don't just ship products — we build the secure infrastructure of tomorrow, one precise decision at a time.</p>

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
          padding: clamp(5rem, 12vh, 14rem) 0;
          background: var(--black);
          overflow: hidden;
        }

        .about__bg { display: none; }
        @media (min-width: 768px) {
          .about__bg {
            display: block;
            position: absolute; left: 0; right: 0; top: 30%;
            font-family: var(--font-display); font-weight: 800;
            font-size: clamp(5rem, 12vw, 12rem); letter-spacing: -0.04em; line-height: 1;
            text-align: center; -webkit-text-stroke: 1px rgba(255,255,255,0.04);
            color: transparent; white-space: nowrap;
            pointer-events: none; user-select: none; z-index: 1; will-change: transform;
          }
        }
        .about__grid { display: none; }
        @media (min-width: 768px) {
          .about__grid {
            display: block;
            position: absolute; inset: -10% 0; width: 100%; height: 120%;
            z-index: 1; opacity: 0.5; pointer-events: none;
          }
        }

        .about__inner {
          position: relative; z-index: 3;
          max-width: 1400px; margin: 0 auto; padding: 0 1.25rem;
        }
        @media (min-width: 768px) { .about__inner { padding: 0 5vw; } }

        .about-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          align-items: start;
        }
        @media (min-width: 900px) {
          .about-grid { grid-template-columns: 1fr 1fr; gap: clamp(2rem, 6vw, 6rem); }
        }

        .about-left {
          display: flex; flex-direction: column; gap: 1.5rem; position: static;
        }
        @media (min-width: 900px) {
          .about-left { gap: 2rem; position: sticky; top: 120px; }
        }

        .about-headline {
          font-family: var(--font-display); font-weight: 800;
          font-size: clamp(2rem, 8vw, 3rem);
          line-height: 1.05; letter-spacing: -0.02em; color: var(--white);
          display: flex; flex-wrap: wrap; gap: 0.18em 0.3em;
        }
        @media (min-width: 768px) {
          .about-headline { font-size: clamp(2.5rem, 5vw, 4.5rem); }
        }
        .about-headline__word-wrap { display: inline-block; overflow: hidden; padding-bottom: 0.05em; }
        .about-headline__word { display: inline-block; will-change: transform; }
        .about-headline__word em { font-style: normal; color: var(--accent); }

        .draw-line { width: 100%; height: 1px; background: var(--dim); transform-origin: left; transform: scaleX(0); }

        .about-right {
          display: flex; flex-direction: column; gap: 1.25rem;
          font-family: var(--font-body); font-weight: 300;
          font-size: 0.95rem; line-height: 1.7; color: var(--muted);
        }
        @media (min-width: 768px) { .about-right { font-size: 1.05rem; gap: 1.5rem; } }
        .about-right p { max-width: 560px; }

        .stats-row {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--dim);
        }
        @media (min-width: 768px) { .stats-row { gap: 1.5rem; margin-top: 2rem; padding-top: 2rem; } }

        .stat { display: flex; flex-direction: column; gap: 0.35rem; }
        .stat__num {
          font-family: var(--font-display); font-weight: 800;
          font-size: clamp(2rem, 8vw, 2.5rem);
          line-height: 1; color: var(--white); letter-spacing: -0.02em;
        }
        @media (min-width: 768px) { .stat__num { font-size: clamp(2rem, 3.5vw, 2.6rem); } }
        .stat__label {
          font-family: var(--font-body); font-weight: 400;
          font-size: 0.65rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted);
        }
        @media (min-width: 768px) { .stat__label { font-size: 0.72rem; } }
      `}</style>
    </section>
  )
}
