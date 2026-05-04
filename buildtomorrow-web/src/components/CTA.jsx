import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '../hooks/useGSAP'
import { useReducedMotion } from '../hooks/useMediaQuery'

const HEADLINE_TEXT  = 'Ready to build your next chapter?'
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%'

function scrambleText(element, finalText, isMobile) {
  let iteration = 0, cancelled = false
  const interval = setInterval(() => {
    if (cancelled) { clearInterval(interval); return }
    element.innerText = finalText.split('').map((c,i) => i<iteration?c:(c===' '?' ':SCRAMBLE_CHARS[Math.floor(Math.random()*SCRAMBLE_CHARS.length)])).join('')
    if (iteration >= finalText.length) { clearInterval(interval) }
    iteration += 0.5
  }, isMobile ? 25 : 35)
  return () => { cancelled = true; clearInterval(interval) }
}

export default function CTA() {
  const sectionRef  = useRef(null)
  const headlineRef = useRef(null)
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail]         = useState('')
  const [focused, setFocused]     = useState(false)
  const reduced = useReducedMotion()

  useGSAP(({ ScrollTrigger }) => {
    const el = headlineRef.current
    if (!el) return
    if (reduced) { el.innerText = HEADLINE_TEXT; return }

    const mobile = window.innerWidth < 768
    let cleanup = null
    const trigger = ScrollTrigger.create({
      trigger: el, start: mobile ? 'top 65%' : 'top 85%', once: true,
      onEnter: () => { cleanup = scrambleText(el, HEADLINE_TEXT, mobile) },
    })
    return () => { cleanup?.(); trigger.kill() }
  }, [reduced], sectionRef)

  /* ── Mobile: staggered entry animations ── */
  useGSAP(({ gsap, ScrollTrigger }) => {
    if (window.innerWidth >= 768) return
    const section = sectionRef.current
    if (!section) return
    if (reduced) return
    const EASE = 'expo.out'

    const label = section.querySelector('.section-label')
    const sub   = section.querySelector('.cta-sub')
    const form  = section.querySelector('.cta-form')
    const meta  = section.querySelector('.cta-meta')

    const elements = [label, sub, form, meta].filter(Boolean)
    
    // Set initial state so they are hidden before scroll
    gsap.set(elements, { opacity: 0, y: 30 })

    ScrollTrigger.create({
      trigger: section,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(elements, { opacity: 1, y: 0, duration: 0.8, ease: EASE, stagger: 0.12 })
      }
    })
  }, [reduced], sectionRef)

  useEffect(() => {
    if (headlineRef.current && !headlineRef.current.innerText)
      headlineRef.current.innerText = HEADLINE_TEXT.replace(/[A-Za-z0-9]/g,'·')
  }, [])

  const handleSubmit = e => {
    e.preventDefault()
    if (!email) return
    if (!reduced) {
      const button = e.currentTarget.querySelector('.cta-submit')
      if (button) {
        const rect = button.getBoundingClientRect()
        const mobile = window.innerWidth < 768
        const count  = mobile ? 10 : 20
        const maxDist = mobile ? 60 : 120
        for (let i = 0; i < count; i++) {
          const p = document.createElement('div'); p.className='cta-particle'
          const angle = Math.random()*Math.PI*2
          const dist  = 40+Math.random()*maxDist
          p.style.left=`${rect.left+rect.width/2}px`; p.style.top=`${rect.top+rect.height/2}px`
          p.style.setProperty('--tx',`${Math.cos(angle)*dist}px`); p.style.setProperty('--ty',`${Math.sin(angle)*dist}px`)
          document.body.appendChild(p); setTimeout(()=>p.remove(),700)
        }
      }
    }
    setSubmitted(true); setTimeout(()=>setSubmitted(false),3000); setEmail('')
  }

  return (
    <section id="contact" ref={sectionRef} className="cta-section" aria-label="Get in touch">
      <div className="cta-bg" aria-hidden="true" />
      <div className="cta-inner">
        <span className="section-label">Let's Talk</span>
        <h2 ref={headlineRef} className="cta-headline" aria-label={HEADLINE_TEXT} />
        <p className="cta-sub">Tell us where you want to go. We'll show you how to get there — with software that performs, scales, and lasts.</p>

        <form onSubmit={handleSubmit} className="cta-form" noValidate>
          <div className={`cta-input-wrap ${focused?'is-focused':''}`}>
            <input
              type="email" required placeholder="your@email.com"
              value={email} onChange={e=>setEmail(e.target.value)}
              onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
              className="cta-input" aria-label="Your email address"
            />
          </div>
          <button type="submit" className="cta-submit">
            <span>{submitted?'Thank you →':'Send →'}</span>
          </button>
        </form>

        <div className="cta-meta">
          <span>or email us directly</span>
          <a href="mailto:hello@buildtomorrow.io" className="cta-meta__link">hello@buildtomorrow.io</a>
        </div>
      </div>

      <style>{`
        .cta-section {
          position: relative; width: 100vw; min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 4rem 1.25rem;
          overflow: hidden; background: var(--surface2);
        }
        @media (min-width: 768px) {
          .cta-section { padding: clamp(6rem,14vh,10rem) 5vw; }
        }

        .cta-bg {
          position: absolute; inset: 0; z-index: 1;
          background:
            radial-gradient(ellipse at var(--c1x) var(--c1y), rgba(200,245,66,0.06) 0%, transparent 60%),
            radial-gradient(ellipse at var(--c2x) var(--c2y), rgba(66,245,176,0.04) 0%, transparent 50%),
            var(--surface2);
          animation: breathe 8s ease-in-out infinite alternate;
        }
        /* On low-end / small screens, skip the animation */
        @media (max-width: 767px) {
          .cta-bg { animation: none; background: var(--surface2); }
        }

        .cta-inner {
          position: relative; z-index: 2;
          max-width: 900px; width: 100%;
          display: flex; flex-direction: column; align-items: flex-start; gap: 1.25rem;
        }

        .cta-headline {
          font-family: var(--font-display); font-weight: 800;
          font-size: clamp(2.5rem, 9vw, 3.5rem);
          line-height: 1.05; letter-spacing: -0.02em;
          color: var(--white); min-height: 1.05em; word-break: break-word;
        }
        @media (min-width: 768px) {
          .cta-headline { font-size: clamp(2.4rem, 5.5vw, 4.8rem); }
        }

        .cta-sub {
          font-family: var(--font-body); font-weight: 300;
          font-size: 0.95rem; line-height: 1.6; color: var(--muted); max-width: 560px;
        }
        @media (min-width: 768px) { .cta-sub { font-size: 1.05rem; } }

        /* ── Form: stacked on mobile ── */
        .cta-form {
          display: flex;
          flex-direction: column;   /* mobile: stacked */
          gap: 1rem;
          margin-top: 1.5rem;
          width: 100%;
        }
        @media (min-width: 600px) {
          .cta-form { flex-direction: row; align-items: flex-end; gap: 1.5rem; flex-wrap: wrap; }
        }

        .cta-input-wrap { position: relative; width: 100%; }
        @media (min-width: 600px) { .cta-input-wrap { width: 320px; max-width: 100%; } }

        .cta-input {
          width: 100%; font-family: var(--font-body); font-weight: 300;
          font-size: 1rem; color: var(--white); background: transparent;
          border: none; border-bottom: 1px solid var(--dim);
          padding: 0.75rem 0; transition: border-color .3s, box-shadow .3s;
          min-height: 48px;
        }
        @media (min-width: 768px) { .cta-input { font-size: 1.1rem; } }
        .cta-input::placeholder { color: var(--muted); }
        .cta-input-wrap.is-focused .cta-input { border-bottom-color: var(--accent); box-shadow: 0 1px 0 0 var(--accent); }

        .cta-submit {
          font-family: var(--font-display); font-weight: 700;
          font-size: 0.78rem; letter-spacing: 0.18em; text-transform: uppercase;
          padding: 0.95rem 2.4rem;
          background: var(--accent); color: var(--black); border: none;
          transition: transform .4s var(--ease-out-back), box-shadow .4s;
          position: relative; overflow: hidden;
          width: 100%; min-height: 52px;
        }
        @media (min-width: 600px) { .cta-submit { width: auto; }  }
        .cta-submit:hover { transform: translateY(-3px); box-shadow: 0 20px 60px rgba(200,245,66,0.25); }

        .cta-meta {
          display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem;
          margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--dim);
          font-family: var(--font-body); font-weight: 300; font-size: 0.88rem; color: var(--muted); width: 100%;
        }
        .cta-meta__link {
          color: var(--accent); font-weight: 400;
          border-bottom: 1px solid transparent; transition: border-color .3s;
          min-height: 44px; display: inline-flex; align-items: center;
        }
        .cta-meta__link:hover { border-bottom-color: var(--accent); }
      `}</style>

      <style>{`
        .cta-particle {
          position: fixed; width: 6px; height: 6px;
          background: var(--accent); border-radius: 50%;
          pointer-events: none; z-index: 9000;
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
