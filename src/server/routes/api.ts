import { Hono } from 'hono';
import { redis, reddit } from '@devvit/web/server';
import type {
  MysteryResponse,
  VoteResponse,
  LeaderboardResponse,
  LeaderboardEntry,
  UserStats,
  ErrorResponse,
} from '../../shared/api';
import {
  getMysteryForDay,
  getCurrentDayNumber,
  getRevealTime,
  isRevealed,
} from '../../shared/mysteries';

export const api = new Hono();

function parseStats(data: Record<string, string>): UserStats {
  return {
    streak: parseInt(data.streak || '0'),
    totalCorrect: parseInt(data.totalCorrect || '0'),
    totalPlayed: parseInt(data.totalPlayed || '0'),
    accuracy: parseFloat(data.accuracy || '0'),
  };
}

// GET /api/mystery - Get current mystery state
api.get('/mystery', async (c) => {
  try {
    const username = await reddit.getCurrentUsername();
    if (!username) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Not authenticated' },
        401
      );
    }

    const dayNumber = getCurrentDayNumber();
    const mystery = getMysteryForDay(dayNumber);
    const dayKey = `mystery:day:${dayNumber}`;

    // Get user's vote
    const userVote = await redis.hGet(`${dayKey}:votes`, username);

    // Get vote counts
    const voteCounts: Record<string, number> = {};
    const voteData = await redis.hGetAll(`${dayKey}:vote_counts`);
    for (const [key, val] of Object.entries(voteData)) {
      voteCounts[key] = parseInt(val) || 0;
    }

    // Get total votes
    const totalVotesStr = await redis.get(`${dayKey}:total_votes`);
    const totalVotes = parseInt(totalVotesStr || '0');

    // Track investigator (use hash since no set operations)
    await redis.hSet(`${dayKey}:investigators`, { [username]: '1' });
    const totalInvestigators = await redis.hLen(`${dayKey}:investigators`);

    // Check if revealed
    const revealed = isRevealed();
    const revealTime = getRevealTime();
    const timeUntilReveal = Math.max(0, revealTime.getTime() - Date.now());

    // Get user stats
    const statsData = await redis.hGetAll(`user:${username}:stats`);
    const userStats = parseStats(statsData);

    // Process evidence - hide locked hidden evidence, show everything if revealed
    const processedEvidence = revealed
      ? mystery.evidence
      : mystery.evidence.map((e) => {
          if (
            e.type === 'hidden' &&
            e.unlockThreshold &&
            totalVotes < e.unlockThreshold
          ) {
            return {
              ...e,
              description: `[LOCKED] ${e.unlockThreshold - totalVotes} more community votes needed to unlock this classified intel.`,
            };
          }
          return e;
        });

    // Build response
    const response: MysteryResponse = {
      type: 'mystery',
      mystery: {
        id: mystery.id,
        dayNumber: mystery.dayNumber,
        title: mystery.title,
        description: mystery.description,
        difficulty: mystery.difficulty,
        suspects: mystery.suspects,
        evidence: processedEvidence,
      },
      userVote: userVote || null,
      voteCounts,
      totalVotes,
      totalInvestigators,
      revealed,
      timeUntilReveal,
      userStats,
    };

    // Add reveal data if revealed
    if (revealed) {
      response.revealData = {
        answer: mystery.answer,
        explanation: mystery.explanation,
        correct: userVote ? userVote === mystery.answer : null,
      };
    }

    return c.json(response);
  } catch (error) {
    console.error('Mystery API error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to load mystery' },
      500
    );
  }
});

// POST /api/vote - Cast or change vote
api.post('/vote', async (c) => {
  try {
    const username = await reddit.getCurrentUsername();
    if (!username) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Not authenticated' },
        401
      );
    }

    const { suspectId } = await c.req.json<{ suspectId: string }>();
    if (!suspectId) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'suspectId required' },
        400
      );
    }

    if (isRevealed()) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Mystery already revealed' },
        400
      );
    }

    const dayNumber = getCurrentDayNumber();
    const mystery = getMysteryForDay(dayNumber);
    const dayKey = `mystery:day:${dayNumber}`;

    // Verify suspect exists
    if (!mystery.suspects.find((s) => s.id === suspectId)) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Invalid suspect' },
        400
      );
    }

    // Check for existing vote
    const existingVote = await redis.hGet(`${dayKey}:votes`, username);

    if (existingVote) {
      // Change vote - decrement old, increment new
      await redis.hIncrBy(`${dayKey}:vote_counts`, existingVote, -1);
      await redis.hIncrBy(`${dayKey}:vote_counts`, suspectId, 1);
    } else {
      // New vote
      await redis.hIncrBy(`${dayKey}:vote_counts`, suspectId, 1);
      await redis.incrBy(`${dayKey}:total_votes`, 1);
    }

    // Set user's vote
    await redis.hSet(`${dayKey}:votes`, { [username]: suspectId });

    // Get updated counts
    const voteCounts: Record<string, number> = {};
    const voteData = await redis.hGetAll(`${dayKey}:vote_counts`);
    for (const [key, val] of Object.entries(voteData)) {
      voteCounts[key] = parseInt(val) || 0;
    }
    const totalVotesStr = await redis.get(`${dayKey}:total_votes`);
    const totalVotes = parseInt(totalVotesStr || '0');

    return c.json<VoteResponse>({
      type: 'vote',
      suspectId,
      voteCounts,
      totalVotes,
    });
  } catch (error) {
    console.error('Vote API error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to cast vote' },
      500
    );
  }
});

