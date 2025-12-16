# PlanPull - PDF Material List Extractor

PlanPull is a SaaS application that helps contractors streamline their estimating process. It extracts tabular data and material quantities from PDFs (plans, diagrams, material lists) and converts them into clean, downloadable CSVs formatted for import into estimating software like HeavyBid.

## Features

- **Intelligent Extraction**: Uses Gemini 2.5 Flash to accurately identify and extract material quantities, items, and units from both tables and diagram annotations.
- **Smart Consolidation**: Automatically groups duplicates and sums quantities across multiple pages or sections.
- **Interactive Data Grid**: Powered by AG Grid, with full editing, verification workflows, flexible filtering, and column visibility controls.
- **Dynamic Views**: Toggle between detailed itemized views and consolidated summaries.
- **Custom Export Schemas**: Create reusable export formats to match your estimating software's requirements.
- **Welcome Flow**: New users see a welcome modal with quick access to the help guide.

## Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Hosting**: Firebase Hosting
- **Components**: AG Grid Community, React Dropzone

### Backend & Services
- **Platform**: Firebase
  - **Auth**: Firebase Authentication (Email/Password, Google)
  - **Database**: Cloud Firestore
  - **Compute**: Cloud Functions (Python)
- **AI Model**: Google Gemini 2.5 Flash
- **Payments**: Stripe

## Project Structure

```
├── .claude/                # Project documentation and plans
├── planpull/               # React Frontend Application
│   ├── src/
│   │   ├── components/     # UI Components (Grid, Schemas, Common)
│   │   ├── contexts/       # React Context (Auth)
│   │   ├── hooks/          # Custom hooks (useGridData, etc.)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API clients (Firebase, Stripe, billing)
│   │   └── utils/          # Utilities (consolidation, export, etc.)
├── functions/              # Firebase Cloud Functions (Python)
└── scripts/                # Utility scripts
```

## Setup & Installation

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Firebase CLI (`npm install -g firebase-tools`)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Caellwyn/planpull.git
   cd planpull
   ```

2. **Install frontend dependencies**
   ```bash
   cd planpull
   npm install
   ```

3. **Install Cloud Functions dependencies**
   ```bash
   cd ../functions
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Environment Setup**
   - Create a `.env` file in the `planpull` directory with your Firebase and Stripe config.
   - Create a `.env` file in the `functions` directory with Stripe and other secrets.

5. **Running Locally**
   ```bash
   cd planpull
   npm run dev
   ```

## Deployment

```bash
# Build and deploy everything
cd planpull
npm run build
cd ..
firebase deploy

# Or deploy specific parts
firebase deploy --only hosting
firebase deploy --only functions
```

## License

Proprietary. All rights reserved.
