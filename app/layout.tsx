import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "AI/ML Engineer — Careers | Northstar AI",
  description: "Join Northstar AI as an AI/ML Engineer. Build next-generation intelligent applications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen text-[#eef2ff] antialiased flex flex-col justify-between">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <footer className="max-w-[1120px] mx-auto w-full px-6 py-8 border-t border-[rgba(255,255,255,0.14)] text-xs text-[#a7b0ca] flex flex-wrap justify-between items-center gap-4">
          <div>Northstar AI Careers · Next.js Client-Side ATS (Zero Backend Required).</div>
          <div className="flex gap-4">
            <a href="/" className="hover:text-white transition">Job Post</a>
            <a href="/admin" className="text-[#67e8d2] hover:underline">Applicants Dashboard →</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
