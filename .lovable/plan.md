

## TV Display Mode for "Ranking ao Vivo"

The current page uses tabs, small text, and a layout optimized for desktop monitors. For a sales floor TV, we need a completely different approach: large fonts, high contrast, no interaction needed, and auto-rotating content.

### Design Concept: "Stadium Scoreboard"

A full-screen, single-view layout with no tabs or scrolling. Everything important visible at once, optimized for readability at 3-5 meters distance.

```text
┌─────────────────────────────────────────────────────────────┐
│  🏆  RANKING AO VIVO          ● Live    14:32:05           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         ┌──────┐    ┌──────┐    ┌──────┐                    │
│         │  2nd │    │  1st │    │  3rd │                    │
│         │ 🥈   │    │ 🥇   │    │ 🥉   │                    │
│         │Avatar│    │Avatar│    │Avatar│                    │
│  ░░░░░░ │ Name │ ░░ │ Name │░░░ │ Name │ ░░░░░░            │
│  ░ BAR ░│ Pts  │ ░░ │ Pts  │░░░ │ Pts  │ ░ BAR ░           │
│  ░░░░░░ └──────┘ ░░ └──────┘░░░ └──────┘ ░░░░░░            │
│         ▓▓▓▓▓▓▓▓    ▓▓▓▓▓▓▓▓▓   ▓▓▓▓▓▓                    │
│          medium       tall        short   ← actual podium   │
│                                                             │
├──────────────────────────────────┬──────────────────────────┤
│  4. Avatar  Name     1.250 pts  │  FEED AO VIVO            │
│  5. Avatar  Name       980 pts  │  ● João fechou venda!    │
│  6. Avatar  Name       870 pts  │  ● Maria criou lead      │
│  7. Avatar  Name       650 pts  │  ● Pedro enviou proposta │
│  ...                             │  ...                     │
└──────────────────────────────────┴──────────────────────────┘
```

### Changes

**1. Redesign `GamificationLive.tsx` for TV mode**
- Remove tabs entirely -- show a single unified view
- Remove footer motivational cards (redundant for TV)
- Remove "Voltar ao Dashboard" button
- Layout: Podium (top 60% of screen) + Bottom split (list 4-10 left, activity feed right)
- Add a pulsing red "● AO VIVO" indicator with current time (clock updates every second)
- Header: much simpler, just title + live indicator + clock, no bouncing trophies

**2. Redesign `LeaderboardLive.tsx` with a true visual podium**
- Top 3 get a **physical podium** effect: three columns with different heights (2nd=medium, 1st=tall, 3rd=short) using actual height blocks at the bottom
- 1st place: huge avatar (128px), large name text (2xl), massive points (4xl), coral glow ring around avatar, subtle pulse animation
- 2nd/3rd: large avatar (96px), proportionally sized text
- Points use `tabular-nums` font for clean alignment
- Each podium block shows: medal emoji, avatar, name, points, sales count, conversion rate -- all large enough to read from across the room
- Rank 4-10 list: single horizontal rows with large text (lg/xl), big avatars (48px), clear separation

**3. Scale everything up for TV readability**
- Base font sizes increase: names 2xl-3xl, points 3xl-5xl, stats xl
- Avatars: 1st place 128px, 2nd/3rd 96px, rest 56px
- More whitespace/padding between elements
- Use `font-variant-numeric: tabular-nums` on all numbers for clean columns

**4. Auto-rotate activity feed**
- The activity feed on the right auto-scrolls through recent events
- No manual scrolling needed

### Files to edit
- `src/pages/GamificationLive.tsx` -- Flatten to single view, remove tabs/footer
- `src/components/gamification/LeaderboardLive.tsx` -- True podium with height blocks, scaled-up typography

No new dependencies needed. All existing data fetching and celebration modals remain intact.

