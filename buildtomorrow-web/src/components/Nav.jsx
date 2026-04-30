import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'

const LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Work',     href: '#work' },
  { label: 'About',   href: '#about' },
  { label: 'Contact', href: '#contact' },
]

/* ---------- Desktop hover-slide link ---------- */
function NavLink({ label, href }) {
  return (
    <a href={href} className="nav-link">
      <span className="nav-link-inner">
        <span className="nav-link-text">{label}</span>
        <span className="nav-link-text nav-link-text--ghost" aria-hidden="true">{label}</span>
      </span>
    </a>
  )
}

/* ---------- Mobile overlay menu ---------- */
function MobileMenu({ open, onClose }) {
  const overlayRef = useRef(null)
  const listRef    = useRef(null)

  useEffect(() => {
    if (!open) return
    const items = listRef.current?.querySelectorAll('.mob-link, .mob-cta')
    if (!items?.length) return
    gsap.fromTo(
      items,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: 'expo.out', stagger: 0.07, delay: 0.2 },
    )
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          className="mob-overlay"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          aria-modal="true"
          role="dialog"
          aria-label="Navigation menu"
        >
          {/* Close button */}
          <button
            className="mob-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <span aria-hidden="true">✕</span>
          </button>

          <nav ref={listRef} className="mob-nav">
            {LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                className="mob-link"
                onClick={onClose}
              >
                {l.label}
              </a>
            ))}
            <a href="#contact" className="mob-cta" onClick={onClose}>
              Start a Project
            </a>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ---------- Nav ---------- */
export default function Nav() {
  const navRef        = useRef(null)
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <motion.nav
        ref={navRef}
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={`bt-nav ${scrolled ? 'bt-nav--scrolled' : ''}`}
      >
        <div className="bt-nav__inner">
          <a href="#top" className="bt-logo">
            <span className="bt-logo__build">Build</span>
            <span className="bt-logo__tomorrow">Tomorrow</span>
          </a>

          {/* Desktop links */}
          <ul className="bt-nav__links">
            {LINKS.map(l => (
              <li key={l.label}><NavLink {...l} /></li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <a href="#contact" className="bt-nav__cta">
            <span>Start a Project</span>
          </a>

          {/* Mobile hamburger */}
          <button
            className="bt-hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
          >
            <span className="bt-hamburger__bar" />
            <span className="bt-hamburger__bar" />
            <span className="bt-hamburger__bar" />
          </button>
        </div>
      </motion.nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <style>{`
        /* ── Nav shell ── */
        .bt-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          height: 64px;
          background: transparent;
          border-bottom: 1px solid transparent;
          transition: height .4s var(--ease-out-expo),
                      background .4s, backdrop-filter .4s, border-color .4s;
        }
        @media (min-width: 1024px) {
          .bt-nav { height: 80px; }
        }
        .bt-nav--scrolled {
          background: rgba(8,8,10,0.92);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom-color: var(--dim);
        }
        @media (min-width: 1024px) {
          .bt-nav--scrolled { height: 56px; }
        }

        /* ── Inner ── */
        .bt-nav__inner {
          height: 100%;
          margin: 0 auto;
          padding: 0 1.25rem;
          max-width: 1600px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        @media (min-width: 1024px) {
          .bt-nav__inner { padding: 0 5vw; }
        }

        /* ── Logo ── */
        .bt-logo {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 0.9rem;
          letter-spacing: -0.01em;
          line-height: 1;
          flex-shrink: 0;
        }
        @media (min-width: 1024px) {
          .bt-logo { font-size: 1.05rem; }
        }
        .bt-logo__build    { color: var(--white); }
        .bt-logo__tomorrow { color: var(--accent); }

        /* ── Desktop links — hidden on mobile ── */
        .bt-nav__links {
          display: none;
          align-items: center;
          gap: 2.5rem;
          list-style: none;
        }
        @media (min-width: 1024px) {
          .bt-nav__links { display: flex; }
        }
        .nav-link {
          position: relative;
          display: inline-block;
          font-family: var(--font-body);
          font-weight: 400;
          font-size: 0.82rem;
          letter-spacing: 0.02em;
          color: var(--white);
          padding: 0.4rem 0;
        }
        .nav-link-inner {
          position: relative;
          display: inline-block;
          height: 1.2em;
          line-height: 1.2;
          overflow: hidden;
        }
        .nav-link-text {
          display: block;
          transition: transform 0.5s var(--ease-out-expo), color 0.4s;
        }
        .nav-link-text--ghost {
          position: absolute;
          inset: 0;
          transform: translateY(120%);
          color: var(--accent);
        }
        .nav-link:hover .nav-link-text:first-child  { transform: translateY(-120%); color: var(--accent); }
        .nav-link:hover .nav-link-text--ghost       { transform: translateY(0); }

        /* ── Desktop CTA — hidden on mobile ── */
        .bt-nav__cta {
          display: none;
        }
        @media (min-width: 1024px) {
          .bt-nav__cta {
            display: inline-flex;
            align-items: center;
            font-family: var(--font-display);
            font-weight: 700;
            font-size: 0.7rem;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            padding: 0.7rem 1.4rem;
            border: 1px solid rgba(200,245,66,0.35);
            color: var(--accent);
            background: transparent;
            overflow: hidden;
            position: relative;
            transition: color 0.35s var(--ease-in-out);
          }
          .bt-nav__cta > span { position: relative; z-index: 1; }
          .bt-nav__cta::before {
            content: '';
            position: absolute;
            inset: 0;
            background: var(--accent);
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.35s var(--ease-in-out);
          }
          .bt-nav__cta:hover { color: var(--black); }
          .bt-nav__cta:hover::before { transform: scaleX(1); }
        }

        /* ── Hamburger — visible only on mobile/tablet ── */
        .bt-hamburger {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          width: 44px;
          height: 44px;
          background: none;
          border: none;
          padding: 0 10px;
          flex-shrink: 0;
        }
        @media (min-width: 1024px) {
          .bt-hamburger { display: none; }
        }
        .bt-hamburger__bar {
          display: block;
          width: 24px;
          height: 2px;
          background: var(--white);
          transition: background 0.3s;
        }
        .bt-hamburger:hover .bt-hamburger__bar { background: var(--accent); }

        /* ── Mobile overlay ── */
        .mob-overlay {
          position: fixed;
          inset: 0;
          background: var(--surface);
          z-index: 200;
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1.25rem 3rem;
          overflow-y: auto;
        }
        .mob-close {
          align-self: flex-end;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: 1px solid var(--dim);
          border-radius: 50%;
          color: var(--white);
          font-size: 1rem;
          flex-shrink: 0;
          margin-bottom: 3rem;
        }
        .mob-nav {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
        }
        .mob-link {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: clamp(2.5rem, 8vw, 4rem);
          color: var(--white);
          letter-spacing: -0.02em;
          line-height: 1.1;
          padding: 0.5rem 0;
          display: block;
          border-bottom: 1px solid var(--dim);
          transition: color 0.25s;
        }
        .mob-link:hover { color: var(--accent); }
        .mob-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 2.5rem;
          padding: 1.1rem 2rem;
          background: var(--accent);
          color: var(--black);
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          min-height: 52px;
        }
      `}</style>
    </>
  )
}
