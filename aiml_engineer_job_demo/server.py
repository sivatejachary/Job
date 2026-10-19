import os
import re
import uuid
import sqlite3
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException, status
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "applicants.db"
UPLOADS_DIR = BASE_DIR / "uploads"

# Ensure uploads directory exists
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS applicants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reference_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            location TEXT NOT NULL,
            education TEXT NOT NULL,
            gradyear TEXT,
            experience TEXT NOT NULL,
            linkedin TEXT,
            skills TEXT NOT NULL,
            cover TEXT,
            resume_filename TEXT NOT NULL,
            resume_original_name TEXT NOT NULL,
            file_size_bytes INTEGER DEFAULT 0,
            applied_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

app = FastAPI(title="Job Application Demo & ATS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/")
async def serve_index():
    index_file = BASE_DIR / "index.html"
    if not index_file.exists():
        raise HTTPException(status_code=404, detail="index.html not found")
    return FileResponse(index_file)

@app.get("/admin")
async def serve_admin():
    admin_file = BASE_DIR / "admin.html"
    if not admin_file.exists():
        raise HTTPException(status_code=404, detail="admin.html not found")
    return FileResponse(admin_file)

@app.post("/api/apply")
async def apply_job(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    location: str = Form(...),
    education: str = Form(...),
    experience: str = Form(...),
    skills: str = Form(...),
    gradyear: Optional[str] = Form(None),
    linkedin: Optional[str] = Form(None),
    cover: Optional[str] = Form(None),
    resume: UploadFile = File(...)
):
    # Validate resume
    if not resume or not resume.filename:
        raise HTTPException(status_code=400, detail="Resume file is required.")
    
    allowed_exts = {".pdf", ".doc", ".docx"}
    ext = Path(resume.filename).suffix.lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Invalid file type {ext}. Allowed: PDF, DOC, DOCX.")

    # Generate reference ID
    random_code = uuid.uuid4().hex[:6].upper()
    reference_id = f"APP-{random_code}"

    # Clean safe filename
    clean_stem = re.sub(r'[^a-zA-Z0-9_\-]', '_', Path(resume.filename).stem)[:40]
    stored_filename = f"{reference_id}_{clean_stem}{ext}"
    dest_path = UPLOADS_DIR / stored_filename

    # Save resume file
    content = await resume.read()
    max_size = 5 * 1024 * 1024  # 5MB
    if len(content) > max_size:
        raise HTTPException(status_code=400, detail="Resume file exceeds the 5MB size limit.")

    with open(dest_path, "wb") as f:
        f.write(content)

    # Store in database
    applied_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO applicants (
            reference_id, name, email, phone, location,
            education, gradyear, experience, linkedin, skills,
            cover, resume_filename, resume_original_name, file_size_bytes, applied_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        reference_id,
        name.strip(),
        email.strip(),
        phone.strip(),
        location.strip(),
        education.strip(),
        (gradyear or "").strip(),
        experience.strip(),
        (linkedin or "").strip(),
        skills.strip(),
        (cover or "").strip(),
        stored_filename,
        resume.filename,
        len(content),
        applied_at
    ))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "reference_id": reference_id,
        "message": "Application stored successfully in database.",
        "applied_at": applied_at
    }

@app.get("/api/applicants")
async def get_applicants():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM applicants ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()

    applicants = [dict(row) for row in rows]
    return {
        "count": len(applicants),
        "applicants": applicants
    }

@app.get("/api/applicants/{applicant_id}")
async def get_applicant(applicant_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM applicants WHERE id = ?", (applicant_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Applicant not found")
    return dict(row)

@app.delete("/api/applicants/{applicant_id}")
async def delete_applicant(applicant_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT resume_filename FROM applicants WHERE id = ?", (applicant_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Applicant not found")
    
    resume_filename = row["resume_filename"]
    cursor.execute("DELETE FROM applicants WHERE id = ?", (applicant_id,))
    conn.commit()
    conn.close()

    # Try removing file if exists
    if resume_filename:
        file_path = UPLOADS_DIR / resume_filename
        if file_path.exists():
            try:
                file_path.unlink()
            except Exception:
                pass

    return {"success": True, "message": "Applicant and resume deleted successfully"}

@app.get("/uploads/{filename}")
async def download_resume(filename: str):
    # Prevent directory traversal
    safe_name = os.path.basename(filename)
    file_path = UPLOADS_DIR / safe_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Resume file not found")
    return FileResponse(file_path, filename=safe_name)

if __name__ == "__main__":
    print(f"Starting Application Server at http://localhost:8080")
    print(f"Applicants Dashboard available at http://localhost:8080/admin")
    uvicorn.run("server:app", host="127.0.0.1", port=8080, reload=False)
