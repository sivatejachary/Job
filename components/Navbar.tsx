'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAllApplicants } from '@/lib/storage';
import { Users, Sparkles } from 'lucide-react';

export default function Navbar() {
  const [applicantCount, setApplicantCount] = useState<number>(0);

  useEffect(() => {
    async function loadCount() {
      try {
        const list = await getAllApplicants();
        setApplicantCount(list.length);
      } catch (e) {
        console.warn(e);
      }
    }
    loadCount();
  }, []);

  return (
    <header className="max-w-[1120px] mx-auto px-6">
      <nav className="flex items-center justify-between py-6 border-b border-[rgba(255,255,255,0.14)]">
        <Link href="/" className="flex items-center gap-3 font-extrabold tracking-wide text-white no-underline">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#9b8cff] to-[#67e8d2] text-[#10152b] font-black">
            N
          </span>
          <span className="text-base">
            northstar<span className="text-[#67e8d2]">.ai</span>{' '}
            <span className="text-[#a7b0ca] font-normal text-sm">Careers</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 border border-[rgba(103,232,210,0.4)] rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#67e8d2] bg-[rgba(103,232,210,0.08)] hover:bg-[rgba(103,232,210,0.15)] transition"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Applicants</span>
            {applicantCount > 0 && (
              <span className="bg-[#67e8d2] text-[#0b1020] rounded-full px-1.5 py-0.5 text-[10px] font-black">
                {applicantCount}
              </span>
            )}
          </Link>

          <Link
            href="/#apply"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#a7b0ca] hover:text-white transition"
          >
            Open role ↗
          </Link>
        </div>
      </nav>
    </header>
  );
}
