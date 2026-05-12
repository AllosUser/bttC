import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '../hooks/useGSAP'
import { useReducedMotion } from '../hooks/useMediaQuery'

const LINES = [
  { text: 'We build the infrastructure of tomorrow —', accent: false },
  { text: 'designed for scale, built for performance,', accent: false },
  { text: 'and engineered to grow with your business.', accent: false },
  { text: 'Today.', accent: true },
]

const FULL_TEXT = LINES.map(l => l.text).join(' ')

/* ---------- WebGL shader ---------- */
const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() { vUv=(aPos+1.0)*0.5; gl_Position=vec4(aPos,0.0,1.0); }
`
const FRAG = `
precision mediump float;
uniform float uTime; uniform vec2 uRes; varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes; float t=uTime*0.18;
  float n=noise(uv*3.0+t)*0.5+noise(uv*6.0-t*1.3)*0.25+noise(uv*12.0+t*0.7)*0.125;
  float scanline=sin(uv.y*uRes.y*0.5)*0.012;
  float ca=sin(uTime*0.3+uv.x*10.0)*0.004;
  vec3 base=vec3(0.020,0.027,0.075);
  vec3 haze=vec3(0.000,0.110,0.160)*(n*0.10);
  vec3 col=base+haze+vec3(scanline+ca);
  col+=vec3(0.000,0.030,0.070)*smoothstep(0.85,0.20,distance(uv,vec2(0.5,0.22)))*0.35;
  gl_FragColor=vec4(col,1.0);
}
`
function compile(gl, type, src) {
  const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { gl.deleteShader(sh); throw new Error(gl.getShaderInfoLog(sh)) }
  return sh
}

/* ---------- CSS scanline fallback for mobile ---------- */
function ScanlineBg() {
  return <div className="vs-scanline-bg" aria-hidden="true" />
}

export default function VideoStrip() {
  const sectionRef = useRef(null)
  const canvasRef  = useRef(null)
  const reduced    = useReducedMotion()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  /* ── WebGL — desktop only ── */
  useEffect(() => {
    if (reduced || isMobile) return
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
    if (!gl) return

    const vs = compile(gl, gl.VERTEX_SHADER, VERT), fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    const prog = gl.createProgram()
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog)

    const aPos = gl.getAttribLocation(prog,'aPos'), uTime = gl.getUniformLocation(prog,'uTime'), uRes = gl.getUniformLocation(prog,'uRes')
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW)

    const dpr = Math.min(window.devicePixelRatio, 2)
    const setSize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight
      canvas.width = Math.floor(w*dpr); canvas.height = Math.floor(h*dpr)
      gl.viewport(0,0,canvas.width,canvas.height)
    }
    setSize(); window.addEventListener('resize', setSize)

    let rafId = 0; const t0 = performance.now()
    const tick = () => {
      const t = (performance.now()-t0)*0.001
      gl.useProgram(prog); gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0)
      gl.uniform1f(uTime,t); gl.uniform2f(uRes,canvas.width,canvas.height)
      gl.drawArrays(gl.TRIANGLES,0,6); rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId); window.removeEventListener('resize',setSize)
      gl.deleteBuffer(buf); gl.deleteProgram(prog); gl.deleteShader(vs); gl.deleteShader(fs)
    }
  }, [reduced, isMobile])

  /* ── Pinned scroll-driven word reveal ── */
  useGSAP(({ gsap, ScrollTrigger }) => {
    const section = sectionRef.current
    if (!section) return
    const mobile = window.innerWidth < 768

    if (reduced) {
      section.querySelectorAll('.reveal-word').forEach(w => {
        w.style.opacity = '1'
        w.style.filter  = 'blur(0px)'
      })
      const ey = section.querySelector('.vs-eyebrow')
      const at = section.querySelector('.vs-attrib')
      if (ey) ey.style.opacity = '1'
      if (at) at.style.opacity = '0.6'
      return
    }

    const pinDistance = mobile ? '+=120%' : '+=150%'

    // Pre-pin: section scrolls in from below. Fade words from CSS base → floor
    // so there is no empty scanline background before the pin locks in.
    const preMax      = mobile ? 0.28 : 0.22
    const wordCssBase = mobile ? 0.15 : 0.10
    const eyeCssBase  = mobile ? 0.08 : 0.06

    ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',  // section first enters viewport
      end:   'top top',     // section fills viewport / pin starts
      scrub: true,
      onUpdate(self) {
        const pp          = self.progress
        const blurStart   = mobile ? 6 : 8
        const blurEnd     = mobile ? 4 : 5

        section.querySelectorAll('.reveal-word').forEach(w => {
          w.style.opacity = Math.max(wordCssBase, pp * preMax)
          w.style.filter  = `blur(${blurStart - pp * (blurStart - blurEnd)}px)`
        })

        const eyebrow = section.querySelector('.vs-eyebrow')
        if (eyebrow) {
          eyebrow.style.opacity = Math.max(eyeCssBase, pp * (mobile ? 0.20 : 0.14))
        }
      },
    })

    // Main pin: section fixed while words reveal word-by-word
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: pinDistance,
      pin: true,
      pinSpacing: true,
      scrub: mobile ? 0.4 : 0.8,
      invalidateOnRefresh: true,
      onUpdate(self) {
        const p = self.progress

        /* ── Eyebrow: floor matches pre-pin max, then fades fully in 0–5% ── */
        const eyebrow = section.querySelector('.vs-eyebrow')
        if (eyebrow) {
          const ep = Math.min(1, p / 0.05)
          const eyebrowFloor = mobile ? 0.20 : 0.14
          const eyebrowVal   = Math.max(eyebrowFloor, ep)
          eyebrow.style.opacity   = eyebrowVal
          eyebrow.style.transform = `translateY(${(1 - eyebrowVal) * 12}px)`
        }

        /* ── Words: floor = preMax so reveal continues seamlessly ── */
        const words     = section.querySelectorAll('.reveal-word')
        const total     = words.length
        const revealEnd = 0.80
        const wordFloor = mobile ? 0.28 : 0.22
        const maxBlur   = mobile ? 4 : 5

        words.forEach((word, i) => {
          const wordStart = (i / total) * revealEnd * 0.78
          const wordDur   = revealEnd * 0.22
          const wp        = (p - wordStart) / wordDur
          const clamped   = Math.min(1, Math.max(0, wp))
          const displayed = Math.max(wordFloor, clamped)
          word.style.opacity = displayed
          word.style.filter  = displayed >= 1 ? 'blur(0px)' : `blur(${(1 - displayed) * maxBlur}px)`
        })

        /* ── Attribution: fade in 75%–90% ── */
        const attrib = section.querySelector('.vs-attrib')
        if (attrib) {
          const ap = Math.min(1, Math.max(0, (p - 0.75) / 0.15))
          attrib.style.opacity   = ap * 0.6
          attrib.style.transform = `translateY(${(1 - ap) * 10}px)`
        }
      },
    })
  }, [reduced, isMobile], sectionRef)

  /* ── Build word spans per line ── */
  let globalWordIndex = 0
  const renderLines = LINES.map((line, li) => {
    const words = line.text.split(' ')
    const wordSpans = words.map((word) => {
      const idx = globalWordIndex++
      return (
        <span
          key={idx}
          className="reveal-word"
          data-accent={line.accent ? 'true' : undefined}
        >
          {word}
        </span>
      )
    })
    return (
      <span key={li} className="vs-line">
        {wordSpans}
      </span>
    )
  })

  return (
    <section id="work" ref={sectionRef} className="vs-section" aria-label="Mission statement">
      {/* Desktop: WebGL canvas. Mobile: CSS scanlines */}
      {isMobile ? <ScanlineBg /> : <canvas ref={canvasRef} className="vs-canvas" aria-hidden="true" />}
      <div className="vs-overlay" aria-hidden="true" />

      <div className="vs-center">
        <div className="vs-content">
          <span className="vs-eyebrow">Engineering the future</span>
          <p className="vs-quote" aria-label={FULL_TEXT}>
            {renderLines}
          </p>
          <span className="vs-attrib">— BuildTomorrow</span>
        </div>
      </div>

      <style>{`
        /* ── Section: exactly 1 viewport tall, GSAP pin handles extra scroll ── */
        .vs-section {
          position: relative;
          height: 100vh;
          background:
            radial-gradient(circle at 50% 20%, rgba(0, 217, 255, 0.08), transparent 35%),
            linear-gradient(180deg, #050713 0%, #0B1024 100%);
          border-top: 1px solid rgba(0, 217, 255, 0.16);
          border-bottom: 1px solid rgba(0, 217, 255, 0.16);
          overflow: hidden;
        }

        /* WebGL canvas — desktop only */
        .vs-canvas {
          position: absolute; inset: 0;
          width: 100% !important; height: 100% !important;
          z-index: 1;
        }

        /* CSS scanline fallback — mobile */
        .vs-scanline-bg {
          position: absolute; inset: 0; z-index: 1;
          background:
            repeating-linear-gradient(
              0deg,
              transparent 0px, transparent 2px,
              rgba(0,217,255,0.035) 2px, rgba(0,217,255,0.035) 3px
            ),
            radial-gradient(circle at 50% 20%, rgba(0, 217, 255, 0.08), transparent 35%),
            linear-gradient(180deg, #050713 0%, #0B1024 100%);
          opacity: 0.9;
        }

        .vs-overlay {
          position: absolute; inset: 0; z-index: 2;
          background:
            repeating-linear-gradient(0deg, rgba(0, 217, 255, 0.025) 0px, rgba(0, 217, 255, 0.025) 1px, transparent 1px, transparent 10px),
            radial-gradient(ellipse at center, transparent 30%, rgba(3,4,11,0.72) 100%);
          opacity: 0.48;
          pointer-events: none;
        }

        /* ── Centering wrapper — fills the viewport, centers content ── */
        .vs-center {
          position: relative; z-index: 3;
          height: 100vh; width: 100%;
          display: flex; align-items: center; justify-content: center;
        }

        .vs-content {
          width: 100%;
          display: flex; flex-direction: column; align-items: center;
          gap: 1.2rem; padding: 0 1.25rem;
        }
        @media (min-width: 768px) { .vs-content { padding: 0 3vw; gap: 1.8rem; } }

        /* ── Eyebrow ── */
        .vs-eyebrow {
          font-family: var(--font-display); font-weight: 700;
          font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase;
          color: var(--accent); opacity: 0.06;
          will-change: opacity, transform;
        }

        /* ── Quote — multi-line ── */
        .vs-quote {
          font-family: var(--font-display); font-weight: 800;
          font-size: clamp(1.4rem, 3.6vw, 3.2rem);
          line-height: 1.15; letter-spacing: -0.02em;
          color: var(--white); text-align: center;
          max-width: 1400px; margin: 0 auto;
          display: flex; flex-direction: column; gap: 0.12em;
        }

        .vs-line { display: block; }

        .reveal-word {
          display: inline-block;
          margin-right: 0.28em;
          opacity: 0.10;
          filter: blur(8px);
          will-change: opacity, filter;
        }
        @media (max-width: 767px) {
          .reveal-word {
            opacity: 0.15;
            filter: blur(6px);
          }
          .vs-eyebrow {
            opacity: 0.08;
          }
        }
        .reveal-word[data-accent="true"] {
          background: var(--bt-gradient);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .reveal-word:last-child { margin-right: 0; }

        .vs-attrib {
          font-family: var(--font-display); font-weight: 700;
          font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase;
          color: var(--accent); opacity: 0;
          will-change: opacity, transform;
        }
      `}</style>
    </section>
  )
}
