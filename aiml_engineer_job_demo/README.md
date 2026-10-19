# Job

**AI/ML Engineer Job Portal & Client-Side Applicant Tracking System (ATS)**

A 100% frontend, zero-backend static web application. No Python, Node.js, server, or database installation required. Everything runs entirely within the web browser using modern Web APIs (`IndexedDB` and `localStorage`).

---

## Highlights
- **Zero Backend / Serverless**: Open directly in any browser (`index.html`) or deploy with 1-click to **GitHub Pages**, Netlify, or Vercel.
- **Client-Side Applicant Storage**: Candidate submissions are stored locally in the browser's persistent `IndexedDB` database.
- **Resume File Handling**: Resumes (`.pdf`, `.doc`, `.docx`) are converted to browser data blobs, stored offline, and can be downloaded anytime.
- **Full Applicant Dashboard (`admin.html`)**:
  - Real-time search across candidate names, skills, email, location, and reference IDs.
  - Filter by experience level (Fresher, 1–3 years, 3+ years).
  - One-click native resume download.
  - Candidate details modal with full cover letter and profile info.
  - Export all applicants to **CSV** (for Excel / Google Sheets) or **JSON**.
  - One-click sample test data loader and record management (delete / clear all).

---

## How to Run

### Option 1: Direct File Open
Simply double-click [`index.html`](index.html) or run [`start.bat`](start.bat) to launch the website in your default browser.

### Option 2: GitHub Pages (Live Hosting)
1. In your GitHub repository settings, go to **Pages**.
2. Select `main` branch and `/ (root)` folder.
3. Click **Save**. Your site will be live instantly on `https://<username>.github.io/<repo>/`!

---

## File Structure
```text
├── index.html        # Job posting and application form
├── admin.html        # ATS Applicant tracking dashboard
├── storage.js        # Client-side IndexedDB storage engine
├── start.bat         # Windows shortcut to open website
├── README.md         # Documentation
└── .gitignore        # Git ignore rules
```
