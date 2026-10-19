/**
 * Client-Side Storage Engine for Next.js (IndexedDB + localStorage fallback)
 * 100% Client-side. Zero server, zero external database required.
 */

export interface Applicant {
  id?: number;
  reference_id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  education: string;
  gradyear?: string;
  experience: string;
  linkedin?: string;
  skills: string;
  cover?: string;
  resume_name: string;
  resume_type: string;
  resume_size: number;
  resume_data: string; // Base64 data URL
  applied_at: string;
}

const DB_NAME = 'NorthstarJobATS';
const DB_VERSION = 1;
const STORE_NAME = 'applicants';

function getDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('reference_id', 'reference_id', { unique: true });
        store.createIndex('applied_at', 'applied_at', { unique: false });
        store.createIndex('email', 'email', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function generateReferenceId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'APP-';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

export function getCurrentDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export async function saveApplicant(data: Omit<Applicant, 'reference_id' | 'applied_at'>): Promise<Applicant> {
  const applicantRecord: Applicant = {
    ...data,
    reference_id: generateReferenceId(),
    applied_at: getCurrentDateTime(),
  };

  const db = await getDB();
  if (db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.add(applicantRecord);
      req.onsuccess = (e) => {
        applicantRecord.id = (e.target as IDBRequest).result as number;
        syncToSummary(applicantRecord);
        resolve(applicantRecord);
      };
      req.onerror = () => reject(req.error);
    });
  } else {
    const list = getLocalStorageApplicants();
    applicantRecord.id = Date.now();
    list.unshift(applicantRecord);
    localStorage.setItem('ats_applicants_full', JSON.stringify(list));
    syncToSummary(applicantRecord);
    return applicantRecord;
  }
}

function syncToSummary(record: Applicant) {
  try {
    const raw = localStorage.getItem('ats_applicants_summary');
    const summaryList = raw ? JSON.parse(raw) : [];
    const item = { ...record };
    delete (item as Partial<Applicant>).resume_data;
    summaryList.unshift(item);
    localStorage.setItem('ats_applicants_summary', JSON.stringify(summaryList.slice(0, 100)));
  } catch (e) {
    console.warn(e);
  }
}

export async function getAllApplicants(): Promise<Applicant[]> {
  const db = await getDB();
  if (db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result || []) as Applicant[];
        list.sort((a, b) => (b.id || 0) - (a.id || 0));
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  } else {
    return getLocalStorageApplicants();
  }
}

export async function deleteApplicant(id: number): Promise<boolean> {
  const db = await getDB();
  if (db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } else {
    let list = getLocalStorageApplicants();
    list = list.filter((a) => a.id !== id);
    localStorage.setItem('ats_applicants_full', JSON.stringify(list));
    return true;
  }
}

export async function clearAllApplicants(): Promise<boolean> {
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

function getLocalStorageApplicants(): Applicant[] {
  try {
    const raw = localStorage.getItem('ats_applicants_full');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function seedSampleApplicants(): Promise<void> {
  const sample: Omit<Applicant, 'reference_id' | 'applied_at'>[] = [
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
      resume_data: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1OSAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeJwrSi0uUdBQUFCwsDAwsFCwVYjV5eICACgWBPUKZW5kc3RyZWFtCmVuZG9iag==',
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
      resume_data: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1OSAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeJwrSi0uUdBQUFCwsDAwsFCwVYjV5eICACgWBPUKZW5kc3RyZWFtCmVuZG9iag==',
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
      resume_data: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1OSAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeJwrSi0uUdBQUFCwsDAwsFCwVYjV5eICACgWBPUKZW5kc3RyZWFtCmVuZG9iag==',
    },
  ];

  for (const item of sample) {
    await saveApplicant(item);
  }
}
