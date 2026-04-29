import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '../hooks/useGSAP'
import { useReducedMotion } from '../hooks/useMediaQuery'

const HEADLINE_TEXT = 'Ready to build your next chapter?'
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%'

function scrambleText(element, finalText, onComplete) {
  let iteration = 0
  let cancelled = false
  const interval = setInterval(() => {
    if (cancelled) {
      clearInterval(interval)
      return
    }
    element.innerText = finalText
      .split('')
      .map((char, i) => {
        if (i < iteration) return char
        if (char === ' ') return ' '
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
      })
      .join('')
    if (iteration >= finalText.length) {
      clearInterval(interval)
      onComplete?.()
    }
    iteration += 0.5
  }, 35)
  return () => {
    cancelled = true
    clearInterval(interval)
  }
}

export default function CTA() {
  const sectionRef = useRef(null)
  const headlineRef = useRef(null)
  const formRef = useRef(null)
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')
  const [focused, setFocused] = useState(false)
  const reduced = useReducedMotion()

  // Trigger scramble on enter
  useGSAP(({ ScrollTrigger }) => {
    const el = headlineRef.current
    if (!el) return

    if (reduced) {
      el.innerText = HEADLINE_TEXT
      return
    }

    let cleanup = null
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        cleanup = scrambleText(el, HEADLINE_TEXT)
      },
    })

    return () => {
      cleanup?.()
      trigger.kill()
    }
  }, [reduced], sectionRef)

  // Initial placeholder so it doesn't pop in
  useEffect(() => {
    if (headlineRef.current && !headlineRef.current.innerText) {
      headlineRef.current.innerText = HEADLINE_TEXT.replace(/[A-Za-z0-9]/g, '·')
    }
  }, [])

  const handleSubmit = e => {
    e.preventDefault()
    if (!email) return

    if (!reduced) {
      const button = e.currentTarget.querySelector('.cta-submit')
      if (button) {
        const rect = button.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2

        for (let i = 0; i < 20; i++) {
          const particle = document.createElement('div')
          particle.className = 'cta-particle'
          const angle = Math.random() * Math.PI * 2
          const dist = 40 + Math.random() * 80
          particle.style.left = `${cx}px`
          particle.style.top = `${cy}px`
          particle.style.setProperty('--tx', `${Math.cos(angle) * dist}px`)
          particle.style.setProperty('--ty', `${Math.sin(angle) * dist}px`)
          document.body.appendChild(particle)
          setTimeout(() => particle.remove(), 700)
        }
      }
    }

    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
    setEmail('')
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="cta-section"
      aria-label="Get in touch"
    >
      <div className="cta-bg" aria-hidden="true" />

      <div className="cta-inner">
        <span className="section-label">Let's Talk</span>

        <h2 ref={headlineRef} className="cta-headline" aria-label={HEADLINE_TEXT} />

        <p className="cta-sub">
          Tell us where you want to go. We'll show you how to get there — with software
          that performs, scales, and lasts.
        </p>

        <form ref={formRef} onSubmit={handleSubmit} className="cta-form" noValidate>
          <div className={`cta-input-wrap ${focused ? 'is-focused' : ''}`}>
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="cta-input"
              aria-label="Your email address"
            />
          </div>
          <button type="submit" className="cta-submit">
            <span>{submitted ? 'Thank you →' : 'Send →'}</span>
          </button>
        </form>

        <div className="cta-meta">
          <span>or email us directly</span>
          <a href="mailto:hello@buildtomorrow.io" className="cta-meta__link">
            hello@buildtomorrow.io
          </a>
        </div>
      </div>

      <style>{`
        .cta-section {
          position: relative;
          width: 100vw;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(6rem, 14vh, 10rem) 5vw;
          overflow: hidden;
          background: var(--surface2);
        }
        .cta-bg {
          position: absolute;
          inset: 0;
          z-index: 1;
          background:
            radial-gradient(ellipse at var(--c1x) var(--c1y), rgba(200, 245, 66, 0.06) 0%, transparent 60%),
            radial-gradient(ellipse at var(--c2x) var(--c2y), rgba(66, 245, 176, 0.04) 0%, transparent 50%),
            var(--surface2);
          animation: breathe 8s ease-in-out infinite alternate;
        }
        .cta-inner {
          position: relative;
          z-index: 2;
          max-width: 900px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1.5rem;
        }
        .cta-headline {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: clamp(2.4rem, 5.5vw, 4.8rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: var(--white);
          min-height: 1.05em;
          word-break: break-word;
        }
        .cta-sub {
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 1.05rem;
          line-height: 1.6;
          color: var(--muted);
          max-width: 560px;
        }
        .cta-form {
          display: flex;
          align-items: flex-end;
          gap: 1.5rem;
          margin-top: 2rem;
          flex-wrap: wrap;
          width: 100%;
        }
        .cta-input-wrap {
          position: relative;
          width: 360px;
          max-width: 100%;
        }
        .cta-input {
          width: 100%;
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 1.1rem;
          color: var(--white);
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--dim);
          padding: 0.6rem 0;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .cta-input::placeholder { color: var(--muted); }
        .cta-input-wrap.is-focused .cta-input {
          border-bottom-color: var(--accent);
          box-shadow: 0 1px 0 0 var(--accent);
        }
        .cta-submit {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.78rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 0.95rem 2.4rem;
          background: var(--accent);
          color: var(--black);
          border: none;
          transition: transform 0.4s var(--ease-out-back), box-shadow 0.4s ease;
          position: relative;
          overflow: hidden;
        }
        .cta-submit:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 60px rgba(200, 245, 66, 0.25);
        }
        .cta-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.75rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--dim);
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 0.92rem;
          color: var(--muted);
          width: 100%;
        }
        .cta-meta__link {
          color: var(--accent);
          font-weight: 400;
          transition: color 0.3s ease;
          border-bottom: 1px solid transparent;
        }
        .cta-meta__link:hover {
          border-bottom-color: var(--accent);
        }
      `}</style>

      <style>{`
        .cta-particle {
          position: fixed;
          width: 6px;
          height: 6px;
          background: var(--accent);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9000;
          --tx: 0px;
          --ty: 0px;
          animation: cta-burst 0.6s var(--ease-out-expo) forwards;
        }
        @keyframes cta-burst {
          from {
            transform: translate(-50%, -50%) translate(0, 0);
            opacity: 1;
          }
          to {
            transform: translate(-50%, -50%) translate(var(--tx), var(--ty));
            opacity: 0;
          }
        }
      `}</style>
    </section>
  )
}
