import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useMediaQuery'

export default function Cursor() {
  const dotRef  = useRef(null)
  const ringRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    // Mark touch devices on <html> so CSS can restore system cursor globally
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    if (isTouch) {
      document.documentElement.classList.add('touch-device')
      document.body.style.cursor = 'auto'
      return () => document.documentElement.classList.remove('touch-device')
    }

    if (reduced) return

    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let ringX   = targetX
    let ringY   = targetY
    let rafId   = 0

    const onMove = e => {
      targetX = e.clientX
      targetY = e.clientY
      if (dotRef.current)
        dotRef.current.style.transform = `translate3d(${targetX}px,${targetY}px,0) translate(-50%,-50%)`
    }

    const tick = () => {
      ringX += (targetX - ringX) * 0.12
      ringY += (targetY - ringY) * 0.12
      if (ringRef.current)
        ringRef.current.style.transform = `translate3d(${ringX}px,${ringY}px,0) translate(-50%,-50%)`
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    const onLeave     = () => document.body.classList.add('cursor-hide')
    const onEnter     = () => document.body.classList.remove('cursor-hide')
    const onMouseDown = () => document.body.classList.add('cursor-drag')
    const onMouseUp   = () => document.body.classList.remove('cursor-drag')

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)

    const HOVER_SEL = 'a, button, [role="button"], input, textarea, select, label, .hoverable'
    const attached  = new WeakSet()
    const addHover  = () => document.body.classList.add('cursor-hover')
    const rmHover   = () => document.body.classList.remove('cursor-hover')
    const attach = el => {
      if (attached.has(el)) return
      attached.add(el)
      el.addEventListener('mouseenter', addHover)
      el.addEventListener('mouseleave', rmHover)
    }
    const scan = root => (root || document).querySelectorAll(HOVER_SEL).forEach(attach)
    scan(document)

    const obs = new MutationObserver(muts => {
      muts.forEach(m => m.addedNodes.forEach(n => {
        if (!(n instanceof Element)) return
        if (n.matches?.(HOVER_SEL)) attach(n)
        scan(n)
      }))
    })
    obs.observe(document.body, { childList: true, subtree: true })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      obs.disconnect()
      document.body.classList.remove('cursor-hover', 'cursor-drag', 'cursor-hide')
    }
  }, [reduced])

  // On touch devices (detected synchronously via matchMedia) render nothing
  if (typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches)
    return null
  if (reduced) return null

  return (
    <>
      <div id="cursor-dot"  ref={dotRef}  aria-hidden="true" />
      <div id="cursor-ring" ref={ringRef} aria-hidden="true">
        <span id="cursor-label" />
      </div>
    </>
  )
}
