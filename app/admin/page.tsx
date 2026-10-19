'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getAllApplicants,
  deleteApplicant,
  clearAllApplicants,
  seedSampleApplicants,
  Applicant,
} from '@/lib/storage';
import {
  Search,
  Download,
  Trash2,
  Eye,
  RefreshCw,
  Sparkles,
  FileText,
  FileSpreadsheet,
  X,
  ExternalLink,
  ArrowLeft,
  Users,
} from 'lucide-react';

export default function AdminPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expFilter, setExpFilter] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const list = await getAllApplicants();
      setApplicants(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm('Are you sure you want to remove this applicant?')) return;
    await deleteApplicant(id);
    fetchApplicants();
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete ALL applicant records? This action cannot be undone.')) return;
    await clearAllApplicants();
    fetchApplicants();
  };

  const handleSeedData = async () => {
    await seedSampleApplicants();
    fetchApplicants();
  };

  const filteredApplicants = applicants.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.phone.includes(q) ||
      a.location.toLowerCase().includes(q) ||
      a.skills.toLowerCase().includes(q) ||
      a.reference_id.toLowerCase().includes(q);

    const matchesExp = !expFilter || a.experience === expFilter;

    return matchesQuery && matchesExp;
  });

  const fresherCount = applicants.filter(
    (a) => a.experience === 'Fresher' || a.experience === 'Less than 1 year'
  ).length;

  const expCount = applicants.filter(
    (a) => a.experience === '1–3 years' || a.experience === '3+ years'
  ).length;

  const exportJSON = () => {
    if (applicants.length === 0) {
      alert('No applicants to export.');
      return;
    }
    const cleanList = applicants.map((a) => {
      const copy = { ...a };
      delete (copy as Partial<Applicant>).resume_data;
      return copy;
    });
    const blob = new Blob([JSON.stringify(cleanList, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Job_Applicants_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    if (applicants.length === 0) {
      alert('No applicants to export.');
      return;
    }
    const headers = [
      'Reference ID',
      'Name',
      'Email',
      'Phone',
      'Location',
      'Education',
      'Graduation Year',
      'Experience',
      'LinkedIn',
      'Skills',
      'Applied At',
    ];
    const rows = applicants.map((a) => [
      a.reference_id,
      `"${(a.name || '').replace(/"/g, '""')}"`,
      `"${(a.email || '').replace(/"/g, '""')}"`,
      `"${(a.phone || '').replace(/"/g, '""')}"`,
      `"${(a.location || '').replace(/"/g, '""')}"`,
      `"${(a.education || '').replace(/"/g, '""')}"`,
      `"${(a.gradyear || '').replace(/"/g, '""')}"`,
      `"${(a.experience || '').replace(/"/g, '""')}"`,
      `"${(a.linkedin || '').replace(/"/g, '""')}"`,
      `"${(a.skills || '').replace(/"/g, '""')}"`,
      `"${(a.applied_at || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Job_Applicants_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Header section */}
      <section className="flex justify-between items-end flex-wrap gap-4 pb-6 pt-4">
        <div>
          <div className="inline-flex items-center gap-1.5 border border-[rgba(103,232,210,0.3)] bg-[rgba(103,232,210,0.08)] text-[#67e8d2] rounded-full px-3 py-1 text-xs font-semibold mb-3">
            <Users className="w-3.5 h-3.5" /> Next.js ATS Dashboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Job Applicants</h1>
          <p className="text-sm text-[#a7b0ca] mt-1">
            Real-time view of candidates who submitted applications. Stored in client-side IndexedDB.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchApplicants}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-xs font-semibold text-white transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-xs font-semibold text-white transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#67e8d2]" /> Export CSV
          </button>
          <button
            onClick={exportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-xs font-semibold text-white transition"
          >
            <FileText className="w-3.5 h-3.5 text-[#9b8cff]" /> Export JSON
          </button>
          <button
            onClick={handleSeedData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[rgba(155,140,255,0.3)] bg-[rgba(155,140,255,0.08)] hover:bg-[rgba(155,140,255,0.15)] text-xs font-semibold text-[#d9d5ff] transition"
          >
            <Sparkles className="w-3.5 h-3.5" /> Load Demo Data
          </button>
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#fb7185]/30 bg-[#fb7185]/10 hover:bg-[#fb7185]/20 text-xs font-semibold text-[#fb7185] transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </button>
        </div>
      </section>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-panel p-5">
          <div className="text-xs uppercase tracking-wider text-[#a7b0ca]">Total Applicants</div>
          <div className="text-3xl font-extrabold text-white mt-1">{applicants.length}</div>
          <div className="text-xs text-[#a7b0ca] mt-1">Saved in browser storage</div>
        </div>
        <div className="glass-panel p-5">
          <div className="text-xs uppercase tracking-wider text-[#a7b0ca]">Fresher / &lt;1 Year</div>
          <div className="text-3xl font-extrabold text-[#67e8d2] mt-1">{fresherCount}</div>
          <div className="text-xs text-[#a7b0ca] mt-1">Early career candidates</div>
        </div>
        <div className="glass-panel p-5">
          <div className="text-xs uppercase tracking-wider text-[#a7b0ca]">Experienced (1+ Years)</div>
          <div className="text-3xl font-extrabold text-[#9b8cff] mt-1">{expCount}</div>
          <div className="text-xs text-[#a7b0ca] mt-1">Mid to senior candidates</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-3 mb-5 flex-wrap items-center justify-between">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a7b0ca]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, skills, location, or reference ID..."
            className="w-full bg-[rgba(6,10,24,0.7)] border border-[rgba(255,255,255,0.14)] focus:border-[#9b8cff] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition"
          />
        </div>

        <select
          value={expFilter}
          onChange={(e) => setExpFilter(e.target.value)}
          className="bg-[rgba(6,10,24,0.7)] border border-[rgba(255,255,255,0.14)] rounded-xl px-4 py-2.5 text-sm text-white outline-none cursor-pointer"
        >
          <option value="">All Experience Levels</option>
          <option value="Fresher">Fresher</option>
          <option value="Less than 1 year">Less than 1 year</option>
          <option value="1–3 years">1–3 years</option>
          <option value="3+ years">3+ years</option>
        </select>
      </div>

      {/* Applicants Table */}
      <div className="glass-panel overflow-hidden mb-12">
        {filteredApplicants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.02)] text-xs uppercase tracking-wider text-[#a7b0ca]">
                  <th className="py-3.5 px-5">Ref & Date</th>
                  <th className="py-3.5 px-5">Candidate</th>
                  <th className="py-3.5 px-5">Experience / Degree</th>
                  <th className="py-3.5 px-5">Skills</th>
                  <th className="py-3.5 px-5">Resume</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.1)]">
                {filteredApplicants.map((a) => {
                  const skillsList = a.skills.split(',').map((s) => s.trim()).filter(Boolean);
                  const displayedSkills = skillsList.slice(0, 3);
                  const extra = skillsList.length > 3 ? skillsList.length - 3 : 0;

                  return (
                    <tr key={a.id || a.reference_id} className="hover:bg-[rgba(255,255,255,0.03)] transition">
                      <td className="py-4 px-5">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold text-[#67e8d2] border border-[rgba(103,232,210,0.3)] bg-[rgba(103,232,210,0.08)]">
                          {a.reference_id}
                        </span>
                        <div className="text-xs text-[#a7b0ca] mt-1">{a.applied_at}</div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {a.name}
                          {a.linkedin && (
                            <a
                              href={a.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#67e8d2] hover:text-white"
                              title="LinkedIn Profile"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <div className="text-xs text-[#a7b0ca] mt-0.5">
                          <a href={`mailto:${a.email}`} className="hover:underline">{a.email}</a> · {a.phone}
                        </div>
                        <div className="text-xs text-[#a7b0ca] mt-0.5">{a.location}</div>
                      </td>

                      <td className="py-4 px-5">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold text-[#facc15] border border-[rgba(250,204,21,0.3)] bg-[rgba(250,204,21,0.08)]">
                          {a.experience}
                        </span>
                        <div className="text-xs text-[#cbd5e1] mt-1">
                          {a.education} {a.gradyear && `(${a.gradyear})`}
                        </div>
                      </td>

                      <td className="py-4 px-5 max-w-[220px]">
                        <div className="flex flex-wrap gap-1">
                          {displayedSkills.map((s, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[11px] bg-[rgba(155,140,255,0.1)] text-[#d9d5ff] border border-[rgba(155,140,255,0.2)]"
                            >
                              {s}
                            </span>
                          ))}
                          {extra > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[11px] bg-[rgba(255,255,255,0.05)] text-[#a7b0ca]">
                              +{extra}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        {a.resume_data ? (
                          <a
                            href={a.resume_data}
                            download={a.resume_name || 'resume.pdf'}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-xs text-white transition"
                          >
                            <Download className="w-3.5 h-3.5 text-[#67e8d2]" />
                            <span className="truncate max-w-[120px]">{a.resume_name || 'Resume'}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-[#a7b0ca]">No file</span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => setSelectedApplicant(a)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[rgba(255,255,255,0.14)] hover:bg-[rgba(255,255,255,0.08)] text-xs text-white transition"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#fb7185]/30 bg-[#fb7185]/10 hover:bg-[#fb7185]/20 text-xs text-[#fb7185] transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 px-6 text-[#a7b0ca]">
            <Users className="w-12 h-12 mx-auto stroke-1 text-[#a7b0ca] mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No applicants found</h3>
            <p className="text-sm">
              {applicants.length === 0
                ? 'No candidates have applied yet.'
                : 'No applicants match your current search filters.'}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                href="/#apply"
                className="btn-primary text-xs"
              >
                Submit Application →
              </Link>
              <button
                onClick={handleSeedData}
                className="px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-xs font-semibold text-white transition"
              >
                ✨ Load Demo Data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#10152b] border border-[rgba(255,255,255,0.14)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold text-[#67e8d2] border border-[rgba(103,232,210,0.3)] bg-[rgba(103,232,210,0.08)] mb-2">
                  {selectedApplicant.reference_id}
                </span>
                <h2 className="text-2xl font-bold text-white">{selectedApplicant.name}</h2>
                <div className="text-xs text-[#a7b0ca]">Applied on {selectedApplicant.applied_at}</div>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="text-[#a7b0ca] hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-[rgba(255,255,255,0.03)] p-3 rounded-xl border border-[rgba(255,255,255,0.1)]">
                <div className="text-[11px] uppercase tracking-wider text-[#a7b0ca]">Email</div>
                <div className="text-white font-medium break-all">{selectedApplicant.email}</div>
              </div>
              <div className="bg-[rgba(255,255,255,0.03)] p-3 rounded-xl border border-[rgba(255,255,255,0.1)]">
                <div className="text-[11px] uppercase tracking-wider text-[#a7b0ca]">Phone</div>
                <div className="text-white font-medium">{selectedApplicant.phone}</div>
              </div>
              <div className="bg-[rgba(255,255,255,0.03)] p-3 rounded-xl border border-[rgba(255,255,255,0.1)]">
                <div className="text-[11px] uppercase tracking-wider text-[#a7b0ca]">Location</div>
                <div className="text-white font-medium">{selectedApplicant.location}</div>
              </div>
              <div className="bg-[rgba(255,255,255,0.03)] p-3 rounded-xl border border-[rgba(255,255,255,0.1)]">
                <div className="text-[11px] uppercase tracking-wider text-[#a7b0ca]">Experience</div>
                <div className="text-white font-medium">{selectedApplicant.experience}</div>
              </div>
              <div className="bg-[rgba(255,255,255,0.03)] p-3 rounded-xl border border-[rgba(255,255,255,0.1)]">
                <div className="text-[11px] uppercase tracking-wider text-[#a7b0ca]">Education</div>
                <div className="text-white font-medium">{selectedApplicant.education}</div>
              </div>
              <div className="bg-[rgba(255,255,255,0.03)] p-3 rounded-xl border border-[rgba(255,255,255,0.1)]">
                <div className="text-[11px] uppercase tracking-wider text-[#a7b0ca]">Graduation Year</div>
                <div className="text-white font-medium">{selectedApplicant.gradyear || '—'}</div>
              </div>
              {selectedApplicant.linkedin && (
                <div className="sm:col-span-2 bg-[rgba(255,255,255,0.03)] p-3 rounded-xl border border-[rgba(255,255,255,0.1)]">
                  <div className="text-[11px] uppercase tracking-wider text-[#a7b0ca]">LinkedIn Profile</div>
                  <a
                    href={selectedApplicant.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#67e8d2] hover:underline font-medium break-all"
                  >
                    {selectedApplicant.linkedin}
                  </a>
                </div>
              )}
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider text-[#a7b0ca] mb-2 font-semibold">Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedApplicant.skills.split(',').map((s, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-xs bg-[rgba(155,140,255,0.1)] text-[#d9d5ff] border border-[rgba(155,140,255,0.2)]"
                  >
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>

            {selectedApplicant.cover && (
              <div>
                <div className="text-xs uppercase tracking-wider text-[#a7b0ca] mb-2 font-semibold">Cover Letter</div>
                <div className="bg-[rgba(6,10,24,0.6)] border border-[rgba(255,255,255,0.14)] rounded-xl p-4 text-sm text-[#cbd5e1] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedApplicant.cover}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-[rgba(255,255,255,0.14)]">
              {selectedApplicant.resume_data ? (
                <a
                  href={selectedApplicant.resume_data}
                  download={selectedApplicant.resume_name || 'resume.pdf'}
                  className="btn-primary text-xs"
                >
                  <Download className="w-4 h-4" /> Download Resume ({selectedApplicant.resume_name})
                </a>
              ) : (
                <span className="text-xs text-[#a7b0ca]">No resume attached</span>
              )}
              <button
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.14)] hover:bg-[rgba(255,255,255,0.08)] text-xs text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
