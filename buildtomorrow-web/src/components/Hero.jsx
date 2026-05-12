import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { useReducedMotion } from '../hooks/useMediaQuery'

const TITLE_TEXT = 'We Build Digital Futures'
const TYPE_LINES = [
  'Web · AI · Systems · Security',
  'Secure platforms built to scale',
  'AI-powered systems for modern teams',
  'Engineering digital infrastructure',
  'Designed in Cyprus. Built for tomorrow.',
]

/* ---------- CSS gradient fallback for low-end / reduced-motion ---------- */
function GradientFallback() {
  return <div className="hero-gradient-bg" aria-hidden="true" />
}

/* ---------- Magnetic Particle Field ---------- */
function ParticleField({ heroRef }) {
  const canvasRef = useRef(null)
  const reduced   = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    const heroEl = heroRef.current
    if (!canvas || !heroEl) return

    const lowEnd = (navigator.hardwareConcurrency ?? 4) <= 2
    if (lowEnd) return

    // ── Sizing ──────────────────────────────────────────────
    let W = canvas.clientWidth  || window.innerWidth
    let H = canvas.clientHeight || window.innerHeight
    const isMobile = W < 768
    const dpr = Math.min(window.devicePixelRatio, 1.75)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setSize(W, H, false)
    renderer.setPixelRatio(dpr)
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()

    // Orthographic camera so world units map cleanly to pixels
    let viewH = 720
    let viewW = viewH * (W / H)
    const cam = new THREE.OrthographicCamera(-viewW/2, viewW/2, viewH/2, -viewH/2, -1000, 1000)
    cam.position.z = 10

    // ── Particle counts ──────────────────────────────────────
    const COUNT      = isMobile ? 380 : 1000
    const MAX_BOLTS  = isMobile ? 5   : 12
    const SEGS       = 14
    const BOLT_VERTS = MAX_BOLTS * SEGS * 2

    // ── Particle data arrays ─────────────────────────────────
    const home     = new Float32Array(COUNT * 2)
    const pos      = new Float32Array(COUNT * 3)
    const vel      = new Float32Array(COUNT * 2)
    const sizes    = new Float32Array(COUNT)
    const aSize    = new Float32Array(COUNT)
    const aGlow    = new Float32Array(COUNT)
    const aOpac    = new Float32Array(COUNT)
    const colorMix = new Float32Array(COUNT)
    const seedN    = new Float32Array(COUNT)
    const driftR   = new Float32Array(COUNT)  // per-particle drift radius (world units)
    const driftS   = new Float32Array(COUNT)  // per-particle drift speed  (rad/s)

    function distribute() {
      const w = viewW * 1.18, h = viewH * 1.18
      for (let i = 0; i < COUNT; i++) {
        const hx = (Math.random() - 0.5) * w
        const hy = (Math.random() - 0.5) * h
        home[i*2] = hx; home[i*2+1] = hy
        pos[i*3]  = hx; pos[i*3+1]  = hy; pos[i*3+2] = 0
        vel[i*2]  = 0;  vel[i*2+1]  = 0
        sizes[i]  = 1.3 + Math.pow(Math.random(), 2.4) * 4.0
        aOpac[i]  = 0.35 + Math.random() * 0.40
        colorMix[i] = Math.random() < 0.30 ? 1 : 0
        seedN[i]  = Math.random() * 1000
        driftR[i] = 15 + Math.random() * 30   // 15–45 world units  (~22–67 px at 1080p)
        driftS[i] = 0.10 + Math.random() * 0.22  // 0.10–0.32 rad/s  (≈ 20–63 s per cycle)
      }
    }
    distribute()

    // ── Particle geometry + custom shader ────────────────────
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos,      3))
    geo.setAttribute('aSize',    new THREE.BufferAttribute(aSize,    1))
    geo.setAttribute('aGlow',    new THREE.BufferAttribute(aGlow,    1))
    geo.setAttribute('aOpac',    new THREE.BufferAttribute(aOpac,    1))
    geo.setAttribute('aColorMix',new THREE.BufferAttribute(colorMix, 1))

    // Brand colours: bt-cyan #00D9FF, bt-green #00E39A, hot bright #87FFFF
    const ptVert = `
      attribute float aSize;
      attribute float aGlow;
      attribute float aOpac;
      attribute float aColorMix;
      varying float vGlow;
      varying float vOpac;
      varying float vColorMix;
      uniform float uPixelRatio;
      uniform float uViewH;
      void main(){
        vGlow = aGlow;
        vOpac = aOpac;
        vColorMix = aColorMix;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uPixelRatio * (700.0 / uViewH);
        gl_Position = projectionMatrix * mv;
      }
    `
    const ptFrag = `
      precision mediump float;
      uniform vec3 uCyan;
      uniform vec3 uGreen;
      uniform vec3 uHot;
      varying float vGlow;
      varying float vOpac;
      varying float vColorMix;
      void main(){
        vec2 c = gl_PointCoord - vec2(0.5);
        float d = length(c) * 2.0;
        if(d > 1.0) discard;
        float disc = smoothstep(1.0, 0.65, d);
        float halo = smoothstep(1.0, 0.0, d) * (0.3 + vGlow * 1.4);
        vec3 col = mix(uCyan, uGreen, vColorMix);
        col = mix(col, uHot, vGlow * 0.7);
        float a = (disc + halo * 0.55) * vOpac * (0.85 + vGlow * 0.55);
        gl_FragColor = vec4(col, a);
      }
    `
    const ptMat = new THREE.ShaderMaterial({
      vertexShader: ptVert,
      fragmentShader: ptFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uCyan:       { value: new THREE.Color(0x00D9FF) },
        uGreen:      { value: new THREE.Color(0x00E39A) },
        uHot:        { value: new THREE.Color(0x87FFFF) },
        uPixelRatio: { value: dpr },
        uViewH:      { value: viewH },
      },
    })
    const points = new THREE.Points(geo, ptMat)
    scene.add(points)

    // ── Electric bolt arcs ───────────────────────────────────
    const boltPos   = new Float32Array(BOLT_VERTS * 3)
    const boltAlpha = new Float32Array(BOLT_VERTS)
    const boltGeo   = new THREE.BufferGeometry()
    boltGeo.setAttribute('position', new THREE.BufferAttribute(boltPos,   3))
    boltGeo.setAttribute('aAlpha',   new THREE.BufferAttribute(boltAlpha, 1))
    const boltMat = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float aAlpha;
        varying float vAlpha;
        void main(){
          vAlpha = aAlpha;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        varying float vAlpha;
        uniform vec3 uColor;
        void main(){
          gl_FragColor = vec4(uColor, vAlpha);
        }
      `,
      uniforms: { uColor: { value: new THREE.Color(0x00EEFF) } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const boltLines = new THREE.LineSegments(boltGeo, boltMat)
    scene.add(boltLines)

    // ── Pointer halo glow ────────────────────────────────────
    const haloArr = new Float32Array([0, 0, 0])
    const haloGeo = new THREE.BufferGeometry()
    haloGeo.setAttribute('position', new THREE.BufferAttribute(haloArr, 3))
    const haloMat = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uSize;
        uniform float uPixelRatio;
        uniform float uViewH;
        void main(){
          gl_PointSize = uSize * uPixelRatio * (700.0 / uViewH);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform vec3 uColor;
        uniform float uActive;
        void main(){
          vec2 c = gl_PointCoord - vec2(0.5);
          float d = length(c) * 2.0;
          if(d > 1.0) discard;
          float core = smoothstep(0.18, 0.0, d);
          float ring = smoothstep(1.0, 0.0, d) * 0.65;
          gl_FragColor = vec4(uColor, (core + ring * 0.55) * uActive);
        }
      `,
      uniforms: {
        uColor:      { value: new THREE.Color(0x00D9FF) },
        uSize:       { value: 90 },
        uActive:     { value: 0 },
        uPixelRatio: { value: dpr },
        uViewH:      { value: viewH },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const haloPoint = new THREE.Points(haloGeo, haloMat)
    scene.add(haloPoint)

    // ── Pointer state ────────────────────────────────────────
    const ptr = { x: 0, y: 0, tx: 0, ty: 0, active: 0, tActive: 0 }

    function setPointerFromEvent(cx, cy) {
      const rect = canvas.getBoundingClientRect()
      const nx = (cx - rect.left) / rect.width
      const ny = (cy - rect.top)  / rect.height
      ptr.tx = (nx - 0.5) * viewW
      ptr.ty = (0.5 - ny) * viewH
    }

    const onMouseMove  = e => { setPointerFromEvent(e.clientX, e.clientY); ptr.tActive = 1 }
    const onMouseLeave = () => { ptr.tActive = 0 }
    const onTouchStart = e => {
      const t = e.touches[0]; if (!t) return
      setPointerFromEvent(t.clientX, t.clientY)
      ptr.x = ptr.tx; ptr.y = ptr.ty
      ptr.tActive = 1
    }
    const onTouchMove = e => {
      const t = e.touches[0]; if (!t) return
      setPointerFromEvent(t.clientX, t.clientY)
    }
    const onTouchEnd = () => { ptr.tActive = 0 }

    heroEl.addEventListener('mousemove',   onMouseMove)
    heroEl.addEventListener('mouseleave',  onMouseLeave)
    heroEl.addEventListener('touchstart',  onTouchStart,  { passive: true })
    heroEl.addEventListener('touchmove',   onTouchMove,   { passive: true })
    heroEl.addEventListener('touchend',    onTouchEnd,    { passive: true })
    heroEl.addEventListener('touchcancel', onTouchEnd,    { passive: true })

    // ── Bolt helpers ─────────────────────────────────────────
    function jaggedBolt(bIdx, x1, y1, x2, y2, intensity) {
      const dx = x2 - x1, dy = y2 - y1
      const len = Math.sqrt(dx*dx + dy*dy)
      if (len < 1) { clearBolt(bIdx); return }
      const nx = -dy / len, ny = dx / len
      const pts = new Array(SEGS + 1)
      pts[0] = [x1, y1]; pts[SEGS] = [x2, y2]
      const maxJitter = Math.min(len * 0.20, 26)
      for (let i = 1; i < SEGS; i++) {
        const t = i / SEGS
        const taper = Math.sin(t * Math.PI)
        const j = (Math.random() - 0.5) * 2 * maxJitter * taper
        pts[i] = [x1 + dx * t + nx * j, y1 + dy * t + ny * j]
      }
      for (let s = 0; s < SEGS; s++) {
        const base  = (bIdx * SEGS + s) * 6
        const aBase = (bIdx * SEGS + s) * 2
        const p1 = pts[s], p2 = pts[s+1]
        boltPos[base]   = p1[0]; boltPos[base+1] = p1[1]; boltPos[base+2] = 0
        boltPos[base+3] = p2[0]; boltPos[base+4] = p2[1]; boltPos[base+5] = 0
        const alpha = intensity * (1 - s / SEGS) * 0.95 + intensity * 0.20
        boltAlpha[aBase] = boltAlpha[aBase+1] = alpha
      }
    }
    function clearBolt(bIdx) {
      for (let s = 0; s < SEGS; s++) {
        const aBase = (bIdx * SEGS + s) * 2
        boltAlpha[aBase] = boltAlpha[aBase+1] = 0
      }
    }

    // ── Physics constants ────────────────────────────────────
    const ATTRACT_R  = 230
    const ORBIT_R    = 55
    const PULL       = 4.4
    const SPRING     = 0.012
    const DAMP       = 0.86
    const BOLT_RANGE = 250

    const cand     = new Int32Array(96)
    const candDist = new Float32Array(96)

    const posAttr  = geo.getAttribute('position')
    const sizeAttr = geo.getAttribute('aSize')
    const glowAttr = geo.getAttribute('aGlow')

    let last = performance.now()
    let timeAccum = 0
    let rafId = 0

    function animate(now) {
      rafId = requestAnimationFrame(animate)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      timeAccum += dt

      // Smooth pointer tracking
      ptr.x      += (ptr.tx - ptr.x)           * 0.18
      ptr.y      += (ptr.ty - ptr.y)           * 0.18
      ptr.active += (ptr.tActive - ptr.active) * 0.12

      haloArr[0] = ptr.x; haloArr[1] = ptr.y
      haloPoint.geometry.attributes.position.needsUpdate = true
      haloMat.uniforms.uActive.value = ptr.active
      haloMat.uniforms.uSize.value   = 70 + Math.sin(timeAccum * 7) * 8 + ptr.active * 28

      const arr  = posAttr.array
      const sArr = sizeAttr.array
      const gArr = glowAttr.array

      const wantBolts = ptr.active > 0.2
      let candN = 0

      for (let i = 0; i < COUNT; i++) {
        const ix = i*3, iy = i*3+1
        const hx = home[i*2], hy = home[i*2+1]

        // Organic idle drift — two incommensurable frequencies produce a slow,
        // non-repeating lissajous orbit unique to each particle
        const tt  = timeAccum * driftS[i] + seedN[i]
        const dxn = Math.sin(tt)               * driftR[i] * 0.80
                  + Math.sin(tt * 1.618 + 1.1) * driftR[i] * 0.35
        const dyn = Math.cos(tt * 0.73)        * driftR[i]
                  + Math.cos(tt * 1.30  + 2.4) * driftR[i] * 0.30

        vel[i*2]   += (hx + dxn - arr[ix]) * SPRING
        vel[i*2+1] += (hy + dyn - arr[iy]) * SPRING

        let glow = 0, bonus = 0

        if (ptr.active > 0.01) {
          const dx = ptr.x - arr[ix]
          const dy = ptr.y - arr[iy]
          const d  = Math.sqrt(dx*dx + dy*dy) + 0.001
          if (d < ATTRACT_R) {
            const f = 1 - d / ATTRACT_R
            const k = f * f * ptr.active
            // Radial pull + tangential swirl for liquid feel
            let pullX = (dx / d) * PULL * k + (-dy / d) * PULL * k * 0.6
            let pullY = (dy / d) * PULL * k + ( dx / d) * PULL * k * 0.6
            // Soft orbit repulsion so particles don't pile at cursor
            if (d < ORBIT_R) {
              const e = (ORBIT_R - d) / ORBIT_R
              pullX -= (dx / d) * 1.5 * e
              pullY -= (dy / d) * 1.5 * e
            }
            vel[i*2]   += pullX
            vel[i*2+1] += pullY
            glow  = k
            bonus = k * 1.8
            if (wantBolts && d < BOLT_RANGE && candN < cand.length) {
              cand[candN] = i; candDist[candN] = d; candN++
            }
          }
        }

        vel[i*2]   *= DAMP; vel[i*2+1] *= DAMP
        arr[ix]  += vel[i*2]; arr[iy]  += vel[i*2+1]

        sArr[i] = sizes[i] * (1 + bonus * 0.7)
        gArr[i] = glow
      }

      posAttr.needsUpdate  = true
      sizeAttr.needsUpdate = true
      glowAttr.needsUpdate = true

      // Electric arcs to the closest particles
      if (wantBolts && candN > 0) {
        const sorted = Array.from({ length: candN }, (_, k) => k)
          .sort((a, b) => candDist[a] - candDist[b])
        const N = Math.min(MAX_BOLTS, sorted.length)
        for (let b = 0; b < MAX_BOLTS; b++) {
          if (b < N) {
            const pi = cand[sorted[b]]
            const intensity = (1 - candDist[sorted[b]] / BOLT_RANGE) * ptr.active
            jaggedBolt(b, ptr.x, ptr.y, arr[pi*3], arr[pi*3+1], intensity * 0.9)
          } else {
            clearBolt(b)
          }
        }
      } else {
        for (let b = 0; b < MAX_BOLTS; b++) clearBolt(b)
      }
      boltGeo.attributes.position.needsUpdate = true
      boltGeo.attributes.aAlpha.needsUpdate   = true

      renderer.render(scene, cam)
    }
    rafId = requestAnimationFrame(animate)

    // ── Resize ───────────────────────────────────────────────
    function onResize() {
      W = canvas.clientWidth  || window.innerWidth
      H = canvas.clientHeight || window.innerHeight
      viewW = viewH * (W / H)
      cam.left = -viewW/2; cam.right  =  viewW/2
      cam.top  =  viewH/2; cam.bottom = -viewH/2
      cam.updateProjectionMatrix()
      renderer.setSize(W, H, false)
      distribute()
      posAttr.needsUpdate = true
    }
    window.addEventListener('resize', onResize)

    // ── Cleanup ──────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      heroEl.removeEventListener('mousemove',   onMouseMove)
      heroEl.removeEventListener('mouseleave',  onMouseLeave)
      heroEl.removeEventListener('touchstart',  onTouchStart)
      heroEl.removeEventListener('touchmove',   onTouchMove)
      heroEl.removeEventListener('touchend',    onTouchEnd)
      heroEl.removeEventListener('touchcancel', onTouchEnd)
      geo.dispose(); ptMat.dispose()
      boltGeo.dispose(); boltMat.dispose()
      haloGeo.dispose(); haloMat.dispose()
      renderer.dispose()
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
      wrap.className = 'hero-word'
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

    let cancelled = false, lineIdx = 0
    let subAnim = null

    const rotateSub = () => {
      if (cancelled) return
      lineIdx = (lineIdx + 1) % TYPE_LINES.length
      gsap.to(subEl, {
        opacity: 0, y: -10, duration: 0.4, ease: 'power2.in',
        onComplete: () => {
          subEl.textContent = TYPE_LINES[lineIdx]
          gsap.fromTo(subEl, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
        },
      })
      subAnim = setTimeout(rotateSub, 3500)
    }

    tl.add(() => {
      subEl.textContent = TYPE_LINES[0]
      gsap.to(subEl, { opacity: 1, duration: 0.5 })
      subAnim = setTimeout(rotateSub, 3500)
    }, '-=0.4')

    return () => {
      cancelled = true; tl.kill()
      clearTimeout(subAnim)
    }
  }, [reduced])

  const handleSecondaryClick = e => {
    if (reduced) return
    const btn = e.currentTarget, liq = liquidRef.current
    if (!liq) return
    const rect = btn.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2.2
    Object.assign(liq.style, {
      width: `${size}px`, height: `${size}px`,
      left: `${e.clientX - rect.left - size/2}px`,
      top:  `${e.clientY - rect.top  - size/2}px`,
      transform: 'scale(0)', opacity: '1',
    })
    requestAnimationFrame(() => { liq.style.transform = 'scale(1)'; liq.style.opacity = '0' })
  }

  return (
    <section id="top" ref={heroRef} className="hero">
      {isLowEnd || reduced
        ? <GradientFallback />
        : <ParticleField heroRef={heroRef} />
      }

      <div className="hero-content">
        <p ref={eyebrowRef} className="hero-eyebrow">CYPRUS · DIGITAL EXCELLENCE</p>
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
          z-index: 0;
          width: 100% !important;
          height: 100% !important;
          pointer-events: none;
        }
        /* Low-end / reduced-motion fallback */
        .hero-gradient-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 60%, rgba(0,217,255,0.06) 0%, transparent 70%),
            var(--black);
        }

        .hero-content {
          position: relative;
          z-index: 10;
          text-align: center;
          width: 100%;
          padding: 0 1.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }
        @media (min-width: 768px) {
          .hero-content {
            max-width: 1200px;
            padding: 50px 2rem 0;
          }
        }

        /* ── Eyebrow ── */
        .hero-eyebrow {
          position: relative;
          z-index: 3;
          font-size: 11px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--bt-cyan);
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 32px;
        }
        @media (min-width: 768px) {
          .hero-eyebrow {
            font-size: 12px;
            letter-spacing: 0.32em;
            gap: 16px;
            margin-bottom: clamp(1.8rem, 3.5vw, 2.8rem);
          }
        }
        .hero-eyebrow::before, .hero-eyebrow::after {
          content: ''; display: block; width: 24px; height: 1px;
          background: var(--bt-gradient-soft); flex-shrink: 0; opacity: 0.55;
        }
        @media (min-width: 768px) {
          .hero-eyebrow::before, .hero-eyebrow::after { width: clamp(32px, 4vw, 56px); }
        }

        /* ── Title ── */
        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(3rem, 11vw, 4.2rem);
          font-weight: 800;
          line-height: 0.84;
          letter-spacing: -0.04em;
          color: var(--white);
          margin-bottom: 24px;
          overflow: visible;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        @media (min-width: 768px) {
          .hero-title { font-size: clamp(4.4rem, 8.8vw, 8.6rem); margin-bottom: 28px; }
        }
        .hero-word  { display: block; white-space: nowrap; }
        .hero-char  { display: inline-block; opacity: 0; will-change: transform, opacity; }
        .hero-space { display: none; }

        /* ── Subtitle ── */
        .hero-sub {
          font-size: 0.85rem;
          color: rgba(244, 247, 251, 0.68);
          font-weight: 400;
          margin-bottom: 32px;
          min-height: 1.6em;
          letter-spacing: 0.05em;
          max-width: 100%;
          text-align: center;
          opacity: 0;
          white-space: nowrap;
        }
        @media (min-width: 768px) {
          .hero-sub { font-size: clamp(14px, 1.1vw, 17px); margin-bottom: 42px; }
        }
        @media (max-width: 768px) {
          .hero-sub { white-space: normal; }
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
          color: var(--bt-black);
          background: var(--bt-gradient);
          padding: 17px 44px;
          border: none;
          border-radius: 2px;
          font-weight: 400;
          overflow: hidden;
          transition: filter 0.3s;
          width: 100%;
          min-height: 52px;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
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
          border: 1px solid rgba(0,217,255,0);
          animation: heroBtnPulse 2.5s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes heroBtnPulse {
          0%,100% { inset: -6px;  border-color: rgba(0,217,255,0);    }
          50%     { inset: -12px; border-color: rgba(0,217,255,0.32); }
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
          border: 1px solid rgba(244,247,251,0.18);
          border-radius: 2px;
          font-weight: 300;
          overflow: hidden;
          transition: border-color 0.3s, color 0.3s;
          width: 100%;
          min-height: 52px;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        @media (min-width: 600px) {
          .hero-btn-secondary { width: auto; }
        }
        .hero-btn-secondary:hover { border-color: var(--bt-green); color: var(--bt-green); }
        .hero-btn-liquid {
          position: absolute; border-radius: 50%;
          background: rgba(0,227,154,0.12);
          transform: scale(0); transition: transform 0.7s ease, opacity 0.7s ease;
          pointer-events: none;
        }
      `}</style>
    </section>
  )
}
