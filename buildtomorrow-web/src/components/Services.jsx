import { useRef } from 'react'
import { useGSAP } from '../hooks/useGSAP'

const SERVICES = [
  {
    id: '01',
    title: 'Web Development',
    subtitle: 'Digital Experiences',
    desc: 'High-performance websites and web applications, precision-engineered to convert visitors and scale with your ambitions.',
    tags: ['React', 'Next.js', 'Node.js', 'PostgreSQL'],
    color: '#0f0f12',
  },
  {
    id: '02',
    title: 'Mobile Applications',
    subtitle: 'iOS & Android',
    desc: 'Native and cross-platform mobile apps with intuitive interfaces backed by robust, scalable backend infrastructure.',
    tags: ['React Native', 'Expo', 'Swift', 'Kotlin'],
    color: '#0d0f0d',
  },
  {
    id: '03',
    title: 'Cybersecurity',
    subtitle: 'Protection & Compliance',
    desc: 'End-to-end security audits, penetration testing, and hardening strategies to protect your assets and your customers.',
    tags: ['Pen Testing', 'SIEM', 'ISO 27001', 'Zero Trust'],
    color: '#0a0c0f',
  },
  {
    id: '04',
    title: 'Systems Development',
    subtitle: 'Enterprise Architecture',
    desc: 'Complex backend systems, APIs, and enterprise software built with modern architecture that performs under real pressure.',
    tags: ['Microservices', 'GraphQL', 'Kubernetes', 'AWS'],
    color: '#0d0d0f',
  },
]

function ServicePanel({ service, idx }) {
  return (
    <article
      className="service-panel"
      style={{ background: service.color }}
      data-idx={idx}
    >
      <div className="service-panel__inner">
        <span className="panel-num" aria-hidden="true">{service.id}</span>

        <div className="service-panel__body">
          <span className="service-panel__subtitle">{service.subtitle}</span>
          <h3 className="panel-title">{service.title}</h3>
          <p className="panel-desc">{service.desc}</p>

          <ul className="service-panel__tags">
            {service.tags.map(t => (
              <li key={t} className="service-panel__tag">{t}</li>
            ))}
          </ul>
        </div>

        <div className="service-panel__progress" data-progress={idx} />
      </div>
    </article>
  )
}

export default function Services() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const progressRef = useRef(null)

  useGSAP(({ gsap, ScrollTrigger }) => {
    const track = trackRef.current
    const section = sectionRef.current
    if (!track || !section) return

    const panels = gsap.utils.toArray('.service-panel', track)
    const totalWidth = (panels.length - 1) * window.innerWidth

    const scrollTween = gsap.to(track, {
      x: -totalWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${(panels.length - 1) * window.innerWidth}`,
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    })

    // Progress bar
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${(panels.length - 1) * window.innerWidth}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
    }

    // Per-panel content animation, tied to the horizontal scrollTween
    panels.forEach(panel => {
      const num = panel.querySelector('.panel-num')
      const subtitle = panel.querySelector('.service-panel__subtitle')
      const title = panel.querySelector('.panel-title')
      const desc = panel.querySelector('.panel-desc')
      const tags = panel.querySelectorAll('.service-panel__tag')
      const progress = panel.querySelector('.service-panel__progress')

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panel,
          containerAnimation: scrollTween,
          start: 'left center',
          end: 'right center',
          scrub: true,
        },
      })

      tl.from(num,      { opacity: 0, y: 60, duration: 0.3 })
        .from(subtitle, { opacity: 0, y: 20, duration: 0.25 }, '-=0.15')
        .from(title,    { opacity: 0, y: 40, duration: 0.3 }, '-=0.1')
        .from(desc,     { opacity: 0, y: 30, duration: 0.3 }, '-=0.1')
        .from(tags,     { opacity: 0, y: 20, stagger: 0.05, duration: 0.25 }, '-=0.1')

      if (progress) {
        gsap.fromTo(
          progress,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: scrollTween,
              start: 'left center',
              end: 'right center',
              scrub: true,
            },
          }
        )
      }
    })
  }, [], sectionRef)

  return (
    <section
      id="services"
      ref={sectionRef}
      className="services-outer"
      aria-label="Our services"
    >
      <div ref={progressRef} className="services-progress" />

      <div className="services-sticky">
        <div ref={trackRef} className="services-track">
          {SERVICES.map((s, i) => (
            <ServicePanel key={s.id} service={s} idx={i} />
          ))}
        </div>
      </div>

      <style>{`
        .services-outer {
          position: relative;
          width: 100vw;
          background: var(--black);
        }
        .services-progress {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--accent);
          transform: scaleX(0);
          transform-origin: left center;
          z-index: 200;
          pointer-events: none;
        }
        .services-sticky {
          position: relative;
          height: 100vh;
          overflow: hidden;
        }
        .services-track {
          display: flex;
          flex-wrap: nowrap;
          height: 100%;
          will-change: transform;
        }
        .service-panel {
          position: relative;
          flex: 0 0 100vw;
          width: 100vw;
          height: 100vh;
        }
        .service-panel + .service-panel {
          border-left: 1px solid var(--dim);
        }
        .service-panel__inner {
          position: relative;
          width: 100%;
          height: 100%;
          padding: clamp(4rem, 10vh, 8rem) clamp(2rem, 6vw, 6rem);
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }
        .panel-num {
          position: absolute;
          right: clamp(2rem, 6vw, 6rem);
          top: clamp(3rem, 8vh, 6rem);
          font-family: var(--font-display);
          font-weight: 800;
          font-size: clamp(12rem, 20vw, 18rem);
          line-height: 0.8;
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.05);
          color: transparent;
          pointer-events: none;
          user-select: none;
        }
        .service-panel__body {
          position: relative;
          z-index: 2;
          max-width: 720px;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .service-panel__subtitle {
          font-family: var(--font-display);
          font-weight: 400;
          font-size: 0.8rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--accent);
        }
        .panel-title {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: clamp(3rem, 6vw, 5.5rem);
          line-height: 1;
          letter-spacing: -0.02em;
          color: var(--white);
        }
        .panel-desc {
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 1rem;
          line-height: 1.6;
          color: var(--muted);
          max-width: 480px;
        }
        .service-panel__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.75rem;
          list-style: none;
        }
        .service-panel__tag {
          border: 1px solid var(--dim);
          padding: 0.4rem 0.9rem;
          font-family: var(--font-body);
          font-weight: 400;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .service-panel__progress {
          position: absolute;
          left: clamp(2rem, 6vw, 6rem);
          right: clamp(2rem, 6vw, 6rem);
          bottom: 3rem;
          height: 1px;
          background: var(--accent);
          transform: scaleX(0);
          transform-origin: left center;
          opacity: 0.7;
        }
      `}</style>
    </section>
  )
}
