const PDFDocument = require('pdfkit')
const fs = require('fs')

const doc = new PDFDocument({ margin: 60, size: 'A4' })
doc.pipe(fs.createWriteStream('d:/Projects/Stler_Tasks/TaskManager_TechSpec.pdf'))

const ORANGE = '#e07e38'
const DARK   = '#1c1c1c'
const GRAY   = '#555555'
const LGRAY  = '#888888'
const LINE   = '#dddddd'

function h1(text) {
  doc.moveDown(0.5)
  doc.fontSize(20).fillColor(ORANGE).font('Helvetica-Bold').text(text)
  doc.moveDown(0.25)
}
function h2(text) {
  doc.moveDown(0.5)
  doc.fontSize(13).fillColor(DARK).font('Helvetica-Bold').text(text)
  doc.moveDown(0.15)
}
function h3(text) {
  doc.moveDown(0.3)
  doc.fontSize(10).fillColor(ORANGE).font('Helvetica-Bold').text(text)
  doc.moveDown(0.1)
}
function body(text) {
  doc.fontSize(10).fillColor(DARK).font('Helvetica').text(text, { align: 'justify' })
  doc.moveDown(0.2)
}
function bullet(items) {
  for (let i = 0; i < items.length; i++) {
    doc.fontSize(10).fillColor(DARK).font('Helvetica').text('\u2022  ' + items[i], { indent: 14 })
  }
  doc.moveDown(0.2)
}
function kv(key, value) {
  doc.fontSize(10).font('Helvetica-Bold').fillColor(DARK).text(key + ':  ', { continued: true })
  doc.font('Helvetica').fillColor(GRAY).text(value)
}
function code(lines) {
  for (let i = 0; i < lines.length; i++) {
    doc.fontSize(8.5).fillColor('#333').font('Courier').text(lines[i], { indent: 16 })
  }
  doc.moveDown(0.2)
}
function divider() {
  doc.moveDown(0.4)
  doc.moveTo(60, doc.y).lineTo(535, doc.y).strokeColor(LINE).lineWidth(0.5).stroke()
  doc.moveDown(0.4)
}

// Cover
doc.rect(0, 0, 595, 190).fillColor(DARK).fill()
doc.fontSize(30).fillColor(ORANGE).font('Helvetica-Bold').text('Task Manager', 60, 55)
doc.fontSize(15).fillColor('#ffffff').font('Helvetica').text('Technical Specification', 60, 98)
doc.fontSize(9.5).fillColor(LGRAY).text('Personal PWA  \u00b7  Web + Mobile  \u00b7  Version 1.0', 60, 126)
doc.fontSize(9).fillColor(LGRAY).text('February 2026', 60, 144)
doc.y = 215

// 1
h1('1. Project Overview')
body(
  'Task Manager is a personal productivity application built as a Progressive Web App (PWA). ' +
  'It runs in any modern browser and can be installed on Android or iOS home screens for a native-like ' +
  'experience without an app store. The application uses Google Sheets as a persistent database, ' +
  'Google Identity Services for authentication, and IndexedDB for offline-first data access with automatic sync.'
)
divider()

// 2
h1('2. Goals & Non-Goals')
h2('Goals')
bullet([
  'Fully functional task manager accessible from any device via browser or installed PWA',
  'No backend server required — Google Sheets acts as the data store',
  'Offline support: full read/write while offline, auto-sync on reconnect',
  'Single user (personal use); authentication via Google OAuth 2.0',
  'Responsive design: desktop sidebar layout + mobile drawer layout',
])
h2('Non-Goals')
bullet([
  'Multi-user collaboration or sharing',
  'Native app distribution via App Store / Google Play',
  'Real-time push notifications',
  'Server-side rendering or a backend API',
])
divider()

// 3
h1('3. Technology Stack')
h2('Frontend')
kv('Framework', 'React 18 + TypeScript 5')
kv('Build Tool', 'Vite 7')
kv('Styling', 'Tailwind CSS v3')
kv('UI Components', 'shadcn/ui (Radix UI primitives)')
kv('State Management', 'Zustand 5')
kv('Form Handling', 'React Hook Form + Zod')
kv('Drag & Drop', '@dnd-kit/core + @dnd-kit/sortable')
kv('Icons', 'Lucide React')
kv('Date Utilities', 'date-fns')
doc.moveDown(0.3)
h2('Data & Auth')
kv('Database', 'Google Sheets API v4 (spreadsheet as DB)')
kv('Authentication', 'Google Identity Services (GIS) \u2014 OAuth 2.0 Token Client')
kv('Offline Storage', 'Dexie.js (IndexedDB wrapper)')
kv('Sync Queue', 'Custom offline queue with deduplication')
doc.moveDown(0.3)
h2('PWA & Deployment')
kv('PWA Plugin', 'vite-plugin-pwa (Workbox)')
kv('Hosting', 'Vercel (auto-deploy from GitHub)')
kv('CI/CD', 'GitHub -> Vercel (push-triggered builds)')
kv('Production URL', 'https://stler-tasks.vercel.app')
divider()

