// Types shared between client and server

export interface Suspect {
  id: string;
  name: string;
  alibi: string;
  motive: string;
  background: string;
}

export interface Evidence {
  id: string;
  type: 'direct' | 'witness' | 'visual' | 'redherring' | 'hidden';
  title: string;
  description: string;
  unlockThreshold?: number;
}

export interface Mystery {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  suspects: Suspect[];
  evidence: Evidence[];
  answer: string;
  explanation: string;
}

export type MysteryResponse = {
  type: 'mystery';
  mystery: Omit<Mystery, 'answer' | 'explanation'>;
  userVote: string | null;
  voteCounts: Record<string, number>;
  totalVotes: number;
  totalInvestigators: number;
  revealed: boolean;
  revealData?: {
    answer: string;
    explanation: string;
    correct: boolean | null;
  };
  timeUntilReveal: number;
  userStats: UserStats;
};

export type VoteResponse = {
  type: 'vote';
  suspectId: string;
  voteCounts: Record<string, number>;
  totalVotes: number;
};

export type LeaderboardEntry = {
  username: string;
  score: number;
  streak: number;
  rank: number;
};

export type LeaderboardResponse = {
  type: 'leaderboard';
  weekly: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
  userRank: number;
  userScore: number;
};

export type UserStats = {
  streak: number;
  totalCorrect: number;
  totalPlayed: number;
  accuracy: number;
};

export type ErrorResponse = {
  status: 'error';
  message: string;
};
