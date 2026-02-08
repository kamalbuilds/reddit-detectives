import './index.css';

import { context, requestExpandedMode } from '@devvit/web/client';
import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

type SplashData = {
  title: string;
  dayNumber: number;
  totalInvestigators: number;
  totalVotes: number;
  timeUntilReveal: number;
  revealed: boolean;
  difficulty: string;
};

function Splash() {
  const [data, setData] = useState<SplashData | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    fetch('/api/mystery')
      .then((r) => r.json())
      .then((json) => {
        setData({
          title: json.mystery.title,
          dayNumber: json.mystery.dayNumber,
          totalInvestigators: json.totalInvestigators,
          totalVotes: json.totalVotes,
          timeUntilReveal: json.timeUntilReveal,
          revealed: json.revealed,
          difficulty: json.mystery.difficulty,
        });
        setTimeLeft(json.timeUntilReveal);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((p) => Math.max(0, p - 1000)), 1000);
    return () => clearInterval(id);
  }, [timeLeft > 0]);

  const h = Math.floor(timeLeft / 3600000);
  const m = Math.floor((timeLeft % 3600000) / 60000);
  const s = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="noise-bg vignette flex flex-col items-center justify-center min-h-screen bg-[#0a0e1a] text-white px-6 relative">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,168,83,0.06)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(30,58,138,0.08)_0%,_transparent_50%)]" />

      <div className="relative z-10 flex flex-col items-center max-w-[320px]">
        {/* Case number badge */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-700/40" />
          <span className="gold-text font-black text-[11px] tracking-[0.3em] uppercase">
            Karma Kriminals
          </span>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-700/40" />
        </div>

        {data && (
          <div className="glass rounded-md px-3 py-1 mb-6">
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">
              CASE #{String(data.dayNumber).padStart(3, '0')}
            </span>
          </div>
        )}

        {/* Mystery title */}
        {data ? (
          <div className="text-center mb-6">
            <h1 className="text-xl font-extrabold text-white mb-2.5 leading-tight tracking-tight">
              {data.title}
            </h1>
            <div className={`stamp text-[9px] ${
              data.difficulty === 'easy'
                ? 'text-emerald-400 border-emerald-400/50'
                : data.difficulty === 'medium'
                  ? 'text-amber-400 border-amber-400/50'
                  : 'text-red-400 border-red-400/50'
            }`}>
              {data.difficulty}
            </div>
          </div>
        ) : (
          <div className="mb-6 text-center">
            <div className="h-6 w-56 bg-slate-800/50 rounded mb-2 animate-pulse" />
            <div className="h-4 w-36 bg-slate-800/30 rounded animate-pulse mx-auto" />
          </div>
        )}

        {/* Divider */}
        <div className="classified-line w-full mb-6" />

        {/* Stats */}
        {data && (
          <div className="flex items-center justify-center gap-6 mb-6 text-[11px]">
            <div className="text-center">
              <p className="text-lg font-bold text-white font-mono">{data.totalInvestigators}</p>
              <p className="text-slate-500 text-[9px] uppercase tracking-wider">Detectives</p>
            </div>
            <div className="w-px h-8 bg-slate-700/50" />
            {!data.revealed ? (
              <div className="text-center">
                <p className="text-lg font-bold text-amber-400/90 font-mono">
                  {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
                </p>
                <p className="text-slate-500 text-[9px] uppercase tracking-wider">Until Reveal</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-bold text-emerald-400">SOLVED</p>
                <p className="text-slate-500 text-[9px] uppercase tracking-wider">Case Closed</p>
              </div>
            )}
          </div>
        )}

        {/* CTA Button */}
        <button
          className="group relative w-full max-w-[260px] py-3.5 rounded-lg font-bold text-sm tracking-wide transition-all active:scale-[0.97] overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #b45309, #d97706, #b45309)',
            color: '#0a0e1a',
          }}
          onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
        >
          <span className="relative z-10">
            {data?.revealed ? 'View Case Results' : 'Open Case File'}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </button>

        {/* Username */}
        {context.username && (
          <p className="text-[10px] text-slate-600 mt-5 font-mono tracking-wide">
            Agent {context.username} | Clearance: Active
          </p>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
