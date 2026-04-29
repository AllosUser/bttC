import { useEffect, useRef } from 'react'
import { useGSAP } from '../hooks/useGSAP'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { splitText } from '../utils/splitText'

const QUOTE = "We don't just build software. We build the infrastructure of tomorrow."

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = (aPos + 1.0) * 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const FRAG = `
precision mediump float;
uniform float uTime;
uniform vec2 uRes;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0,0.0)), f.x),
    mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), f.x),
    f.y
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float t = uTime * 0.18;

  float n = noise(uv * 3.0 + t) * 0.5
          + noise(uv * 6.0 - t * 1.3) * 0.25
          + noise(uv * 12.0 + t * 0.7) * 0.125;

  float scanline = sin(uv.y * uRes.y * 0.5) * 0.04;
  float ca = sin(uTime * 0.3 + uv.x * 10.0) * 0.008;

  vec3 col = vec3(0.04 + n * 0.08 + scanline + ca);
  col += vec3(0.0, 0.02, 0.0) * n;
  col.rg += vec2(0.02, 0.06) * n * 0.5;

  gl_FragColor = vec4(col, 1.0);
}
`

function compile(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(sh)
    gl.deleteShader(sh)
    throw new Error('Shader compile failed: ' + info)
  }
  return sh
}

export default function VideoStrip() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const charsRef = useRef([])
  const reduced = useReducedMotion()

  // WebGL shader
  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
    if (!gl) return

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    const prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program link failed:', gl.getProgramInfoLog(prog))
      return
    }

    const aPos = gl.getAttribLocation(prog, 'aPos')
    const uTime = gl.getUniformLocation(prog, 'uTime')
    const uRes = gl.getUniformLocation(prog, 'uRes')

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )

    const dpr = Math.min(window.devicePixelRatio, 2)
    const setSize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    setSize()
    const onResize = () => setSize()
    window.addEventListener('resize', onResize)

    let rafId = 0
    const start = performance.now()
    const tick = () => {
      const t = (performance.now() - start) * 0.001
      gl.useProgram(prog)
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.enableVertexAttribArray(aPos)
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
      gl.uniform1f(uTime, t)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [reduced])

  // Parallax canvas + scroll-driven char reveal
  useGSAP(({ gsap, ScrollTrigger }) => {
    const section = sectionRef.current
    if (!section) return

    if (canvasRef.current) {
      gsap.to(canvasRef.current, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
    }

    const chars = charsRef.current.filter(Boolean)
    if (chars.length) {
      gsap.set(chars, { opacity: 0.08 })
      gsap.to(chars, {
        opacity: 1,
        stagger: 0.5,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 30%',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
    }
  }, [], sectionRef)

  const chars = splitText(QUOTE)

  return (
    <section ref={sectionRef} className="videostrip" aria-label="Mission statement">
      <canvas ref={canvasRef} className="videostrip__canvas" aria-hidden="true" />
      <div className="videostrip__overlay" aria-hidden="true" />

      <div className="videostrip__inner">
        <p className="videostrip__quote">
          {chars.map((c, i) => (
            <span
              key={i}
              ref={el => (charsRef.current[i] = el)}
              className="videostrip__char"
            >
              {c.isSpace ? ' ' : c.char}
            </span>
          ))}
        </p>
        <span className="videostrip__attrib">— BuildTomorrow</span>
      </div>

      <style>{`
        .videostrip {
          position: relative;
          width: 100vw;
          height: 90vh;
          min-height: 600px;
          overflow: hidden;
          background: var(--surface);
          border-top: 1px solid var(--dim);
          border-bottom: 1px solid var(--dim);
        }
        .videostrip__canvas {
          position: absolute;
          inset: -10% 0;
          width: 100% !important;
          height: 120% !important;
          z-index: 1;
          will-change: transform;
        }
        .videostrip__overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: radial-gradient(ellipse at center, transparent 30%, rgba(8, 8, 10, 0.6) 100%);
          pointer-events: none;
        }
        .videostrip__inner {
          position: relative;
          z-index: 3;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          padding: 0 5vw;
          text-align: center;
        }
        .videostrip__quote {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: clamp(2rem, 4vw, 3.5rem);
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: var(--white);
          max-width: 800px;
        }
        .videostrip__char {
          display: inline-block;
          will-change: opacity;
        }
        .videostrip__attrib {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.7rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--accent);
        }
      `}</style>
    </section>
  )
}
