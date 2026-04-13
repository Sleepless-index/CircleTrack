# Uma Club Tracker

A Next.js app for tracking Umamusume club members' fan gains per week.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Rank Assets

Place your rank PNG files in the `/public/ranks/` folder using this exact naming:

| Rank | Filename       |
|------|---------------|
| SS   | `SS.png`      |
| S+   | `S-plus.png`  |
| S    | `S.png`       |
| A+   | `A-plus.png`  |
| A    | `A.png`       |
| B+   | `B-plus.png`  |
| B    | `B.png`       |
| C+   | `C-plus.png`  |
| C    | `C.png`       |
| D+   | `D-plus.png`  |

If a PNG is missing, the app falls back to displaying the rank text.

## Deploying to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project → select your repo
3. Leave all settings as default → Deploy

## How It Works

- **Landing page** — shows all your clubs as cards (rank image → name → member count). Click the dashed `+` card to add a new club. Hover a card to reveal the edit icon.
- **Club page** — week tabs across the top (calculated from the current month's calendar). Table shows: Trainer Name, Previous Fans, Current Fans, Fan Increase (auto-calculated). Click the edit icon on any row to update fan numbers.
- **Burger menu** — slides in from the right. Shows all members with their latest fan count. Use it to add or remove members.
- **Remove mode** — triggered from the burger menu. Puts the table into checkbox mode. Select members to remove, then confirm.
- **Data** — all data is stored in `localStorage` under the key `uma-club-tracker-v1`. No backend required.
