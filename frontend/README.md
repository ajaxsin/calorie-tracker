# Frontend - NutriPaste Calorie Tracker

Next.js 15+ App Router application with TypeScript, Tailwind CSS, and TanStack React Query.

## Structure
```
frontend/
├── src/
│   ├── app/            # Next.js App Router (layout, globals, pages)
│   ├── components/     # UI & Feature components (dashboard, history, deficit, layout)
│   ├── constants/      # App constants & macro palette
│   ├── hooks/          # React Query custom hooks
│   ├── lib/            # Axios API client & utility functions
│   ├── models/         # TypeScript interfaces & types
│   └── services/       # API interaction services
├── Dockerfile          # Multi-stage standalone production container
├── next.config.ts      # Next.js configuration
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript configuration
```

## Running Locally

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

3. Run development server:
```bash
npm run dev
```

4. Build production bundle:
```bash
npm run build
```
