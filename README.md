# Parse and Furious

An AI-powered bank statement parser and underwriting assistant built with Next.js 15 and deployed on **Cloudflare Workers**. It extracts structured financial metrics from PDFs/images, detects MCA (Merchant Cash Advance) stacking, scores underwriting risk, and caches results in Cloudflare D1.

## Features

- **Document Extraction & Validation**: Extracts text from PDFs and images via Cloudflare Workers AI (`toMarkdown`). Auto-rejects invalid non-statement documents (invoices, receipts, tax forms) with clear reasons.
- **Multi-Model Inference**: Switch between fast extraction (`Llama 3.2 3B`) and deep reasoning models (`DeepSeek R1 32B`, `Qwen QwQ 32B`) depending on statement complexity.
- **MCA Stacking Detection**: Identifies recurring daily/weekly ACH debits from short-term business lenders (e.g. OnDeck, Kabbage, Yellowstone) and flags multi-lender stacking risks.
- **Automated Underwriting Engine**: Evaluates financial health (NSF/overdrafts, net cash flow margin, average daily balance, MCA stacking) to generate a 0–100 risk score, risk tier, loan decision (Approved / Conditional / Declined), and recommended funding limit.
- **Field Confidence Scoring**: Computes per-field confidence scores (0.0 to 1.0) so underwriters can flag low-confidence extractions for manual review.
- **SHA-256 & D1 Caching**: Hashes files before processing to instantly serve cached results from Cloudflare D1, avoiding duplicate LLM costs.

## Tech Stack

- **Framework**: Next.js 15 (App Router) via `@opennextjs/cloudflare`
- **Edge Infrastructure**: Cloudflare Workers AI & Cloudflare D1 Database
- **UI & Styling**: Tailwind CSS, Radix UI / Shadcn
- **Language**: TypeScript

## Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run locally**:

   ```bash
   npm run dev
   ```

3. **Deploy to Cloudflare Workers**:
   ```bash
   npm run deploy
   ```

## Project Structure

```
src/
├── app/              # Next.js App Router & API routes (/api/parse)
├── components/       # Dashboard, Uploader, Underwriting Cards, Recent History
└── lib/
    ├── parser/       # LLM runner, OCR extractor, SHA-256 hashing, DB cache, underwriting logic
    └── types.ts      # TypeScript interfaces & model configurations
```