// 4
h1('4. Application Architecture')
body('The app follows a layered architecture with clear separation between UI, state, data access, and external services.')
h3('Layer Overview')
bullet([
  'UI Layer  --  React components (src/components/)',
  'State Layer  --  Zustand stores (src/store/): tasks, folders, labels, ui, auth, sync',
  'Service Layer  --  syncService, authService, recurrenceService (src/services/)',
  'API Layer  --  Google Sheets API wrappers (src/api/): tasksApi, foldersApi, labelsApi',
  'DB Layer  --  Dexie.js IndexedDB (src/services/db.ts)',
  'Hooks  --  useTasks, useSync (src/hooks/)',
])
h3('Data Flow: Online')
body('User action -> Zustand store update -> IndexedDB write + enqueue -> scheduleFlush() -> Sheets API write')
h3('Data Flow: Offline')
body('User action -> Zustand store update -> IndexedDB write -> offline queue stores op -> on reconnect: flush() sends to Sheets')
h3('Sync Strategy')
bullet([
  'initialLoad() -- on app start, fetches all data from Sheets into IndexedDB',
  'enqueue() -- adds CRUD operation to offline queue',
  'scheduleFlush() -- debounced 800ms flush, safe to call after every drag/edit',
  'flush() -- deduplicates queue by (entityType, entityId, operationType), sends only the latest op per entity',
  'fullSync() -- complete read from Sheets + local reconciliation (last-write-wins by updated_at)',
])
divider()

// 5
h1('5. Data Model')
body(
  'The Google Spreadsheet contains three sheets: tasks, folders, labels. ' +
  'Column A of each sheet contains a header row used for schema identification.'
)
h2('Tasks Sheet  (columns A:P, 16 fields)')
code([
  'A  id            -- unique ID, format: tsk-xxxxxxxx',
  'B  title         -- task text',
  'C  status        -- pending | completed | deleted',
  'D  priority      -- urgent | important | normal',
  'E  folder_id     -- FK to folders.id  (fld-inbox = Inbox)',
  'F  parent_id     -- FK to tasks.id  (empty string = root task)',
  'G  labels        -- comma-separated label IDs',
  'H  deadline_date -- YYYY-MM-DD  (or empty)',
  'I  deadline_time -- HH:MM  (or empty)',
  'J  is_recurring  -- TRUE | FALSE',
  'K  recur_type    -- days | weeks | months  (or empty)',
  'L  recur_value   -- integer interval  (default 1)',
  'M  sort_order    -- integer, position within folder + parent group',
  'N  created_at    -- ISO datetime string',
  'O  updated_at    -- ISO datetime string',
  'P  completed_at  -- ISO datetime string  (or empty)',
])
h2('Folders Sheet  (columns A:F)')
code([
  'A  id  |  B  name  |  C  color (hex)  |  D  sort_order  |  E  created_at  |  F  updated_at',
])
h2('Labels Sheet  (columns A:E)')
code([
  'A  id  |  B  name  |  C  color (hex)  |  D  created_at  |  E  updated_at',
])
h2('Special Constants')
bullet([
  'INBOX_FOLDER_ID = "fld-inbox" -- always-present default folder, cannot be deleted',
  'ID format: "tsk-" / "fld-" / "lbl-" prefix + 8 random hex characters',
])
divider()

