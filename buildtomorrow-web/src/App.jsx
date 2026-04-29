import { lazy, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useLenis } from './hooks/useLenis'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Hero from './components/Hero'

// Below-the-fold: code-split for faster initial paint
const Marquee    = lazy(() => import('./components/Marquee'))
const Services   = lazy(() => import('./components/Services'))
const About      = lazy(() => import('./components/About'))
const Process    = lazy(() => import('./components/Process'))
const VideoStrip = lazy(() => import('./components/VideoStrip'))
const CTA        = lazy(() => import('./components/CTA'))
const Footer     = lazy(() => import('./components/Footer'))

function SectionFallback() {
  return <div style={{ minHeight: '50vh', background: 'var(--black)' }} aria-hidden="true" />
}

export default function App() {
  useLenis()

  return (
    <AnimatePresence mode="wait">
      <div key="bt-app" className="relative w-full overflow-x-hidden">
        <Cursor />
        <Nav />
        <main>
          <Hero />
          <Suspense fallback={<SectionFallback />}>
            <Marquee />
            <Services />
            <About />
            <Process />
            <VideoStrip />
            <CTA />
          </Suspense>
        </main>
        <Suspense fallback={<SectionFallback />}>
          <Footer />
        </Suspense>
      </div>
    </AnimatePresence>
  )
}
