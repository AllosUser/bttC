const CONTENT = 'EST. 2024 · WEB · MOBILE · SECURITY · SYSTEMS · BUILD TOMORROW · CYPRUS · '

export default function BrandMarquee() {
  return (
    <div className="lm-wrap" aria-hidden="true">
      <div className="lm-track">
        <span className="lm-text">{CONTENT}</span>
        <span className="lm-text">{CONTENT}</span>
      </div>

      <style>{`
        .lm-wrap {
          width: 100vw;
          height: 44px;
          background: var(--bt-gradient-soft);
          overflow: hidden;
          display: flex;
          align-items: center;
          border-top: none;
          border-bottom: none;
          flex-shrink: 0;
        }
        .lm-track {
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
          animation: lm-marquee 30s linear infinite;
          will-change: transform;
        }
        @keyframes lm-marquee {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        .lm-text {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--bt-black);
          white-space: nowrap;
          padding-right: 2.4rem;
          flex-shrink: 0;
        }
        @media (min-width: 768px) {
          .lm-wrap { height: 46px; }
          .lm-text { font-size: 0.78rem; padding-right: 3rem; }
        }
      `}</style>
    </div>
  )
}
