import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useGSAP } from '../hooks/useGSAP'

const GIANT = 'BUILDTOMORROW'
const NAV = ['Services', 'Work', 'About', 'Contact']

const SOCIALS = [
  {
    name: 'GitHub',
    href: 'https://github.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .5C5.73.5.5 5.74.5 12.04c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.34-1.27-1.7-1.27-1.7-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18a10.91 10.91 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56 4.56-1.52 7.85-5.83 7.85-10.91C23.5 5.74 18.27.5 12 .5z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z" />
      </svg>
    ),
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
]

export default function Footer() {
  const footerRef = useRef(null)
  const giantRef = useRef(null)
  const bottomRef = useRef(null)

  useGSAP(({ gsap, ScrollTrigger }) => {
    const giant = giantRef.current
    if (!giant) return

    const letters = giant.querySelectorAll('.footer-giant__letter')
    if (!letters.length) return

    letters.forEach((l, i) => {
      gsap.set(l, { xPercent: i % 2 === 0 ? -60 : 60, opacity: 0 })
    })

    gsap.to(letters, {
      xPercent: 0,
      opacity: 1,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.04,
      scrollTrigger: {
        trigger: giant,
        start: 'top 90%',
        once: true,
      },
    })

    if (bottomRef.current) {
      gsap.from(bottomRef.current, {
        opacity: 0,
        y: 20,
        duration: 1,
        ease: 'expo.out',
        delay: 0.3,
        scrollTrigger: {
          trigger: giant,
          start: 'top 80%',
          once: true,
        },
      })
    }
  }, [], footerRef)

  return (
    <footer ref={footerRef} className="bt-footer" aria-label="Site footer">
      <div className="bt-footer__inner">
        <div className="bt-footer__top">
          <div className="bt-footer__brand">
            <a href="#top" className="bt-footer__logo">
              <span className="bt-logo__build">Build</span>
              <span className="bt-logo__tomorrow">Tomorrow</span>
            </a>
            <p className="bt-footer__tagline">
              Cyprus-based technology partner. Engineered for excellence.
            </p>
          </div>

          <div className="bt-footer__contact">
            <span className="bt-footer__label">Get in touch</span>
            <a href="mailto:hello@buildtomorrow.io" className="bt-footer__email">
              hello@buildtomorrow.io
            </a>
            <ul className="bt-footer__socials">
              {SOCIALS.map(s => (
                <li key={s.name}>
                  <motion.a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    whileHover={{ scale: [1, 1.25, 1] }}
                    transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    {s.icon}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ul className="bt-footer__nav">
          {NAV.map(label => (
            <li key={label}>
              <a href={`#${label.toLowerCase()}`}>{label}</a>
            </li>
          ))}
        </ul>

        <div ref={giantRef} className="footer-giant" aria-hidden="true">
          {Array.from(GIANT).map((char, i) => (
            <span key={i} className="footer-giant__letter">
              {char}
            </span>
          ))}
        </div>

        <div ref={bottomRef} className="bt-footer__bottom">
          <span>© 2025 BuildTomorrow Ltd. Cyprus.</span>
          <span>Designed &amp; built with precision.</span>
        </div>
      </div>

      <style>{`
        .bt-footer {
          position: relative;
          width: 100vw;
          background: var(--black);
          border-top: 1px solid var(--dim);
          padding: clamp(4rem, 10vh, 7rem) 0 2rem;
          overflow: hidden;
        }
        .bt-footer__inner {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 5vw;
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }
        .bt-footer__top {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: start;
        }
        @media (max-width: 720px) {
          .bt-footer__top { grid-template-columns: 1fr; }
        }
        .bt-footer__brand {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        .bt-footer__logo {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.4rem;
          letter-spacing: -0.01em;
        }
        .bt-footer__tagline {
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 0.92rem;
          color: var(--muted);
          max-width: 320px;
          line-height: 1.55;
        }
        .bt-footer__contact {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          align-items: flex-end;
        }
        @media (max-width: 720px) {
          .bt-footer__contact { align-items: flex-start; }
        }
        .bt-footer__label {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .bt-footer__email {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: clamp(1.4rem, 2.6vw, 2.1rem);
          color: var(--white);
          letter-spacing: -0.01em;
          border-bottom: 1px solid var(--dim);
          padding-bottom: 0.2rem;
          transition: color 0.3s ease, border-color 0.3s ease;
        }
        .bt-footer__email:hover {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }
        .bt-footer__socials {
          display: flex;
          gap: 1rem;
          margin-top: 0.4rem;
          list-style: none;
        }
        .bt-footer__socials a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 1px solid var(--dim);
          border-radius: 50%;
          color: var(--muted);
          transition: color 0.3s ease, border-color 0.3s ease;
        }
        .bt-footer__socials a:hover {
          color: var(--accent);
          border-color: var(--accent);
        }
        .bt-footer__nav {
          display: flex;
          gap: 2rem;
          list-style: none;
          padding-top: 2rem;
          border-top: 1px solid var(--dim);
          flex-wrap: wrap;
        }
        .bt-footer__nav a {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
          transition: color 0.3s ease;
        }
        .bt-footer__nav a:hover { color: var(--white); }

        .footer-giant {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-top: 2rem;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 13.5vw;
          line-height: 0.9;
          letter-spacing: -0.04em;
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.08);
          color: transparent;
          user-select: none;
          overflow: hidden;
        }
        .footer-giant__letter {
          display: inline-block;
          will-change: transform, opacity;
        }
        .bt-footer__bottom {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--dim);
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 0.72rem;
          color: var(--muted);
        }
      `}</style>
    </footer>
  )
}
