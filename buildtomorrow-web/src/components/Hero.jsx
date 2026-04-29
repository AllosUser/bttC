import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { useReducedMotion } from '../hooks/useMediaQuery'

const TITLE_TEXT = 'We Build Digital Futures'
const TYPE_LINES = [
  'Crafting the digital infrastructure of tomorrow.',
  'Web · Mobile · Security · Systems',
]

/* ---------- Particle Field (elliptical ring + connecting lines) ---------- */
function ParticleField({ heroRef }) {
  const canvasRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    const heroEl = heroRef.current
    if (!canvas || !heroEl) return

    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width = W
    canvas.height = H

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true })
    renderer.setSize(W, H, false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
    cam.position.z = 280

    const COUNT = window.innerWidth < 768 ? 400 : 900
    const MAX_LINES = window.innerWidth < 768 ? 120 : 280
    const origPos = new Float32Array(COUNT * 3)
    const curPos = new Float32Array(COUNT * 3)
    const vel = new Float32Array(COUNT * 3)

    for (let i = 0; i < COUNT; i++) {
      const t = Math.random() * Math.PI * 2
      const r = 80 + Math.random() * 100
      const x = Math.cos(t) * r * 1.6 + (Math.random() - 0.5) * 80
      const y = Math.sin(t) * r * 0.9 + (Math.random() - 0.5) * 60
      const z = (Math.random() - 0.5) * 30
      origPos[i * 3] = curPos[i * 3] = x
      origPos[i * 3 + 1] = curPos[i * 3 + 1] = y
      origPos[i * 3 + 2] = curPos[i * 3 + 2] = z
    }

    const geo = new THREE.BufferGeometry()
    const posAttr = new THREE.BufferAttribute(curPos.slice(), 3)
    geo.setAttribute('position', posAttr)
    const mat = new THREE.PointsMaterial({
      size: 1.3,
      color: 0xc8f542,
      transparent: true,
      opacity: 0.65,
      sizeAttenuation: true,
    })
    const pts = new THREE.Points(geo, mat)
    scene.add(pts)

    // Line buffer sized to MAX_LINES, not COUNT*COUNT (saves ~19MB)
    const lineGeo = new THREE.BufferGeometry()
    const linePos = new Float32Array(MAX_LINES * 6)
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3))
    const lineSeg = new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({ color: 0xc8f542, transparent: true, opacity: 0.08 })
    )
    scene.add(lineSeg)
    const linePosArr = lineGeo.attributes.position.array

    let mouseX = 0
    let mouseY = 0
    const onMove = e => {
      const rect = canvas.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2
    }
    const onLeave = () => {
      mouseX = 0
      mouseY = 0
    }
    heroEl.addEventListener('mousemove', onMove)
    heroEl.addEventListener('mouseleave', onLeave)

    const REPEL_DIST = 80
    const REPEL_FORCE = 4.5
    const SPRING = 0.04
    const DAMP = 0.88
    let rafId = 0

    function animate() {
      rafId = requestAnimationFrame(animate)
      const fovTan = Math.tan((cam.fov * Math.PI / 180) / 2)
      const mwx = mouseX * cam.position.z * fovTan * cam.aspect
      const mwy = mouseY * cam.position.z * fovTan

      let lineCount = 0
      const pArr = posAttr.array
      for (let i = 0; i < COUNT; i++) {
        const ix = i * 3
        const iy = i * 3 + 1
        const iz = i * 3 + 2

        const dx = pArr[ix] - mwx
        const dy = pArr[iy] - mwy
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < REPEL_DIST && dist > 0.0001) {
          const f = (1 - dist / REPEL_DIST) * REPEL_FORCE
          vel[ix] += (dx / dist) * f
          vel[iy] += (dy / dist) * f
        }

        vel[ix] += (origPos[ix] - pArr[ix]) * SPRING
        vel[iy] += (origPos[iy] - pArr[iy]) * SPRING
        vel[iz] += (origPos[iz] - pArr[iz]) * SPRING
        vel[ix] *= DAMP
        vel[iy] *= DAMP
        vel[iz] *= DAMP
        pArr[ix] += vel[ix]
        pArr[iy] += vel[iy]
        pArr[iz] += vel[iz]

        if (lineCount < MAX_LINES) {
          for (let j = i + 1; j < COUNT && lineCount < MAX_LINES; j++) {
            const jx = j * 3
            const ddx = pArr[ix] - pArr[jx]
            const ddy = pArr[iy] - pArr[jx + 1]
            if (Math.abs(ddx) < 35 && Math.abs(ddy) < 35) {
              const dd = Math.sqrt(ddx * ddx + ddy * ddy)
              if (dd < 42) {
                const base = lineCount * 6
                linePosArr[base]     = pArr[ix]
                linePosArr[base + 1] = pArr[iy]
                linePosArr[base + 2] = pArr[iz]
                linePosArr[base + 3] = pArr[jx]
                linePosArr[base + 4] = pArr[jx + 1]
                linePosArr[base + 5] = pArr[jx + 2]
                lineCount++
              }
            }
          }
        }
      }
      posAttr.needsUpdate = true
      lineGeo.attributes.position.needsUpdate = true
      lineGeo.setDrawRange(0, lineCount * 2)
      pts.rotation.y += 0.0003
      renderer.render(scene, cam)
    }
    rafId = requestAnimationFrame(animate)

    const onResize = () => {
      W = window.innerWidth
      H = window.innerHeight
      cam.aspect = W / H
      cam.updateProjectionMatrix()
      renderer.setSize(W, H, false)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      heroEl.removeEventListener('mousemove', onMove)
      heroEl.removeEventListener('mouseleave', onLeave)
      geo.dispose()
      mat.dispose()
      lineGeo.dispose()
      lineSeg.material.dispose()
      renderer.dispose()
    }
  }, [reduced, heroRef])

  return <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />
}

