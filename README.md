# Job

AI/ML Engineer Job Portal & Applicant Tracking System (ATS).

A standalone, responsive demo job posting and application platform with SQLite database storage, resume file uploads, and an internal ATS dashboard.

## Features
- **Job Posting & Application Form**: Candidates can view role requirements and submit applications with resumes (`.pdf`, `.doc`, `.docx`).
- **Applicant Storage**: Secure SQLite database storage for applicant submissions (`applicants.db`).
- **Resume File Uploads**: Uploaded resumes saved safely into the `uploads/` directory.
- **Applicant Dashboard (`/admin`)**:
  - Live metric counters (Total, Freshers, Experienced).
  - Search & filter by keyword, skills, or experience level.
  - Candidate profile modal with full details and cover letters.
  - One-click resume download/view.
  - Candidate deletion option.

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Application
```bash
python aiml_engineer_job_demo/server.py
```
Or double-click `start.bat` on Windows.

### 3. Open in Browser
- **Job Post & Application Form**: [http://localhost:8080](http://localhost:8080)
- **Applicant Dashboard**: [http://localhost:8080/admin](http://localhost:8080/admin)