// 6
h1('6. Features')
h2('6.1  Views (Sidebar Navigation)')
bullet([
  'Upcoming -- all tasks with a deadline, grouped by day: Overdue / Today / Tomorrow / This week / Later. Flat list, no hierarchy.',
  'Completed -- completed tasks in reverse-chronological order.',
  'Priority views -- 3 icon-only flag buttons (Urgent / Important / Normal). Flat list filtered by priority.',
  'Folder views -- one entry per folder (Inbox always first). Full hierarchy with subtasks and drag-and-drop.',
  'Label views -- one entry per label. Tasks tagged with that label.',
])
h2('6.2  Task Item: Two-Row Design')
bullet([
  'Row 1: expand/collapse toggle (if subtasks exist), checkbox, title, action icons.',
  'Row 2 (shown when data exists): recurring indicator, deadline date/time, label chips, folder name.',
  'Deadline colors: Overdue=red-400, Today=emerald-500, Tomorrow=orange-400, This week=violet-400, Future=muted.',
  'Checkbox: gray border by default; turns orange on hover and when checked.',
])
h2('6.3  Action Icons')
body('Desktop (>=768px): Clock, Flag (priority), Tag (labels), Plus (subtask), Pencil (edit), Trash -- always visible.')
body('Mobile (<768px): Clock, Flag, ... dropdown with: Labels / Add subtask / Edit / Delete.')
h2('6.4  Task Management')
bullet([
  'Create: title, priority, labels (chip multi-select), due date, due time, recurring settings. Folder auto-resolved from current view.',
  'New tasks always appended at the end (max sort_order + 1) within their folder/parent group.',
  'Edit: same form pre-filled with current values.',
  'Delete: confirmation dialog; cascades to all subtasks (soft-delete).',
  'Complete: checkbox; recurring tasks advance deadline instead of changing status.',
])
h2('6.5  Recurring Tasks')
bullet([
  'Configuration: interval type (days / weeks / months) + integer value.',
  'On complete: deadline_date advances by recur_value x recur_type. Status stays "pending".',
  '"Postpone" button in Set Deadline dialog manually advances deadline to next occurrence.',
])
h2('6.6  Set Deadline Dialog')
bullet([
  'Date picker + optional time picker.',
  '"No date" button removes deadline entirely.',
  '"Postpone" button for recurring tasks only.',
  'Cancel and Save buttons. Width: max-w-sm. Close X hidden on mobile.',
])
h2('6.7  Hierarchy & Drag-and-Drop')
bullet([
  'Tasks support one level of parent-child nesting (parent_id field).',
  'Subtasks rendered indented under parent in Folder view with their own DnD context.',
  'Root-level and subtask-level reordering via @dnd-kit.',
  'New sort_order persisted via scheduleFlush() after every drag.',
])
h2('6.8  Upcoming View Filters')
bullet([
  'Priority filter chips (Urgent / Important / Normal) above the task list.',
  'Label filter chips -- one per existing label.',
  'Filters combined with AND logic.',
])
h2('6.9  Folders & Labels Management')
bullet([
  'Create / rename / delete via inline forms in sidebar.',
  'Delete folder: all tasks moved to Inbox first.',
  'Delete label: label ID stripped from all tasks.',
  'Color picker with preset swatches.',
])
divider()

// 7
h1('7. Authentication')
body(
  'Authentication uses Google Identity Services (GIS) Token Client -- OAuth 2.0 implicit flow. ' +
  'No redirect URIs are needed; only Authorized JavaScript Origins must be configured in Google Cloud Console.'
)
bullet([
  'Access token stored via Zustand persist middleware (localStorage). Expiry tracked as tokenExpiry timestamp.',
  'On page load: if stored token valid (>60 s remaining), session restored without a network call.',
  'If token expired but user profile exists: silent GIS refresh attempted.',
  'User profile (name, email, avatar) fetched from Google userinfo endpoint after token received.',
  'Sign-out clears token, expiry, and user profile from store and localStorage.',
])
h2('Google Cloud Console Setup')
bullet([
  'Google Sheets API v4 enabled on the project.',
  'OAuth 2.0 Client ID -- type: Web application.',
  'Authorized JavaScript Origins: http://localhost:5173 (dev) and https://stler-tasks.vercel.app (prod).',
  'OAuth consent screen: Testing mode, personal Google account added as test user.',
])
divider()

// 8
h1('8. Offline Support')
body(
  'The app is fully functional without internet. IndexedDB (Dexie.js) stores all tasks, folders, ' +
  'and labels locally. An offline queue records every write operation while disconnected.'
)
h2('Offline Queue')
bullet([
  'IndexedDB table stores: entityType, entityId, operationType, payload, createdAt.',
  'flush() deduplicates by (entityType:entityId:operationType) -- only the latest op per entity is sent to Sheets.',
  'scheduleFlush(): debounced 800ms, separate _flushing guard prevents concurrent flushes, bypasses isSyncing block.',
  'Conflict resolution: last-write-wins by updated_at timestamp.',
])
h2('Service Worker (Workbox)')
bullet([
  'Precaches all static assets (JS, CSS, HTML, icons).',
  'Google Sheets API: NetworkFirst strategy, 10 s timeout, fallback to cache.',
  'Google Fonts: CacheFirst strategy.',
  'Google Identity Services: NetworkOnly (auth requires internet).',
  'registerType: autoUpdate -- new SW installs silently in the background.',
])
divider()

