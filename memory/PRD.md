# AJX90 — Product Requirements

## Original problem statement
The user tracks calories and macros in Excel by meal segment and manually asks ChatGPT to estimate nutrition. They want to paste a natural-language meal once and have calories, protein, carbs, fibre, and fats calculated and tracked daily across Breakfast, Lunch, Dinner, and Snacks.

## Architecture decisions
- React dashboard with FastAPI API and MongoDB persistence.
- OpenAI GPT-5.4 through the Emergent universal key, called server-side.
- Meal records use UUIDs and ISO date strings; MongoDB `_id` is excluded from responses.
- Frontend calls only `REACT_APP_BACKEND_URL`; backend uses only `MONGO_URL`.

## User personas
- Primary: health-conscious person replacing an Excel calorie log with faster natural-language meal entry.
- Secondary: anyone who wants a simple daily macro snapshot without nutrition database expertise.

## Core requirements (static)
- Paste a meal description.
- Select Breakfast, Lunch, Dinner, or Snacks.
- Estimate calories, protein, carbs, fibre, and fats.
- Review and save the estimate.
- View daily totals and progress toward macro targets.
- Browse dates and delete meals.

## Implemented (2026-08-23)
- GPT-5.4 nutrition estimate endpoint with structured JSON parsing and assumption notes.
- Persistent meal create/list/delete endpoints.
- Responsive NutriPaste dashboard with date navigation, four meal segments, daily balance bars, estimate review card, and mobile layout.
- Live integration and API regression tests passing.
- Added persistent current-weight settings and date-based step activity logs.
- Added walking burn, daily burn, calorie deficit, and estimated weight-change calculations using 2,000 kcal baseline and 7,700 kcal per kg.
- Completed historical import from Apple Numbers file. All 5 previously-failed rows backfilled (safe float cast on confidence). DB now holds 63 meals across 14 tracked days.
- Meal presets: save any AI-estimated meal as a preset, then one-tap log it to any segment on any date. Endpoints: `POST /api/presets`, `GET /api/presets`, `DELETE /api/presets/{id}`, `POST /api/presets/{id}/log`.
- CSV export: date-range export via `GET /api/export/meals.csv?start&end` returns one row per meal with calories, macros, and daily steps.
- Router-based navigation: `/` (dashboard) and `/history` routes wired via `BrowserRouter`; extracted `Sidebar` uses `NavLink` for active state.
- Meal history page: month picker, stat cards (tracked days, avg calories, avg steps, total meals), stacked macro bar chart + calorie chart (recharts) with Macros/Calories toggle, and day-by-day cards showing all four segments with per-meal calories.
- New endpoint: `GET /api/summary/monthly?year&month` returns 31-day array with rolled-up macros, steps, and segment-grouped meals.
- Preset nicknames: `PresetCreate.name` (max 60) and `PATCH /api/presets/{id}` for rename. UI shows nickname as card title with meal text as subtitle; inline rename on click, Enter/blur to commit, Escape to cancel.

## Prioritized backlog
- P0: user-specific accounts and private logs.
- P1: editable daily calorie/macro targets and manual estimate corrections.
- P1: weekly and monthly trend charts.
- P1: configurable maintenance baseline and walking calorie formula.
- P2: export to CSV/Excel and reusable meal presets.

## Next tasks
1. Add target settings for calories and macros.
2. Add weekly trend view.
3. Add CSV export.
