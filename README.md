# PlanPull - Landscaping PDF to CSV Extractor

PlanPull is a SaaS application designed to help landscaping contractors streamlined their estimating process. It extracts tabular data and material quantities from landscaping PDFs (plans, diagrams, material lists) and converts them into clean, downloadable CSVs formatted for import into estimating software like HeavyBid.

## 🚀 Features

-   **Intelligent Extraction**: Uses Gemini 2.5 Flash to accurately identify and extract material quantities, items, and units from both tables and diagram annotations.
-   **Smart Consolidation**: Automatically groups duplicates and sums quantities across multiple pages or sections (e.g., combining "Japanese Maple" counts from the front and back yard).
-   **Interactive Data Grid**: powered by AG Grid, allowing for:
    -   Full editing of extracted data.
    -   Verification workflows (checkboxes to confirm rows).
    -   Flexible filtering (by row number ranges, text, or values).
    -   Column visibility controls.
-   **Dynamic Views**: Toggle between detailed itemized views and consolidated summaries.
-   **Custom Exports**: Export data to CSV with applied filters and formatting ready for estimation software.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: React (Vite)
-   **Hosting**: Firebase Hosting
-   **Styling**: Vanilla CSS / CSS Variables
-   **Components**: AG Grid Community, React Dropzone

### Backend & Services
-   **Platform**: Firebase
    -   **Auth**: Firebase Authentication (Email/Password, Google)
    -   **Database**: Cloud Firestore
    -   **Storage**: Firebase Storage (for temporary PDF holding)
    -   **Compute**: Cloud Functions (Python 2nd Gen)
-   **AI Model**: Google Gemini 2.5 Flash via Google AI Studio

## 📦 Project Structure

```
├── .claude/                # Project documentation and plans
├── input/                  # Local testing input files
├── output/                 # Local testing output files
├── planpull/               # React Frontend Application
│   ├── src/
│   │   ├── components/     # UI Components (Grid, Extraction, Common)
│   │   ├── services/       # API clients (Firebase, Stripe)
│   │   ├── contexts/       # React Context (Auth, Extraction)
│   │   └── ...
├── scripts/                # Utility and POC scripts
└── firebase_admin_sdi_config.js
```

## 🔧 Setup & Installation

### Prerequisites
-   Node.js (v18+)
-   Python (v3.10+)
-   Firebase CLI (`npm install -g firebase-tools`)

### Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Caellwyn/planpull.git
    cd planpull
    ```

2.  **Install dependencies**
    ```bash
    # Install dependencies for the root project (if any)
    npm install

    # Install dependencies for the frontend
    cd planpull
    npm install
    
    # Set up Python virtual environment
    cd ..
    python -m venv .venv
    source .venv/bin/activate  # On Windows: .venv\Scripts\activate
    pip install -r requirements.txt
    ```

3.  **Environment Setup**
    -   Create a `.env` file in the `planpull` (frontend) directory with your Firebase config.
    -   Ensure you have the necessary Firebase credentials if running backend emulators.

4.  **Running Locally**
    
    To start the frontend development server:
    ```bash
    cd planpull
    npm run dev
    ```

## 📄 License

[MIT](LICENSE)
