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
          padding: 0.9rem 0;
          background: var(--surface);
          border-top: 1px solid var(--dim);
          border-bottom: 1px solid var(--dim);
          overflow: hidden;
          display: flex;
          flex-wrap: nowrap;
        }
        .marquee__row {
          display: flex;
          flex: 0 0 auto;
          align-items: center;
          gap: 2rem;
          padding-right: 2rem;
          white-space: nowrap;
          animation: marquee-slide 16s linear infinite;
          will-change: transform;
        }
        @media (min-width: 768px) {
          .marquee__row { gap: 3rem; padding-right: 3rem; animation-duration: 22s; }
          .marquee { padding: 1.2rem 0; }
        }
        .marquee:hover .marquee__row { animation-play-state: paused; }
        .marquee:hover .marquee__text { color: var(--white); }
        .marquee__item {
          display: inline-flex;
          align-items: center;
          gap: 2rem;
          flex-shrink: 0;
        }
        @media (min-width: 768px) {
          .marquee__item { gap: 3rem; }
        }
        .marquee__text {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
          transition: color 0.4s var(--ease-out-expo);
        }
        @media (min-width: 768px) {
          .marquee__text { font-size: 0.7rem; }
        }
        .marquee__dot {
          display: inline-block;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: var(--accent);
          flex-shrink: 0;
        }
      `}</style>
    </div>
  )
}
