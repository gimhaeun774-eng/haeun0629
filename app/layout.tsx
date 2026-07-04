import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduCraft | 나만의 교육용 웹앱 만들기",
  description: "선생님과 학생들을 위한 가장 단순하고 강력한 교육용 웹앱 템플릿",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-300">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b border-slate-200/85 dark:border-zinc-850/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-sky-400 dark:to-blue-500 bg-clip-text text-transparent">
                EduCraft 🌟
              </span>
            </div>
            
            {/* Navigation (Responsive: Hidden on mobile) */}
            <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-zinc-300">
              <a href="#" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">홈</a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">소개</a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">교육 가이드</a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors">예제실</a>
            </nav>

            {/* Right-side Call-to-action button */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-xs sm:text-sm font-medium px-4 py-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all shadow-sm"
              >
                시작하기
              </a>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              © {new Date().getFullYear()} EduCraft. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-zinc-500">
              <a href="#" className="hover:underline">이용약관</a>
              <span className="text-slate-300 dark:text-zinc-800">|</span>
              <a href="#" className="hover:underline">개인정보처리방침</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
