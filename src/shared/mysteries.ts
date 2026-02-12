import type { Mystery } from './api';

export const MYSTERY_BANK: Mystery[] = [
  {
    id: 'mystery-001',
    dayNumber: 1,
    title: 'The Case of the Missing Upvotes',
    description:
      'Overnight, the top post on the subreddit lost 10,000 upvotes. The mods are baffled. Someone manipulated the votes, but who? The server logs show suspicious activity from three accounts, each with a grudge against the original poster.',
    difficulty: 'easy',
    suspects: [
      {
        id: 's1',
        name: 'Captain Downvote',
        alibi: 'Claims to have been sleeping during the incident, phone was off.',
        motive:
          'Was publicly called out by OP for spreading misinformation last week.',
        background:
          'Known contrarian with a history of heated debates. Account is 5 years old with mostly negative karma.',
      },
      {
        id: 's2',
        name: 'The Shadow Mod',
        alibi: 'Says they were moderating another subreddit all night.',
        motive:
          "Wanted to remove OP's post but couldn't find a rule violation.",
        background:
          'Former mod who was demoted. Still has access to some mod tools through an alt account.',
      },
      {
        id: 's3',
        name: 'Karma Farmer',
        alibi:
          "Was busy posting memes in other subreddits - has timestamped posts to prove it.",
        motive:
          "OP's post was beating their own top post of all time.",
        background:
          'Power user who reposts content frequently. Very competitive about karma rankings.',
      },
    ],
    evidence: [
      {
        id: 'e1',
        type: 'direct',
        title: 'Server Log Fragment',
        description:
          'API calls from a single IP address sent 847 downvote requests in 3 minutes at 3:17 AM. The IP traces back to a VPN service.',
      },
      {
        id: 'e2',
        type: 'witness',
        title: 'AutoMod Report',
        description:
          'AutoModerator flagged unusual mod queue activity at 3:15 AM. Someone accessed the mod tools panel.',
      },
      {
        id: 'e3',
        type: 'visual',
        title: 'Account Activity Timeline',
        description:
          'Shadow Mod\'s alt account was active at 3:14 AM - just one minute before the mod tools were accessed. Their main account shows "offline" during this period.',
      },
      {
        id: 'e4',
        type: 'redherring',
        title: 'Angry DM Screenshot',
        description:
          'Captain Downvote sent OP a furious DM two days ago: "You\'ll regret crossing me." Sounds threatening but DMs alone don\'t prove technical capability.',
      },
      {
        id: 'e5',
        type: 'hidden',
        title: 'Mod Audit Log',
        description:
          'The audit log shows the mod tools were accessed with credentials belonging to The Shadow Mod\'s old account. The password was never changed after demotion.',
        unlockThreshold: 20,
      },
    ],
    answer: 's2',
    explanation:
      'The Shadow Mod used their old, never-deactivated mod credentials to access the mod tools at 3:15 AM. The server logs show the vote manipulation came through the mod API, not regular voting - something only someone with mod access could do. Captain Downvote was all bark and no byte, and Karma Farmer had verified alibis. The key was the mod audit log showing Shadow Mod\'s old account accessing the system.',
  },
  {
    id: 'mystery-002',
    dayNumber: 2,
    title: 'The Phantom Award Giver',
    description:
      'Someone is spending thousands of Reddit coins giving Ternion awards to completely random posts - a blurry photo of a sandwich, a misspelled shower thought, and a bot-generated weather update. The awards are anonymous, but three users had recently acquired large coin balances.',
    difficulty: 'medium',
    suspects: [
      {
        id: 's1',
        name: 'GoldRush Gary',
        alibi: 'Says he bought coins to award his girlfriend\'s cat photos.',
        motive: 'Testing a theory that random awards boost algorithm visibility.',
        background:
          'Data analyst who studies Reddit\'s recommendation algorithm. Has a blog about "gaming social media."',
      },
      {
        id: 's2',
        name: 'Prankster Pete',
        alibi: 'Claims he was at a comedy show all evening.',
        motive: 'Running a social experiment for his YouTube channel on Reddit reactions.',
        background:
          'Content creator known for elaborate pranks. Has 200K YouTube subscribers. Recently bought Reddit Premium.',
      },
      {
        id: 's3',
        name: 'Buggy Bot Beth',
        alibi: 'Her award bot was "turned off" - she has server logs showing it was idle.',
        motive: 'No apparent motive - claims it must be a bug.',
        background:
          'Developer who built an auto-award bot for her Discord community. The bot has Reddit API access.',
      },
    ],
    evidence: [
      {
        id: 'e1',
        type: 'direct',
        title: 'Award Timing Pattern',
        description:
          'All three awards were given at exactly 47 seconds past the minute (12:03:47, 12:15:47, 12:28:47). This precise timing suggests automation, not manual clicks.',
      },
      {
        id: 'e2',
        type: 'witness',
        title: 'API Rate Limit Alert',
        description:
          'Reddit\'s API logged unusual activity from a registered bot application called "DiscordAwardHelper" at the exact times of the awards.',
      },
      {
        id: 'e3',
        type: 'visual',
        title: 'Comedy Show Receipt',
        description:
          'Prankster Pete posted a selfie at the Laugh Factory with a timestamp of 12:10 PM - right between the first and second award. Appears genuine.',
      },
      {
        id: 'e4',
        type: 'redherring',
        title: 'Gary\'s Blog Post',
        description:
          'GoldRush Gary published an article titled "I Figured Out Reddit\'s Algorithm" last week. Suspicious but his coin purchase was only 500 coins - not enough for Ternion.',
      },
      {
        id: 'e5',
        type: 'hidden',
        title: 'Bot Server Crash Log',
        description:
          'Beth\'s server logs show her bot crashed at 11:58 AM and auto-restarted at 12:01 AM. The restart triggered a config file with a corrupted target list, causing it to award random posts.',
        unlockThreshold: 25,
      },
    ],
    answer: 's3',
    explanation:
      'Buggy Bot Beth\'s award bot crashed and auto-restarted with a corrupted configuration. The precise 47-second timing pattern matches the bot\'s cron schedule, the API logs trace back to her registered app "DiscordAwardHelper", and her "turned off" claim is contradicted by the crash-restart logs. It was genuinely accidental - a bug, not malice.',
  },
  {
    id: 'mystery-003',
    dayNumber: 3,
    title: 'The Impostor AMA',
    description:
      'An AMA claiming to be from a famous game developer went viral with 5,000 upvotes before mods noticed the account was created 2 hours before the post. The real developer denied involvement. Who impersonated them?',
    difficulty: 'medium',
    suspects: [
      {
        id: 's1',
        name: 'FanFic Frankie',
        alibi: 'Was streaming on Twitch during the AMA - has VOD proof.',
        motive: 'Obsessive fan who runs an unofficial fan wiki and wants insider knowledge to seem legit.',
        background:
          'Super fan with encyclopedic knowledge of the developer\'s games. Runs a 50K member fan community.',
      },
      {
        id: 's2',
        name: 'Clout Chaser Chris',
        alibi: 'Says they were at work during the AMA posting time.',
        motive: 'Recently lost followers after a controversy. Desperately needs a viral moment.',
        background:
          'Influencer with declining relevance. Previously caught exaggerating credentials. Has deep knowledge of the gaming industry.',
      },
      {
        id: 's3',
        name: 'Disgruntled Dev Dana',
        alibi: 'Was at a job interview across town.',
        motive: 'Recently fired from the game studio. Has inside knowledge and a grudge against the company.',
        background:
          'Former QA tester at the studio. Was let go during layoffs. Knows internal details that only employees would know.',
      },
    ],
    evidence: [
      {
        id: 'e1',
        type: 'direct',
        title: 'AMA Response Analysis',
        description:
          'The impostor correctly answered 3 questions about unreleased features that aren\'t public knowledge. Only current or former employees would know these details.',
      },
      {
        id: 'e2',
        type: 'witness',
        title: 'IP Geolocation',
        description:
          'The AMA account was created from an IP address in Portland, OR. The real developer is based in Seattle, WA.',
      },
      {
        id: 'e3',
        type: 'visual',
        title: 'Twitch VOD Timestamp',
        description:
          'Frankie\'s Twitch stream was live from 2 PM to 6 PM. The AMA was posted at 3:15 PM. Frankie appears on camera continuously.',
      },
      {
        id: 'e4',
        type: 'redherring',
        title: 'Chris\'s Deleted Tweet',
        description:
          'Chris tweeted "Big announcement coming tomorrow" the day before the AMA, then deleted it. But the tweet was about an unrelated brand deal that fell through.',
      },
      {
        id: 'e5',
        type: 'hidden',
        title: 'LinkedIn Location Check',
        description:
          'Dana updated their LinkedIn location to "Portland, OR" two weeks ago after being fired from the Seattle studio. Matches the IP geolocation.',
        unlockThreshold: 30,
      },
    ],
    answer: 's3',
    explanation:
      'Disgruntled Dev Dana had both the inside knowledge (correctly answering questions about unreleased features) and the motive (fired from the studio). The IP geolocation matches Portland, where Dana moved after being let go. Frankie had an airtight Twitch alibi, and Chris\'s deleted tweet was about an unrelated brand deal.',
  },
  {
    id: 'mystery-004',
    dayNumber: 4,
    title: 'The Subreddit Saboteur',
    description:
      'A once-thriving 100K member community has been overrun with spam bots overnight. The subscriber count is dropping fast as real users flee. Someone gave the bots access to bypass the spam filter. Three people had the ability to modify AutoMod rules.',
    difficulty: 'hard',
    suspects: [
      {
        id: 's1',
        name: 'Rival Rick',
        alibi: 'Was moderating his own competing subreddit.',
        motive: 'His competing subreddit has been losing members to this one. Sabotage would drive users to his community.',
        background:
          'Runs a similar community that\'s been declining. Former friends with the head mod before a public falling out.',
      },
      {
        id: 's2',
        name: 'Burnout Bailey',
        alibi: 'Says they were on vacation and didn\'t touch Reddit all week.',
        motive: 'Has been complaining about mod burnout for months. Might have wanted an excuse to step down.',
        background:
          'Senior mod who\'s been handling most of the workload alone. Recently posted about quitting Reddit entirely.',
      },
      {
        id: 's3',
        name: 'Newbie Mod Nina',
        alibi: 'Claims she was asleep when it happened.',
        motive: 'No obvious motive, but she was recently added as a mod and might have accidentally misconfigured something.',
        background:
          'Added as mod just 2 weeks ago to help with growing workload. Enthusiastic but inexperienced.',
      },
      {
        id: 's4',
        name: 'Crypto Carl',
        alibi: 'Says he has no idea what happened and points fingers at Rick.',
        motive: 'Has been trying to promote his crypto project in the community. Got warned twice by mods.',
        background:
          'Active community member who\'s been pushing the boundaries of self-promotion rules. Surprisingly tech-savvy.',
      },
    ],
    evidence: [
      {
        id: 'e1',
        type: 'direct',
        title: 'AutoMod Change Log',
        description:
          'AutoMod rules were modified at 2:33 AM to whitelist a specific pattern that the spam bots use. The change was made from Bailey\'s mod account.',
      },
      {
        id: 'e2',
        type: 'witness',
        title: 'Vacation Photo Metadata',
        description:
          'Bailey posted vacation photos on Instagram. The EXIF data shows they were taken with their phone at the beach, but the upload time was 2:45 AM - 12 minutes after the AutoMod change.',
      },
      {
        id: 'e3',
        type: 'visual',
        title: 'Rick\'s Subreddit Growth Spike',
        description:
          'Rick\'s competing subreddit gained 3,000 new members in the 24 hours following the attack. He posted a "welcome refugees" thread.',
      },
      {
        id: 'e4',
        type: 'redherring',
        title: 'Nina\'s Config Mistake',
        description:
          'Nina accidentally broke a CSS rule last week, causing visual glitches. But CSS changes and AutoMod changes require different permissions.',
      },
      {
        id: 'e5',
        type: 'direct',
        title: 'DM Between Rick and Carl',
        description:
          'A leaked DM shows Rick telling Carl: "If you get me access to their AutoMod, I\'ll promote your coin in my sub." Carl replied with a thumbs up emoji.',
      },
      {
        id: 'e6',
        type: 'hidden',
        title: 'Login Session Data',
        description:
          'Bailey\'s account was accessed from an IP that matches Carl\'s known location. Carl phished Bailey\'s password through a fake "mod verification" link sent via DM.',
        unlockThreshold: 30,
      },
    ],
    answer: 's4',
    explanation:
      'Crypto Carl phished Bailey\'s mod credentials using a fake verification link, then used Bailey\'s account to modify AutoMod rules at 2:33 AM. Rick orchestrated the plan, promising Carl promotion for his crypto project. The leaked DMs prove the conspiracy, and the login session data shows Carl accessed Bailey\'s account from his own IP. Bailey was genuinely on vacation - they were the victim, not the perpetrator.',
  },
  {
    id: 'mystery-005',
    dayNumber: 5,
    title: 'The Deleted Masterpiece',
    description:
      'A user spent 3 months creating an incredible piece of digital art and posted it to the community. Within an hour, it was deleted - not by mods, but by the original account. The artist claims they didn\'t delete it and their account was compromised.',
    difficulty: 'easy',
    suspects: [
      {
        id: 's1',
        name: 'Jealous Jess',
        alibi: 'Was in a voice chat with friends during the deletion time.',
        motive: 'Her own art post was overshadowed by the masterpiece. Was visibly upset in comments.',
        background:
          'Talented artist who usually gets top post. Publicly congratulated the artist but privately seethed.',
      },
      {
        id: 's2',
        name: 'Ex-Partner Pat',
        alibi: 'Claims to have no Reddit account.',
        motive: 'Recently broke up with the artist. The artwork contained a hidden dedication to Pat that was embarrassing.',
        background:
          'Broke up with the artist last month. Has been trying to get the artist to "move on" and stop posting about their relationship.',
      },
      {
        id: 's3',
        name: 'Troll Tyler',
        alibi: 'Says he was banned from the subreddit weeks ago.',
        motive: 'Enjoys causing chaos for entertainment.',
        background:
          'Known troublemaker who has been banned from multiple communities. Claims to have "connections" everywhere.',
      },
    ],
    evidence: [
      {
        id: 'e1',
        type: 'direct',
        title: 'Login Location',
        description:
          'The deletion was made from a device in the same city as the artist, not from a remote location.',
      },
      {
        id: 'e2',
        type: 'witness',
        title: 'Artist\'s Password Habits',
        description:
          'The artist admitted they use the same password for Reddit and their email. Their email was recently accessed from an unknown device.',
      },
      {
        id: 'e3',
        type: 'visual',
        title: 'Pat\'s Browser History',
        description:
          'Pat\'s friend mentioned Pat was "really upset about that dedication" and was trying to "make it go away."',
      },
      {
        id: 'e4',
        type: 'redherring',
        title: 'Jess\'s Rant',
        description:
          'Jess ranted about "people who post low effort art" in a Discord server. But the masterpiece was clearly high-effort - Jess was venting about a different post.',
      },
      {
        id: 'e5',
        type: 'hidden',
        title: 'Email Access Log',
        description:
          'The artist\'s email was accessed from Pat\'s home IP address 30 minutes before the deletion. Pat used the email access to reset the Reddit password.',
        unlockThreshold: 15,
      },
    ],
    answer: 's2',
    explanation:
      'Ex-Partner Pat accessed the artist\'s email using shared knowledge (they were in a relationship and likely knew the password). They reset the Reddit password through email recovery, logged in, and deleted the post to remove the embarrassing hidden dedication. The same-city login location and email access logs both point to Pat.',
  },
  {
    id: 'mystery-006',
    dayNumber: 6,
    title: 'The Copycat Crisis',
    description:
      'Three different users posted suspiciously similar original content within 30 minutes of each other. Each claims to be the original creator. One is the real artist, and two are copycats who somehow got advance access to the work.',
    difficulty: 'medium',
    suspects: [
      {
        id: 's1',
        name: 'User AlphaCreator',
        alibi: 'Posted first at 8:00 AM. Has a history of similar work.',
        motive: 'Wants recognition and karma for their art.',
        background:
          'Account is 3 years old. Has a consistent posting history of similar artwork. Portfolio website matches their style.',
      },
      {
        id: 's2',
        name: 'User BetaBrush',
        alibi: 'Posted at 8:15 AM. Claims they started the piece weeks ago.',
        motive: 'Wants to build an art portfolio quickly.',
        background:
          'Account is 4 months old. Posting history shows rapid improvement that seems unrealistic. No portfolio website.',
      },
      {
        id: 's3',
        name: 'User GammaGraphics',
        alibi: 'Posted at 8:27 AM. Says they shared the idea in a Discord first.',
        motive: 'Trying to get noticed by a game studio that frequents the subreddit.',
        background:
          'Account is 1 year old. Mixed posting history. Claims to be a freelance artist but has no client work shown.',
      },
    ],
    evidence: [
      {
        id: 'e1',
        type: 'direct',
        title: 'Image Metadata',
        description:
          'AlphaCreator\'s image has Photoshop metadata showing it was saved in 47 layers over 12 days. BetaBrush\'s version has metadata from a screenshot tool. Gamma\'s has no metadata (stripped).',
      },
      {
        id: 'e2',
        type: 'witness',
        title: 'Discord Server Logs',
        description:
          'GammaGraphics shared the image in a Discord art server at 7:45 AM with the caption "check out what I found." Found, not created.',
      },
      {
        id: 'e3',
        type: 'direct',
        title: 'Portfolio Comparison',
        description:
          'AlphaCreator\'s website shows work-in-progress shots of the piece from 2 weeks ago. Style is consistent with their previous work.',
      },
      {
        id: 'e4',
        type: 'redherring',
        title: 'BetaBrush\'s Sketch',
        description:
          'BetaBrush posted a "rough sketch" as proof, but reverse image search shows the sketch was AI-generated to match the final piece.',
      },
      {
        id: 'e5',
        type: 'hidden',
        title: 'File Origin Trace',
        description:
          'BetaBrush and Gamma both accessed AlphaCreator\'s cloud storage link that was accidentally left public for 2 hours on their portfolio site.',
        unlockThreshold: 25,
      },
    ],
    answer: 's1',
    explanation:
      'AlphaCreator is the real artist. The Photoshop metadata proving 12 days of work across 47 layers, the portfolio WIP shots from 2 weeks ago, and the consistent style history all confirm originality. BetaBrush used a screenshot (no creation metadata) and faked a sketch with AI. GammaGraphics said "check out what I found" - admitting they found it, not created it. Both copycats accessed Alpha\'s accidentally public cloud storage.',
  },
  {
    id: 'mystery-007',
    dayNumber: 7,
    title: 'The Weekend Whodunit: Chaos at the Virtual Meetup',
    description:
      'During the subreddit\'s annual virtual meetup, the shared Spotify playlist was hijacked to play nothing but Rickrolls, the community Discord was flooded with memes, and the moderator\'s presentation slides were replaced with cat photos. All three incidents happened within 5 minutes. Who orchestrated this coordinated chaos?',
    difficulty: 'hard',
    suspects: [
      {
        id: 's1',
        name: 'Meme Lord Max',
        alibi: 'Was presenting their "Best Memes of the Year" segment during the incident.',
        motive: 'It would be peak irony and the ultimate meme.',
        background:
          'The community\'s most beloved shitposter. Known for elaborate pranks. Was the emcee for part of the meetup.',
      },
      {
        id: 's2',
        name: 'Quiet Quinn',
        alibi: 'Camera was off during the meetup, claims bad internet.',
        motive: 'Recently proposed a community restructure that was rejected. Might want to prove the current system is fragile.',
        background:
          'Lurker who rarely posts but has deep technical knowledge. Systems administrator by profession.',
      },
      {
        id: 's3',
        name: 'Newbie Nancy',
        alibi: 'Just joined the community last month. Says they barely know how Discord works.',
        motive: 'Trying to make a memorable first impression.',
        background:
          'New member who\'s been suspiciously eager to help with tech setup. Volunteered to "test" all the shared links before the event.',
      },
      {
        id: 's4',
        name: 'Old Guard Oliver',
        alibi: 'Was giving the opening speech when the chaos started.',
        motive: 'Nostalgic for "the old days" before the community grew. Has openly said things were better when it was smaller.',
        background:
          'Founding member who\'s been increasingly vocal about the community "losing its soul." Respected but out of touch.',
      },
    ],
    evidence: [
      {
        id: 'e1',
        type: 'direct',
        title: 'Spotify Playlist Edit History',
        description:
          'The playlist was modified by a Spotify account named "test_helper_2026." The account was created the same day Nancy volunteered to test links.',
      },
      {
        id: 'e2',
        type: 'witness',
        title: 'Discord Bot Logs',
        description:
          'The meme flood was sent by a webhook that was added to the Discord server during "tech testing" 3 days ago.',
      },
      {
        id: 'e3',
        type: 'visual',
        title: 'Presentation File Access',
        description:
          'The Google Slides were last edited by an anonymous user whose browser fingerprint matches the device used during the "link testing" session.',
      },
      {
        id: 'e4',
        type: 'redherring',
        title: 'Max\'s Prank History',
        description:
          'Max once replaced all server emojis with variations of the same face. Classic Max. But during this incident, Max was visibly on camera presenting.',
      },
      {
        id: 'e5',
        type: 'redherring',
        title: 'Quinn\'s Network Tools',
        description:
          'Quinn has professional hacking tools on their computer (they\'re a sysadmin). But having tools doesn\'t mean they used them for this.',
      },
      {
        id: 'e6',
        type: 'hidden',
        title: 'Volunteer Chat Logs',
        description:
          'In the volunteer planning chat, Nancy asked for access to the Spotify playlist, the Discord admin panel, AND the presentation slides "for testing." No other volunteer had all three.',
        unlockThreshold: 35,
      },
    ],
    answer: 's3',
    explanation:
      'Newbie Nancy orchestrated the entire thing. By volunteering to "test" the tech setup, Nancy gained access to all three systems: the Spotify playlist (created a test account to edit it), the Discord server (added a webhook during "testing"), and the presentation slides (accessed via the shared link). The Spotify account creation date, the webhook timing, and the browser fingerprint all trace back to Nancy\'s "testing" sessions. Nancy wasn\'t a clueless newbie - they were a very prepared prankster making a dramatic entrance.',
  },
];

