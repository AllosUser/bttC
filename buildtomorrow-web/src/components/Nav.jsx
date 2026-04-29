import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

function NavLink({ label, href }) {
  return (
    <a href={href} className="nav-link">
      <span className="nav-link-inner">
        <span className="nav-link-text">{label}</span>
        <span className="nav-link-text nav-link-text--ghost" aria-hidden="true">
          {label}
        </span>
      </span>
      <style>{`
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
          transition: transform 0.5s var(--ease-out-expo), color 0.4s var(--ease-out-expo);
        }
        .nav-link-text--ghost {
          position: absolute;
          inset: 0;
          transform: translateY(120%);
          color: var(--accent);
        }
        .nav-link:hover .nav-link-text:first-child {
          transform: translateY(-120%);
          color: var(--accent);
        }
        .nav-link:hover .nav-link-text--ghost {
          transform: translateY(0);
        }
      `}</style>
    </a>
  )
}

export default function Nav() {
  const navRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
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

        <ul className="bt-nav__links">
          {LINKS.map(l => (
            <li key={l.label}>
              <NavLink {...l} />
            </li>
          ))}
        </ul>

        <a href="#contact" className="bt-nav__cta">
          <span>Start a Project</span>
        </a>
      </div>

      <style>{`
        .bt-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          height: 80px;
          background: transparent;
          border-bottom: 1px solid transparent;
          transition: height 0.4s var(--ease-out-expo),
                      background 0.4s var(--ease-out-expo),
                      backdrop-filter 0.4s var(--ease-out-expo),
                      border-color 0.4s var(--ease-out-expo);
        }
        .bt-nav--scrolled {
          height: 56px;
          background: rgba(8, 8, 10, 0.92);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom-color: var(--dim);
        }
        .bt-nav__inner {
          max-width: 1600px;
          height: 100%;
          margin: 0 auto;
          padding: 0 5vw;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }
        .bt-logo {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.05rem;
          letter-spacing: -0.01em;
          line-height: 1;
        }
        .bt-logo__build { color: var(--white); }
        .bt-logo__tomorrow { color: var(--accent); }

        .bt-nav__links {
          display: flex;
          align-items: center;
          gap: 2.5rem;
          list-style: none;
        }
        @media (max-width: 860px) {
          .bt-nav__links { display: none; }
        }

        @media (max-width: 768px) {
          .bt-nav {
            height: 64px;
          }
          .bt-nav--scrolled {
            height: 52px;
          }
          .bt-nav__inner {
            padding: 0 16px;
            gap: 1rem;
          }
          .bt-logo {
            font-size: 0.9rem;
          }
          .bt-nav__cta {
            font-size: 0.6rem;
            letter-spacing: 0.12em;
            padding: 0.55rem 1rem;
          }
        }

        @media (max-width: 380px) {
          .bt-logo {
            font-size: 0.8rem;
          }
          .bt-nav__cta {
            font-size: 0.55rem;
            padding: 0.5rem 0.8rem;
            letter-spacing: 0.08em;
          }
        }

        .bt-nav__cta {
          position: relative;
          display: inline-flex;
          align-items: center;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 0.7rem 1.4rem;
          border: 1px solid rgba(200, 245, 66, 0.35);
          color: var(--accent);
          background: transparent;
          overflow: hidden;
          transition: color 0.35s var(--ease-in-out);
        }
        .bt-nav__cta > span {
          position: relative;
          z-index: 1;
        }
        .bt-nav__cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--accent);
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.35s var(--ease-in-out);
        }
        .bt-nav__cta:hover {
          color: var(--black);
        }
        .bt-nav__cta:hover::before {
          transform: scaleX(1);
        }
      `}</style>
    </motion.nav>
  )
}
