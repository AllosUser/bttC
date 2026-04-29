import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * useGSAP — runs `callback` inside a gsap.context scoped to `scopeRef`
 * (or document if no scope provided). All animations are reverted on unmount.
 */
export function useGSAP(callback, deps = [], scopeRef = null) {
  const internalRef = useRef(null)
  const scope = scopeRef ?? internalRef

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const ctx = gsap.context(() => {
      callback({ gsap, ScrollTrigger })
    }, scope.current || undefined)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return scope
}
