# PlanPull

**AI-powered material list extraction for contractors** — Turn design PDFs into estimation-ready spreadsheets in seconds.

[Try it Free](https://planpull.com) • [Live Product](https://planpull.com)

---

## The Problem

Landscapers receive design PDFs from architects — site plans, planting diagrams, material schedules. Buried in those documents are the quantities they need to generate estimates: 47 boxwoods, 12 yards of mulch, 200 sq ft of flagstone.

The current workflow: **manually transcribe each item into Excel**, then import into estimation software. Every. Single. Bid.

- 10-15 minutes per estimate
- 20+ bids per month
- **4+ hours of manual data entry, every month**

It's tedious, error-prone, and nobody's idea of skilled work.

## The Solution

PlanPull uses Gemini 2.5 Flash as an OCR engine to extract material lists directly from PDFs. Upload a plan, get a structured table. Review, edit, export to CSV, import into your estimation software.

**Time per estimate: under 2 minutes.**

---

## Features

### Extraction
- **AI-powered OCR**: Gemini identifies tables, annotations, and material callouts across multi-page documents
- **Smart consolidation**: Duplicate items across pages are grouped and quantities summed automatically
- **Page-aware extraction**: See which page each item came from

### Review & Edit
- **Interactive data grid**: AG Grid with inline editing, filtering, and column controls
- **Dual views**: Toggle between detailed (every line item) and consolidated (grouped totals)
- **Verification workflow**: Mark rows as verified to track review progress
- **Live consolidation**: Edits in detail view immediately update consolidated totals — no round-trip to the server

### Export
- **Custom schemas**: Save reusable export formats that match your estimation software's column requirements
- **CSV download**: One click to get a file ready for import

### Business
- **Subscription billing**: Stripe integration with monthly plans
- **Free trials**: Promotional codes for new user acquisition
- **Auth**: Email/password or Google OAuth via Firebase

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Frontend (Vite)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ PDF Upload  │  │ AG Grid     │  │ Schema Manager          │  │
│  │ (Dropzone)  │  │ (Edit/View) │  │ (Custom Export Formats) │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                      Firebase Hosting
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     Firebase Backend                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Auth        │  │ Firestore   │  │ Cloud Functions         │  │
│  │ (Email/OAuth)│ │ (User Data) │  │ (Python Extraction)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │                                       │
    ┌────▼────┐                          ┌───────▼───────┐
    │ Stripe  │                          │ Gemini 2.5    │
    │(Billing)│                          │ Flash (OCR)   │
    └─────────┘                          └───────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Frontend consolidation** | Grouping/summing happens in the browser, not the server. Edits reflect instantly without API round-trips. |
| **Gemini for OCR** | Better at understanding context than traditional OCR. Handles messy PDFs, annotations, and varied table formats. |
| **Custom export schemas** | Every estimation software has different column requirements. Users save their format once, reuse forever. |
| **Firebase all-in-one** | Auth, database, hosting, and functions in one platform. Fast to ship, easy to maintain for a solo dev. |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React, Vite, AG Grid, React Dropzone |
| **Backend** | Firebase (Auth, Firestore, Cloud Functions) |
| **AI** | Google Gemini 2.5 Flash |
| **Payments** | Stripe (subscriptions, trials, webhooks) |
| **Hosting** | Firebase Hosting |

---

## What I Built

This is a shipped product with paying customers. It demonstrates:

- **End-to-end product development**: Problem discovery → solution design → implementation → monetization
- **AI integration**: Gemini as a practical OCR tool, not a chatbot gimmick
- **SaaS infrastructure**: Stripe subscriptions, Firebase auth, promotional trials
- **UX for non-technical users**: Contractors don't want complexity — upload, review, download
- **Performance optimization**: Frontend consolidation eliminates server round-trips for a snappy editing experience

---

## License

All rights reserved. This code is provided for portfolio demonstration purposes only.

---

## Acknowledgments

Built with Gemini 2.5 Flash, Firebase, Stripe, AG Grid, and Claude Code.