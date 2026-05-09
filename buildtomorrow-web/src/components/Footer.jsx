import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useGSAP } from '../hooks/useGSAP'
import logo from '../assets/bt_logo_text.png'

const NAV = ['Services', 'Process', 'Work', 'About', 'Contact']

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
            <img src={logo} alt="BuildTomorrow Logo" className="ft-logo-img" />
          </a>
          <p className="ft-tagline">Building digital excellence through innovation and engineering.</p>
        </div>

        <div className="ft-contact">
          <span className="ft-contact__label">Get in touch</span>
          <a href="mailto:hello@buildtomorrow.today" className="ft-email">hello@buildtomorrow.today</a>

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
        <span>© {new Date().getFullYear()} BuildTomorrow Ltd.</span>
        <span>Designed &amp; built for excellence.</span>
      </div>

      <style>{`
        .ft-footer {
          position: relative; width: 100vw;
          background: var(--black); border-top: 1px solid rgba(0, 217, 255, 0.16); overflow: hidden;
        }

        /* ── Top row ── */
        .ft-top {
          display: flex;
          flex-direction: column;   /* stacked on mobile */
          gap: 2rem;
          padding: 2.75rem 1.25rem 2.25rem;
          max-width: 1600px; margin: 0 auto; box-sizing: border-box;
        }
        @media (min-width: 768px) {
          .ft-top { flex-direction: unset; display: grid; grid-template-columns:1fr 1fr; gap:2rem; padding: 3.75rem 5vw 2.75rem; align-items:start; }
        }

        .ft-brand { display:flex; flex-direction:column; gap:1.25rem; }
        .ft-logo-img { height: 38px; width: auto; display: block; object-fit: contain; }
        .ft-tagline { font-family:'DM Sans',sans-serif; font-weight:300; font-size:0.88rem; line-height:1.5; color:var(--bt-muted); max-width: 300px; }

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
        .ft-email:hover { color:var(--bt-cyan); border-bottom-color:var(--bt-green); }



        .ft-hr { width:100%; height:1px; background:rgba(0, 217, 255, 0.16); }

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
