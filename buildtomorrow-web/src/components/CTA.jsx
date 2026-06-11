import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '../hooks/useGSAP'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { submitContactForm } from '../utils/contactForm'
import { triggerContactParticles } from '../utils/contactParticles'

const HEADLINE_TEXT  = 'Ready to build something that lasts?'
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%'

function scrambleText(element, finalText, isMobile) {
  let iteration = 0, cancelled = false
  const interval = setInterval(() => {
    if (cancelled) { clearInterval(interval); return }
    element.innerText = finalText
      .split('')
      .map((c, i) => i < iteration ? c : (c === ' ' ? ' ' : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]))
      .join('')
    if (iteration >= finalText.length) clearInterval(interval)
    iteration += 0.5
  }, isMobile ? 25 : 35)
  return () => { cancelled = true; clearInterval(interval) }
}

export default function CTA() {
  const sectionRef  = useRef(null)
  const headlineRef = useRef(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [formData, setFormData]   = useState({ name: '', email: '', message: '', botcheck: '' })
  const [focused, setFocused]     = useState('')
  const reduced = useReducedMotion()
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || import.meta.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY

  /*
   * ── MOBILE: hide elements BEFORE first paint ─────────────────────────────
   * Runs synchronously before browser paints, eliminating any flash of
   * visible content before the IntersectionObserver triggers the reveal.
   */
  useLayoutEffect(() => {
    if (window.innerWidth >= 768) return
    if (reduced) return
    const section = sectionRef.current
    if (!section) return

    const label = section.querySelector('.section-label')
    const sub   = section.querySelector('.cta-sub')
    const form  = section.querySelector('.cta-form-panel')
    const meta  = section.querySelector('.cta-meta')
    const els   = [label, sub, form, meta].filter(Boolean)
    gsap.set(els, { opacity: 0, y: 30 })
  }, [reduced])

  /*
   * ── MOBILE: IntersectionObserver — scramble + entry reveal ───────────────
   * Observes .cta-inner (the visible content box) with threshold 0.45
   * so the animation only starts when ~45 % of the content is on screen.
   * This is completely decoupled from GSAP / Lenis scroll-position math.
   */
  useEffect(() => {
    if (window.innerWidth >= 768) return
    if (reduced) return
    const section = sectionRef.current
    if (!section) return

    const inner = section.querySelector('.cta-inner')
    if (!inner) return

    const EASE = 'expo.out'
    let fired = false

    const runReveal = () => {
      if (fired) return
      fired = true

      const headline = headlineRef.current
      const label = section.querySelector('.section-label')
      const sub   = section.querySelector('.cta-sub')
      const form  = section.querySelector('.cta-form-panel')
      const meta  = section.querySelector('.cta-meta')
      const els   = [label, sub, form, meta].filter(Boolean)

      // Scramble fires immediately; entry elements stagger in 200 ms later
      if (headline) scrambleText(headline, HEADLINE_TEXT, true)
      gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: EASE, stagger: 0.12, delay: 0.2 })
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          runReveal()
          io.disconnect()
        }
      },
      // 0.45 = fire when 45 % of .cta-inner is visible
      { threshold: 0.45, rootMargin: '0px' },
    )

    io.observe(inner)
    return () => io.disconnect()
  }, [reduced])

  /*
   * ── DESKTOP: scramble via GSAP ScrollTrigger (unchanged) ─────────────────
   * Returns early on mobile so it never interferes with the IO path above.
   */
  useGSAP(({ ScrollTrigger }) => {
    if (window.innerWidth < 768) return    // mobile handled by IO
    const el = headlineRef.current
    if (!el) return
    if (reduced) { el.innerText = HEADLINE_TEXT; return }

    let cleanup = null
    const trigger = ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => { cleanup = scrambleText(el, HEADLINE_TEXT, false) },
    })
    return () => { cleanup?.(); trigger.kill() }
  }, [reduced], sectionRef)

  // Set placeholder text so the headline isn't blank on initial render
  useEffect(() => {
    if (headlineRef.current && !headlineRef.current.innerText)
      headlineRef.current.innerText = HEADLINE_TEXT.replace(/[A-Za-z0-9]/g, '·')
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const formElement = e.currentTarget
    if (loading) return

    const name = formData.name.trim()
    const email = formData.email.trim()
    const message = formData.message.trim()
    const botcheck = formData.botcheck.trim()

    setSubmitted(false)
    setError('')

    if (!name || !email || !message) {
      setError('Please complete your name, email, and message.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (botcheck) return

    setLoading(true)

    try {
      const result = await submitContactForm({
        accessKey,
        name,
        email,
        message,
        botcheck,
      })

      if (result.skipped) return

      triggerContactParticles(formElement, { reduced })
      setSubmitted(true)
      setFormData({ name: '', email: '', message: '', botcheck: '' })
      setTimeout(() => setSubmitted(false), 3000)
    } catch (err) {
      setError(err.message || 'Message could not be sent. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" ref={sectionRef} className="cta-section" aria-label="Get in touch">
      <div className="cta-bg" aria-hidden="true" />

      <div className="cta-inner">
        <div className="cta-copy">
          <span className="section-label">Let's Talk</span>
          <h2 ref={headlineRef} className="cta-headline" aria-label={HEADLINE_TEXT} />
          <p className="cta-sub">
            Tell us where you want to go. We'll design the software, systems, and infrastructure to get you there.
          </p>
        </div>

        <div className="cta-form-panel">
          <div className="cta-form-head">
            <h3>Tell us about your project</h3>
          </div>

          <form onSubmit={handleSubmit} className="cta-form" noValidate>
            <input
              type="text"
              name="botcheck"
              value={formData.botcheck}
              onChange={handleChange}
              className="cta-botcheck"
              tabIndex="-1"
              autoComplete="off"
            />

            <div className={`cta-input-wrap ${focused === 'name' ? 'is-focused' : ''}`}>
              <input
                type="text" name="name" required placeholder="Name"
                value={formData.name} onChange={handleChange}
                onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                className="cta-input" aria-label="Your name"
              />
            </div>

            <div className={`cta-input-wrap ${focused === 'email' ? 'is-focused' : ''}`}>
              <input
                type="email" name="email" required placeholder="Email"
                value={formData.email} onChange={handleChange}
                onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                className="cta-input" aria-label="Your email address"
              />
            </div>

            <div className={`cta-input-wrap cta-input-wrap--message ${focused === 'message' ? 'is-focused' : ''}`}>
              <textarea
                name="message" required placeholder="Tell us what you want to build, improve, or automate."
                value={formData.message} onChange={handleChange}
                onFocus={() => setFocused('message')} onBlur={() => setFocused('')}
                className="cta-input cta-textarea" aria-label="Project details"
                rows="5"
              />
            </div>

            <div className="cta-submit-group">
              <button type="submit" className="cta-submit" disabled={loading}>
                <span>{loading ? 'SENDING...' : submitted ? 'THANK YOU' : 'SEND MESSAGE'}</span>
              </button>
              <div className="cta-direct-contact" aria-label="Direct contact">
                <span className="cta-direct-contact__label">DIRECT CONTACT</span>
                <a href="mailto:hello@buildtomorrow.today" className="cta-direct-contact__link">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="cta-direct-contact__icon">
                    <path d="M4 6.5h16v11H4z" />
                    <path d="m4.5 7 7.5 6 7.5-6" />
                  </svg>
                  hello@buildtomorrow.today
                </a>
                <a href="tel:+35799824874" className="cta-direct-contact__link">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="cta-direct-contact__icon">
                    <path d="M6.7 4.8 9 4.2l2 4.4-1.5 1.1c.9 1.9 2.3 3.3 4.2 4.2l1.1-1.5 4.4 2-.6 2.3c-.2.9-1 1.5-1.9 1.5C10.7 18.2 5.8 13.3 5.8 7.3c0-.9.6-1.7 1.5-1.9Z" />
                  </svg>
                  +357 99 824 874
                </a>
              </div>
            </div>
          </form>

          <div className="cta-status" aria-live="polite">
            {error ? <span className="cta-status__error">{error}</span> : submitted ? <span>Message sent — we’ll get back to you soon.</span> : null}
          </div>
        </div>
      </div>

      <style>{`
        .cta-section {
          position: relative; width: 100vw; min-height: 78vh;
          display: flex; align-items: center; justify-content: center;
          padding: 4rem 1.25rem; overflow: hidden; background: var(--surface2);
        }
        @media (min-width: 768px) {
          .cta-section { min-height: 82vh; padding: clamp(5rem,10vh,7rem) 5vw; }
        }

        .cta-bg {
          position: absolute; inset: 0; z-index: 1;
          background:
            radial-gradient(ellipse at var(--c1x) var(--c1y), rgba(0,217,255,0.055) 0%, transparent 58%),
            radial-gradient(ellipse at var(--c2x) var(--c2y), rgba(8,123,255,0.045) 0%, transparent 52%),
            linear-gradient(180deg, #050713 0%, #0B1024 100%),
            var(--surface2);
          animation: breathe 8s ease-in-out infinite alternate;
        }
        @media (max-width: 767px) {
          .cta-bg { animation: none; background: linear-gradient(180deg, #050713 0%, #0B1024 100%); }
        }

        .cta-inner {
          position: relative; z-index: 2;
          max-width: 1120px; width: 100%;
          display: grid; grid-template-columns: 1fr; align-items: center; gap: 2rem;
        }
        @media (min-width: 900px) {
          .cta-inner { grid-template-columns: minmax(0, 0.95fr) minmax(420px, 0.9fr); gap: clamp(2.5rem, 5vw, 4rem); }
        }

        .cta-copy {
          display: flex; flex-direction: column; align-items: flex-start; gap: 1rem; max-width: 680px;
        }

        .cta-headline {
          font-family: var(--font-display); font-weight: 800;
          font-size: clamp(2.1rem, 7.5vw, 3rem);
          line-height: 1.05; letter-spacing: -0.02em;
          color: var(--white); min-height: 1.05em; word-break: break-word;
        }
        @media (min-width: 768px) {
          .cta-headline { font-size: clamp(2.35rem, 4.2vw, 3.65rem); }
        }

        .cta-sub {
          font-family: var(--font-body); font-weight: 300;
          font-size: 0.95rem; line-height: 1.6; color: var(--muted); max-width: 620px;
        }
        @media (min-width: 768px) { .cta-sub { font-size: 1.05rem; } }

        .cta-form-panel {
          position: relative;
          width: 100%;
          padding: clamp(1.1rem, 3vw, 1.55rem);
          background:
            radial-gradient(circle at 88% 8%, rgba(0, 204, 196, 0.16) 0%, rgba(0, 204, 196, 0.045) 28%, transparent 56%),
            linear-gradient(145deg, rgba(12, 18, 36, 0.82), rgba(5, 8, 20, 0.72));
          border: 1px solid rgba(148, 212, 231, 0.12);
          border-radius: 8px;
          box-shadow:
            0 18px 56px rgba(0, 0, 0, 0.28),
            0 0 36px rgba(0, 217, 255, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(16px);
          overflow: hidden;
        }

        .cta-form-head {
          display: flex; flex-direction: column; gap: 0;
          padding-bottom: 0.65rem; margin-bottom: 0.75rem;
          border-bottom: 1px solid rgba(0, 217, 255, 0.08);
        }
        .cta-form-head h3 {
          font-family: var(--font-display); font-weight: 800;
          font-size: 0.74rem; line-height: 1.2;
          color: rgba(244, 247, 251, 0.78); letter-spacing: 0.18em; text-transform: uppercase;
        }

        .cta-form {
          display: grid; grid-template-columns: 1fr; gap: 0.8rem; width: 100%;
        }
        @media (min-width: 680px) {
          .cta-form { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 1rem; row-gap: 0.95rem; }
        }

        .cta-botcheck { display: none; }

        .cta-input-wrap { position: relative; width: 100%; }
        .cta-input-wrap--message { width: 100%; }
        @media (min-width: 680px) { .cta-input-wrap--message { grid-column: 1 / -1; } }

        .cta-input {
          width: 100%; font-family: var(--font-body); font-weight: 300;
          font-size: 1rem; color: var(--white);
          background: transparent;
          border: none; border-bottom: 1px solid rgba(0, 217, 255, 0.22);
          border-radius: 0;
          padding: 0.7rem 0 0.65rem;
          transition: border-color .3s, box-shadow .3s, color .3s;
          min-height: 44px;
        }
        @media (min-width: 768px) { .cta-input { font-size: 1rem; } }
        .cta-input::placeholder { color: rgba(184, 195, 214, 0.68); }
        .cta-input-wrap.is-focused .cta-input {
          border-bottom-color: rgba(0, 217, 255, 0.82);
          box-shadow: 0 1px 0 rgba(0, 217, 255, 0.34), 0 10px 24px rgba(0, 217, 255, 0.045);
        }
        .cta-textarea {
          resize: vertical; min-height: 86px; line-height: 1.5;
        }
        @media (min-width: 768px) {
          .cta-textarea { min-height: 98px; }
        }

        .cta-submit-group {
          display: grid; grid-template-columns: 1fr; align-items: end;
          gap: 1rem; width: 100%; padding-top: 0.25rem;
        }
        @media (min-width: 680px) {
          .cta-submit-group { grid-column: 1 / -1; grid-template-columns: auto 1fr; gap: 1.35rem; }
        }

        .cta-submit {
          font-family: var(--font-display); font-weight: 700;
          font-size: 0.72rem; letter-spacing: 0.16em;
          padding: 0.78rem 1.35rem; background: var(--bt-gradient); color: var(--bt-black); border: none;
          transition: transform .4s var(--ease-out-back), box-shadow .4s;
          position: relative; overflow: hidden; width: 100%; min-height: 42px;
        }
        @media (min-width: 680px) { .cta-submit { width: auto; min-width: 168px; } }
        .cta-submit:hover { transform: translateY(-2px); box-shadow: 0 14px 38px rgba(0,217,255,0.18); }
        .cta-submit:disabled {
          cursor: wait; opacity: 0.72; transform: none; box-shadow: none;
        }

        .cta-status {
          min-height: 1.4em; margin-top: 0.8rem; font-family: var(--font-body); font-weight: 300;
          font-size: 0.88rem; color: var(--bt-cyan);
        }
        .cta-status__error { color: #ff8b9a; }

        .cta-direct-contact {
          display: flex; flex-direction: column; align-items: flex-start; gap: 0.28rem;
          font-family: var(--font-body); font-weight: 300; justify-self: start;
          color: var(--muted); line-height: 1.35;
        }
        @media (min-width: 680px) {
          .cta-direct-contact { justify-self: end; align-items: flex-start; }
        }
        .cta-direct-contact__label {
          font-family: var(--font-display); font-weight: 700;
          font-size: 0.58rem; letter-spacing: 0.22em; color: rgba(244, 247, 251, 0.48);
        }
        .cta-direct-contact__link {
          color: rgba(244, 247, 251, 0.8); font-size: 0.84rem;
          border-bottom: 1px solid transparent; transition: color .3s, border-color .3s;
          display: inline-flex; align-items: center; gap: 0.42rem;
        }
        .cta-direct-contact__icon {
          width: 0.9rem; height: 0.9rem; flex: 0 0 auto;
          fill: none; stroke: currentColor; stroke-width: 1.7;
          stroke-linecap: round; stroke-linejoin: round; opacity: 0.78;
        }
        .cta-direct-contact__link:hover { color: var(--bt-cyan); border-bottom-color: rgba(0, 217, 255, 0.45); }
      `}</style>

      <style>{`
        .cta-particle {
          position: fixed; width: 6px; height: 6px; background: var(--accent);
          border-radius: 50%; pointer-events: none; z-index: 9000;
          --tx: 0px; --ty: 0px;
          animation: cta-burst 0.6s var(--ease-out-expo) forwards;
        }
        @keyframes cta-burst {
          from { transform: translate(-50%,-50%) translate(0,0); opacity: 1; }
          to   { transform: translate(-50%,-50%) translate(var(--tx),var(--ty)); opacity: 0; }
        }
      `}</style>
    </section>
  )
}
