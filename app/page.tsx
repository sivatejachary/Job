'use client';

import { useState } from 'react';
import Link from 'next/link';
import { saveApplicant, fileToDataUrl, Applicant } from '@/lib/storage';
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, MapPin, Clock, Briefcase, IndianRupee } from 'lucide-react';

export default function JobPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    education: '',
    gradyear: '',
    experience: '',
    linkedin: '',
    skills: '',
    cover: '',
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; message: string; refId?: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!resumeFile) {
      setStatus({ type: 'err', message: 'Please attach a resume file.' });
      return;
    }

    if (resumeFile.size > 5 * 1024 * 1024) {
      setStatus({ type: 'err', message: 'The resume file must be 5 MB or smaller.' });
      return;
    }

    const ext = resumeFile.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'doc', 'docx'].includes(ext)) {
      setStatus({ type: 'err', message: 'Please upload a PDF, DOC, or DOCX file.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const resumeDataUrl = await fileToDataUrl(resumeFile);

      const saved = await saveApplicant({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        education: formData.education,
        gradyear: formData.gradyear,
        experience: formData.experience,
        linkedin: formData.linkedin,
        skills: formData.skills,
        cover: formData.cover,
        resume_name: resumeFile.name,
        resume_type: resumeFile.type,
        resume_size: resumeFile.size,
        resume_data: resumeDataUrl,
      });

      setStatus({
        type: 'ok',
        message: 'Application Submitted & Stored Successfully!',
        refId: saved.reference_id,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        location: '',
        education: '',
        gradyear: '',
        experience: '',
        linkedin: '',
        skills: '',
        cover: '',
      });
      setResumeFile(null);
      const fileInput = document.getElementById('resume') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'err', message: err.message || 'Failed to submit application.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1120px] mx-auto px-6 py-8">
      {/* Hero Section */}
      <section className="pt-8 pb-10">
        <div className="text-xs font-bold uppercase tracking-[1.8px] text-[#67e8d2] mb-3">
          Careers · Engineering
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 leading-[1.1]">
          Build what intelligence can become.
        </h1>
        <p className="max-w-[720px] text-lg text-[#a7b0ca] leading-relaxed mb-6">
          We&apos;re looking for an AI/ML Engineer to help design, train, evaluate, and deploy machine-learning systems that solve practical problems.
        </p>

        <div className="flex flex-wrap gap-2.5 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.035)] text-sm text-[#e2e8f8]">
            <Sparkles className="w-3.5 h-3.5 text-[#67e8d2]" /> AI/ML Engineer
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.035)] text-sm text-[#e2e8f8]">
            <MapPin className="w-3.5 h-3.5 text-[#a7b0ca]" /> Bengaluru, India · Hybrid
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.035)] text-sm text-[#e2e8f8]">
            <Clock className="w-3.5 h-3.5 text-[#a7b0ca]" /> Full-time
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.035)] text-sm text-[#e2e8f8]">
            <IndianRupee className="w-3.5 h-3.5 text-[#a7b0ca]" /> ₹8–14 LPA
          </span>
        </div>

        <div className="inline-flex items-center gap-2 border border-[rgba(103,232,210,0.3)] bg-[rgba(103,232,210,0.08)] text-[#67e8d2] rounded-full px-3.5 py-1 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" /> Next.js Client-Side ATS · Zero Backend Required
        </div>
      </section>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_370px] gap-8 items-start mb-16">
        {/* Role Description */}
        <article className="glass-panel p-7 sm:p-9 space-y-7">
          <div>
            <h2 className="text-xl font-bold text-white mb-3">About the role</h2>
            <p className="text-[#c4cce0] leading-relaxed">
              As an AI/ML Engineer at Northstar AI, you&apos;ll collaborate with product and engineering teams to turn data and research into dependable machine-learning features. You&apos;ll work across experimentation, model evaluation, API integration, and production monitoring.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white mb-2.5">What you&apos;ll do</h3>
            <ul className="list-disc pl-5 space-y-2 text-[#c4cce0] text-sm leading-relaxed">
              <li>Prepare datasets, build data pipelines, and perform exploratory data analysis.</li>
              <li>Train, evaluate, and improve machine-learning and deep-learning models.</li>
              <li>Develop reproducible experiments and measure model quality using suitable metrics.</li>
              <li>Build inference APIs and integrate models into application workflows.</li>
              <li>Collaborate with software engineers, product managers, and domain experts.</li>
              <li>Document experiments, monitor model performance, and help address data or model drift.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white mb-2.5">Required qualifications</h3>
            <ul className="list-disc pl-5 space-y-2 text-[#c4cce0] text-sm leading-relaxed">
              <li>Bachelor&apos;s or Master&apos;s degree in Computer Science, AI/ML, Data Science, Statistics, or related field.</li>
              <li>Working knowledge of Python, SQL, data structures, and software development fundamentals.</li>
              <li>Experience with NumPy, Pandas, scikit-learn, and at least one of PyTorch or TensorFlow.</li>
              <li>Understanding of supervised learning, model validation, overfitting, and evaluation metrics.</li>
              <li>Ability to explain technical decisions and collaborate effectively.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white mb-3">Nice to have</h3>
            <div className="flex flex-wrap gap-2">
              {['NLP / Transformers', 'LLMs / RAG', 'Docker', 'FastAPI', 'Cloud deployment', 'MLOps', 'Git'].map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-xs rounded-md border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.04)] text-[#d7def2]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white mb-2.5">What we offer</h3>
            <ul className="list-disc pl-5 space-y-2 text-[#c4cce0] text-sm leading-relaxed">
              <li>Mentorship and opportunities to learn from applied ML projects.</li>
              <li>Collaborative engineering environment and flexible hybrid work.</li>
              <li>Learning budget and dedicated time for technical development.</li>
            </ul>
          </div>
        </article>

        {/* Side Panel */}
        <aside className="glass-panel p-6 sticky top-6 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">AI/ML Engineer</h2>
            <div className="text-sm text-[#a7b0ca]">Northstar AI Careers</div>
          </div>

          <a
            href="#apply"
            className="btn-primary w-full text-center text-sm"
          >
            Apply for this role
          </a>

          <div className="space-y-3 pt-2 text-sm border-t border-[rgba(255,255,255,0.14)]">
            <div className="flex justify-between py-1.5 border-b border-[rgba(255,255,255,0.1)]">
              <span className="text-[#a7b0ca]">Employment</span>
              <strong className="text-white font-medium">Full-time</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[rgba(255,255,255,0.1)]">
              <span className="text-[#a7b0ca]">Workplace</span>
              <strong className="text-white font-medium">Hybrid</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[rgba(255,255,255,0.1)]">
              <span className="text-[#a7b0ca]">Location</span>
              <strong className="text-white font-medium">Bengaluru, India</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[rgba(255,255,255,0.1)]">
              <span className="text-[#a7b0ca]">Experience</span>
              <strong className="text-white font-medium">0–3 years</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[rgba(255,255,255,0.1)]">
              <span className="text-[#a7b0ca]">Salary</span>
              <strong className="text-white font-medium">₹8–14 LPA</strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#a7b0ca]">Job ID</span>
              <strong className="text-white font-medium font-mono text-xs">NSAI-ML-001</strong>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/admin"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] py-2.5 text-xs font-semibold text-white transition"
            >
              📊 Open Applicant Dashboard
            </Link>
          </div>
        </aside>
      </div>

      {/* Application Form Section */}
      <section className="glass-panel p-7 sm:p-10 mb-16" id="apply">
        <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
          <div>
            <div className="text-xs font-bold uppercase tracking-[1.8px] text-[#67e8d2] mb-1">
              Application form
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Apply for AI/ML Engineer</h2>
            <p className="text-sm text-[#a7b0ca] mt-1">
              Fill in your details below. Resumes and candidate data are saved offline in browser storage.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#67e8d2] border border-[rgba(103,232,210,0.3)] bg-[rgba(103,232,210,0.08)]">
            Next.js Client Storage
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-[#dbe2f5]">Full name *</label>
              <input
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full bg-[rgba(6,10,24,0.6)] border border-[rgba(255,255,255,0.14)] focus:border-[#9b8cff] rounded-xl p-3 text-sm text-white outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-[#dbe2f5]">Email address *</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-[rgba(6,10,24,0.6)] border border-[rgba(255,255,255,0.14)] focus:border-[#9b8cff] rounded-xl p-3 text-sm text-white outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-xs font-semibold text-[#dbe2f5]">Phone number *</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full bg-[rgba(6,10,24,0.6)] border border-[rgba(255,255,255,0.14)] focus:border-[#9b8cff] rounded-xl p-3 text-sm text-white outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="location" className="text-xs font-semibold text-[#dbe2f5]">Current location *</label>
              <input
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
                className="w-full bg-[rgba(6,10,24,0.6)] border border-[rgba(255,255,255,0.14)] focus:border-[#9b8cff] rounded-xl p-3 text-sm text-white outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="education" className="text-xs font-semibold text-[#dbe2f5]">Highest education *</label>
              <select
                id="education"
                name="education"
                required
                value={formData.education}
                onChange={handleChange}
                className="w-full bg-[rgba(6,10,24,0.8)] border border-[rgba(255,255,255,0.14)] focus:border-[#9b8cff] rounded-xl p-3 text-sm text-white outline-none transition"
              >
                <option value="">Select education</option>
                <option>B.Tech / B.E.</option>
                <option>B.Sc.</option>
                <option>M.Tech / M.E.</option>
                <option>M.Sc.</option>
                <option>MCA</option>
                <option>Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="gradyear" className="text-xs font-semibold text-[#dbe2f5]">Graduation year</label>
              <input
                id="gradyear"
                name="gradyear"
                type="number"
                min="1980"
                max="2035"
                value={formData.gradyear}
                onChange={handleChange}
                placeholder="2025"
                className="w-full bg-[rgba(6,10,24,0.6)] border border-[rgba(255,255,255,0.14)] focus:border-[#9b8cff] rounded-xl p-3 text-sm text-white outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="experience" className="text-xs font-semibold text-[#dbe2f5]">Experience *</label>
              <select
                id="experience"
                name="experience"
                required
                value={formData.experience}
                onChange={handleChange}
                className="w-full bg-[rgba(6,10,24,0.8)] border border-[rgba(255,255,255,0.14)] focus:border-[#9b8cff] rounded-xl p-3 text-sm text-white outline-none transition"
              >
                <option value="">Select experience</option>
                <option>Fresher</option>
                <option>Less than 1 year</option>
                <option>1–3 years</option>
                <option>3+ years</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="linkedin" className="text-xs font-semibold text-[#dbe2f5]">LinkedIn URL</label>
              <input
                id="linkedin"
                name="linkedin"
                type="url"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourname"
                className="w-full bg-[rgba(6,10,24,0.6)] border border-[rgba(255,255,255,0.14)] focus:border-[#9b8cff] rounded-xl p-3 text-sm text-white outline-none transition"
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label htmlFor="skills" className="text-xs font-semibold text-[#dbe2f5]">Relevant skills *</label>
              <textarea
                id="skills"
                name="skills"
                required
                value={formData.skills}
                onChange={handleChange}
                placeholder="Python, SQL, scikit-learn, PyTorch, Transformers, FastAPI..."
                className="w-full bg-[rgba(6,10,24,0.6)] border border-[rgba(255,255,255,0.14)] focus:border-[#9b8cff] rounded-xl p-3 text-sm text-white outline-none transition min-h-[90px]"
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label htmlFor="resume" className="text-xs font-semibold text-[#dbe2f5]">Resume (PDF, DOC, DOCX) *</label>
              <input
                id="resume"
                name="resume"
                type="file"
                required
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="w-full bg-[rgba(6,10,24,0.6)] border border-[rgba(255,255,255,0.14)] focus:border-[#9b8cff] rounded-xl p-2.5 text-sm text-white outline-none file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#9b8cff] file:text-[#0b1020] hover:file:opacity-90"
              />
              <div className="text-xs text-[#a7b0ca]">Max file size: 5 MB. Files are stored directly in your browser database.</div>
            </div>

            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label htmlFor="cover" className="text-xs font-semibold text-[#dbe2f5]">Cover letter (optional)</label>
              <textarea
                id="cover"
                name="cover"
                value={formData.cover}
                onChange={handleChange}
                placeholder="Tell us briefly why you're interested in this role..."
                className="w-full bg-[rgba(6,10,24,0.6)] border border-[rgba(255,255,255,0.14)] focus:border-[#9b8cff] rounded-xl p-3 text-sm text-white outline-none transition min-h-[90px]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-start gap-3 text-xs text-[#c4cce0] cursor-pointer">
                <input type="checkbox" required className="mt-0.5" />
                <span>I consent to saving my application details and resume in the applicant tracking system. *</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary mt-4"
          >
            {isSubmitting ? 'Storing application...' : 'Submit application →'}
          </button>

          {status && (
            <div
              className={`p-4 rounded-xl border mt-4 text-sm leading-relaxed ${
                status.type === 'ok'
                  ? 'border-[#4fd1ad]/40 bg-[#2dd4bf]/10 text-[#a7f3d0]'
                  : 'border-[#fb7185]/40 bg-[#fb7185]/10 text-[#fecaca]'
              }`}
            >
              {status.type === 'ok' ? (
                <div>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4 text-[#67e8d2]" />
                    {status.message}
                  </div>
                  <div>
                    Reference ID: <strong className="text-[#67e8d2] font-mono">{status.refId}</strong>
                  </div>
                  <div className="mt-3">
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#67e8d2] hover:underline"
                    >
                      View in Applicants Dashboard 👥 <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#fb7185]" />
                  <span>{status.message}</span>
                </div>
              )}
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
