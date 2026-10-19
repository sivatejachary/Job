/**
 * Northstar AI — Client-Side Storage Engine (IndexedDB + localStorage fallback)
 * 100% Frontend. Zero server, Zero Python, Zero Node.js required.
 */

const DB_NAME = 'NorthstarJobATS';
const DB_VERSION = 1;
const STORE_NAME = 'applicants';

function getDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported, falling back to localStorage');
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('reference_id', 'reference_id', { unique: true });
        store.createIndex('applied_at', 'applied_at', { unique: false });
        store.createIndex('email', 'email', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.warn('IndexedDB open error, falling back to localStorage:', request.error);
      resolve(null);
    };
  });
}

// Convert file to base64 Data URL
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Generate unique reference ID (e.g. APP-A4F9D1)
function generateReferenceId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'APP-';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

// Format current date and time
function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Save applicant record
async function saveApplicant(data) {
  const applicantRecord = {
    reference_id: generateReferenceId(),
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    location: data.location.trim(),
    education: data.education.trim(),
    gradyear: (data.gradyear || '').trim(),
    experience: data.experience.trim(),
    linkedin: (data.linkedin || '').trim(),
    skills: data.skills.trim(),
    cover: (data.cover || '').trim(),
    resume_name: data.resume_name || 'resume.pdf',
    resume_type: data.resume_type || 'application/pdf',
    resume_size: data.resume_size || 0,
    resume_data: data.resume_data || '', // Base64 Data URL
    applied_at: getCurrentDateTime()
  };

  const db = await getDB();
  if (db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.add(applicantRecord);
      req.onsuccess = (e) => {
        applicantRecord.id = e.target.result;
        syncToLocalStorageSummary(applicantRecord);
        resolve(applicantRecord);
      };
      req.onerror = () => reject(req.error);
    });
  } else {
    // localStorage Fallback
    const list = getLocalStorageApplicants();
    applicantRecord.id = Date.now();
    list.unshift(applicantRecord);
    localStorage.setItem('ats_applicants_full', JSON.stringify(list));
    syncToLocalStorageSummary(applicantRecord);
    return applicantRecord;
  }
}

// Quick sync of summary to localStorage (without heavy resume base64) for instant counters
function syncToLocalStorageSummary(record) {
  try {
    const raw = localStorage.getItem('ats_applicants_summary');
    const summaryList = raw ? JSON.parse(raw) : [];
    const item = { ...record };
    delete item.resume_data;
    summaryList.unshift(item);
    localStorage.setItem('ats_applicants_summary', JSON.stringify(summaryList.slice(0, 100)));
  } catch (e) {
    console.warn('Could not sync to localStorage summary', e);
  }
}

// Get all applicants
async function getAllApplicants() {
  const db = await getDB();
  if (db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = req.result || [];
        // Sort newest first
        list.sort((a, b) => (b.id || 0) - (a.id || 0));
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  } else {
    return getLocalStorageApplicants();
  }
}

// Delete applicant by ID
async function deleteApplicant(id) {
  const db = await getDB();
  if (db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(Number(id));
      req.onsuccess = () => {
        removeFromLocalStorageSummary(id);
        resolve(true);
      };
      req.onerror = () => reject(req.error);
    });
  } else {
    let list = getLocalStorageApplicants();
    list = list.filter(a => a.id !== id);
    localStorage.setItem('ats_applicants_full', JSON.stringify(list));
    removeFromLocalStorageSummary(id);
    return true;
  }
}

function removeFromLocalStorageSummary(id) {
  try {
    const raw = localStorage.getItem('ats_applicants_summary');
    if (!raw) return;
    let list = JSON.parse(raw);
    list = list.filter(a => a.id !== id);
    localStorage.setItem('ats_applicants_summary', JSON.stringify(list));
  } catch (e) {}
}

// Clear all applicants
async function clearAllApplicants() {
  const db = await getDB();
  if (db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => {
        localStorage.removeItem('ats_applicants_summary');
        resolve(true);
      };
      req.onerror = () => reject(req.error);
    });
  } else {
    localStorage.removeItem('ats_applicants_full');
    localStorage.removeItem('ats_applicants_summary');
    return true;
  }
}

// Fallback helper
function getLocalStorageApplicants() {
  try {
    const raw = localStorage.getItem('ats_applicants_full');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// Load pre-populated sample candidates for testing
async function seedSampleApplicants() {
  const sample = [
    {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      phone: '+91 98765 43210',
      location: 'Bengaluru, India',
      education: 'B.Tech / B.E.',
      gradyear: '2024',
      experience: '1–3 years',
      linkedin: 'https://linkedin.com/in/aaravsharma',
      skills: 'Python, PyTorch, Scikit-Learn, Transformers, FastAPI, Git',
      cover: 'I have 2 years of experience designing deep learning pipelines and fine-tuning transformer models for NLP applications. Very excited about Northstar AI!',
      resume_name: 'Aarav_Sharma_Resume.pdf',
      resume_type: 'application/pdf',
      resume_size: 145000,
      resume_data: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1OSAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeJwrSi0uUdBQUFCwsDAwsFCwVYjV5eICACgWBPUKZW5kc3RyZWFtCmVuZG9iag=='
    },
    {
      name: 'Pooja Reddy',
      email: 'pooja.reddy@example.com',
      phone: '+91 99887 76655',
      location: 'Hyderabad, India',
      education: 'M.Tech / M.E.',
      gradyear: '2023',
      experience: '3+ years',
      linkedin: 'https://linkedin.com/in/poojareddy',
      skills: 'PyTorch, TensorFlow, Computer Vision, MLOps, Docker, AWS',
      cover: 'Passionate computer vision engineer specializing in model quantization and edge AI deployment. Looking forward to discussing how I can contribute.',
      resume_name: 'Pooja_Reddy_Resume.pdf',
      resume_type: 'application/pdf',
      resume_size: 210000,
      resume_data: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1OSAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeJwrSi0uUdBQUFCwsDAwsFCwVYjV5eICACgWBPUKZW5kc3RyZWFtCmVuZG9iag=='
    },
    {
      name: 'Rohan Verma',
      email: 'rohan.verma@example.com',
      phone: '+91 91234 56789',
      location: 'Pune, India',
      education: 'B.Tech / B.E.',
      gradyear: '2025',
      experience: 'Fresher',
      linkedin: 'https://linkedin.com/in/rohanverma',
      skills: 'Python, SQL, Pandas, NumPy, Machine Learning, scikit-learn',
      cover: 'Recent CS graduate with top grades in Machine Learning. Completed multiple end-to-end ML classification projects and eager to start my career.',
      resume_name: 'Rohan_Verma_Resume.pdf',
      resume_type: 'application/pdf',
      resume_size: 98000,
      resume_data: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1OSAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeJwrSi0uUdBQUFCwsDAwsFCwVYjV5eICACgWBPUKZW5kc3RyZWFtCmVuZG9iag=='
    }
  ];

  for (const item of sample) {
    await saveApplicant(item);
  }
}
