# QA Dashboard — React Demo

Static prototype of the VIP Account Manager QA Dashboard. React + Vite +
Tailwind v4 + ApexCharts, with the dummy data bundled as JSON. No backend,
no database, no auth — purely a visual walkthrough.

## Deploy on CodeSandbox (the easy path)

1. Go to **https://codesandbox.io/** and sign in.
2. Click **Create** → **Import from GitHub** _or_ **Create Sandbox** → **Import Project**.
   - If using the GitHub flow, first push this folder to a new GitHub repo, then paste the repo URL.
   - If uploading directly, drag the unzipped folder into the upload box.
3. CodeSandbox auto-detects Vite, runs `npm install`, and starts `npm run dev`.
4. A preview URL appears in the right-hand panel — something like
   `https://abcde-5173.csb.app`. That's the share link.

The first boot takes ~30 seconds while dependencies install. Subsequent
loads are instant.

## Run locally (alternative)

```bash
npm install
npm run dev
```

Then open the URL Vite prints (typically `http://localhost:5173`).

## What's wired up

- **`/dashboard`** — period dropdown, searchable multi-select agent filter,
  4 KPI cards with vs-previous-period delta, top/bottom-5 panels with
  click-through, violation stacked bar, risk donut. Filter state is in the
  URL so links are shareable.
- **`/agents/{id}`** — profile header (office badge: CR=blue, PRG=purple),
  score history line chart, violation breakdown bar, executive summary,
  paginated dossier table (rows clickable → chat detail).
- **`/chats/{id}`** — header with risk/empathy/pending badges, 5 SOP
  sections (QA Summary with PASS/FAIL + critical detection, Risk Alerts &
  Patterns, Revenue Opportunity Report, Leadership Summary with human
  feedback, Coaching Plan with auto-formatted "Example script:" block),
  slide-out transcript modal with tab switcher between the two sample
  transcripts.
- **`/reviews`** — chats where `requires_human_review = true`, sorted
  CRIT → LOW then by score ascending. Sidebar shows pending count badge.
- **`/configurations`** — intentional stub.
- **Dark mode** — sun/moon toggle in the topbar, persisted to
  `localStorage`. Charts re-render with new fore/grid colors when toggled.

## Demo data caveats

All 30 chats fall between 2026-05-19 and 2026-05-25. "Last Week" shows
~3 chats; "Last Month" shows 0. Period semantics are anchored to
`metadata.period_end` (2026-05-26) so "This Week" always has data.

The topbar user is hardcoded to "Marypaz" — auth is out of scope.

## File layout

```
qa-dashboard-react/
├── package.json
├── vite.config.js
├── index.html
├── README.md
└── src/
    ├── main.jsx              # entry
    ├── App.jsx               # router setup
    ├── index.css             # Tailwind import + tokens
    ├── data/
    │   └── qaData.json       # bundled dummy data
    ├── lib/
    │   ├── qaService.js      # JS port of the Laravel QaDataService
    │   └── useTheme.js       # dark-mode hook
    ├── components/
    │   ├── Layout.jsx        # sidebar + topbar shell
    │   ├── Sidebar.jsx
    │   ├── Topbar.jsx
    │   ├── Breadcrumb.jsx
    │   ├── KpiCard.jsx
    │   ├── Badges.jsx        # Risk + Empathy + Score badges
    │   └── Charts.jsx        # 4 ApexCharts wrappers
    └── pages/
        ├── Dashboard.jsx
        ├── AgentDetail.jsx
        ├── ChatDetail.jsx
        ├── ReviewsQueue.jsx
        └── Configurations.jsx
```

## Out of scope

- Authentication / user permissions
- Real API or DB (everything reads the bundled JSON)
- Configurations admin UI
- Export to CSV/PDF
- Search across chats globally
