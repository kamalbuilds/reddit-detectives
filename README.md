# Karma Kriminals

A daily mystery game for Reddit communities built with Devvit Web.

Every day, a new Reddit-themed mystery drops. Examine evidence, interrogate suspects, and vote on who you think is guilty before the reveal timer expires. Earn points, build streaks, and climb the leaderboard.

## How It Works

1. **A mystery post appears** daily in the subreddit
2. **Examine evidence** — physical clues, witness statements, visual analysis, and classified intel that unlocks as more people vote
3. **Read suspect profiles** — check their alibis, motives, and backgrounds
4. **Vote guilty** — pick the suspect you think did it (you can change your mind before the reveal)
5. **Reveal** — at 10 PM UTC the answer is revealed, points are scored, and streaks are tracked

## Architecture

- **Platform**: [Devvit Web](https://developers.reddit.com/) (Reddit's developer platform)
- **Frontend**: React 19 + Tailwind CSS 4 + TypeScript
- **Backend**: Hono (Node.js serverless)
- **Storage**: Devvit Redis (hashes, sorted sets, strings)
- **Build**: Vite 7

### Project Structure

```
src/
  client/
    splash.tsx     # Inline post view (mystery title, timer, CTA)
    game.tsx       # Expanded game UI (evidence, suspects, voting, reveal)
    index.css      # Tailwind + custom animations
  server/
    index.ts       # Hono router
    routes/
      api.ts       # Game API (mystery, vote, leaderboard, reveal)
      menu.ts      # Mod menu action (Create Daily Mystery)
      triggers.ts  # onAppInstall trigger (auto-creates first post)
    core/
      post.ts      # Custom post creation helper
  shared/
    api.ts         # Shared TypeScript types
    mysteries.ts   # Mystery content bank + day rotation helpers
```

### Two-Entrypoint Pattern

- **Splash** (`splash.html`) — Inline post view shown in the feed. Shows mystery title, difficulty, investigator count, countdown timer, and "Investigate Now" button.
- **Game** (`game.html`) — Expanded full-screen view. Four tabs: Evidence, Suspects, Case File, Ranks. Animated reveal screen with phased transitions.

## Commands

- `bun run dev` — Start development server with live reload on Reddit
- `bun run build` — Build client and server
- `npx devvit upload` — Upload new version
- `npx devvit publish` — Publish app for review

## Scoring

- **10 points** for a correct guess
- **Streak bonus**: +2 per consecutive correct day (capped at 20)
- **Weekly + All-Time** leaderboards via Redis sorted sets