export function getMysteryForDay(dayNumber: number): Mystery {
  const index = (dayNumber - 1) % MYSTERY_BANK.length;
  return MYSTERY_BANK[index]!;
}

export function getCurrentDayNumber(): number {
  const startDate = new Date('2026-02-12T00:00:00Z');
  const now = new Date();
  const diffTime = now.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

// TEST MODE: Set to short cycles for testing. Change TEST_MODE=false before final upload.
const TEST_MODE = true;
const TEST_CYCLE_MS = 5 * 60 * 1000; // 5 minute total cycle
const TEST_ACTIVE_MS = 60 * 1000; // 1 minute to vote, then 4 minutes of reveal

export function getRevealTime(): Date {
  if (TEST_MODE) {
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setUTCHours(0, 0, 0, 0);
    const elapsed = now.getTime() - dayStart.getTime();
    const cycleNumber = Math.floor(elapsed / TEST_CYCLE_MS);
    const cycleStart = dayStart.getTime() + cycleNumber * TEST_CYCLE_MS;
    return new Date(cycleStart + TEST_ACTIVE_MS);
  }
  const now = new Date();
  const reveal = new Date(now);
  reveal.setUTCHours(22, 0, 0, 0);
  if (now >= reveal) {
    reveal.setDate(reveal.getDate() + 1);
  }
  return reveal;
}

export function isRevealed(): boolean {
  if (TEST_MODE) {
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setUTCHours(0, 0, 0, 0);
    const elapsed = now.getTime() - dayStart.getTime();
    const posInCycle = elapsed % TEST_CYCLE_MS;
    return posInCycle >= TEST_ACTIVE_MS; // revealed for the remaining 4 minutes
  }
  const now = new Date();
  const today6am = new Date(now);
  today6am.setUTCHours(6, 0, 0, 0);
  const today22pm = new Date(now);
  today22pm.setUTCHours(22, 0, 0, 0);
  return now >= today22pm || now < today6am;
}
