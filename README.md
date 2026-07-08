# Prospect Assist AI — IDBI Bank Hackathon

**Prospect Assist AI** is an AI-powered Lead Intelligence, CRM, and Loan Origination Support Platform built for IDBI Bank. It helps Relationship Managers and Credit Managers identify, analyze, and convert high-quality retail lending prospects.

---

## Overview

This is a **fully frontend-only prototype** built for the IDBI Bank Hackathon. There is no backend, database, or authentication server. All data is served from static JSON files under `public/data/`, and every API call is mocked with a random 800–1800 ms delay to simulate real backend processing.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Styling | TailwindCSS v4 |
| UI Components | shadcn/ui + Radix UI |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Routing | Wouter |
| Notifications | Sonner |

---

## Brand Colors

| Color | Hex | Usage |
|---|---|---|
| IDBI Blue | `#004C97` | Primary brand color, sidebar, buttons |
| IDBI Gold | `#FFB800` | Accent, highlights, active states |
| Deep Navy | `hsl(211, 100%, 20%)` | Sidebar background |

---

## Modules (10 Pages)

1. **Executive Dashboard** — KPI cards with animated counters, lead funnel, monthly conversion trends, branch performance, loan distribution pie chart, real-time activity feed, Live Demo mode
2. **Lead Management** — Full CRM table with search, sortable columns, filter by type/status/priority/branch, CSV export, pagination
3. **Lead Details** — Risk scores (CIBIL, AI confidence, conversion probability), customer journey timeline, document checklist, AI recommendation summary, quick navigation
4. **Customer 360** — Banking relationship tabs: accounts, deposits/investments, insurance, existing loans, credit cards, risk profile, cross-sell opportunities
5. **AI Intelligence** — Confidence score, income analysis, AI-generated conversation starter, likely questions & objection handling scripts, required documents checklist, cross-sell
6. **Income Intelligence** — 6-month cash flow area charts, net surplus bar chart, income source pie chart, EMI eligibility analysis
7. **Offer Recommendation** — Pre-approved offer card with interactive EMI calculator (tenure selector), principal/interest breakdown, accept/email/SMS/download actions
8. **Analytics** — Portfolio growth trends, RM leaderboard with success rates, campaign ROI, customer segment avg ticket size
9. **Explainability** — SHAP-style feature importance bar chart, risk-creditworthiness radar chart, per-factor decision breakdown with positive/negative signals
10. **Settings** — RM profile, notification toggles, AI threshold sliders, dark/light mode toggle

---

## Data Structure

All data lives in `public/data/`:

```
public/data/
├── dashboard.json        — KPI metrics, funnel, branch performance, activity feed
├── customers.json        — Master list of all 15 leads
├── analytics.json        — RM leaderboard, campaigns, segments, portfolio growth
├── settings.json         — Default app settings and RM profile
├── customer-1.json       — Full profile: Rajesh Sharma (Home Loan)
├── customer-2.json       — Full profile: Priya Mehta (Personal Loan)
├── customer-3.json       — Full profile: Suresh Patel (Business Loan)
├── customer-4.json       — Full profile: Kavitha Rao (Auto Loan)
├── customer-5.json       — Full profile: Arjun Krishnan (Home Loan)
├── customer-6.json       — Full profile: Sunita Gupta (Personal Loan)
├── customer-7.json       — Full profile: Mohammed Ali (Credit Card)
├── customer-8.json       — Full profile: Deepa Nambiar (Education Loan)
├── customer-9.json       — Full profile: Ramesh Nair (Gold Loan)
├── customer-10.json      — Full profile: Neha Joshi (Personal Loan)
├── customer-11.json      — Full profile: Vikash Singh (LAP)
├── customer-12.json      — Full profile: Anjali Verma (Balance Transfer)
├── customer-13.json      — Full profile: Sanjay Kumar (Home Loan)
├── customer-14.json      — Full profile: Meghna Shah (Auto Loan)
└── customer-15.json      — Full profile: Suresh Reddy (Gold Loan)
```

Each customer JSON contains: personal details, banking relationship, existing products, lead info, AI recommendation (conversation starter, objection handling, cross-sell, required documents), income intelligence (6-month data), timeline, risk profile, documents, assigned RM and CM.

---

## Running the App

```bash
pnpm --filter @workspace/prospect-assist run dev
```

The app runs on the PORT environment variable.

---

## AI Simulation

All AI features are simulated from the per-customer JSON data:

- **Confidence scores** — Pre-computed per customer (65–92%)
- **Conversation starters** — Customer-specific AI-generated openers
- **Objection handling** — 3 likely objections per customer with handling context
- **SHAP explainability** — Feature importance derived from risk profile scores
- **Income Intelligence** — 6 months of realistic credit/debit patterns

---

## Live Demo Mode

Click **"Start Live Demo"** on the dashboard to auto-navigate through the full application flow (Leads → Lead Details → Customer 360 → AI Intelligence → Offer Recommendation → Analytics) with 3-second intervals per page.

---

## Hackathon Notes

- Built for the **IDBI Bank Internal Hackathon**
- Simulates an enterprise banking CRM similar to Salesforce Financial Services Cloud or Finacle CRM
- Intended for **internal use by IDBI Bank employees** (Relationship Managers, Credit Managers)
- No real customer data or PII — all profiles are entirely synthetic
