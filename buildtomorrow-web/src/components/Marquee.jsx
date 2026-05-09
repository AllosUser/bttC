const ITEMS = [
  'Digital Transformation', 'Web Platforms', 'Applied AI',
  'Security & Governance', 'Mobile Ecosystems', 'Systems Architecture',
]

function MarqueeRow({ ariaHidden = false }) {
  return (
    <div className="marquee__row" aria-hidden={ariaHidden}>
      {ITEMS.map((item, i) => (
        <span className="marquee__item" key={`${item}-${i}`}>
          <span className="marquee__text">{item}</span>
          <span className="marquee__dot" aria-hidden="true" />
        </span>
      ))}
    </div>
  )
}

export default function Marquee() {
  return (
    <div className="marquee" aria-label="Services we offer">
      <MarqueeRow />
      <MarqueeRow ariaHidden />

      <style>{`
        .marquee {
          position: relative;
          width: 100vw;
          padding: 0.6rem 0;
          background: var(--bt-dark);
          border-top: 1px solid rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.03);
          overflow: hidden;
          display: flex;
          flex-wrap: nowrap;
        }
        .marquee__row {
          display: flex;
          flex: 0 0 auto;
          align-items: center;
          gap: 2.5rem;
          padding-right: 2.5rem;
          white-space: nowrap;
          animation: marquee-slide 20s linear infinite;
          will-change: transform;
        }
        @media (min-width: 768px) {
          .marquee__row { gap: 4rem; padding-right: 4rem; animation-duration: 28s; }
          .marquee { padding: 0.8rem 0; }
        }
        .marquee:hover .marquee__row { animation-play-state: paused; }
        .marquee:hover .marquee__text { color: var(--white); }
        .marquee__item {
          display: inline-flex;
          align-items: center;
          gap: 2.5rem;
          flex-shrink: 0;
        }
        @media (min-width: 768px) {
          .marquee__item { gap: 4rem; }
        }
        .marquee__text {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.55rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(244,247,251,0.35);
          transition: color 0.4s var(--ease-out-expo);
        }
        @media (min-width: 768px) {
          .marquee__text { font-size: 0.62rem; }
        }
        .marquee__dot {
          display: inline-block;
          width: 3px; height: 3px;
          border-radius: 50%;
          background: var(--bt-cyan);
          opacity: 0.4;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  )
}
