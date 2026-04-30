import { useRef } from 'react'
import { useGSAP } from '../hooks/useGSAP'
import { useReducedMotion } from '../hooks/useMediaQuery'

const STATS = [
  { display:'50+',   type:'count',   target:50,  suffix:'+', label:'Projects Delivered',  sub:'Across EU & Middle East',     variant:'solid'   },
  { display:'4',     type:'count',   target:4,   suffix:'',  label:'Core Disciplines',    sub:'Web · Mobile · Security · Systems', variant:'outline' },
  { display:'100%',  type:'scramble',                        label:'Client Retention',    sub:'Every client came back',      variant:'solid'   },
  { display:'< 48h', type:'scramble',                        label:'Response Time',       sub:'From brief to first proposal', variant:'outline' },
]
const SC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%'

function doScramble(el, finalText) {
  let it = 0, cancelled = false
  const iv = setInterval(() => {
    if (cancelled) return
    el.textContent = finalText.split('').map((c,i) => i < it ? c : (c===' '?' ':SC[Math.floor(Math.random()*SC.length)])).join('')
    if (it >= finalText.length) { clearInterval(iv); el.textContent = finalText }
    it += 0.5
  }, 35)
  return () => { cancelled = true; clearInterval(iv) }
}

export default function StatsBand() {
  const sectionRef = useRef(null)
  const lineRef    = useRef(null)
  const numRefs    = useRef([])
  const reduced    = useReducedMotion()

  useGSAP(({ gsap, ScrollTrigger }) => {
    const section = sectionRef.current
    if (!section) return

    if (lineRef.current) {
      gsap.fromTo(lineRef.current, { scaleX:0 }, { scaleX:1, duration:1, ease:'expo.out', transformOrigin:'left center', scrollTrigger:{ trigger:section, start:'top 82%', once:true } })
    }

    gsap.fromTo(gsap.utils.toArray('.sb-block', section),
      { y:60, opacity:0 },
      { y:0, opacity:1, duration:0.8, ease:'expo.out', stagger:0.12, scrollTrigger:{ trigger:section, start:'top 78%', once:true } },
    )

    STATS.forEach((stat, i) => {
      const el = numRefs.current[i]
      if (!el) return
      ScrollTrigger.create({
        trigger: section, start: 'top 78%', once: true,
        onEnter() {
          if (stat.type === 'count') {
            const obj = { val:0 }
            gsap.to(obj, { val:stat.target, duration:1.4, ease:'power3.out', onUpdate(){ el.textContent=Math.round(obj.val)+stat.suffix }, onComplete(){ el.textContent=stat.display } })
          } else {
            doScramble(el, stat.display)
          }
        },
      })
    })
  }, [reduced], sectionRef)

  if (reduced) {
    return (
      <section className="sb-section" aria-label="Impact statistics">
        <div ref={lineRef} className="sb-line" style={{ transform:'scaleX(1)' }} />
        <div className="sb-grid">
          {STATS.map((s,i) => (
            <div key={i} className="sb-block">
              <span className={`sb-num sb-num--${s.variant}`}>{s.display}</span>
              <span className="sb-label">{s.label}</span>
              <span className="sb-sub">{s.sub}</span>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="sb-section" aria-label="Impact statistics">
      {/* Watermark — hidden on mobile via CSS */}
      <div className="sb-watermark" aria-hidden="true">IMPACT</div>
      <div ref={lineRef} className="sb-line" />
      <div className="sb-grid">
        {STATS.map((stat, i) => (
          <div key={i} className="sb-block" aria-label={`${stat.display} — ${stat.label}`}>
            <span ref={el => (numRefs.current[i]=el)} className={`sb-num sb-num--${stat.variant}`} aria-live="polite">
              {stat.type==='count' ? '0'+(stat.suffix||'') : stat.display}
            </span>
            <span className="sb-label">{stat.label}</span>
            <span className="sb-sub">{stat.sub}</span>
          </div>
        ))}
      </div>

      <style>{`
        .sb-section {
          position: relative; width: 100vw; min-height: 100vh;
          background: var(--surface);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: clamp(4rem, 10vh, 8rem) 0;
          overflow: hidden;
          border-top: 1px solid var(--dim); border-bottom: 1px solid var(--dim);
        }

        /* Watermark — desktop only */
        .sb-watermark {
          display: none;
        }
        @media (min-width: 768px) {
          .sb-watermark {
            display: block;
            position: absolute; top:50%; left:50%; transform:translate(-50%,-50%);
            font-family:'Syne',sans-serif; font-weight:800;
            font-size: clamp(8rem,18vw,16rem); letter-spacing:-0.04em;
            -webkit-text-stroke:1px rgba(255,255,255,0.03); color:transparent;
            white-space:nowrap; pointer-events:none; user-select:none; z-index:0;
          }
        }

        .sb-line {
          position:absolute; top:0; left:0; right:0; height:1px;
          background:var(--accent); transform:scaleX(0); transform-origin:left; z-index:2; opacity:0.6;
        }

        /* ── Grid: 2×2 on mobile, 4-col on desktop ── */
        .sb-grid {
          position:relative; z-index:2;
          display:grid;
          grid-template-columns: repeat(2, 1fr);   /* mobile: 2×2 */
          width:100%; max-width:1600px; padding:0 1.25rem;
        }
        @media (min-width: 768px) {
          .sb-grid { padding: 0 5vw; }
        }
        @media (min-width: 1024px) {
          .sb-grid { grid-template-columns: repeat(4, 1fr); }
        }

        /* ── Block ── */
        .sb-block {
          display:flex; flex-direction:column; gap:0.6rem;
          padding: 1.75rem 1.25rem;
          border-right: 1px solid var(--dim);
          transition: background .3s;
          will-change: transform, opacity;
        }
        @media (min-width: 768px) {
          .sb-block { gap:0.9rem; padding: clamp(2.5rem,5vw,4rem) clamp(1.5rem,3vw,3rem); }
        }
        /* Right border: remove on last in each row */
        .sb-block:nth-child(2n)  { border-right: none; }
        @media (min-width: 1024px) {
          .sb-block:nth-child(2n)  { border-right: 1px solid var(--dim); }
          .sb-block:last-child     { border-right: none; }
        }
        /* Bottom border: add between rows */
        .sb-block:nth-child(1),
        .sb-block:nth-child(2)   { border-bottom: 1px solid var(--dim); }
        @media (min-width: 1024px) {
          .sb-block:nth-child(1),
          .sb-block:nth-child(2)  { border-bottom: none; }
        }
        .sb-block:hover { background: rgba(200,245,66,0.02); }

        /* ── Number ── */
        .sb-num {
          display:block; font-family:'Syne',sans-serif; font-weight:800;
          font-size: clamp(3rem, 12vw, 5rem);
          line-height:0.9; letter-spacing:-0.04em; transition: color .3s, -webkit-text-stroke-color .3s;
          font-variant-numeric: tabular-nums;
        }
        @media (min-width: 1024px) {
          .sb-num { font-size: clamp(5rem, 10vw, 9rem); }
        }
        .sb-num--solid   { color: var(--accent); }
        .sb-num--outline { color: transparent; -webkit-text-stroke: 2px var(--accent); }
        .sb-block:hover .sb-num--solid   { color: var(--teal); }
        .sb-block:hover .sb-num--outline { -webkit-text-stroke-color: var(--teal); }

        .sb-label {
          font-family:'Syne',sans-serif; font-weight:700; color:var(--white); letter-spacing:-0.01em;
          font-size: 0.9rem; line-height:1.1;
        }
        @media (min-width: 768px) {
          .sb-label { font-size: clamp(1rem,2vw,1.4rem); }
        }
        .sb-sub {
          font-family:'DM Sans',sans-serif; font-weight:300;
          color:var(--muted); letter-spacing:0.05em; line-height:1.4;
          font-size: 0.75rem;
        }
        @media (min-width: 768px) { .sb-sub { font-size: 0.85rem; } }
      `}</style>
    </section>
  )
}
