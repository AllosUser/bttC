import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { useReducedMotion } from '../hooks/useMediaQuery'

const TITLE_TEXT = 'We Build Digital Futures'
const TYPE_LINES = [
  'Crafting the digital infrastructure of tomorrow.',
  'Web · Mobile · Security · Systems',
]

/* ---------- CSS gradient fallback for low-end mobile ---------- */
function GradientFallback() {
  return (
    <div className="hero-gradient-bg" aria-hidden="true" />
  )
}

/* ---------- Particle Field ---------- */
function ParticleField({ heroRef }) {
  const canvasRef = useRef(null)
  const reduced   = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    const heroEl = heroRef.current
    if (!canvas || !heroEl) return

    // Low-end device check — skip WebGL
    const lowEnd = (navigator.hardwareConcurrency ?? 4) <= 2
    if (lowEnd) return

    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width  = W
    canvas.height = H

    const isMobile = W < 768
    const dpr      = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true })
    renderer.setSize(W, H, false)
    renderer.setPixelRatio(dpr)
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()
    const cam   = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
    cam.position.z = 280

    const COUNT     = isMobile ? 300 : 900
    const MAX_LINES = isMobile ? 80  : 280

    const origPos = new Float32Array(COUNT * 3)
    const curPos  = new Float32Array(COUNT * 3)
    const vel     = new Float32Array(COUNT * 3)

    // Particles scaled down on mobile so ring fits small viewport
    const scale = isMobile ? 0.6 : 1.0
    for (let i = 0; i < COUNT; i++) {
      const t = Math.random() * Math.PI * 2
      const r = (80 + Math.random() * 100) * scale
      const x = Math.cos(t) * r * 1.6 * scale + (Math.random() - 0.5) * 80 * scale
      const y = Math.sin(t) * r * 0.9 * scale + (Math.random() - 0.5) * 60 * scale
      const z = (Math.random() - 0.5) * 30
      origPos[i * 3] = curPos[i * 3] = x
      origPos[i * 3 + 1] = curPos[i * 3 + 1] = y
      origPos[i * 3 + 2] = curPos[i * 3 + 2] = z
    }

    const geo     = new THREE.BufferGeometry()
    const posAttr = new THREE.BufferAttribute(curPos.slice(), 3)
    geo.setAttribute('position', posAttr)

    const mat = new THREE.PointsMaterial({ size: isMobile ? 1.0 : 1.3, color: 0xc8f542, transparent: true, opacity: 0.65, sizeAttenuation: true })
    const pts = new THREE.Points(geo, mat)
    scene.add(pts)

    const lineGeo    = new THREE.BufferGeometry()
    const lineBuf    = new Float32Array(MAX_LINES * 6)
    lineGeo.setAttribute('position', new THREE.BufferAttribute(lineBuf, 3))
    const lineSeg    = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0xc8f542, transparent: true, opacity: 0.08 }))
    scene.add(lineSeg)
    const linePosArr = lineGeo.attributes.position.array

    let mouseX = 0, mouseY = 0
    const onMove = e => {
      const rect = canvas.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2
      mouseY = -((e.clientY - rect.top)  / rect.height - 0.5) * 2
    }
    const onLeave = () => { mouseX = 0; mouseY = 0 }
    // Touch: no mouse interaction on mobile
    if (!isMobile) {
      heroEl.addEventListener('mousemove', onMove)
      heroEl.addEventListener('mouseleave', onLeave)
    }

    const REPEL_DIST = 80 * scale, REPEL_FORCE = 4.5, SPRING = 0.04, DAMP = 0.88
    let rafId = 0
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      const fovTan = Math.tan((cam.fov * Math.PI / 180) / 2)
      const mwx = mouseX * cam.position.z * fovTan * cam.aspect
      const mwy = mouseY * cam.position.z * fovTan
      let lineCount = 0
      const pArr = posAttr.array
      for (let i = 0; i < COUNT; i++) {
        const ix = i * 3, iy = ix + 1, iz = ix + 2
        const dx = pArr[ix] - mwx, dy = pArr[iy] - mwy
        const d  = Math.sqrt(dx * dx + dy * dy)
        if (d < REPEL_DIST && d > 0.0001) {
          const f = (1 - d / REPEL_DIST) * REPEL_FORCE
          vel[ix] += (dx / d) * f; vel[iy] += (dy / d) * f
        }
        vel[ix] += (origPos[ix] - pArr[ix]) * SPRING
        vel[iy] += (origPos[iy] - pArr[iy]) * SPRING
        vel[iz] += (origPos[iz] - pArr[iz]) * SPRING
        vel[ix] *= DAMP; vel[iy] *= DAMP; vel[iz] *= DAMP
        pArr[ix] += vel[ix]; pArr[iy] += vel[iy]; pArr[iz] += vel[iz]
        if (lineCount < MAX_LINES) {
          for (let j = i + 1; j < COUNT && lineCount < MAX_LINES; j++) {
            const jx = j * 3
            const ddx = pArr[ix] - pArr[jx], ddy = pArr[iy] - pArr[jx + 1]
            if (Math.abs(ddx) < 35 && Math.abs(ddy) < 35 && Math.sqrt(ddx*ddx+ddy*ddy) < 42) {
              const b = lineCount * 6
              linePosArr[b]=pArr[ix]; linePosArr[b+1]=pArr[iy]; linePosArr[b+2]=pArr[iz]
              linePosArr[b+3]=pArr[jx]; linePosArr[b+4]=pArr[jx+1]; linePosArr[b+5]=pArr[jx+2]
              lineCount++
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
      W = window.innerWidth; H = window.innerHeight
      cam.aspect = W / H; cam.updateProjectionMatrix()
      renderer.setSize(W, H, false)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      if (!isMobile) { heroEl.removeEventListener('mousemove', onMove); heroEl.removeEventListener('mouseleave', onLeave) }
      geo.dispose(); mat.dispose(); lineGeo.dispose(); lineSeg.material.dispose(); renderer.dispose()
    }
  }, [reduced, heroRef])

  return <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />
}

