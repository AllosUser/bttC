import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useMediaQuery'

export default function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    if (typeof window === 'undefined') return

    // Detect coarse pointer (mobile/tablet) — disable custom cursor
    const coarse = window.matchMedia('(pointer: coarse)').matches
    if (coarse) {
      document.body.style.cursor = 'auto'
      if (dotRef.current) dotRef.current.style.display = 'none'
      if (ringRef.current) ringRef.current.style.display = 'none'
      return
    }

    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let ringX = targetX
    let ringY = targetY
    let rafId = 0

    const onMove = e => {
      targetX = e.clientX
      targetY = e.clientY
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`
      }
    }

    const tick = () => {
      ringX += (targetX - ringX) * 0.12
      ringY += (targetY - ringY) * 0.12
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    const onLeave = () => document.body.classList.add('cursor-hide')
    const onEnter = () => document.body.classList.remove('cursor-hide')
    const onMouseDown = () => document.body.classList.add('cursor-drag')
    const onMouseUp = () => document.body.classList.remove('cursor-drag')

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)

    // Hover targets
    const HOVER_SELECTOR = 'a, button, [role="button"], input, textarea, select, label, .hoverable'
    const attachedSet = new WeakSet()

    const onHoverEnter = () => document.body.classList.add('cursor-hover')
    const onHoverLeave = () => document.body.classList.remove('cursor-hover')

    const attach = el => {
      if (attachedSet.has(el)) return
      attachedSet.add(el)
      el.addEventListener('mouseenter', onHoverEnter)
      el.addEventListener('mouseleave', onHoverLeave)
    }

    const scan = root => {
      const nodes = (root || document).querySelectorAll(HOVER_SELECTOR)
      nodes.forEach(attach)
    }
    scan(document)

    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        m.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return
          if (node.matches?.(HOVER_SELECTOR)) attach(node)
          scan(node)
        })
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      observer.disconnect()
      document.body.classList.remove('cursor-hover', 'cursor-drag', 'cursor-hide')
    }
  }, [reduced])

  if (reduced) return null

  return (
    <>
      <div id="cursor-dot" ref={dotRef} aria-hidden="true" />
      <div id="cursor-ring" ref={ringRef} aria-hidden="true">
        <span id="cursor-label" />
      </div>
    </>
  )
}
