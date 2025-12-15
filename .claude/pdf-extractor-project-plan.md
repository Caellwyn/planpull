# PlanPull - Project Plan v4

## Project Overview

**PlanPull** is a SaaS application that extracts tabular data and material quantities from landscaping PDFs (plans, diagrams, material lists) and converts them to downloadable CSVs formatted for import into estimating software like HeavyBid.

**Domain**: planpull.web.app (Firebase) - consider planpull.com later

### Core Value Proposition

Landscapers spend ~10 minutes per project manually transcribing PDF tables and diagram annotations into their estimating software. At 20 projects/month, that's 3+ hours of tedious data entry. This tool reduces that to ~40 minutes/month, saving 2.5+ hours of skilled labor worth $250-500/month.

### Target User

Landscaping contractors using:
- **Input**: Bluebeam (or similar) for creating plans/material lists as PDFs
- **Output**: HeavyBid (or similar estimating software) requiring CSV imports

---

## Technical Architecture

### Stack Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│                   Firebase Hosting (static)                  │
│                                                             │
│  - File upload (react-dropzone)                             │
│  - Data grid editor (AG Grid Community)                     │
│  - Verification workflow with checkboxes                    │
│  - Row/column filtering + consolidation view                │
│  - Schema manager                                           │
│  - Usage dashboard                                          │
│  - Stripe Checkout integration                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Firebase Services                        │
│                                                             │
│  - Authentication (Firebase Auth)                           │
│  - Database (Firestore)                                     │
│  - Cloud Functions (Python) - extraction API                │
│  (No Storage - PDFs sent directly to Cloud Function)        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│                                                             │
│  - Gemini 2.5 Flash API (extraction)                        │
│  - Stripe (subscription billing)                            │
└─────────────────────────────────────────────────────────────┘
```

### Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| No Firebase Storage | PDFs sent directly to Cloud Function. Simpler, cheaper, no need to store files. |
| No page type designation | Gemini auto-detects tables vs diagrams (validated in POC). Simpler UX. |
| Direct upload to Cloud Function | PDF as base64 in request body. 25MB limit is fine for landscaping PDFs. |
| Python Cloud Functions | Gemini SDK, familiar language, good for data processing |
| Frontend Consolidation | Consolidation (groupby + sum) runs on frontend so edits reflect immediately without API round-trip |

### Frontend Consolidation Architecture

Consolidation logic runs on the frontend rather than backend. This allows users to edit items in Detail view and see changes immediately reflected in Consolidated view without an API call.

```
Backend (Cloud Function)
    │
    └── Returns: raw extracted items (NOT consolidated)
        [
          { rowNumber: 1, item: "Japanese Maple", quantity: 3, unit: "ea", area: "Front", page: 1, verified: false },
          { rowNumber: 2, item: "Knockout Rose", quantity: 12, unit: "ea", area: "Side", page: 1, verified: false },
          { rowNumber: 3, item: "Japanese Maple", quantity: 5, unit: "ea", area: "Back", page: 2, verified: false },
        ]

Frontend
    │
    ├── Stores: detailRows as single source of truth (useState)
    │
    ├── Detail View: renders detailRows in AG Grid (editable)
    │
    └── Consolidated View: computes groupBy + sum via useMemo (read-only)
```

**Key Files:**
- `functions/consolidation.py` - `flatten_items()` assigns row numbers, no grouping
- `src/utils/consolidation.js` - `consolidateRows()` and `getGroupableColumns()`
- `src/hooks/useGridData.js` - manages detailRows state, computes consolidatedRows
- `src/components/grid/ResultsGrid.jsx` - AG Grid for detail view
- `src/components/grid/ConsolidatedView.jsx` - HTML table for consolidated view

### Data Flow

```
1. User logs in (Firebase Auth)
         │
         ▼
2. User uploads PDF (react-dropzone)
         │
         ▼
3. Frontend sends PDF (base64) directly to Cloud Function
         │
         ▼
4. Cloud Function:
   a. Decodes PDF
   b. Sends to Gemini 2.5 Flash (auto-detects content type)
   c. Receives JSON with extracted items
   d. Consolidates duplicates (Python arithmetic)
   e. Increments user's page count in Firestore
   f. Returns results to frontend
         │
         ▼
5. Results displayed in AG Grid with verification + filtering
         │
         ▼
6. User reviews/edits/filters data, checks verification boxes
         │
         ▼
7. User can toggle to Consolidated view (groupby + sum)
         │
         ▼
8. User applies output schema (column mapping)
         │
         ▼
