export function triggerContactParticles(formElement, { reduced = false, win, doc } = {}) {
  if (reduced || !formElement || typeof formElement.querySelector !== 'function') return false

  try {
    const browserWindow = win || globalThis.window
    const browserDocument = doc || globalThis.document
    if (!browserWindow || !browserDocument?.body) return false

    const button = formElement.querySelector('.cta-submit')
    if (!button || typeof button.getBoundingClientRect !== 'function') return false

    const rect    = button.getBoundingClientRect()
    const mobile  = browserWindow.innerWidth < 768
    const count   = mobile ? 10 : 20
    const maxDist = mobile ? 60 : 120

    for (let i = 0; i < count; i++) {
      const p = browserDocument.createElement('div'); p.className = 'cta-particle'
      const angle = Math.random() * Math.PI * 2
      const dist  = 40 + Math.random() * maxDist
      p.style.left = `${rect.left + rect.width / 2}px`
      p.style.top  = `${rect.top  + rect.height / 2}px`
      p.style.setProperty('--tx', `${Math.cos(angle) * dist}px`)
      p.style.setProperty('--ty', `${Math.sin(angle) * dist}px`)
      browserDocument.body.appendChild(p); setTimeout(() => p.remove(), 700)
    }

    return true
  } catch {
    return false
  }
}
