# AI/ML Engineer Job Application & Tracking System (ATS)

A responsive job post website for Northstar AI with built-in applicant storage, resume uploads, and an ATS dashboard.

## Features
- **Job Posting & Application Form**: Candidates can view role requirements and submit applications with resumes (.pdf, .doc, .docx).
- **SQLite Database Storage**: Automatically stores applicant info (name, email, phone, location, education, experience, skills, cover letter, submission timestamp).
- **Resume File Storage**: Uploaded resumes are safely saved into the `uploads/` directory with unique reference IDs.
- **Applicant Dashboard (`/admin`)**:
  - Live metric counters (Total, Freshers, Experienced).
  - Search & filter by keyword, skills, or experience level.
  - Candidate profile modal with full details and cover letters.
  - One-click resume download/view.
  - Option to delete applications and files.

## How to Run
Run the backend server:
```bash
python server.py
```
Or double-click `start.bat` in the root folder.

- **Job Application Page**: `http://localhost:8080`
- **Applicants Dashboard**: `http://localhost:8080/admin`

## Storage Locations
- **Database**: `applicants.db` (SQLite)
- **Uploaded Resumes**: `uploads/` directory