9. User downloads CSV (respects current view + filters)
```

---

## Data Models

### Firestore Collections

#### `users/{userId}`
```json
{
  "email": "string",
  "displayName": "string",
  "createdAt": "timestamp",
  "stripeCustomerId": "string",
  "subscriptionStatus": "active|canceled|past_due|none",
  "subscriptionTier": "standard|premium|none",
  "currentPeriodStart": "timestamp",
  "currentPeriodEnd": "timestamp",
  "pagesUsedThisPeriod": 0,
  "organizationId": "string|null"
}
```

#### `organizations/{orgId}`
```json
{
  "name": "string",
  "ownerId": "string",
  "memberIds": ["string"],
  "createdAt": "timestamp"
}
```

#### `schemas/{schemaId}`
```json
{
  "name": "string",
  "description": "string",
  "scope": "system|organization|user",
  "ownerId": "string (userId or orgId)",
  "targetSoftware": "string (e.g., 'HeavyBid', 'Custom')",
  "columns": [
    {
      "outputName": "Material Description",
      "sourceField": "item",
      "includeByDefault": true
    },
    {
      "outputName": "Quantity",
      "sourceField": "quantity", 
      "includeByDefault": true
    },
    {
      "outputName": "Area/Zone",
      "sourceField": "area",
      "includeByDefault": false
    },
    {
      "outputName": "Unit",
      "sourceField": "unit",
      "includeByDefault": false
    }
  ],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### `config/billing`
```json
{
  "tiers": {
    "standard": {
      "name": "Standard",
      "priceMonthly": 5000,
      "pageLimit": 500,
      "stripePriceId": "price_xxx"
    },
    "premium": {
      "name": "Premium", 
      "priceMonthly": 10000,
      "pageLimit": 1000,
      "stripePriceId": "price_yyy"
    }
  },
  "warningThreshold": 10,
  "maxFileSizeMB": 25
}
```

---

## Gemini Integration

### Model

**Gemini 2.5 Flash** - validated in POC. Flash Lite was insufficient accuracy.

### Structured Output Schema

```json
{
  "type": "object",
  "properties": {
    "pages": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "pageNumber": {"type": "integer"},
          "contentType": {"type": "string", "enum": ["table", "diagram", "mixed", "other"]},
          "area": {"type": "string", "description": "Zone/area name if identifiable"},
          "items": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "item": {"type": "string"},
                "quantity": {"type": "number"},
                "unit": {"type": "string"},
                "estimated": {"type": "boolean"}
              },
              "required": ["item", "quantity"]
            }
          }
        }
      }
    }
  }
}
```

### Extraction Prompt Template

```
You are extracting material quantities from a landscaping document.

INSTRUCTIONS:
- Analyze each page and identify all material items with quantities
- Automatically detect whether content is a table, diagram, or mixed
- Extract every item with its quantity
- Preserve item names exactly as written (do not normalize or deduplicate)
- If a unit is specified (ea, sf, cy, etc.), include it
- If items are grouped by area/zone, include the area name
- If quantity is unclear, use your best estimate and set "estimated": true
- Identify the content type for each page (table, diagram, mixed, other)

Return ONLY valid JSON matching the provided schema. No explanations.
```

---

## Grid Features Specification

### Overview

The results grid is the core UI component. It must support:
1. Viewing and editing extracted data
2. Verification workflow
3. Multiple ways to filter/select rows
4. Consolidated (grouped) view
5. Flexible export

### View Modes

#### Detail View (Default)
Shows all extracted rows with full editing capability.

#### Consolidated View
Groups rows by a user-selected column and sums quantities.

**Example - Original data:**
```
│ #  │ Item              │ Qty │ Size      │ Area      │
│ 1  │ Terracotta Pot    │ 4   │ 16 inch   │ Front     │
│ 2  │ Terracotta Pot    │ 6   │ 20 inch   │ Front     │
│ 3  │ Terracotta Pot    │ 3   │ 20 inch   │ Back      │
│ 4  │ Ceramic Pot       │ 2   │ 20 inch   │ Back      │
```

**Grouped by "Size":**
```
│ Size      │ Total Qty │ Breakdown                              │
│ 16 inch   │ 4         │ Terracotta Pot (4)                     │
│ 20 inch   │ 11        │ Terracotta Pot (9), Ceramic Pot (2)    │
```

**Grouped by "Item":**
```
│ Item           │ Total Qty │ Breakdown                         │
│ Terracotta Pot │ 13        │ 16 inch (4), 20 inch (9)          │
│ Ceramic Pot    │ 2         │ 20 inch (2)                       │
```

### Row Selection & Filtering

Three methods to narrow down visible/selected rows:

#### 1. Row Number Filter (Text Input)
- User types: "5, 10-15, 20"
- Grid shows only rows 5, 10, 11, 12, 13, 14, 15, and 20
- Parse logic: split by comma, expand ranges (e.g., "10-15" → [10,11,12,13,14,15])

#### 2. Checkbox Selection
- Leftmost column has checkboxes
- User can click individual rows
- "Select All Visible" button selects all currently visible rows
- Selection used for bulk actions (verify selected, delete selected)

#### 3. Column Content Filters
- Each column header has filter dropdown
- Filter types: contains, equals, greater than, less than (for numeric)
- Multiple filters combine with AND logic

### Column Visibility
- Column picker dropdown/panel
- User can show/hide any column
- Preference persists during session

### Verification Workflow

- Rightmost column is "Verified" checkbox
- User must verify each row (confirming extraction is correct)
- "Verify Selected" button marks all selected rows as verified
- "Select All → Verify" is the quick override path
- Export shows warning if unverified rows exist, but allows override

### Export Behavior

- Export respects current view mode (Detail vs Consolidated)
- Export respects current filters (only visible rows exported)
- Export respects column visibility (only visible columns exported)
- User chooses: "Export Visible" vs "Export All"

### UI Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ TOOLBAR                                                              │
│ ┌─────────────────┐ ┌──────────────────────────────────────────────┐│
│ │ View:           │ │ Group by: [Select column ▼]                  ││
│ │ ● Detail        │ │ (only visible in Consolidated view)          ││
│ │ ○ Consolidated  │ │                                              ││
│ └─────────────────┘ └──────────────────────────────────────────────┘│
│                                                                      │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ Row #s: [                    ] [Apply] [Clear]                 │  │
│ │         e.g., "5, 10-15, 20"                                   │  │
│ └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ Columns: [☑ Item] [☑ Qty] [☑ Unit] [☐ Area] [☐ Source Page]   │  │
│ └────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────┤
│ GRID                                                                 │
│ ┌───┬────┬─────────────────────┬─────┬──────┬─────────────┬─────┐   │
│ │ ☐ │ #  │ Item          [▼]   │ Qty │ Unit │ Area    [▼] │  ✓  │   │
│ ├───┼────┼─────────────────────┼─────┼──────┼─────────────┼─────┤   │
│ │ ☐ │ 1  │ Japanese Maple      │ 3   │ ea   │ Front Entry │ ☐   │   │
│ │ ☐ │ 2  │ Knockout Rose       │ 12  │ ea   │ Front Bed   │ ☐   │   │
│ │ ☐ │ 3  │ Blue Fescue         │ 24  │ ea   │ Side Yard   │ ☐   │   │
│ │ ...                                                           │   │
│ └───────────────────────────────────────────────────────────────┘   │
│ [▼] = column filter dropdown                                         │
├──────────────────────────────────────────────────────────────────────┤
│ ACTIONS                                                              │
│ ┌────────────────────────────────────────────────────────────────┐  │
│ │ [Select All Visible] [Verify Selected] [Delete Selected]       │  │
│ │                                                                │  │
│ │ Schema: [Default (Item, Qty) ▼]                                │  │
│ │                                                                │  │
│ │ [Export Visible CSV] [Export All CSV]                          │  │
│ └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## React App Structure

### Pages/Routes

```
/                     Landing page (public)
/pricing              Pricing page (public)
/login                Login/signup (public)
/app                  Main app (protected)
/app/extract          Upload + extraction flow
/app/schemas          Schema management
/app/account          Account + usage dashboard
```

### Component Hierarchy

```
src/
├── components/
│   ├── common/
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── Modal.jsx
│   │
│   ├── extraction/
│   │   ├── FileDropzone.jsx          # Upload UI
│   │   ├── ExtractionProgress.jsx    # Loading state during extraction
│   │   └── ResultsPanel.jsx          # Container for grid + toolbar
│   │
│   ├── grid/
│   │   ├── ResultsGrid.jsx           # AG Grid wrapper
│   │   ├── GridToolbar.jsx           # View toggle, row filter, column picker
│   │   ├── ViewModeToggle.jsx        # Detail vs Consolidated radio
│   │   ├── RowNumberFilter.jsx       # Text input for "5, 10-15, 20"
│   │   ├── ColumnPicker.jsx          # Checkboxes for column visibility
│   │   ├── GroupBySelector.jsx       # Dropdown for consolidation column
│   │   ├── ConsolidatedView.jsx      # Grouped/summed table (non-AG Grid)
│   │   ├── GridActions.jsx           # Select all, verify, delete buttons
│   │   └── ExportControls.jsx        # Schema selector + export buttons
│   │
│   ├── schemas/
│   │   ├── SchemaList.jsx
│   │   ├── SchemaEditor.jsx
│   │   └── ColumnMapper.jsx
│   │
│   ├── account/
│   │   ├── UsageDashboard.jsx
│   │   ├── SubscriptionCard.jsx
│   │   └── UsageWarningModal.jsx
│   │
│   └── marketing/
│       ├── LandingHero.jsx
│       ├── FeatureList.jsx
│       └── PricingCards.jsx
│
├── hooks/
│   ├── useAuth.js
│   ├── useSubscription.js
│   ├── useUsage.js
│   ├── useExtraction.js
│   ├── useGridData.js                # Grid state management
│   └── useRowFilter.js               # Parse "5, 10-15, 20" logic
│
├── services/
│   ├── firebase.js
│   ├── api.js
│   └── stripe.js
│
├── contexts/
│   ├── AuthContext.jsx
│   └── ExtractionContext.jsx         # Current extraction state
│
├── utils/
│   ├── csvExport.js
│   ├── schemaTransform.js
│   ├── rowFilterParser.js            # "5, 10-15, 20" → [5,10,11,12,13,14,15,20]
│   └── consolidation.js              # groupBy + sum logic for frontend
│
└── pages/
    ├── Landing.jsx
    ├── Pricing.jsx
    ├── Login.jsx
    ├── AppShell.jsx
    ├── Extract.jsx
    ├── Schemas.jsx
    └── Account.jsx
```

---

## Build Phases

### Phase 1: Proof of Concept ✅ COMPLETE
- Python script validated Gemini 2.5 Flash extraction
- Flash Lite insufficient, Flash works well
- Gemini auto-detects table vs diagram content (no user designation needed)

---

### Phase 2: Firebase + React Scaffold

**Goal**: Empty React app with auth working

#### Step 2.1: Create Firebase Project
- [ ] Go to Firebase Console, create new project named "planpull"
- [ ] Enable Authentication (Email/Password + Google provider)
- [ ] Create Firestore database (start in test mode)
- [ ] Note project config values

#### Step 2.2: Initialize React App
- [ ] Create new Vite project: `npm create vite@latest planpull -- --template react`
- [ ] `cd planpull`
- [ ] Install dependencies: `npm install firebase react-router-dom`
- [ ] Create `.env` file with Firebase config (VITE_FIREBASE_* variables)
- [ ] Add `.env` to `.gitignore`

#### Step 2.3: Create Firebase Service
- [x] Create `src/services/firebase.js`
- [x] Import and initialize Firebase app with config from env vars
- [x] Export `auth` and `db` (Firestore) instances
- [x] Verify no errors on app load

#### Step 2.4: Set Up Routing
- [x] Create `src/pages/Landing.jsx` (placeholder with "PlanPull" heading)
- [x] Create `src/pages/Login.jsx` (placeholder)
- [x] Create `src/pages/AppShell.jsx` (placeholder with "Dashboard" heading)
- [x] Update `src/App.jsx` with BrowserRouter and Routes
- [x] Define routes: `/` → Landing, `/login` → Login, `/app` → AppShell
- [x] Verify navigation works

#### Step 2.5: Implement Auth Context
- [x] Create `src/contexts/AuthContext.jsx`
- [x] Create AuthProvider component with useState for user, loading
- [x] Use `onAuthStateChanged` to track auth state
- [x] Create `useAuth` hook that returns { user, loading }
- [x] Wrap app in AuthProvider in `main.jsx`

#### Step 2.6: Add Auth Functions to Context
- [x] Add `signUp(email, password)` function using `createUserWithEmailAndPassword`
- [x] Add `signIn(email, password)` function using `signInWithEmailAndPassword`
- [x] Add `signInWithGoogle()` function using `GoogleAuthProvider` and `signInWithPopup`
- [x] Add `signOut()` function
- [x] Export all functions from useAuth hook

#### Step 2.7: Build Login Page UI
- [x] Create login form with email and password inputs
- [x] Add "Sign In" button that calls signIn()
- [x] Add "Sign in with Google" button that calls signInWithGoogle()
- [x] Add toggle/link to switch between "Sign In" and "Create Account" modes
- [x] In "Create Account" mode, call signUp() instead

#### Step 2.8: Handle Auth Errors
- [x] Wrap auth calls in try/catch
- [x] Display error messages below form (e.g., "Invalid email", "Wrong password")
- [x] Clear errors when user starts typing

#### Step 2.9: Redirect After Auth
- [x] Import `useNavigate` from react-router-dom
- [x] After successful sign in/up, navigate to `/app`
- [x] If user is already logged in and visits `/login`, redirect to `/app`

#### Step 2.10: Create Protected Route Component
- [x] Create `src/components/common/ProtectedRoute.jsx`
- [x] Use `useAuth` to get user and loading state
- [x] If loading, show "Loading..." or spinner
- [x] If no user, redirect to `/login`
- [x] If user exists, render children

#### Step 2.11: Protect App Routes
- [x] Wrap `/app` route with ProtectedRoute
- [x] Verify: logged out user visiting `/app` redirects to `/login`
- [x] Verify: logged in user can access `/app`

#### Step 2.12: Create User Document on Signup
- [ ] In AuthContext, after successful `createUserWithEmailAndPassword`
- [ ] Call `setDoc` to create `users/{uid}` document
- [ ] Fields: email, displayName (from email), createdAt (serverTimestamp), subscriptionStatus: "none", pagesUsedThisPeriod: 0
- [ ] Handle case where doc already exists (use `setDoc` with merge or check first)

#### Step 2.13: Build Navbar Component
- [x] Create `src/components/common/Navbar.jsx`
- [x] Show "PlanPull" logo/text on left
- [x] If logged out: show "Login" link
- [x] If logged in: show user email and "Logout" button
- [x] Logout button calls signOut() and redirects to `/`

#### Step 2.14: Add Navbar to App
- [x] Import Navbar in App.jsx
- [x] Render Navbar above Routes
- [x] Verify navbar updates when auth state changes

#### Step 2.15: Basic Styling
  - [ ] Don't overwrite index.html
- [ ] Build app: `npm run build`
- [ ] Deploy: `firebase deploy --only hosting`
- [ ] Visit planpull.web.app and verify auth works

**Deliverables**: Working auth, user doc created, deployed to Firebase Hosting

---

### Phase 3: Cloud Function + Direct Upload

**Goal**: Upload PDF directly to Cloud Function, get dummy response

#### Step 3.1: Initialize Cloud Functions
- [x] Run `firebase init functions`
- [x] Select Python as language
- [x] `cd functions`
- [x] Verify `main.py` and `requirements.txt` exist

#### Step 3.2: Set Up Python Environment
- [x] Create virtual environment: `python -m venv venv`
- [x] Activate: `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
- [x] Install dependencies: `pip install firebase-functions firebase-admin`
- [x] Freeze: `pip freeze > requirements.txt`

#### Step 3.3: Create Stub Cloud Function
- [x] In `functions/main.py`, create `extract_pdf` function
- [x] Use `@https_fn.on_call()` decorator
- [x] Accept request with `pdfBase64` field
- [x] For now, return dummy data:
  ```python
  return {
    "success": True,
    "items": [
      {"rowNumber": 1, "item": "Test Plant", "quantity": 5, "unit": "ea"},
      {"rowNumber": 2, "item": "Test Mulch", "quantity": 3, "unit": "cy"}
    ],
    "pageCount": 1
  }
  ```
- [x] Add basic error handling

#### Step 3.4: Deploy Cloud Function
- [x] Run `firebase deploy --only functions`
- [x] Note the function URL in output
- [x] Verify function appears in Firebase Console

#### Step 3.5: Create API Service in Frontend
- [x] Create `src/services/api.js`
- [x] Import `getFunctions`, `httpsCallable` from firebase/functions
- [x] Create `extractPdf(pdfBase64)` function that calls the Cloud Function
- [x] Export the function

#### Step 3.6: Create File Dropzone Component
- [x] Install react-dropzone: `npm install react-dropzone`
- [x] Create `src/components/extraction/FileDropzone.jsx`
- [x] Use `useDropzone` hook with accept: `{ 'application/pdf': ['.pdf'] }`
- [x] Style the dropzone (border, background change on drag)
- [x] Display "Drop PDF here or click to select"

#### Step 3.7: Handle File Selection
- [x] In FileDropzone, on file drop/select:
- [x] Check file size < 25MB, show error if too large
- [x] Display selected file name
- [x] Add "Extract" button (disabled until file selected)

#### Step 3.8: Convert PDF to Base64
- [x] Create utility function `fileToBase64(file)` using FileReader
- [x] Returns Promise that resolves to base64 string
- [x] Call this when "Extract" button clicked

#### Step 3.9: Call Cloud Function
- [x] On "Extract" click, convert file to base64
- [x] Call `extractPdf(base64)` from api.js
- [x] Show loading state while waiting
- [x] Log response to console

#### Step 3.10: Create Results Panel
- [x] Create `src/components/extraction/ResultsPanel.jsx`
- [x] Accept `results` prop
- [x] For now, display results as formatted JSON in `<pre>` tag
- [x] Show "No results yet" if results is null

#### Step 3.11: Wire Up Extract Page
- [x] Create `src/pages/Extract.jsx`
- [x] Add state for: selectedFile, loading, results, error
- [x] Render FileDropzone, pass handlers
- [x] On successful extraction, set results
- [x] Render ResultsPanel with results
- [x] Add route `/app/extract` pointing to Extract page

#### Step 3.12: Test End-to-End Flow
- [x] Navigate to `/app/extract`
- [x] Drop a PDF file
- [x] Click Extract
- [x] Verify dummy data appears in ResultsPanel
- [x] Verify loading state shows during request

**Deliverables**: PDF upload works, Cloud Function returns dummy data, results display

---

### Phase 4: Gemini Integration

**Goal**: Cloud Function calls Gemini, returns real extracted data

#### Step 4.1: Add Gemini SDK to Cloud Function
- [x] `cd functions`
- [x] Activate venv
- [x] `pip install google-generativeai` (Updated to `google-genai`)
- [x] Update `requirements.txt`

#### Step 4.2: Configure Gemini API Key
- [x] (Skipped: Using Vertex AI IAM permissions instead)
- [x] Grant `roles/aiplatform.user` to service account

#### Step 4.3: Create Gemini Client Module
- [x] Create `functions/extraction/__init__.py` (empty)
- [x] Create `functions/extraction/gemini_client.py` (Created `functions/gemini_client.py`)
- [x] Import `google.genai`
- [x] Create function `get_client` that configures the SDK
- [x] Create function `extract_data` that:
  - [x] Creates client instance
  - [x] Sends PDF with extraction prompt
  - [x] Returns parsed JSON response

#### Step 4.4: Create Extraction Prompt
- [x] Create `functions/extraction/prompts.py` (Integrated into `gemini_client.py`)
- [x] Define `EXTRACTION_PROMPT` constant with instructions

#### Step 4.5: Add PDF Processing
- [x] `pip install PyMuPDF` (Skipped: Gemini handles PDF bytes directly)

#### Step 4.6: Create Consolidation Module
- [x] Create `functions/extraction/consolidation.py`
- [x] Create function `consolidate_items(raw_items)`

#### Step 4.7: Update Cloud Function
- [x] Import extraction modules
- [x] Initialize Gemini client
- [x] Decode base64 PDF
- [x] Call extraction function
- [x] Call consolidation function
- [x] Return real results

#### Step 4.8: Add Error Handling
- [x] Wrap Gemini call in try/except
- [x] Handle: invalid PDF, Gemini API errors, JSON parse errors
- [x] Return meaningful error messages to frontend
- [x] Add logging for debugging

#### Step 4.9: Add Usage Tracking
- [x] After successful extraction, count pages processed
- [x] Get user ID from request auth context
- [x] Read user doc from Firestore
- [x] Check if under limit (log warning for now, don't block)
- [x] Increment `pagesUsedThisPeriod`
- [x] Update user doc

## Step 4.9a: Create Extraction Log Document

After successful extraction, create a document in the `extractions` collection:

- [x] In the Cloud Function, after Gemini returns results and before returning to frontend:
- [x] Create document in `extractions` collection with auto-generated ID
- [x] Document structure:

```json
{
  "userId": "string",
  "userEmail": "string",
  "subscriptionTier": "standard|premium|none",
  "pageCount": 5,
  "itemCount": 23,
  "fileName": "string (optional, for debugging)",
  "extractedAt": "timestamp (serverTimestamp)",
  "processingTimeMs": 1234,
  "success": true
}
```

- [x] Include `subscriptionTier` at time of extraction (denormalized for easier querying)
- [x] Include `itemCount` (number of line items extracted) for quality metrics
- [x] Track `processingTimeMs` for performance monitoring

---

## Step 4.9b: Log Failed Extractions Too

- [x] Wrap extraction logic in try/catch
- [x] On failure, still create extraction doc with:

```json
{
  "userId": "string",
  "userEmail": "string",
  "subscriptionTier": "standard|premium|none",
  "pageCount": 0,
  "itemCount": 0,
  "extractedAt": "timestamp",
  "processingTimeMs": 1234,
  "success": false,
  "errorType": "gemini_error|invalid_pdf|timeout|unknown"
}
```

- [x] This lets you track failure rates by tier, user, time

---

## Updated Firestore Data Model

Add to `extractions/{extractionId}`:

```json
{
  "userId": "string",
  "userEmail": "string", 
  "subscriptionTier": "standard|premium|none",
  "pageCount": 5,
  "itemCount": 23,
  "fileName": "string",
  "extractedAt": "timestamp",
  "processingTimeMs": 1234,
  "success": true,
  "errorType": "string|null"
}
```

---

## Firestore Security Rules Addition

Add to `firestore.rules`:

```javascript
match /extractions/{extractionId} {
  // Users can read their own extractions
  allow read: if request.auth != null && resource.data.userId == request.auth.uid;
  // Only Cloud Functions can write (no client writes)
  allow write: if false;
}
```


## 4.9c: Add Firestore Indexes

If you plan to run complex queries, create `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "extractions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "extractedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "extractions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "subscriptionTier", "order": "ASCENDING" },
        { "fieldPath": "extractedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "extractions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "extractedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy indexes: `firebase deploy --only firestore:indexes`

- [x] Indexes created and deployed (STATE: READY confirmed via gcloud)

---

#### Step 4.10: Deploy and Test
- [x] Deploy: `firebase deploy --only functions`
- [x] Test with sample materials list PDF
- [x] Verify real extraction data returns
- [x] Verify consolidation works
- [x] Check Firestore that page count incremented

#### Step 4.11: Update Frontend Results Display
- [x] SKIPPED - AG Grid (Phase 5) will replace basic HTML table

**Deliverables**: Real Gemini extraction working, usage tracked

---

### Phase 5: AG Grid + Basic Editing ✅ COMPLETE

**Goal**: Display results in editable AG Grid

**Architecture Change**: Consolidation moved from backend to frontend for immediate edit feedback. See "Frontend Consolidation Architecture" section below.

#### Step 5.1: Install AG Grid
- [x] `npm install ag-grid-react ag-grid-community`
- [x] Register AG Grid modules in main.jsx (v31+ requirement):
  ```js
  import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
  ModuleRegistry.registerModules([AllCommunityModule]);
  ```

#### Step 5.2: Create Results Grid Component
- [x] Create `src/components/grid/ResultsGrid.jsx`
- [x] Import `AgGridReact` from 'ag-grid-react'
- [x] Use new Theming API (v33+): `theme={themeQuartz}`

#### Step 5.3: Define Column Definitions
- [x] Created columns: rowNumber, item, quantity, unit, area, page, verified
- [x] Added filters: agTextColumnFilter, agNumberColumnFilter

#### Step 5.4: Enable Cell Editing
- [x] Added `editable: true` to item, quantity, unit, area columns
- [x] Implemented `onCellValueChanged` callback

#### Step 5.5: Manage Grid State
- [x] Created `useGridData` hook in `src/hooks/useGridData.js`
- [x] Hook manages: detailRows, consolidatedRows (computed), updateCell, deleteRows, verifyRows

#### Step 5.6: Add Selection Checkbox Column
- [x] Using new v32+ rowSelection API:
  ```js
  rowSelection={{ mode: 'multiRow', headerCheckbox: true, enableClickSelection: false }}
  ```

#### Step 5.7: Add Verification Checkbox Column
- [x] Added verified field (default: false from backend)
- [x] Custom cellRenderer with checkbox

#### Step 5.8-5.11: Grid Actions
- [x] Implemented in Dashboard.jsx: Select All, Deselect All, Verify Selected, Delete Selected

#### Step 5.12-5.13: CSV Export
- [x] Implemented CSV export for both Detail and Consolidated views in Dashboard.jsx

#### Step 5.14: Wire Up Dashboard
- [x] Dashboard uses ResultsGrid for detail view
- [x] Dashboard uses ConsolidatedView for consolidated view
- [x] Full flow working: upload → extract → edit → toggle views → export

**Deliverables**: Editable AG Grid with selection, verification, and export

---

### Phase 5b: UX Improvements ✅ COMPLETE

**Goal**: Improve extraction workflow UX

#### Collapsible Dropzone
- [x] Dropzone collapses after successful extraction
- [x] Results table visible immediately without scrolling
- [x] "Start New Extraction" button to begin fresh
- [x] "+ Add Pages" button to append to current extraction

#### Multi-page PDF Support
- [x] Added PyMuPDF for accurate page counting (billing)
- [x] Backend counts actual PDF pages, not just pages with items
- [x] Frontend displays total page count in results header
- [x] `appendData()` function in useGridData hook renumbers rows when adding

#### Files Changed
- `functions/main.py` - Added PyMuPDF page counting
- `functions/requirements.txt` - Added pymupdf dependency
- `planpull/src/pages/Dashboard.jsx` - Collapsible dropzone, extraction modes
- `planpull/src/hooks/useGridData.js` - Added appendData() function

---

### Phase 6: Row Filtering + Column Controls ✅ COMPLETE

**Goal**: Full filtering and column visibility controls

#### Step 6.1: Create Row Number Parser Utility
- [x] Created `src/utils/rowFilterParser.js`
- [x] `parseRowFilter(input)` - parses "5, 10-15, 20" into [5, 10, 11, 12, 13, 14, 15, 20]
- [x] `formatRowFilter(rows)` - formats array back to compact string
- [x] Handles edge cases: empty input, invalid characters, spaces

#### Step 6.2: Row Number Filter Component
- [x] Created `src/components/grid/RowNumberFilter.jsx`
- [x] Text input with placeholder, Apply and Clear buttons
- [x] Integrated with AG Grid external filter API

#### Step 6.3: Column Picker Component
- [x] Created `src/components/grid/ColumnPicker.jsx`
- [x] Dropdown with checkboxes for each column
- [x] rowNumber and verified columns always visible
- [x] Updates grid column visibility via props

#### Step 6.4: AG Grid External Filter
- [x] `isExternalFilterPresent` and `doesExternalFilterPass` callbacks
- [x] Filter updates trigger `api.onFilterChanged()`
- [x] Column visibility via `hide` property in columnDefs

#### Step 6.5: Column Content Filters
- [x] Already implemented in Phase 5 with agTextColumnFilter/agNumberColumnFilter

#### Step 6.6: Export Respects Filters
- [x] CSV export filters by rowNumberFilter when active
- [x] Export only includes visible columns
- [x] Works for both Detail and Consolidated views

#### Files Created/Modified
- `src/utils/rowFilterParser.js` - Parse "5, 10-15" syntax
- `src/components/grid/RowNumberFilter.jsx` - Filter input component
- `src/components/grid/ColumnPicker.jsx` - Column visibility dropdown
- `src/components/grid/ResultsGrid.jsx` - Added external filter props, exported COLUMN_DEFS
- `src/pages/Dashboard.jsx` - Integrated filters, updated export logic

**Deliverables**: Full row/column filtering, export respects filters

---

### Phase 7: Consolidated View ✅ COMPLETE (Implemented with Phase 5)

**Goal**: Grouped view with sum aggregation

**Note**: Consolidated view was implemented alongside Phase 5 as part of the frontend consolidation architecture change.

#### Step 7.1: Create Consolidation Utility
- [x] Created `src/utils/consolidation.js`
- [x] `consolidateRows(rows, groupByColumn)` - groups and sums quantities
- [x] `getGroupableColumns(rows)` - returns columns available for grouping

#### Step 7.2: Test Consolidation Utility
- [x] Tested in production - grouping works correctly

#### Step 7.3-7.4: View Mode Toggle & Group By Selector
- [x] Implemented inline in Dashboard.jsx as button toggle and dropdown

#### Step 7.5: Create Consolidated View Component
- [x] Created `src/components/grid/ConsolidatedView.jsx`
- [x] Renders HTML table with Group Value, Total Qty, Breakdown columns

#### Step 7.6-7.7: View Mode State & Conditional Rendering
- [x] State managed in Dashboard.jsx
- [x] `useGridData` hook computes `consolidatedRows` via useMemo
- [x] Detail view renders ResultsGrid, Consolidated view renders ConsolidatedView

#### Step 7.8: Export for Consolidated View
- [x] Export button changes label based on view mode
- [x] Exports appropriate data format for each view

#### Step 7.9-7.10: Testing
- [x] View toggle works
- [x] Edits in detail view immediately reflect in consolidated view
- [x] Group-by selector changes grouping dynamically
- [x] CSV export works for both views

**Deliverables**: Working consolidated view with groupby + sum

---

### Phase 8: Stripe Billing ✅ COMPLETE

**Goal**: Self-service subscriptions

#### Step 8.1: Create Stripe Account
- [x] Go to stripe.com, create account (or use existing)
- [x] Get test mode API keys (publishable and secret)
- [x] Note: Stay in test mode until ready for launch

#### Step 8.2: Create Stripe Products and Prices
- [x] In Stripe Dashboard, go to Products
- [x] Create product: "PlanPull Basic" - $50/month recurring
- [x] Note the Price IDs (price_xxx)

#### Step 8.3: Configure Stripe in Cloud Functions
- [x] Set environment variables in `functions/.env`
- [x] In functions folder: `pip install stripe`
- [x] Update requirements.txt

#### Step 8.4: Create Checkout Session Function
- [x] Create `functions/billing.py` (single file approach)
- [x] Create function `create_checkout_session`:
  - [x] Initialize Stripe with secret key from env
  - [x] Create checkout session with price_id, mode: 'subscription', success/cancel URLs
  - [x] Return session URL

#### Step 8.5: Add Checkout Endpoint to main.py
- [x] Import billing functions in main.py to expose them
- [x] Functions auto-registered via Firebase Functions framework

#### Step 8.6: Create Stripe Service in Frontend
- [x] Add `VITE_STRIPE_BASIC_PRICE_ID` to `planpull/.env`
- [x] Create `src/services/billing.js`
- [x] Create `redirectToCheckout(priceId)` and `openCustomerPortal()` functions

#### Step 8.7: Create Pricing Page
- [x] Create `src/pages/Pricing.jsx`
- [x] Display Basic plan card ($50/month)
- [x] Show features for tier
- [x] "Get Started" button calls redirectToCheckout

#### Step 8.8: Add Pricing Route
- [x] Add route `/pricing` → Pricing page
- [x] Add link to Pricing in Navbar (for logged out users)
- [x] Add link to Pricing in Account page (for upgrade)

#### Step 8.9: Create Stripe Webhook Function
- [x] Create `stripe_webhook` HTTP function in `functions/billing.py`
- [x] Verify webhook signature
- [x] Parse event and route to handlers

#### Step 8.10: Handle checkout.session.completed
- [x] Extract customer, subscription ID, user ID from session
- [x] Retrieve subscription details from Stripe API
- [x] Update user document with subscription info

#### Step 8.11: Handle customer.subscription.updated
- [x] Extract subscription data
- [x] Update user document with new status, tier, period dates

#### Step 8.12: Handle customer.subscription.deleted
- [x] Find user by stripeCustomerId
- [x] Set subscriptionStatus: 'canceled', subscriptionTier: 'none'

#### Step 8.13: Handle invoice.paid
- [x] Find user by customer ID
- [x] Reset pagesUsedThisPeriod to 0
- [x] Update currentPeriodStart, currentPeriodEnd

#### Step 8.14: Handle invoice.payment_failed
- [x] Find user by customer ID
- [x] Set subscriptionStatus: 'past_due'

#### Step 8.15: Deploy Webhook and Configure Stripe
- [x] Deploy: `firebase deploy --only functions`
- [x] Get webhook URL from Firebase Console (Cloud Run URL)
- [x] In Stripe Dashboard, add webhook endpoint
- [x] Select events: checkout.session.completed, customer.subscription.*, invoice.paid, invoice.payment_failed
- [x] Get webhook signing secret and add to `functions/.env`
- [x] Configure Cloud Run IAM to allow public invocation (allUsers)

#### Step 8.16: Enforce Subscription in Frontend
- [x] Updated `ProtectedRoute.jsx` to check `subscriptionStatus === 'active'`
- [x] Redirects to `/pricing` if no active subscription
- [x] Account page accessible without subscription (`requireSubscription={false}`)

#### Step 8.17-8.18: Usage Warning Modal
- [ ] TODO: Create UsageWarningModal component (deferred to Phase 10)

#### Step 8.19: Create Subscription Card Component
- [x] Built into Account.jsx directly
- [x] Display: current plan name, status badge
- [x] Display: pages used / limit with progress bar
- [x] Display: renewal date
- [x] "Manage Billing" button → Stripe Customer Portal

#### Step 8.20: Create Account Page
- [x] Create `src/pages/Account.jsx`
- [x] Show subscription status, usage, renewal date
- [x] Manage Billing button for active subscribers
- [x] "View Plans" link for non-subscribers
- [x] Add route `/app/account`
- [x] Add link in Navbar

#### Step 8.21: Test Full Billing Flow
- [x] Use Stripe test card: 4242 4242 4242 4242
- [x] Go through checkout, verify redirect to success
- [x] Check Firestore user doc updated
- [x] Verify Dashboard access with subscription
- [x] Test webhook event handling

**Deliverables**: Full self-service billing working

**Notes**:
- Used single `functions/billing.py` file instead of subdirectory structure
- Stripe API 2025 moved `current_period_start/end` to subscription item level
- Required Cloud Run IAM policy update for public webhook access
- Environment variables stored in `functions/.env` (loaded by Firebase on deploy)

---

### Phase 9: Schema System

**Goal**: Flexible output formatting

#### Step 9.1: Create System Schemas Script
- [ ] Create `scripts/seed_schemas.py`
- [ ] Define HeavyBid schema:
  - Columns: Material Description (item), Quantity (quantity), Unit (unit)
- [ ] Define generic "Simple" schema:
  - Columns: Item (item), Qty (quantity)
- [ ] Run script to create documents in `schemas` collection with scope: 'system'

#### Step 9.2: Create Schema List Page
- [ ] Create `src/pages/Schemas.jsx`
- [ ] Query Firestore for:
  - System schemas (scope === 'system')
  - User's schemas (ownerId === currentUser.uid)
- [ ] Display as list or cards
- [ ] Show schema name, target software, column count
- [ ] Add "Create New" button

#### Step 9.3: Add Schemas Route
- [ ] Add route `/app/schemas` → Schemas page
- [ ] Add link in Navbar or app navigation

#### Step 9.4: Create Schema Editor Component
- [ ] Create `src/components/schemas/SchemaEditor.jsx`
- [ ] Form fields:
  - Name (text input)
  - Description (textarea)
  - Target Software (text input or dropdown)
- [ ] "Save" and "Cancel" buttons
- [ ] Accept `schema` prop for editing existing (null for new)

#### Step 9.5: Create Column Mapper Component
- [ ] Create `src/components/schemas/ColumnMapper.jsx`
- [ ] List available source fields: item, quantity, unit, area, page
- [ ] For each, show:
  - Checkbox: include in export
  - Text input: output column name
  - Up/down buttons for ordering (optional)
- [ ] Store as array of { sourceField, outputName, include }

#### Step 9.6: Integrate Column Mapper into Schema Editor
- [ ] Add ColumnMapper below form fields
- [ ] Combine form data + column mapping into schema object
- [ ] On save, validate: name required, at least one column included

#### Step 9.7: Implement Schema CRUD
- [ ] Create: `addDoc(collection(db, 'schemas'), {...schema, ownerId, createdAt})`
- [ ] Update: `updateDoc(doc(db, 'schemas', id), {...schema, updatedAt})`
- [ ] Delete: `deleteDoc(doc(db, 'schemas', id))` with confirmation
- [ ] After save, navigate back to list

#### Step 9.8: Create Schema Transform Utility
- [ ] Create/update `src/utils/schemaTransform.js`
- [ ] Create function `applySchema(rows, schema)`:
  - [ ] Filter columns to only included ones
  - [ ] Rename columns per schema mapping
  - [ ] Reorder columns per schema order
  - [ ] Return transformed rows

#### Step 9.9: Add Schema Selector to Export Controls
- [ ] Update ExportControls component
- [ ] Add dropdown to select schema
- [ ] Populate with system schemas + user schemas
- [ ] Store selected schema ID in state

#### Step 9.10: Apply Schema on Export
- [ ] When export button clicked:
  - [ ] If schema selected, fetch schema doc
  - [ ] Call applySchema(rows, schema)
  - [ ] Export transformed data
- [ ] If no schema, export raw columns

#### Step 9.11: Preview Schema Transform (Optional)
- [ ] In ExportControls, show small preview table
- [ ] Show first 3 rows with schema applied
- [ ] Updates when schema selection changes
- [ ] Helps user verify mapping before export

#### Step 9.12: Test Schema System
- [ ] Create new schema
- [ ] Edit existing schema
- [ ] Delete schema
- [ ] Select schema during export
- [ ] Verify CSV has correct column names and order

**Deliverables**: Working schema system with CRUD and export integration

---

### Phase 10: Polish + Launch Prep

**Goal**: Production-ready application

#### Step 10.1: Error Handling - Cloud Functions
- [ ] Review all Cloud Functions
- [ ] Ensure all errors return user-friendly messages
- [ ] Add try/catch around all external calls
- [ ] Log errors for debugging

#### Step 10.2: Error Handling - Frontend
- [ ] Review all API calls
- [ ] Add try/catch, display errors to user
- [ ] Add error boundaries for React components
- [ ] Create ErrorMessage component for consistent display

#### Step 10.3: Loading States
- [ ] Create LoadingSpinner component
- [ ] Add loading state to Extract page during extraction
- [ ] Add loading state to Schema list while fetching
- [ ] Add loading state to Account page
- [ ] Disable buttons during loading

#### Step 10.4: Empty States
- [ ] Extract page: show instructions when no file selected
- [ ] Results: show message when extraction returns no items
- [ ] Schemas: show prompt to create first schema
- [ ] Account: handle case where subscription loading

#### Step 10.5: Form Validation
- [ ] Login form: validate email format, password length
- [ ] Schema editor: require name, at least one column
- [ ] Show validation errors inline
- [ ] Disable submit until valid

#### Step 10.6: Mobile Responsiveness
- [ ] Test on mobile viewport sizes
- [ ] Make navbar collapse to hamburger menu
- [ ] Make grid horizontally scrollable
- [ ] Ensure buttons are tappable size
- [ ] Test file upload on mobile

#### Step 10.7: Landing Page Content
- [ ] Update Landing.jsx with:
  - Hero: "Pull materials from plans in seconds"
  - Problem/solution statement
  - Feature highlights (3-4 bullets)
  - How it works (3 steps)
  - CTA: "Start Free Trial" or "Get Started"
- [ ] Add simple graphics or screenshots

#### Step 10.8: Review Firestore Security Rules
- [ ] Open `firestore.rules`
- [ ] Users: only owner can read/write own doc
- [ ] Schemas: system readable by all, user schemas by owner only
- [ ] Config: read-only for all
- [ ] Test rules with Firebase emulator

#### Step 10.9: Performance Check
- [ ] Test with 10-page PDF
- [ ] Check Cloud Function execution time
- [ ] If timeout issues, consider:
  - Increasing timeout limit
  - Processing pages in parallel
  - Chunking large PDFs

#### Step 10.10: Analytics (Optional)
- [ ] Enable Firebase Analytics in console
- [ ] Add `logEvent` calls for:
  - signup
  - extraction_complete
  - csv_exported
  - subscription_started
- [ ] Or skip for MVP

#### Step 10.11: Final Testing - Happy Path
- [ ] New user signup
- [ ] Subscribe to Standard plan (test card)
- [ ] Upload sample PDF
- [ ] Verify extraction results
- [ ] Edit data in grid
- [ ] Verify rows
- [ ] Switch to consolidated view
- [ ] Apply schema
- [ ] Export CSV

#### Step 10.12: Final Testing - Edge Cases
- [ ] Upload invalid file (not PDF)
- [ ] Upload oversized file
- [ ] Try to extract without subscription
- [ ] Try to extract over page limit
- [ ] Cancel subscription, verify access revoked

#### Step 10.13: Final Testing - Cross Browser
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test on mobile browser

#### Step 10.14: Deploy Final Version
- [ ] `npm run build`
- [ ] `firebase deploy`
- [ ] Verify all functionality in production
- [ ] Switch Stripe to live mode when ready

**Deliverables**: Production-ready PlanPull application

---

## File Structure

```
planpull/
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── .env                              # VITE_FIREBASE_* variables
├── .gitignore
├── package.json
├── vite.config.js
│
├── functions/
│   ├── requirements.txt
│   ├── main.py                       # Cloud Function entry points
│   ├── extraction/
│   │   ├── __init__.py
│   │   ├── gemini_client.py
│   │   ├── prompts.py
│   │   └── consolidation.py
│   └── billing/
│       ├── __init__.py
│       ├── stripe_checkout.py
│       └── stripe_webhooks.py
│
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── Modal.jsx
│   │   │
│   │   ├── extraction/
│   │   │   ├── FileDropzone.jsx
│   │   │   ├── ExtractionProgress.jsx
│   │   │   └── ResultsPanel.jsx
│   │   │
│   │   ├── grid/
│   │   │   ├── ResultsGrid.jsx
│   │   │   ├── GridToolbar.jsx
│   │   │   ├── ViewModeToggle.jsx
│   │   │   ├── RowNumberFilter.jsx
│   │   │   ├── ColumnPicker.jsx
│   │   │   ├── GroupBySelector.jsx
│   │   │   ├── ConsolidatedView.jsx
│   │   │   ├── GridActions.jsx
│   │   │   └── ExportControls.jsx
│   │   │
│   │   ├── schemas/
│   │   │   ├── SchemaList.jsx
│   │   │   ├── SchemaEditor.jsx
│   │   │   └── ColumnMapper.jsx
│   │   │
│   │   ├── account/
│   │   │   ├── UsageDashboard.jsx
│   │   │   ├── SubscriptionCard.jsx
│   │   │   └── UsageWarningModal.jsx
│   │   │
│   │   └── marketing/
│   │       ├── LandingHero.jsx
│   │       ├── FeatureList.jsx
│   │       └── PricingCards.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useSubscription.js
│   │   ├── useUsage.js
│   │   ├── useExtraction.js
│   │   ├── useGridData.js
│   │   └── useRowFilter.js
│   │
│   ├── services/
│   │   ├── firebase.js
│   │   ├── api.js
│   │   └── stripe.js
│   │
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── ExtractionContext.jsx
│   │
│   ├── utils/
│   │   ├── csvExport.js
│   │   ├── schemaTransform.js
│   │   ├── rowFilterParser.js
│   │   ├── rowFilterParser.test.js
│   │   ├── consolidation.js
│   │   └── consolidation.test.js
│   │
│   └── pages/
│       ├── Landing.jsx
│       ├── Pricing.jsx
│       ├── Login.jsx
│       ├── AppShell.jsx
│       ├── Extract.jsx
│       ├── Schemas.jsx
│       └── Account.jsx
│
├── public/
│   └── (static assets)
│
└── scripts/
    └── seed_schemas.py
```

---

## Environment Variables

### Frontend (.env)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_STRIPE_PUBLISHABLE_KEY=
```

### Cloud Functions (Firebase config)
```bash
firebase functions:config:set gemini.api_key="YOUR_GEMINI_KEY"
firebase functions:config:set stripe.secret_key="sk_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."
```

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Product name | PlanPull | Available, descriptive, memorable |
| Frontend framework | React + Vite | Full control, professional result |
| Data grid | AG Grid Community | Free, excellent features |
| File storage | None (direct upload) | Simpler, cheaper, no need to persist PDFs |
| Page type designation | Automatic (Gemini) | POC showed Gemini auto-detects accurately |
| Backend language | Python | Gemini SDK, familiar, good for data processing |
| Auth provider | Firebase Auth | Native integration, handles OAuth |

---

## Open Questions

1. **Free trial?** - X free pages before requiring subscription?
2. **Annual pricing discount?** - 2 months free for annual?
3. **Custom domain?** - planpull.com later?

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Gemini extraction accuracy | POC validated. User verification catches errors. |
| Cloud Function timeout | 25MB limit helps. Can increase timeout to 540s if needed. |
| Stripe webhook reliability | Idempotency. Log all events. Manual override in Firestore. |
| Scope creep | Strict phase boundaries. Complete each phase before moving on. |

---

## Next Steps

1. Start Phase 2, Step 2.1: Create Firebase project "planpull"
2. Work through steps in order
3. Test each step before moving on
4. Get sample PDFs from client for Phase 4 testing
