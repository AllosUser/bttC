import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useGSAP } from '../hooks/useGSAP'

const NAV = ['Services', 'Work', 'About', 'Contact']

const SOCIALS = [
  {
    name: 'GitHub', href: 'https://github.com',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.73.5.5 5.74.5 12.04c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.34-1.27-1.7-1.27-1.7-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18a10.91 10.91 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56 4.56-1.52 7.85-5.83 7.85-10.91C23.5 5.74 18.27.5 12 .5z" /></svg>,
  },
  {
    name: 'LinkedIn', href: 'https://linkedin.com',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z" /></svg>,
  },
  {
    name: 'Twitter / X', href: 'https://twitter.com',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
  },
]

export default function Footer() {
  const footerRef   = useRef(null)
  const buildRef    = useRef(null)
  const tomorrowRef = useRef(null)
  const giantRef    = useRef(null)
  const bottomRef   = useRef(null)
  const [fontsReady, setFontsReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    document.fonts.ready.then(() => { if (!cancelled) setFontsReady(true) })
    return () => { cancelled = true }
  }, [])

  useGSAP(({ gsap, ScrollTrigger }) => {
    if (!fontsReady) return
    const build = buildRef.current, tomorrow = tomorrowRef.current, giant = giantRef.current, bottom = bottomRef.current
    if (!build || !tomorrow || !giant) return

    const isMobile = window.innerWidth < 768
    const offset   = isMobile ? -80 : -110
    const EASE     = 'expo.out'

    gsap.set(build,    { xPercent: offset,   opacity: 0 })
    gsap.set(tomorrow, { xPercent: -offset,  opacity: 0 })

    ScrollTrigger.create({
      trigger: giant, start: 'top 88%', once: true,
      onEnter() {
        const tl = gsap.timeline()
        tl.to([build, tomorrow], { xPercent: 0, opacity: 1, duration: 1.2, ease: 'power4.out' })
        tl.to(giant, { '--stroke-opacity': 0.4, duration: 1, ease: 'sine.inOut', repeat: -1, yoyo: true }, '+=0.1')
      },
    })

    if (bottom) {
      gsap.from(bottom, { opacity:0, y:16, duration:0.8, ease: EASE, scrollTrigger:{ trigger:giant, start:'top 80%', once:true } })
    }

    // Mobile: animate footer top elements on scroll entry
    if (isMobile) {
      const footer = footerRef.current
      if (!footer) return

      const brand   = footer.querySelector('.ft-brand')
      const contact = footer.querySelector('.ft-contact')
      const navLinks = footer.querySelectorAll('.ft-nav__link')

      if (brand) {
        gsap.fromTo(brand,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, ease: EASE,
            scrollTrigger: { trigger: brand, start: 'top 92%', once: true } }
        )
      }
      if (contact) {
        gsap.fromTo(contact,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7, ease: EASE,
            scrollTrigger: { trigger: contact, start: 'top 94%', once: true } }
        )
      }
      navLinks.forEach((link, i) => {
        gsap.fromTo(link,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5, ease: EASE, delay: i * 0.06,
            scrollTrigger: { trigger: link.parentElement, start: 'top 92%', once: true } }
        )
      })
    }
  }, [fontsReady], footerRef)

  return (
    <footer ref={footerRef} className="ft-footer" aria-label="Site footer">

      {/* ── Top row ── */}
      <div className="ft-top">
        <div className="ft-brand">
          <a href="#top" className="ft-logo">
            <span style={{ color:'var(--white)' }}>Build</span>
            <span style={{ color:'var(--accent)' }}>Tomorrow</span>
          </a>
          <p className="ft-tagline">Cyprus-based technology partner.<br />Engineered for excellence.</p>
        </div>

        <div className="ft-contact">
          <span className="ft-contact__label">Get in touch</span>
          <a href="mailto:hello@buildtomorrow.io" className="ft-email">hello@buildtomorrow.io</a>
          <ul className="ft-socials">
            {SOCIALS.map(s => (
              <li key={s.name}>
                <motion.a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name}
                  whileHover={{ scale:1.2 }} transition={{ duration:0.35, ease:[0.34,1.56,0.64,1] }}>
                  {s.icon}
                </motion.a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ft-hr" />

      {/* ── Nav row ── */}
      <nav className="ft-nav" aria-label="Footer navigation">
        {NAV.map(label => (
          <a key={label} href={`#${label.toLowerCase()}`} className="ft-nav__link">{label}</a>
        ))}
      </nav>

      <div className="ft-hr" />

      {/* ── Giant text ── */}
      <div ref={giantRef} className="ft-giant" aria-hidden="true">
        <span ref={buildRef}    className="ft-giant__word">BUILD</span>
        <span ref={tomorrowRef} className="ft-giant__word">TOMORROW</span>
      </div>

      {/* ── Copyright ── */}
      <div ref={bottomRef} className="ft-bottom">
        <span>© 2025 BuildTomorrow Ltd. Cyprus.</span>
        <span>Designed &amp; built with precision.</span>
      </div>

      <style>{`
        .ft-footer {
          position: relative; width: 100vw;
          background: var(--black); border-top: 1px solid var(--dim); overflow: hidden;
        }

        /* ── Top row ── */
        .ft-top {
          display: flex;
          flex-direction: column;   /* stacked on mobile */
          gap: 2rem;
          padding: 3rem 1.25rem 2.5rem;
          max-width: 1600px; margin: 0 auto; box-sizing: border-box;
        }
        @media (min-width: 768px) {
          .ft-top { flex-direction: unset; display: grid; grid-template-columns:1fr 1fr; gap:2rem; padding: 4rem 5vw 3rem; align-items:start; }
        }

        .ft-brand { display:flex; flex-direction:column; gap:0.75rem; }
        .ft-logo  { font-family:'Syne',sans-serif; font-weight:800; font-size:1.2rem; letter-spacing:-0.01em; line-height:1; }
        @media (min-width:768px) { .ft-logo { font-size:1.4rem; } }
        .ft-tagline { font-family:'DM Sans',sans-serif; font-weight:300; font-size:0.88rem; line-height:1.5; color:var(--muted); }
        @media (min-width:768px) { .ft-tagline { font-size:0.9rem; } }

        .ft-contact { display:flex; flex-direction:column; gap:0.6rem; align-items:flex-start; }
        @media (min-width:768px) { .ft-contact { align-items:flex-end; gap:0.75rem; } }
        .ft-contact__label { font-family:'Syne',sans-serif; font-weight:700; font-size:0.62rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--muted); }

        .ft-email {
          font-family:'Syne',sans-serif; font-weight:700;
          color: var(--white);
          font-size: 1.1rem;
          letter-spacing:-0.01em;
          border-bottom: 1px solid var(--dim);
          padding-bottom: 0.2rem;
          transition: color .3s, border-color .3s;
          min-height: 44px; display: inline-flex; align-items: center;
        }
        @media (min-width:768px) {
          .ft-email { font-size: clamp(1.2rem,2.2vw,1.9rem); }
        }
        .ft-email:hover { color:var(--accent); border-bottom-color:var(--accent); }

        .ft-socials { display:flex; gap:1rem; list-style:none; margin-top:0.25rem; flex-wrap:wrap; }
        @media (min-width:768px) { .ft-socials { gap:0.75rem; } }
        .ft-socials a {
          display:inline-flex; align-items:center; justify-content:center;
          width:44px; height:44px; border:1px solid var(--dim); border-radius:50%;
          color:var(--muted); transition:color .3s,border-color .3s;
        }
        .ft-socials a:hover { color:var(--accent); border-color:var(--accent); }

        .ft-hr { width:100%; height:1px; background:var(--dim); }

        /* ── Nav row ── */
        .ft-nav {
          display:flex; flex-wrap:wrap; gap:1rem 1.5rem;
          padding: 1.5rem 1.25rem;
          max-width:1600px; margin:0 auto; box-sizing:border-box;
        }
        @media (min-width:768px) { .ft-nav { gap:2.5rem; padding:2rem 5vw; } }
        .ft-nav__link {
          font-family:'Syne',sans-serif; font-weight:700;
          font-size:0.68rem; letter-spacing:0.22em; text-transform:uppercase;
          color:var(--muted); transition:color .3s;
          min-height:44px; display:inline-flex; align-items:center;
        }
        .ft-nav__link:hover { color:var(--white); }

        /* ── Giant text ── */
        .ft-giant {
          --stroke-opacity: 0.25;
          display: flex; flex-direction: column; align-items: center;
          width: 100%; overflow: hidden;
          line-height: 0.9; padding: 1.5rem 0 0.5rem;
        }
        .ft-giant__word {
          display: block;
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(1.7rem, 8.9vw, 8rem);
          letter-spacing: -0.02em;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(255,255,255,var(--stroke-opacity));
          will-change: transform, opacity; user-select: none;
          white-space: nowrap;
        }

        /* ── Copyright ── */
        .ft-bottom {
          display: flex;
          flex-direction: column;   /* stacked on mobile */
          gap: 0.4rem;
          text-align: center;
          padding: 1.25rem 1.25rem 2rem;
          font-family:'DM Sans',sans-serif; font-weight:300;
          font-size:0.72rem; color:var(--muted);
          border-top:1px solid var(--dim);
          max-width:1600px; margin:0 auto; box-sizing:border-box;
        }
        @media (min-width:768px) {
          .ft-bottom {
            flex-direction: row; justify-content:space-between; text-align:left;
            padding: 1.5rem 5vw;
          }
        }
      `}</style>
    </footer>
  )
}
