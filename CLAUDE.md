# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server at localhost:5173 with HMR
npm run build    # Production build to dist/
npm run preview  # Preview production build locally
```

No test or lint scripts are configured.

## Architecture

**React 18 + Vite SPA** with Supabase as the entire backend. There is no custom server — all backend logic is delegated to Supabase.

### Data storage (two layers)

| What | Where | Why |
|------|-------|-----|
| Literature metadata | Supabase PostgreSQL (`literatures` table) | Persistent, multi-device |
| PDF blobs | Browser IndexedDB | No file upload limits, fully client-side |

`src/utils/supabase.js` is the data layer for metadata. It exports a `litDB` object with `fetchAll`, `add`, `update`, `remove` methods, plus `fromRow()`/`toRow()` mappers that translate between the DB column naming and the in-app object shape.

`src/utils/db.js` is the IndexedDB wrapper for PDF blobs. PDFs are keyed by the literature's Supabase row ID.

### Auth

Google OAuth via Supabase (`src/hooks/useAuth.js`). The `Root` wrapper in `src/main.jsx` gates the whole app on auth state — unauthenticated users see `LoginPage.jsx`.

### State management

All application state lives in `App.jsx` and is passed down as props. There is no global state library. Filtering/search is client-side against the in-memory list fetched from Supabase on load.

### Component layout

```
Root (auth guard)
└── App (state owner — literature list, selection, search/tag filters)
    ├── SearchBar + action buttons (header)
    ├── LiteratureList (left sidebar — filtered list + tag chips)
    │   └── LiteratureItem (individual row)
    └── LiteratureDetail (right panel — full metadata view)
        └── PDFViewer (IndexedDB read/write + iframe preview)
```

Modals (`AddEditModal`, `CSVImportModal`, `HelpModal`) are rendered at the `App` level and toggled by boolean state flags.

### CSV import

`src/utils/csvParser.js` handles multi-format CSV files, including Notion export. It auto-detects delimiters and maps field aliases (e.g. `著者` → `authors`).

### Environment variables

Required in `.env` (already present, excluded from git):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

For Vercel/Netlify deployments, set these in the platform's environment variable panel.
