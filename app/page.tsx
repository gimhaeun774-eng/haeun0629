'use client';

import React from 'react';

export default function Home() {
  const handleAddFeature = () => {
    alert(
      '🎉 반갑습니다, 선생님! \n\n이 버튼은 새로운 교육용 기능을 추가하기 위한 공간입니다.\n[app/page.tsx] 파일을 열어 원하는 컴포넌트나 학습 게임을 자유롭게 구현해 보세요!'
    );
  };

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-blue-400/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/3 w-[250px] h-[250px] bg-indigo-400/20 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Section Container */}
      <div className="max-w-4xl w-full text-center space-y-8 my-auto">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/50 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800/30 backdrop-blur-sm">
          <span>🚀 Vercel 배포 및 빌드 최적화 완료</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          나만의 <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 dark:from-sky-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">교육용 웹앱</span> 만들기
        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed">
          복잡한 백엔드 설정 없이도 브라우저에서 안정적으로 실행되는 가장 직관적인 교육용 웹앱의 기본 뼈대입니다. 이 템플릿 코드를 마음껏 수정해 실전 교실에서 사용할 다양한 디지털 교구를 만들어보세요.
        </p>

        {/* CTA Button */}
        <div className="pt-4 flex justify-center">
          <button
            onClick={handleAddFeature}
            className="group relative inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm sm:text-base hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 cursor-pointer"
          >
            <span>새로운 기능 추가하기</span>
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Teacher's Expansion Guide Section */}
        <div className="pt-16 border-t border-slate-200/60 dark:border-zinc-800/60 max-w-3xl mx-auto">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-zinc-200 mb-6">
            💡 초보 선생님을 위한 다음 단계 가이드
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            
            {/* Guide Card 1 */}
            <div className="p-5 rounded-2xl border border-slate-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900/50 hover:shadow-md transition-shadow">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-sky-950/50 flex items-center justify-center text-blue-600 dark:text-sky-400 font-bold text-sm mb-3">
                1
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">
                코드 편집하기
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-xs text-rose-500 dark:text-rose-400 font-mono">app/page.tsx</code> 파일을 열어 이 텍스트와 UI 요소를 원하는 내용으로 수정해 보세요.
              </p>
            </div>

            {/* Guide Card 2 */}
            <div className="p-5 rounded-2xl border border-slate-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900/50 hover:shadow-md transition-shadow">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-3">
                2
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">
                기능 컴포넌트 추가
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                타이머, 주사위 게임, 단어 카드 등 수업에 필요한 자바스크립트 컴포넌트를 이 페이지 하단에 붙여넣어 보세요.
              </p>
            </div>

            {/* Guide Card 3 */}
            <div className="p-5 rounded-2xl border border-slate-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900/50 hover:shadow-md transition-shadow">
              <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-purple-950/50 flex items-center justify-center text-sky-600 dark:text-purple-400 font-bold text-sm mb-3">
                3
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">
                클릭 한번에 배포
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                GitHub에 이 프로젝트를 푸시한 뒤, Vercel 서비스와 클릭 한 번으로 연동하여 나만의 웹주소로 친구들에게 공유해 보세요.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
