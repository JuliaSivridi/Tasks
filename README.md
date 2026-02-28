# Task Manager

A personal task manager built as a Progressive Web App. Runs in any browser and installs on Android/iOS home screens like a native app. No backend — Google Sheets is used as the database.

**Live:** [stler-tasks.vercel.app](https://stler-tasks.vercel.app)

---

## Features

- **Multiple views** — Upcoming (grouped by day), Completed, Priority (Urgent / Important / Normal), Folders, Labels
- **Task hierarchy** — subtasks with expand/collapse and drag-and-drop reordering
- **Deadlines** — date + optional time, color-coded: overdue / today / tomorrow / this week
- **Recurring tasks** — daily / weekly / monthly; completing advances the deadline automatically
- **Labels & Folders** — organize tasks with colored labels and folders
- **Offline-first** — full read/write without internet, syncs automatically on reconnect
- **PWA** — installable on Android and iOS, works as a standalone app with its own icon

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript 5 |
| Build | Vite 7 |
| Styling | Tailwind CSS v3 + shadcn/ui |
| State | Zustand 5 |
| Database | Google Sheets API v4 |
| Auth | Google Identity Services (OAuth 2.0) |
| Offline storage | Dexie.js (IndexedDB) |
| PWA | vite-plugin-pwa (Workbox) |
| Hosting | Vercel |

## Setup

### Prerequisites

- Google account
- Google Cloud project with **Google Sheets API v4** enabled
- OAuth 2.0 Client ID (type: Web application)
- An empty Google Spreadsheet (the app creates the schema on first run)

### Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Enable **Google Sheets API v4**
3. Create an **OAuth 2.0 Client ID** → type: Web application
4. Add to **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   https://your-app.vercel.app
   ```
5. Add your Google account as a **test user** in the OAuth consent screen

### Local Development

```bash
git clone https://github.com/JuliaSivridi/Tasks.git
cd Tasks
npm install
```

Create `.env` in the project root:
```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_SPREADSHEET_ID=your-spreadsheet-id
```

```bash
npm run dev
# http://localhost:5173
```

### Deploy to Vercel

1. Import the repository at [vercel.com](https://vercel.com)
2. Add environment variables in project Settings → Environment Variables:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_SPREADSHEET_ID`
3. Every push to `main` triggers automatic deployment

## Data Model

Data is stored in a Google Spreadsheet with three sheets:

| Sheet | Columns |
|---|---|
| tasks | id, title, status, priority, folder_id, parent_id, labels, deadline_date, deadline_time, is_recurring, recur_type, recur_value, sort_order, created_at, updated_at, completed_at |
| folders | id, name, color, sort_order, created_at, updated_at |
| labels | id, name, color, created_at, updated_at |

## Install as Mobile App

**Android:** Chrome prompts automatically, or use the browser menu → *Install app*

**iOS:** Safari → Share button → *Add to Home Screen*
