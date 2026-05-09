import React from 'react'

export default function TargetAudience() {
  return (
    <section className="target-audience" aria-label="Who we work with">
      <div className="target-audience__inner">
        <div className="target-left">
          <h2 className="target-title">Built for teams that operate at scale.</h2>
        </div>
        <div className="target-right">
          <p className="target-desc">
            We work with startups, scale-ups, and established companies building products where performance, security, and reliability are critical.
          </p>
          <ul className="target-list">
            <li><span aria-hidden="true" />High-growth startups</li>
            <li><span aria-hidden="true" />Regulated industries</li>
            <li><span aria-hidden="true" />Enterprise systems</li>
            <li><span aria-hidden="true" />AI-driven products</li>
          </ul>
        </div>
      </div>

      <style>{`
        .target-audience {
          background:
            radial-gradient(circle at 80% 20%, rgba(0, 217, 255, 0.05), transparent 32%),
            var(--black);
          color: var(--bt-white);
          padding: clamp(4.75rem, 9vh, 7rem) 0;
          display: flex;
          justify-content: center;
          align-items: center;
          border-top: 1px solid rgba(0, 217, 255, 0.12);
          border-bottom: 1px solid rgba(0, 217, 255, 0.12);
        }
        .target-audience__inner {
          width: 90%;
          max-width: 1400px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
        }
        .target-title {
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: var(--bt-white);
          max-width: 500px;
        }
        .target-desc {
          font-size: clamp(1rem, 1.5vw, 1.25rem);
          line-height: 1.6;
          color: var(--bt-muted);
          max-width: 600px;
          margin-bottom: 2rem;
        }
        .target-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.85rem;
        }
        .target-list li {
          font-family: var(--font-body);
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--bt-white);
          display: flex;
          align-items: center;
          gap: 0.8rem;
          min-height: 56px;
          padding: 0.95rem 1rem;
          border: 1px solid rgba(0, 217, 255, 0.20);
          background: linear-gradient(180deg, rgba(11, 19, 40, 0.72), rgba(7, 10, 22, 0.58));
          box-shadow: inset 0 1px 0 rgba(244, 247, 251, 0.03);
          transition: border-color 0.3s ease, background 0.3s ease, transform 0.3s ease;
        }
        .target-list li:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 227, 154, 0.34);
          background: linear-gradient(180deg, rgba(11, 19, 40, 0.86), rgba(7, 10, 22, 0.68));
        }
        .target-list li span {
          display: block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--bt-gradient);
          box-shadow: 0 0 18px rgba(0, 217, 255, 0.35);
          flex: 0 0 auto;
        }

        @media (min-width: 1024px) {
          .target-audience { padding: clamp(6rem, 10vh, 8rem) 0; }
          .target-audience__inner {
            grid-template-columns: 1fr 1fr;
            gap: clamp(3rem, 6vw, 6rem);
            align-items: center;
          }
          .target-list {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </section>
  )
}
