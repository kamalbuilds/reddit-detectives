import './index.css';

import { StrictMode, useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import type {
  MysteryResponse,
  VoteResponse,
  LeaderboardResponse,
  LeaderboardEntry,
  Evidence,
  Suspect,
} from '../shared/api';

// ==================== Hooks ====================

function useMystery() {
  const [data, setData] = useState<MysteryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  const fetchMystery = useCallback(async () => {
    try {
      const res = await fetch('/api/mystery');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: MysteryResponse = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load mystery:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const vote = useCallback(async (suspectId: string) => {
    setVoting(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspectId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: VoteResponse = await res.json();
      setData((prev) =>
        prev
          ? {
              ...prev,
              userVote: json.suspectId,
              voteCounts: json.voteCounts,
              totalVotes: json.totalVotes,
            }
          : null
      );
    } catch (err) {
      console.error('Vote failed:', err);
    } finally {
      setVoting(false);
    }
  }, []);

  const fetchReveal = useCallback(async () => {
    try {
      const res = await fetch('/api/reveal');
      if (!res.ok) return;
      const json: MysteryResponse = await res.json();
      setData(json);
    } catch (err) {
      console.error('Reveal fetch failed:', err);
    }
  }, []);

  useEffect(() => {
    fetchMystery();
  }, [fetchMystery]);

  return { data, loading, voting, vote, fetchReveal, refetch: fetchMystery };
}

function useLeaderboard() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: LeaderboardResponse = await res.json();
      setData(json);
    } catch (err) {
      console.error('Leaderboard fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, load };
}

function useCountdown(ms: number) {
  const [left, setLeft] = useState(ms);

  useEffect(() => {
    setLeft(ms);
    if (ms <= 0) return;
    const id = setInterval(() => setLeft((p) => Math.max(0, p - 1000)), 1000);
    return () => clearInterval(id);
  }, [ms]);

  return {
    h: Math.floor(left / 3600000),
    m: Math.floor((left % 3600000) / 60000),
    s: Math.floor((left % 60000) / 1000),
    expired: left <= 0,
  };
}

// ==================== Helpers ====================

function getInitials(name: string): string {
  const words = name.replace(/^(User |The )/i, '').split(/\s+/);
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0]! + words[1]![0]!).toUpperCase();
}

const SUSPECT_COLORS = [
  { bg: 'bg-rose-950/40', border: 'border-rose-500/30', text: 'text-rose-300' },
  { bg: 'bg-sky-950/40', border: 'border-sky-500/30', text: 'text-sky-300' },
  { bg: 'bg-violet-950/40', border: 'border-violet-500/30', text: 'text-violet-300' },
  { bg: 'bg-teal-950/40', border: 'border-teal-500/30', text: 'text-teal-300' },
];

function EvidenceTypeIcon({ type }: { type: string }) {
  const s = 16;
  const props = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (type) {
    case 'direct':
      return (<svg {...props}><path d="M12 10a2 2 0 0 0-2 2c0 1.02.76 2 2 2" /><path d="M12 14c1.24 0 2-.98 2-2a2 2 0 0 0-2-2" /><path d="M7 12c0-2.76 2.24-5 5-5 2.28 0 4.22 1.56 4.8 3.7" /><path d="M12 7c-2.76 0-5 2.24-5 5 0 2.28 1.56 4.22 3.7 4.8" /><path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10" /><path d="M12 2c5.52 0 10 4.48 10 10" /></svg>);
    case 'witness':
      return (<svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
    case 'visual':
      return (<svg {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>);
    case 'redherring':
      return (<svg {...props}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>);
    case 'hidden':
      return (<svg {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
    default:
      return (<svg {...props}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>);
  }
}

// ==================== Components ====================

type Tab = 'evidence' | 'suspects' | 'casefile' | 'leaderboard';

const TYPE_COLORS: Record<string, { border: string; bg: string; label: string; tag: string; dot: string }> = {
  direct: { border: 'border-blue-500/30', bg: 'bg-blue-950/20', label: 'Physical Evidence', tag: 'bg-blue-500/15 text-blue-400', dot: 'bg-blue-400' },
  witness: { border: 'border-emerald-500/30', bg: 'bg-emerald-950/20', label: 'Witness Account', tag: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-400' },
  visual: { border: 'border-violet-500/30', bg: 'bg-violet-950/20', label: 'Forensic Analysis', tag: 'bg-violet-500/15 text-violet-400', dot: 'bg-violet-400' },
  redherring: { border: 'border-slate-600/30', bg: 'bg-slate-800/20', label: 'Unverified', tag: 'bg-slate-500/15 text-slate-400', dot: 'bg-slate-500' },
  hidden: { border: 'border-amber-500/30', bg: 'bg-amber-950/15', label: 'Classified', tag: 'bg-amber-500/15 text-amber-400', dot: 'bg-amber-400' },
};

function EvidenceCard({
  evidence,
  revealed,
  index,
}: {
  evidence: Evidence;
  revealed: boolean;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLocked = evidence.description.startsWith('[LOCKED]');
  const isRedHerring = revealed && evidence.type === 'redherring';
  const style = TYPE_COLORS[evidence.type] || TYPE_COLORS.direct;

  return (
    <div
      className={`rounded-lg border ${style.border} ${style.bg} p-3.5 cursor-pointer transition-all duration-200 hover:border-opacity-60 ${
        isLocked ? 'opacity-50 cursor-not-allowed' : ''
      } ${isRedHerring ? 'border-red-500/40 bg-red-950/10' : ''} ${expanded ? 'ring-1 ring-amber-500/20' : ''}`}
      onClick={() => !isLocked && setExpanded(!expanded)}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className={`shrink-0 w-8 h-8 rounded-md flex items-center justify-center border ${style.border} bg-black/30 ${style.tag.split(' ').pop()}`}>
          <EvidenceTypeIcon type={evidence.type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-[13px] text-white/90 truncate flex-1">
              {evidence.title}
            </h4>
            {isRedHerring && (
              <span className="stamp text-[7px] text-red-400 border-red-400/50 shrink-0">
                False Lead
              </span>
            )}
          </div>
          <span className={`inline-block text-[9px] font-medium px-1.5 py-0.5 rounded ${style.tag}`}>
            {isLocked ? 'CLASSIFIED' : style.label}
          </span>
          {(expanded || isLocked) && (
            <p className={`text-[12px] mt-2.5 leading-[1.6] animate-fadeIn ${
              isLocked ? 'text-amber-400/50 italic' : 'text-slate-300/80'
            }`}>
              {evidence.description}
            </p>
          )}
          {!expanded && !isLocked && (
            <p className="text-[9px] text-slate-600 mt-1.5 italic">Tap to examine</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SuspectCard({
  suspect,
  voted,
  voteCount,
  totalVotes,
  onVote,
  disabled,
  revealed,
  isGuilty,
  colorIndex,
}: {
  suspect: Suspect;
  voted: boolean;
  voteCount: number;
  totalVotes: number;
  onVote: () => void;
  disabled: boolean;
  revealed: boolean;
  isGuilty: boolean;
  colorIndex: number;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
  const color = SUSPECT_COLORS[colorIndex % SUSPECT_COLORS.length]!;
  const initials = getInitials(suspect.name);

  return (
    <div
      className={`mugshot rounded-lg p-4 transition-all duration-200 ${
        revealed && isGuilty
          ? 'border-l-red-500 bg-red-950/15'
          : voted
            ? 'border-l-amber-500'
            : ''
      }`}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-11 h-11 rounded-lg ${color.bg} border ${color.border} flex items-center justify-center shrink-0`}>
          <span className={`text-sm font-black tracking-wider ${color.text}`}>{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-[14px] truncate">{suspect.name}</h3>
            {revealed && isGuilty && (
              <span className="stamp text-[7px] text-red-400 border-red-400/50">Guilty</span>
            )}
            {voted && !revealed && (
              <span className="text-[8px] text-amber-400/70 font-mono">YOUR PICK</span>
            )}
          </div>
          <button
            className="text-[9px] text-slate-500 hover:text-slate-300 transition-colors"
            onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}
          >
            {showDetails ? '- Hide details' : '+ Full profile'}
          </button>
        </div>
      </div>

      {/* Motive */}
      <div className="mb-3 pl-0.5">
        <p className="text-[9px] uppercase tracking-[0.15em] text-amber-500/50 font-semibold mb-0.5">Motive</p>
        <p className="text-[12px] text-slate-300/80 leading-relaxed">{suspect.motive}</p>
      </div>

      {/* Expanded details */}
      {showDetails && (
        <div className="space-y-2 mb-3 pl-0.5 animate-fadeIn">
          <div>
            <p className="text-[9px] uppercase tracking-[0.15em] text-slate-500/70 font-semibold mb-0.5">Alibi</p>
            <p className="text-[12px] text-slate-400/80 leading-relaxed">{suspect.alibi}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.15em] text-slate-500/70 font-semibold mb-0.5">Background</p>
            <p className="text-[12px] text-slate-400/80 leading-relaxed">{suspect.background}</p>
          </div>
        </div>
      )}

      {/* Vote progress */}
      {totalVotes > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-[9px] text-slate-500 mb-1 font-mono">
            <span>{voteCount} vote{voteCount !== 1 ? 's' : ''}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1 bg-black/30 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full vote-bar-fill ${
                revealed && isGuilty
                  ? 'bg-red-500'
                  : voted
                    ? 'bg-amber-500/80'
                    : 'bg-slate-600'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Vote button */}
      {!revealed && (
        <button
          onClick={onVote}
          disabled={disabled}
          className={`w-full py-2.5 rounded-md font-semibold text-[12px] tracking-wide transition-all active:scale-[0.98] ${
            voted
              ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
              : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-amber-600/15 hover:text-amber-300 hover:border-amber-500/30'
          } disabled:opacity-30`}
        >
          {voted ? 'Your Accusation' : 'Accuse'}
        </button>
      )}
    </div>
  );
}

function TabIcon({ id, active }: { id: Tab; active: boolean }) {
  const cls = active ? 'stroke-amber-400' : 'stroke-slate-600 group-hover:stroke-slate-400';
  const size = 18;
  switch (id) {
    case 'evidence':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cls} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
      );
    case 'suspects':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cls} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'casefile':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cls} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case 'leaderboard':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cls} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7" />
          <path d="M4 22h16" />
          <path d="M10 22V8a2 2 0 0 0-2-2H7a4 4 0 0 1-4-4" />
          <path d="M14 22V8a2 2 0 0 1 2-2h1a4 4 0 0 0 4-4" />
          <path d="M10 14h4" />
        </svg>
      );
  }
}

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'evidence', label: 'Evidence' },
    { id: 'suspects', label: 'Suspects' },
    { id: 'casefile', label: 'Case File' },
    { id: 'leaderboard', label: 'Rankings' },
  ];

  return (
    <div className="flex border-t border-slate-800/60 bg-[#070a12]/95 backdrop-blur-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`group flex-1 py-2.5 flex flex-col items-center gap-1 transition-colors relative ${
            active === tab.id
              ? 'text-amber-400'
              : 'text-slate-600 hover:text-slate-400'
          }`}
        >
          <TabIcon id={tab.id} active={active === tab.id} />
          <span className="text-[8px] font-semibold tracking-wider uppercase">{tab.label}</span>
          {active === tab.id && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-500 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="noise-bg flex flex-col items-center justify-center min-h-screen bg-[#0a0e1a] text-white gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
      <p className="text-slate-500 text-[10px] tracking-[0.2em] uppercase font-mono">
        Accessing case files
      </p>
    </div>
  );
}

function RevealScreen({ data }: { data: MysteryResponse }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 1600);
    const t3 = setTimeout(() => setPhase(3), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (!data.revealData) return null;

  const guilty = data.mystery.suspects.find((s) => s.id === data.revealData!.answer);
  const correct = data.revealData.correct;
  const didntVote = correct === null;
  const guiltyColor = SUSPECT_COLORS[data.mystery.suspects.findIndex((s) => s.id === data.revealData!.answer) % SUSPECT_COLORS.length]!;
  const guiltyInitials = guilty ? getInitials(guilty.name) : '??';

  return (
    <div className="noise-bg vignette min-h-screen bg-[#0a0e1a] flex flex-col overflow-y-auto relative">
      {/* Atmospheric overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,168,83,0.04)_0%,_transparent_60%)]" />

      <div className="relative z-10">
        {/* Result header */}
        <div className="px-6 pt-10 pb-6 text-center">
          {didntVote ? (
            <>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-3 font-mono">Case #{String(data.mystery.dayNumber).padStart(3, '0')}</p>
              <h2 className="text-2xl font-extrabold text-slate-300 mb-1.5 tracking-tight">Case Closed</h2>
              <p className="text-[12px] text-slate-500">You didn&apos;t submit an accusation this time.</p>
            </>
          ) : correct ? (
            <>
              <div className="animate-scaleIn mb-3">
                <span className="stamp text-emerald-400 border-emerald-400/60 text-sm px-4 py-1.5">Case Solved</span>
              </div>
              <h2 className="text-2xl font-extrabold text-emerald-400 mb-1.5 tracking-tight">Correct</h2>
              <p className="text-[12px] text-emerald-400/60">You identified the culprit.</p>
            </>
          ) : (
            <>
              <div className="animate-scaleIn mb-3">
                <span className="stamp text-red-400 border-red-400/60 text-sm px-4 py-1.5">Unsolved</span>
              </div>
              <h2 className="text-2xl font-extrabold text-red-400 mb-1.5 tracking-tight">Wrong Suspect</h2>
              <p className="text-[12px] text-slate-500">The real culprit slipped through.</p>
            </>
          )}
        </div>

        {/* Guilty reveal */}
        {phase >= 1 && guilty && (
          <div className="px-5 mb-5 animate-slideUp">
            <div className="classified-line mb-4" />
            <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500 mb-3 text-center font-mono">The Culprit</p>
            <div className="flex items-center gap-4 mugshot rounded-lg p-4 border-l-red-500 animate-glowPulse">
              <div className={`w-14 h-14 rounded-lg ${guiltyColor.bg} border ${guiltyColor.border} flex items-center justify-center`}>
                <span className={`text-lg font-black tracking-wider ${guiltyColor.text}`}>{guiltyInitials}</span>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">{guilty.name}</h3>
                <span className="stamp text-[7px] text-red-400 border-red-400/40">Guilty</span>
              </div>
            </div>
          </div>
        )}

        {/* Explanation */}
        {phase >= 2 && (
          <div className="px-5 mb-4 animate-fadeIn">
            <div className="glass rounded-lg p-4">
              <p className="text-[9px] font-bold text-amber-500/70 uppercase tracking-[0.2em] mb-2.5">Case Summary</p>
              <p className="text-[12px] text-slate-300/80 leading-[1.7]">
                {data.revealData!.explanation}
              </p>
            </div>
          </div>
        )}

        {/* Stats + vote distribution */}
        {phase >= 3 && (
          <div className="px-5 pb-8 space-y-3 animate-fadeIn">
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { val: data.userStats.streak, label: 'Streak', accent: true },
                { val: `${data.userStats.accuracy}%`, label: 'Accuracy', accent: false },
                { val: data.totalVotes, label: 'Votes', accent: false },
                { val: data.totalInvestigators, label: 'Agents', accent: false },
              ].map((item, i) => (
                <div key={i} className="glass rounded-lg py-3 text-center">
                  <p className={`text-base font-bold font-mono ${item.accent ? 'gold-text' : 'text-white/80'}`}>
                    {item.val}
                  </p>
                  <p className="text-[7px] text-slate-500 uppercase tracking-wider mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Vote distribution */}
            <div className="glass rounded-lg p-4">
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-[0.15em] mb-3">Vote Distribution</p>
              {data.mystery.suspects.map((s, idx) => {
                const count = data.voteCounts[s.id] || 0;
                const pct = data.totalVotes > 0 ? Math.round((count / data.totalVotes) * 100) : 0;
                const isAnswer = s.id === data.revealData!.answer;
                const sc = SUSPECT_COLORS[idx % SUSPECT_COLORS.length]!;
                return (
                  <div key={s.id} className="mb-3 last:mb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[11px] flex items-center gap-1.5 ${isAnswer ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>
                        <span className={`inline-block w-2 h-2 rounded-sm ${sc.bg} border ${sc.border}`} />
                        {s.name}
                        {isAnswer && <span className="text-[8px] text-red-400/60 ml-1 font-mono">GUILTY</span>}
                      </span>
                      <span className="text-[9px] text-slate-600 font-mono">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1 bg-black/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full vote-bar-fill ${isAnswer ? 'bg-red-500/80' : 'bg-slate-600/50'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== Main App ====================

function App() {
  const { data, loading, voting, vote, fetchReveal, refetch } = useMystery();
  const leaderboard = useLeaderboard();
  const [tab, setTab] = useState<Tab>('evidence');
  const countdown = useCountdown(data?.timeUntilReveal || 0);

  useEffect(() => {
    if (countdown.expired && data && !data.revealed) {
      fetchReveal();
    }
  }, [countdown.expired, data?.revealed, fetchReveal]);

  useEffect(() => {
    if (tab === 'leaderboard') leaderboard.load();
  }, [tab]);

  if (loading) return <LoadingScreen />;

  if (!data) {
    return (
      <div className="noise-bg flex flex-col items-center justify-center min-h-screen bg-[#0a0e1a] text-white gap-4">
        <p className="text-red-400/80 text-sm font-semibold">Failed to access case files</p>
        <button
          onClick={refetch}
          className="px-5 py-2 bg-white/5 border border-white/10 text-white rounded-md text-[11px] font-semibold tracking-wide hover:bg-white/10 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (data.revealed && data.revealData) {
    return <RevealScreen data={data} />;
  }

  const mystery = data.mystery;

  return (
    <div className="noise-bg flex flex-col h-screen bg-[#0a0e1a] relative">
      {/* Subtle atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,168,83,0.03)_0%,_transparent_50%)] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 glass px-4 py-3.5 border-b border-slate-800/40">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="gold-text font-black text-[10px] tracking-[0.2em] uppercase">
              Karma Kriminals
            </span>
            <span className="text-[8px] text-slate-500 font-mono bg-black/20 px-1.5 py-0.5 rounded">
              #{String(mystery.dayNumber).padStart(3, '0')}
            </span>
            <span className={`stamp text-[7px] ${
              mystery.difficulty === 'easy'
                ? 'text-emerald-400 border-emerald-400/40'
                : mystery.difficulty === 'medium'
                  ? 'text-amber-400 border-amber-400/40'
                  : 'text-red-400 border-red-400/40'
            }`}>
              {mystery.difficulty}
            </span>
          </div>
          <div className="text-[11px] text-amber-400/70 font-mono tracking-wider">
            {String(countdown.h).padStart(2, '0')}:{String(countdown.m).padStart(2, '0')}:{String(countdown.s).padStart(2, '0')}
          </div>
        </div>
        <h1 className="text-[14px] font-bold text-white/90 leading-tight tracking-tight">
          {mystery.title}
        </h1>
        <div className="flex gap-4 mt-1.5 text-[9px] text-slate-500 font-mono">
          <span>{data.totalInvestigators} agent{data.totalInvestigators !== 1 ? 's' : ''}</span>
          <span>{data.totalVotes} vote{data.totalVotes !== 1 ? 's' : ''}</span>
          {data.userVote && <span className="text-amber-500/60">Accusation filed</span>}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="p-4">
          {/* Evidence tab */}
          {tab === 'evidence' && (
            <div>
              <div className="glass rounded-lg p-3.5 mb-4">
                <p className="text-[9px] uppercase tracking-[0.15em] text-amber-500/50 font-semibold mb-1.5">Briefing</p>
                <p className="text-[12px] text-slate-300/80 leading-[1.7]">
                  {mystery.description}
                </p>
              </div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-[0.15em]">
                  Evidence Collected
                </p>
                <span className="text-[9px] text-slate-600 font-mono">{mystery.evidence.length} items</span>
              </div>
              <div className="space-y-2">
                {mystery.evidence.map((e, i) => (
                  <EvidenceCard key={e.id} evidence={e} revealed={data.revealed} index={i} />
                ))}
              </div>
              {!data.userVote && (
                <div className="mt-5 text-center">
                  <button
                    onClick={() => setTab('suspects')}
                    className="text-[11px] text-amber-500/70 font-semibold hover:text-amber-400 transition-colors"
                  >
                    Ready to accuse? View suspects &rarr;
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Suspects tab */}
          {tab === 'suspects' && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 mb-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-amber-500/50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-[0.15em]">
                  {data.userVote ? 'You can change your pick before time runs out' : 'Review the evidence, then pick a suspect'}
                </p>
              </div>
              {mystery.suspects.map((s, idx) => (
                <SuspectCard
                  key={s.id}
                  suspect={s}
                  voted={data.userVote === s.id}
                  voteCount={data.voteCounts[s.id] || 0}
                  totalVotes={data.totalVotes}
                  onVote={() => vote(s.id)}
                  disabled={voting}
                  revealed={data.revealed}
                  isGuilty={data.revealData?.answer === s.id}
                  colorIndex={idx}
                />
              ))}
            </div>
          )}

          {/* Case File tab */}
          {tab === 'casefile' && (
            <div className="space-y-3">
              {/* Your accusation */}
              <div className="glass rounded-lg p-4">
                <p className="text-[9px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-2.5">Your Accusation</p>
                {data.userVote ? (
                  <div className="flex items-center gap-3">
                    {(() => {
                      const sIdx = mystery.suspects.findIndex((s) => s.id === data.userVote);
                      const s = mystery.suspects[sIdx];
                      const sc = SUSPECT_COLORS[sIdx % SUSPECT_COLORS.length]!;
                      return s ? (
                        <>
                          <div className={`w-10 h-10 rounded-lg ${sc.bg} border ${sc.border} flex items-center justify-center`}>
                            <span className={`text-xs font-black tracking-wider ${sc.text}`}>{getInitials(s.name)}</span>
                          </div>
                          <div>
                            <p className="font-bold text-white text-[13px]">{s.name}</p>
                            <p className="text-[9px] text-amber-500/50 font-mono">ACCUSED</p>
                          </div>
                        </>
                      ) : null;
                    })()}
                  </div>
                ) : (
                  <p className="text-slate-500 text-[11px]">
                    No accusation filed.{' '}
                    <button className="text-amber-500/70 font-semibold" onClick={() => setTab('suspects')}>
                      View suspects &rarr;
                    </button>
                  </p>
                )}
              </div>

              {/* Timer */}
              <div className="glass rounded-lg p-4 text-center">
                <p className="text-[9px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-3">Time Remaining</p>
                <div className="flex justify-center gap-4">
                  {[
                    { val: countdown.h, label: 'HR' },
                    { val: countdown.m, label: 'MIN' },
                    { val: countdown.s, label: 'SEC' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div>
                        <p className="text-2xl font-extrabold text-amber-400/80 font-mono">
                          {String(item.val).padStart(2, '0')}
                        </p>
                        <p className="text-[7px] text-slate-600 uppercase tracking-wider">{item.label}</p>
                      </div>
                      {i < 2 && <span className="text-lg text-slate-700 -mt-3 font-mono">:</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Agent record */}
              <div className="glass rounded-lg p-4">
                <p className="text-[9px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-3">Agent Record</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: data.userStats.streak, label: 'Day Streak', accent: true },
                    { val: data.userStats.totalCorrect, label: 'Cases Solved', accent: false },
                    { val: data.userStats.totalPlayed, label: 'Cases Worked', accent: false },
                    { val: `${data.userStats.accuracy}%`, label: 'Solve Rate', accent: false },
                  ].map((item, i) => (
                    <div key={i} className="text-center py-2">
                      <p className={`text-xl font-extrabold font-mono ${item.accent ? 'gold-text' : 'text-white/70'}`}>
                        {item.val}
                      </p>
                      <p className="text-[7px] text-slate-600 uppercase tracking-wider mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community */}
              <div className="glass rounded-lg p-4">
                <p className="text-[9px] uppercase tracking-[0.15em] text-slate-500 font-semibold mb-2.5">Community</p>
                <div className="flex justify-around">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white/70 font-mono">{data.totalInvestigators}</p>
                    <p className="text-[7px] text-slate-600 uppercase tracking-wider">Active Agents</p>
                  </div>
                  <div className="w-px bg-slate-800" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-white/70 font-mono">{data.totalVotes}</p>
                    <p className="text-[7px] text-slate-600 uppercase tracking-wider">Accusations</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard tab */}
          {tab === 'leaderboard' && (
            <div className="space-y-4">
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-[0.15em]">
                Weekly Rankings
              </p>

              {leaderboard.loading ? (
                <div className="text-center py-10">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin mx-auto mb-3" />
                  <p className="text-slate-600 text-[10px] font-mono">Loading rankings...</p>
                </div>
              ) : leaderboard.data ? (
                <>
                  {leaderboard.data.weekly.length > 0 ? (
                    <RankingList entries={leaderboard.data.weekly} />
                  ) : (
                    <EmptyState message="No agents ranked yet. Be the first to solve a case." />
                  )}

                  <p className="text-[9px] font-semibold text-slate-600 uppercase tracking-[0.15em] pt-2">
                    All-Time Hall of Fame
                  </p>
                  {leaderboard.data.allTime.length > 0 ? (
                    <RankingList entries={leaderboard.data.allTime} />
                  ) : (
                    <EmptyState message="No entries yet." />
                  )}
                </>
              ) : (
                <EmptyState message="Failed to load rankings." />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="relative z-10">
        <TabBar active={tab} onChange={setTab} />
      </div>
    </div>
  );
}

function RankingList({ entries }: { entries: LeaderboardEntry[] }) {
  const medals = ['#FFD700', '#C0C0C0', '#CD7F32'];
  return (
    <div className="glass rounded-lg overflow-hidden">
      {entries.map((entry, idx) => (
        <div
          key={entry.username}
          className={`flex items-center justify-between px-4 py-3 ${
            idx < entries.length - 1 ? 'border-b border-white/[0.03]' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                idx < 3 ? 'text-black' : 'text-slate-500 bg-transparent'
              }`}
              style={idx < 3 ? { backgroundColor: medals[idx] } : undefined}
            >
              {idx < 3 ? idx + 1 : <span className="font-mono">{entry.rank}</span>}
            </div>
            <span className="text-[12px] text-white/80 font-medium">{entry.username}</span>
          </div>
          <span className="text-[11px] font-bold text-amber-400/80 font-mono">{entry.score}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8">
      <p className="text-slate-600 text-[11px]">{message}</p>
    </div>
  );
}

// ==================== Root ====================

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