/* ---------- Hero ---------- */
export default function Hero() {
  const heroRef    = useRef(null)
  const titleRef   = useRef(null)
  const eyebrowRef = useRef(null)
  const ctasRef    = useRef(null)
  const subRef     = useRef(null)
  const liquidRef  = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const reduced  = useReducedMotion()
  const isLowEnd = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency ?? 4) <= 2
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const titleEl   = titleRef.current
    const eyebrowEl = eyebrowRef.current
    const ctasEl    = ctasRef.current
    const subEl     = subRef.current
    if (!titleEl || !eyebrowEl || !ctasEl || !subEl) return

    if (reduced) {
      titleEl.textContent  = TITLE_TEXT
      subEl.textContent    = TYPE_LINES.join(' — ')
      eyebrowEl.style.opacity = '1'
      ctasEl.style.opacity    = '1'
      return
    }

    const mobile = window.innerWidth < 768
    // Max offsets scaled down on mobile
    const maxX = mobile ? 150 : 400
    const maxY = mobile ? 100 : 300
    const charDelay = mobile ? 0.025 : 0.04

    titleEl.textContent = ''
    const charNodes = []
    TITLE_TEXT.split(/(\s+)/).forEach(token => {
      if (/^\s+$/.test(token)) {
        const sp = document.createElement('span'); sp.className = 'hero-space'; titleEl.appendChild(sp); return
      }
      const wrap = document.createElement('span')
      wrap.style.cssText = 'display:inline-block;white-space:nowrap;'
      for (const ch of token) {
        const s = document.createElement('span'); s.className = 'hero-char'; s.textContent = ch
        wrap.appendChild(s); charNodes.push(s)
      }
      titleEl.appendChild(wrap)
    })

    const tl = gsap.timeline({ delay: 0.3 })
    tl.to(eyebrowEl, { opacity: 1, duration: 0.6, ease: 'power3.out' })
    tl.to(charNodes, {
      opacity: 1, x: 0, y: 0, rotation: 0,
      duration: 0.7, ease: 'back.out(2)',
      stagger: { each: charDelay, from: 'random' },
      onStart() {
        charNodes.forEach(c => gsap.set(c, {
          x:        (Math.random() - 0.5) * maxX * 2,
          y:        (Math.random() - 0.5) * maxY * 2,
          rotation: (Math.random() - 0.5) * (mobile ? 60 : 120),
          opacity:  0,
        }))
      },
    }, '-=0.2')
    tl.to(ctasEl, { opacity: 1, duration: 0.5, ease: 'power2.out' })

    let cancelled = false, lineIdx = 0, charIdx = 0
    let typeTO = null, switchTO = null, restartTO = null, blinkIV = null
    const typeStep = () => {
      if (cancelled) return
      if (charIdx < TYPE_LINES[lineIdx].length) {
        subEl.textContent = TYPE_LINES[lineIdx].slice(0, ++charIdx) + '|'
        typeTO = setTimeout(typeStep, 40)
      } else {
        subEl.textContent = TYPE_LINES[lineIdx] + '|'
        if (lineIdx === 0) {
          switchTO = setTimeout(() => {
            if (cancelled) return
            subEl.textContent = TYPE_LINES[lineIdx]; lineIdx++; charIdx = 0
            restartTO = setTimeout(typeStep, 800)
          }, 1400)
        } else {
          blinkIV = setInterval(() => {
            if (cancelled) return
            subEl.textContent = subEl.textContent.endsWith('|') ? subEl.textContent.slice(0,-1) : subEl.textContent+'|'
          }, 600)
        }
      }
    }
    tl.add(() => typeStep(), '-=0.4')

    return () => {
      cancelled = true; tl.kill()
      clearTimeout(typeTO); clearTimeout(switchTO); clearTimeout(restartTO); clearInterval(blinkIV)
    }
  }, [reduced])

  const handleSecondaryClick = e => {
    if (reduced) return
    const btn = e.currentTarget, liq = liquidRef.current
    if (!liq) return
    const rect = btn.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2.2
    Object.assign(liq.style, { width:`${size}px`, height:`${size}px`, left:`${e.clientX-rect.left-size/2}px`, top:`${e.clientY-rect.top-size/2}px`, transform:'scale(0)', opacity:'1' })
    requestAnimationFrame(() => { liq.style.transform='scale(1)'; liq.style.opacity='0' })
  }

  return (
    <section id="top" ref={heroRef} className="hero">
      {/* Low-end mobile: CSS gradient instead of Three.js */}
      {isLowEnd ? <GradientFallback /> : <ParticleField heroRef={heroRef} />}

      <div className="hero-content">
        <p ref={eyebrowRef} className="hero-eyebrow">Cyprus · Digital Excellence</p>
        <h1 ref={titleRef}  className="hero-title"  aria-label={TITLE_TEXT} />
        <p  ref={subRef}    className="hero-sub" />
        <div ref={ctasRef} className="hero-ctas">
          <button className="hero-btn-primary" type="button">
            <span className="hero-btn-glow" aria-hidden="true" />
            Start Building
          </button>
          <button className="hero-btn-secondary" type="button" onClick={handleSecondaryClick}>
            <span ref={liquidRef} className="hero-btn-liquid" aria-hidden="true" />
            View Our Work
          </button>
        </div>
      </div>

      {/* Scroll indicator — hide on mobile */}
      <div className={`hero-scroll-ind ${scrolled ? 'is-faded' : ''}`} aria-hidden="true">
        <span className="hero-scroll-text">Scroll</span>
        <div className="hero-scroll-line" />
      </div>

      <style>{`
        .hero {
          position: relative;
          width: 100vw;
          height: 100vh;
          min-height: 600px;
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
        /* Low-end fallback gradient */
        .hero-gradient-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 60%, rgba(200,245,66,0.06) 0%, transparent 70%),
            var(--black);
        }

        /* ── Content ── */
        .hero-content {
          position: relative;
          z-index: 10;
          text-align: center;
          width: 100%;
          padding: 0 1.25rem 4rem;
        }
        @media (min-width: 768px) {
          .hero-content { max-width: 1000px; padding: 0 2rem 4rem; }
        }

        /* ── Eyebrow ── */
        .hero-eyebrow {
          font-size: 10px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #c8f542;
          margin-bottom: 28px;
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        @media (min-width: 768px) {
          .hero-eyebrow { font-size: 11px; letter-spacing: 0.32em; margin-bottom: 36px; gap: 16px; }
        }
        .hero-eyebrow::before, .hero-eyebrow::after {
          content: ''; display: block; width: 28px; height: 1px;
          background: rgba(200,245,66,0.35); flex-shrink: 0;
        }
        @media (min-width: 768px) {
          .hero-eyebrow::before, .hero-eyebrow::after { width: 40px; }
        }

        /* ── Title ── */
        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.8rem, 11vw, 4rem);
          font-weight: 800;
          line-height: 0.95;
          letter-spacing: -0.04em;
          color: var(--white);
          margin-bottom: 24px;
          overflow: visible;
          min-height: 0.95em;
        }
        @media (min-width: 768px) {
          .hero-title { font-size: clamp(4rem, 10vw, 9rem); line-height: 0.9; margin-bottom: 36px; }
        }
        .hero-char  { display: inline-block; opacity: 0; will-change: transform, opacity; }
        .hero-space { display: inline-block; width: 0.28em; }

        /* ── Sub ── */
        .hero-sub {
          font-size: 0.9rem;
          color: rgba(240,237,232,0.38);
          font-weight: 300;
          margin-bottom: 36px;
          min-height: 1.5em;
          letter-spacing: 0.02em;
          max-width: 100%;
        }
        @media (min-width: 768px) {
          .hero-sub { font-size: clamp(15px, 1.8vw, 20px); margin-bottom: 52px; max-width: 600px; margin-inline: auto; }
        }

        /* ── CTAs ── */
        .hero-ctas {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: center;
          opacity: 0;
          width: 100%;
        }
        @media (min-width: 600px) {
          .hero-ctas { flex-direction: row; justify-content: center; gap: 1rem; width: auto; }
        }

        /* Primary button */
        .hero-btn-primary {
          position: relative;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #08080a;
          background: #c8f542;
          padding: 17px 44px;
          border: none;
          border-radius: 2px;
          font-weight: 400;
          overflow: hidden;
          transition: filter 0.3s;
          width: 100%;
          min-height: 52px;
        }
        @media (min-width: 600px) {
          .hero-btn-primary { width: auto; }
        }
        .hero-btn-primary::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3), transparent 70%);
          opacity: 0; transition: opacity 0.4s; pointer-events: none;
        }
        .hero-btn-primary:hover::before { opacity: 1; }
        .hero-btn-glow {
          position: absolute; inset: -6px; border-radius: 4px;
          border: 1px solid rgba(200,245,66,0);
          animation: heroBtnPulse 2.5s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes heroBtnPulse {
          0%,100% { inset: -6px; border-color: rgba(200,245,66,0); }
          50%     { inset: -12px; border-color: rgba(200,245,66,0.35); }
        }

        /* Secondary button */
        .hero-btn-secondary {
          position: relative;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--white);
          background: transparent;
          padding: 17px 44px;
          border: 1px solid rgba(240,237,232,0.18);
          border-radius: 2px;
          font-weight: 300;
          overflow: hidden;
          transition: border-color 0.3s, color 0.3s;
          width: 100%;
          min-height: 52px;
        }
        @media (min-width: 600px) {
          .hero-btn-secondary { width: auto; }
        }
        .hero-btn-secondary:hover { border-color: #f5e942; color: #f5e942; }
        .hero-btn-liquid {
          position: absolute; border-radius: 50%;
          background: rgba(66,245,176,0.12);
          transform: scale(0); transition: transform 0.7s ease, opacity 0.7s ease;
          pointer-events: none;
        }

        /* ── Scroll indicator — hidden on mobile ── */
        .hero-scroll-ind {
          display: none;
        }
        @media (min-width: 768px) {
          .hero-scroll-ind {
            display: flex;
            position: absolute; bottom: 36px; left: 50%;
            transform: translateX(-50%);
            flex-direction: column; align-items: center; gap: 10px;
            z-index: 10; opacity: 1; transition: opacity 0.4s ease;
          }
          .hero-scroll-ind.is-faded { opacity: 0; }
        }
        .hero-scroll-text {
          font-size: 9px; letter-spacing: 0.32em; text-transform: uppercase;
          color: rgba(240,237,232,0.38); writing-mode: vertical-lr; transform: rotate(180deg);
        }
        .hero-scroll-line {
          width: 1px; height: 56px;
          background: linear-gradient(to bottom, rgba(200,245,66,0.7), transparent);
          animation: heroIndPulse 2s ease-in-out infinite;
        }
        @keyframes heroIndPulse {
          0%,100% { transform: scaleY(0.6); transform-origin: top; opacity: 0.4; }
          50%     { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </section>
  )
}
