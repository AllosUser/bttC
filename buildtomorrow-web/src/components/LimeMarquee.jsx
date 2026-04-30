const CONTENT = 'BUILD · TOMORROW · CYPRUS · EST. 2024 · WEB · MOBILE · SECURITY · SYSTEMS · '

export default function LimeMarquee() {
  return (
    <div className="lm-wrap" aria-hidden="true">
      <div className="lm-track">
        <span className="lm-text">{CONTENT}</span>
        <span className="lm-text">{CONTENT}</span>
      </div>

      <style>{`
        .lm-wrap {
          width: 100vw;
          height: 52px;
          background: #c8f542;
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
          animation: marquee-slide 18s linear infinite;
          will-change: transform;
        }
        .lm-text {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #08080a;
          white-space: nowrap;
          padding-right: 0;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  )
}