// GET /api/leaderboard - Weekly + all-time top 10
api.get('/leaderboard', async (c) => {
  try {
    const username = await reddit.getCurrentUsername();

    // Get weekly top 10 (highest scores first)
    const weeklyRaw = await redis.zRange('leaderboard:weekly', 0, 9, {
      by: 'rank',
      reverse: true,
    });
    const weekly: LeaderboardEntry[] = weeklyRaw.map((entry, idx) => ({
      username: entry.member,
      score: entry.score,
      streak: 0,
      rank: idx + 1,
    }));

    // Get all-time top 10
    const allTimeRaw = await redis.zRange('leaderboard:alltime', 0, 9, {
      by: 'rank',
      reverse: true,
    });
    const allTime: LeaderboardEntry[] = allTimeRaw.map((entry, idx) => ({
      username: entry.member,
      score: entry.score,
      streak: 0,
      rank: idx + 1,
    }));

    // Get user rank
    let userRank = 0;
    let userScore = 0;
    if (username) {
      const score = await redis.zScore('leaderboard:weekly', username);
      userScore = score || 0;
      const rank = await redis.zRank('leaderboard:weekly', username);
      userRank = rank !== undefined ? rank + 1 : 0;
    }

    return c.json<LeaderboardResponse>({
      type: 'leaderboard',
      weekly,
      allTime,
      userRank,
      userScore,
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to load leaderboard' },
      500
    );
  }
});

// GET /api/reveal - Process scoring and return reveal data
api.get('/reveal', async (c) => {
  try {
    const username = await reddit.getCurrentUsername();
    if (!username) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Not authenticated' },
        401
      );
    }

    if (!isRevealed()) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Not revealed yet' },
        400
      );
    }

    const dayNumber = getCurrentDayNumber();
    const mystery = getMysteryForDay(dayNumber);
    const dayKey = `mystery:day:${dayNumber}`;

    const userVote = await redis.hGet(`${dayKey}:votes`, username);

    // Score the user if not already scored
    const scored = await redis.hGet(`${dayKey}:scored`, username);
    if (!scored && userVote) {
      const correct = userVote === mystery.answer;
      const basePoints = correct ? 10 : 0;

      // Get current stats
      const stats = await redis.hGetAll(`user:${username}:stats`);
      const currentStreak = parseInt(stats.streak || '0');
      const totalCorrect = parseInt(stats.totalCorrect || '0');
      const totalPlayed = parseInt(stats.totalPlayed || '0');

      const newStreak = correct ? currentStreak + 1 : 0;
      const newTotalCorrect = correct ? totalCorrect + 1 : totalCorrect;
      const newTotalPlayed = totalPlayed + 1;
      const newAccuracy =
        newTotalPlayed > 0
          ? Math.round((newTotalCorrect / newTotalPlayed) * 100)
          : 0;

      // Streak bonus: +2 per consecutive day, capped at 20
      const streakBonus = correct ? Math.min(newStreak * 2, 20) : 0;
      const totalPoints = basePoints + streakBonus;

      await redis.hSet(`user:${username}:stats`, {
        streak: String(newStreak),
        totalCorrect: String(newTotalCorrect),
        totalPlayed: String(newTotalPlayed),
        accuracy: String(newAccuracy),
        lastPlayed: String(dayNumber),
      });

      // Update leaderboards
      if (totalPoints > 0) {
        await redis.zIncrBy('leaderboard:weekly', username, totalPoints);
        await redis.zIncrBy('leaderboard:alltime', username, totalPoints);
      }

      // Mark as scored
      await redis.hSet(`${dayKey}:scored`, { [username]: '1' });
    }

    // Get updated stats
    const statsData = await redis.hGetAll(`user:${username}:stats`);
    const userStats = parseStats(statsData);

    // Get vote counts
    const voteCounts: Record<string, number> = {};
    const voteData = await redis.hGetAll(`${dayKey}:vote_counts`);
    for (const [key, val] of Object.entries(voteData)) {
      voteCounts[key] = parseInt(val) || 0;
    }
    const totalVotesStr = await redis.get(`${dayKey}:total_votes`);
    const totalVotes = parseInt(totalVotesStr || '0');
    const totalInvestigators = await redis.hLen(`${dayKey}:investigators`);

    return c.json<MysteryResponse>({
      type: 'mystery',
      mystery: {
        id: mystery.id,
        dayNumber: mystery.dayNumber,
        title: mystery.title,
        description: mystery.description,
        difficulty: mystery.difficulty,
        suspects: mystery.suspects,
        evidence: mystery.evidence,
      },
      userVote: userVote || null,
      voteCounts,
      totalVotes,
      totalInvestigators,
      revealed: true,
      revealData: {
        answer: mystery.answer,
        explanation: mystery.explanation,
        correct: userVote ? userVote === mystery.answer : null,
      },
      timeUntilReveal: 0,
      userStats,
    });
  } catch (error) {
    console.error('Reveal API error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to load reveal' },
      500
    );
  }
});
