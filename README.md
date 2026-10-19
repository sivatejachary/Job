# Job

**AI/ML Engineer Job Portal & Applicant Tracking System (ATS) — Built with Next.js 14, React, and TypeScript**

A modern Next.js web application with Tailwind CSS and persistent client-side storage (`IndexedDB`).

---

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: Client-Side `IndexedDB` (with localStorage fallback)
- **Deployment**: Vercel, GitHub Pages, or Netlify

---

## Features
- **Job Post & Candidate Application Form (`/`)**:
  - Full AI/ML Engineer JD, responsibilities, and requirements.
  - Resume upload (`.pdf`, `.doc`, `.docx`) converted and stored offline in the browser.
  - Client-side validation with real-time feedback and reference code generation (`APP-XXXXXX`).
  - Dynamic applicant count badge in the navigation bar.
- **Applicant Tracking Dashboard (`/admin`)**:
  - Live metric counters (Total, Freshers, Experienced).
  - Real-time search across candidate names, email, phone, location, skills, and reference IDs.
  - Filter by experience level.
  - One-click native resume download.
  - Candidate profile modal with full details and cover letters.
  - **Export CSV** (for Excel / Google Sheets) & **Export JSON**.
  - Demo data generator (`Load Demo Data`) and delete / clear actions.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Or double-click `start.bat` on Windows.

### 3. Open in Browser
- **Job Application Page**: [http://localhost:3000](http://localhost:3000)
- **Applicant Dashboard (ATS)**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Project Structure
```text
├── app/
│   ├── layout.tsx         # Root layout with Navbar and Footer
│   ├── page.tsx           # Job posting and application form
│   ├── globals.css        # Tailwind & glassmorphism theme
│   └── admin/
│       └── page.tsx       # ATS Applicant Tracking Dashboard
├── components/
│   └── Navbar.tsx         # Navigation with dynamic applicant counter
├── lib/
│   └── storage.ts         # Client-side IndexedDB storage utility
├── public/                # Static assets
├── tailwind.config.ts     # Tailwind theme configuration
├── next.config.mjs        # Next.js configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Project dependencies & scripts
└── start.bat              # Windows startup shortcut
```