// 9
h1('9. UI / UX Design')
h2('Theme')
bullet([
  'Color mode: follows system prefers-color-scheme (light / dark, automatic).',
  'Primary accent: HSL(25, 75%, 55%) -- warm muted orange, approx. #e07e38.',
  'Dark mode background: #1c1c1c.',
  'Base font size: 16px minimum.',
  'Deadline status colors (softer palette): red-400 / emerald-500 / orange-400 / violet-400.',
])
h2('Responsive Layout')
bullet([
  'Desktop (>=768px): fixed left sidebar 240px wide + scrollable main content.',
  'Mobile (<768px): sidebar opens as a left Sheet drawer; closes automatically on view selection.',
  'Header bar: Menu icon (mobile only), current view title, user avatar with sign-out dropdown.',
])
h2('Modals & Dialogs')
bullet([
  'Create/Edit Task: max-w-md, scrollable, close X hidden on mobile, Cancel + Create/Save buttons.',
  'Set Deadline: max-w-sm, close X hidden on mobile, Cancel + Save buttons.',
  'Confirm Delete: yes/no dialog for all destructive actions.',
])
divider()

// 10
h1('10. PWA & Mobile')
bullet([
  'Web App Manifest: name "Task Manager", short_name "Tasks", display standalone.',
  'Theme color: #e07e38 (set in both manifest and <meta name="theme-color"> in index.html).',
  'Background color: #ffffff.',
  'Icons: icon-192.png and icon-512.png -- orange task-list design, also used as maskable icon.',
  'Android: Chrome shows automatic install banner; also available via browser menu.',
  'iOS: Safari Share menu -> "Add to Home Screen".',
  'Installed PWA opens without browser chrome, full-screen, with its own icon on the home screen.',
])
divider()

// 11
h1('11. Deployment')
h2('Vercel')
bullet([
  'Connected to GitHub repository JuliaSivridi/Tasks (main branch).',
  'Every push to main triggers automatic build and deployment.',
  'Build command: npm run build  (tsc -b && vite build).',
  'Output directory: dist/',
])
h2('Environment Variables (Vercel dashboard)')
bullet([
  'VITE_GOOGLE_CLIENT_ID -- OAuth 2.0 Client ID from Google Cloud Console.',
  'VITE_SPREADSHEET_ID  -- Google Sheets spreadsheet ID.',
])
h2('Local Development')
code([
  '1. Clone repository',
  '2. npm install',
  '3. Create .env with VITE_GOOGLE_CLIENT_ID and VITE_SPREADSHEET_ID',
  '4. npm run dev   ->   http://localhost:5173',
  '5. npm run build ->   production output in dist/',
])
divider()

// 12
h1('12. Key File Structure')
code([
  'src/',
  '  api/              tasksApi.ts  foldersApi.ts  labelsApi.ts',
  '  components/',
  '    layout/         AppShell.tsx  Header.tsx  Sidebar.tsx  LoginPage.tsx',
  '    tasks/          TaskList.tsx  TaskItem.tsx  TaskChildren.tsx',
  '                    TaskCreateModal.tsx  TimePickerDialog.tsx',
  '    ui/             shadcn/ui components (button, dialog, sheet, checkbox, ...)',
  '    common/         ConfirmDialog.tsx',
  '  hooks/            useTasks.ts  useSync.ts',
  '  services/         db.ts  syncService.ts  authService.ts',
  '                    offlineQueue.ts  recurrenceService.ts',
  '  store/            tasksStore.ts  foldersStore.ts  labelsStore.ts',
  '                    uiStore.ts  authStore.ts  syncStore.ts',
  '  types/            task.ts  folder.ts  label.ts',
  '  utils/            dateUtils.ts  constants.ts  uuid.ts',
  'public/icons/       icon-192.png  icon-512.png  icon.svg',
  'index.html          meta theme-color, favicon, page title "Tasks"',
  'vite.config.ts      PWA manifest, Workbox caching strategies',
  '.env                VITE_GOOGLE_CLIENT_ID, VITE_SPREADSHEET_ID  (not committed to git)',
])

// Footer
doc.moveDown(1.5)
divider()
doc.fontSize(8.5).fillColor(LGRAY).font('Helvetica')
  .text('Task Manager  \u00b7  Technical Specification  \u00b7  February 2026', { align: 'center' })

doc.end()
console.log('Done: TaskManager_TechSpec.pdf')