/* ---------- Hero ---------- */
export default function Hero() {
  const heroRef = useRef(null)
  const titleRef = useRef(null)
  const eyebrowRef = useRef(null)
  const ctasRef = useRef(null)
  const subRef = useRef(null)
  const scrollIndRef = useRef(null)
  const liquidRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const reduced = useReducedMotion()

  // Scroll indicator fade
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Title char split + intro animations + typewriter
  useEffect(() => {
    const titleEl = titleRef.current
    const eyebrowEl = eyebrowRef.current
    const ctasEl = ctasRef.current
    const subEl = subRef.current
    if (!titleEl || !eyebrowEl || !ctasEl || !subEl) return

    if (reduced) {
      titleEl.textContent = TITLE_TEXT
      subEl.textContent = TYPE_LINES.join(' — ')
      eyebrowEl.style.opacity = 1
      ctasEl.style.opacity = 1
      return
    }

    // Build word-wrapped char spans (each word in nowrap span so words don't break)
    titleEl.textContent = ''
    const charNodes = []
    const words = TITLE_TEXT.split(/(\s+)/)
    words.forEach(w => {
      if (/^\s+$/.test(w)) {
        const sp = document.createElement('span')
        sp.className = 'space'
        titleEl.appendChild(sp)
        return
      }
      const wrap = document.createElement('span')
      wrap.style.cssText = 'display:inline-block;white-space:nowrap;'
      for (const ch of w) {
        const s = document.createElement('span')
        s.className = 'char'
        s.textContent = ch
        wrap.appendChild(s)
        charNodes.push(s)
      }
      titleEl.appendChild(wrap)
    })

    const tl = gsap.timeline({ delay: 0.3 })
    tl.to(eyebrowEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
    tl.to(charNodes, {
      opacity: 1,
      x: 0,
      y: 0,
      rotation: 0,
      duration: 0.7,
      ease: 'back.out(2)',
      stagger: { each: 0.03, from: 'random' },
      onStart() {
        charNodes.forEach(c => {
          gsap.set(c, {
            x: (Math.random() - 0.5) * window.innerWidth * 0.8,
            y: (Math.random() - 0.5) * window.innerHeight * 0.8,
            rotation: (Math.random() - 0.5) * 120,
            opacity: 0,
          })
        })
      },
    }, '-=0.2')
    tl.to(ctasEl, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })

    // Typewriter — two lines with switch + blinking cursor on second line
    let lineIdx = 0
    let charIdx = 0
    let cancelled = false
    let typeTimeout = null
    let switchTimeout = null
    let restartTimeout = null
    let blinkInterval = null

    const startTypewriter = () => {
      const tick = () => {
        if (cancelled) return
        if (charIdx < TYPE_LINES[lineIdx].length) {
          subEl.textContent = TYPE_LINES[lineIdx].slice(0, ++charIdx) + '|'
          typeTimeout = setTimeout(tick, 40)
        } else {
          subEl.textContent = TYPE_LINES[lineIdx] + '|'
          if (lineIdx === 0) {
            switchTimeout = setTimeout(() => {
              if (cancelled) return
              subEl.textContent = TYPE_LINES[lineIdx]
              lineIdx++
              charIdx = 0
              restartTimeout = setTimeout(tick, 800)
            }, 1400)
          } else {
            blinkInterval = setInterval(() => {
              if (cancelled) return
              subEl.textContent = subEl.textContent.endsWith('|')
                ? subEl.textContent.slice(0, -1)
                : subEl.textContent + '|'
            }, 600)
          }
        }
      }
      tick()
    }
    tl.add(() => startTypewriter(), '-=0.4')

    return () => {
      cancelled = true
      tl.kill()
      clearTimeout(typeTimeout)
      clearTimeout(switchTimeout)
      clearTimeout(restartTimeout)
      clearInterval(blinkInterval)
    }
  }, [reduced])

  // Secondary button liquid-ripple
  const handleSecondaryClick = e => {
    if (reduced) return
    const btn = e.currentTarget
    const liq = liquidRef.current
    if (!liq) return
    const rect = btn.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2.2
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    Object.assign(liq.style, {
      width: `${size}px`,
      height: `${size}px`,
      left: `${x}px`,
      top: `${y}px`,
      transform: 'scale(0)',
      opacity: '1',
    })
    requestAnimationFrame(() => {
      liq.style.transform = 'scale(1)'
      liq.style.opacity = '0'
    })
  }

  return (
    <section id="top" ref={heroRef} className="hero">
      <ParticleField heroRef={heroRef} />

      <div className="hero-content">
        <p ref={eyebrowRef} className="hero-eyebrow">Cyprus · Digital Excellence</p>
        <h1 ref={titleRef} className="hero-title">{TITLE_TEXT}</h1>
        <p ref={subRef} className="hero-sub" />
        <div ref={ctasRef} className="hero-ctas">
          <button className="btn-primary" type="button">
            <span className="btn-glow" aria-hidden="true" />
            Start Building
          </button>
          <button className="btn-secondary" type="button" onClick={handleSecondaryClick}>
            <span ref={liquidRef} className="btn-liquid" aria-hidden="true" />
            View Our Work
          </button>
        </div>
      </div>

      <div ref={scrollIndRef} className={`scroll-ind ${scrolled ? 'is-faded' : ''}`} aria-hidden="true">
        <span className="scroll-ind-text">Scroll</span>
        <div className="scroll-ind-line" />
      </div>

      <style>{`
        .hero {
          --hero-lime: #c8f542;
          --hero-teal: #f5e942;
          position: relative;
          width: 100vw;
          height: 100vh;
          min-height: 720px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--black);
        }
        .hero-canvas {
          position: absolute;
          inset: 0;
          width: 100% !important;
          height: 100% !important;
        }
        .hero-content {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 1000px;
          padding: 0 32px;
        }
        .hero-eyebrow {
          font-size: 11px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--hero-lime);
          margin-bottom: 36px;
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }
        .hero-eyebrow::before,
        .hero-eyebrow::after {
          content: '';
          display: block;
          width: 40px;
          height: 1px;
          background: rgba(200, 245, 66, 0.35);
        }
        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(64px, 10vw, 130px);
          font-weight: 800;
          line-height: 0.9;
          letter-spacing: -0.04em;
          margin-bottom: 36px;
          color: var(--white);
          overflow: visible;
        }
        .hero-title :global(.char),
        .hero-title .char {
          display: inline-block;
          opacity: 0;
          will-change: transform;
        }
        .hero-title :global(.space),
        .hero-title .space {
          display: inline-block;
          width: 0.28em;
        }
        .hero-sub {
          font-size: clamp(15px, 1.8vw, 20px);
          color: rgba(240, 237, 232, 0.38);
          font-weight: 300;
          margin-bottom: 52px;
          min-height: 1.6em;
          letter-spacing: 0.02em;
        }
        .hero-ctas {
          display: flex;
          gap: 16px;
          justify-content: center;
          align-items: center;
          opacity: 0;
          flex-wrap: wrap;
        }

        .btn-primary {
          position: relative;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--black);
          background: var(--hero-lime);
          padding: 17px 44px;
          border: none;
          border-radius: 2px;
          overflow: hidden;
          font-weight: 400;
          transition: filter 0.3s, transform 0.2s;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3), transparent 70%);
          opacity: 0;
          transition: opacity 0.4s;
          pointer-events: none;
        }
        .btn-primary:hover::before { opacity: 1; }

        .btn-glow {
          position: absolute;
          inset: -6px;
          border-radius: 4px;
          border: 1px solid rgba(200, 245, 66, 0);
          animation: heroBtnPulse 2.5s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes heroBtnPulse {
          0%, 100% { inset: -6px; border-color: rgba(200, 245, 66, 0); }
          50%      { inset: -12px; border-color: rgba(200, 245, 66, 0.35); }
        }

        .btn-secondary {
          position: relative;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--white);
          background: transparent;
          padding: 17px 44px;
          border: 1px solid rgba(240, 237, 232, 0.18);
          border-radius: 2px;
          overflow: hidden;
          font-weight: 300;
          transition: border-color 0.3s, color 0.3s;
        }
        .btn-secondary:hover {
          border-color: var(--hero-teal);
          color: var(--hero-teal);
        }
        .btn-liquid {
          position: absolute;
          border-radius: 50%;
          background: rgba(66, 245, 176, 0.12);
          transform: scale(0);
          transition: transform 0.7s ease, opacity 0.7s ease;
          pointer-events: none;
        }

        .scroll-ind {
          position: absolute;
          bottom: 36px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          z-index: 10;
          opacity: 1;
          transition: opacity 0.4s ease;
        }
        .scroll-ind.is-faded { opacity: 0; }
        .scroll-ind-text {
          font-size: 9px;
          letter-spacing: 0.32em;
          color: rgba(240, 237, 232, 0.38);
          writing-mode: vertical-lr;
          transform: rotate(180deg);
          text-transform: uppercase;
        }
        .scroll-ind-line {
          width: 1px;
          height: 56px;
          background: linear-gradient(to bottom, rgba(200, 245, 66, 0.7), transparent);
          animation: heroIndPulse 2s ease-in-out infinite;
        }
        @keyframes heroIndPulse {
          0%, 100% {
            transform: scaleY(0.6);
            transform-origin: top;
            opacity: 0.4;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        /* ── Mobile Responsive ── */
        @media (max-width: 768px) {
          .hero {
            min-height: 100svh;
          }
          .hero-content {
            padding: 0 20px;
            max-width: 100%;
          }
          .hero-eyebrow {
            font-size: 9px;
            letter-spacing: 0.22em;
            margin-bottom: 24px;
            gap: 10px;
          }
          .hero-eyebrow::before,
          .hero-eyebrow::after {
            width: 24px;
          }
          .hero-title {
            font-size: clamp(40px, 13vw, 64px);
            line-height: 0.92;
            margin-bottom: 24px;
            letter-spacing: -0.03em;
          }
          .hero-sub {
            font-size: clamp(13px, 3.8vw, 16px);
            margin-bottom: 36px;
            padding: 0 8px;
          }
          .hero-ctas {
            flex-direction: column;
            gap: 12px;
            width: 100%;
            padding: 0 12px;
          }
          .btn-primary,
          .btn-secondary {
            width: 100%;
            max-width: 320px;
            padding: 16px 32px;
            font-size: 12px;
          }
          .scroll-ind {
            bottom: 20px;
          }
          .scroll-ind-line {
            height: 36px;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: clamp(36px, 12vw, 48px);
          }
          .hero-eyebrow {
            font-size: 8px;
            letter-spacing: 0.18em;
            margin-bottom: 20px;
          }
          .hero-sub {
            font-size: 13px;
          }
        }

        /* Fix for small-height viewports (landscape phones) */
        @media (max-height: 600px) {
          .hero {
            min-height: 100svh;
          }
          .hero-content {
            padding-top: 60px;
          }
          .hero-eyebrow {
            margin-bottom: 16px;
          }
          .hero-title {
            margin-bottom: 16px;
            font-size: clamp(32px, 7vw, 56px);
          }
          .hero-sub {
            margin-bottom: 24px;
          }
          .scroll-ind {
            display: none;
          }
        }
      `}</style>
    </section>
  )
}
