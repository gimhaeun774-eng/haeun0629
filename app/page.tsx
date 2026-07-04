'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  RotateCw, 
  Sparkles, 
  Layers, 
  Activity, 
  Gamepad2, 
  Compass, 
  ArrowRight,
  Database,
  Code,
  BookOpen,
  Bot
} from 'lucide-react';

interface ActivityCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
  badgeColor?: string;
  status: 'active' | 'coming_soon' | 'planned';
  category: string;
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const activities: ActivityCardProps[] = [
    {
      title: 'AI 수학 튜터 챗봇',
      description: '수학 개념이 헷갈릴 때 AI에게 바로 물어보세요! 회전체, 함수, 기하학 등 모든 수학 질문에 단계별 풀이와 함께 친절하게 답해주는 AI 튜터와 1:1 대화를 나눠볼 수 있습니다.',
      icon: <Bot className="w-6 h-6 text-violet-400 group-hover:scale-110 transition-transform duration-300" />,
      href: '/math-bot',
      badge: '실행 가능 🔥',
      badgeColor: 'bg-emerald-950/70 text-emerald-400 border-emerald-900/50',
      status: 'active',
      category: 'AI 튜터'
    },
    {
      title: '3D 입체 회전체 공장',
      description: '모눈종이에 직접 그린 평면도형을 회전축을 기준으로 돌려보며 3D 원뿔, 원기둥, 구 등 다양한 회전체를 디자인하고 학급 갤러리에 저장하는 탐구 도구입니다.',
      icon: <RotateCw className="w-6 h-6 text-indigo-400 group-hover:rotate-180 transition-transform duration-700" />,
      href: '/rotational-solid',
      badge: '실행 가능 🔥',
      badgeColor: 'bg-emerald-950/70 text-emerald-400 border-emerald-900/50',
      status: 'active',
      category: '기하학'
    },
    {
      title: '대칭 & 평행이동 퍼즐 빌더',
      description: '격자 위에 그려진 도형을 X축 대칭, Y축 대칭, 혹은 평행이동 변환 규칙에 맞춰 목표 포인트로 안전하게 안착시키는 기하학 학습 퍼즐 게임입니다.',
      icon: <Layers className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform duration-300" />,
      href: '#',
      badge: '콘텐츠 준비 중',
      badgeColor: 'bg-purple-950/70 text-purple-400 border-purple-900/50',
      status: 'coming_soon',
      category: '게임/퍼즐'
    },
    {
      title: '함수 그래프 레이서',
      description: '일차함수와 이차함수의 수식을 입력하여 장애물이 등장하는 도로의 곡선을 따라 자동차를 안전하게 조종해보는 실시간 수학 시뮬레이션 게임입니다.',
      icon: <Activity className="w-6 h-6 text-sky-400 group-hover:translate-x-1 transition-transform duration-300" />,
      href: '#',
      badge: '개발 준비 중',
      badgeColor: 'bg-sky-950/70 text-sky-400 border-sky-900/50',
      status: 'planned',
      category: '게임/퍼즐'
    },
    {
      title: '다각형 내각/외각 나침반',
      description: '정다각형의 정점 개수를 동적으로 조작하며 내각의 총합과 외각의 총합 규칙을 시각적 각도 측정기로 밝혀내는 자기주도 기하학적 실험도구입니다.',
      icon: <Compass className="w-6 h-6 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />,
      href: '#',
      badge: '아이디어 구상 중',
      badgeColor: 'bg-amber-950/70 text-amber-400 border-amber-900/50',
      status: 'planned',
      category: '기하학'
    }
  ];

  const categories = [
    { id: 'all', name: '전체 활동' },
    { id: 'AI 튜터', name: '🤖 AI 수학 튜터' },
    { id: '기하학', name: '📐 기하학 탐구' },
    { id: '게임/퍼즐', name: '🎮 수학 미니게임' }
  ];

  const filteredActivities = selectedCategory === 'all' 
    ? activities 
    : activities.filter(act => act.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none -z-10" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/75 backdrop-blur-md sticky top-0 z-40 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-sky-500 rounded-2xl shadow-lg shadow-indigo-500/10">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              수학 코딩 플레이그라운드
            </h1>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Math & Coding hub</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>디지털 기하 교실 v1.0</span>
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-12 my-auto flex flex-col justify-center">
        
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto py-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-950/50 text-indigo-300 border border-indigo-900/30 backdrop-blur shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>수학과 코딩이 함께하는 실감 탐구 실험실</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-[1.15]">
            쉽고 재밌는 <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-sky-400 bg-clip-text text-transparent">수학 코딩 탐구원</span>
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            이곳은 평면도형을 직접 마우스로 그려서 3D 공간에 회전체를 생성해보고, 다양한 수학적 규칙을 
            코딩 시뮬레이션을 통해 직관적으로 조작하며 학습해보는 수학 전용 실습 포털입니다. 아래 원하는 활동을 클릭해 보세요!
          </p>

          <div className="pt-2 text-xs text-slate-500 font-medium">
            💡 (페이지 설명 및 문구는 언제든지 선생님의 요청에 맞춰 자유롭게 커스텀 수정 가능합니다!)
          </div>
        </section>

        {/* Category Tabs */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-900 pb-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer active:scale-95 border ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Activities Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {filteredActivities.map((act, idx) => {
              const isActive = act.status === 'active';
              const CardWrapper = isActive ? Link : 'div';
              
              return (
                <CardWrapper
                  key={idx}
                  href={act.href}
                  className={`group relative rounded-3xl p-6 bg-slate-900/35 border border-slate-800/80 backdrop-blur flex flex-col justify-between transition-all duration-300 overflow-hidden ${
                    isActive 
                      ? 'hover:-translate-y-1.5 hover:bg-slate-900/60 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/5 cursor-pointer' 
                      : 'opacity-75 border-slate-900 bg-slate-950/20'
                  }`}
                >
                  {/* Subtle hover gradient border overlay */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  )}

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/60 text-slate-300 group-hover:border-indigo-500/40 transition-colors shadow">
                        {act.icon}
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border tracking-wide uppercase ${act.badgeColor}`}>
                        {act.badge}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-base text-slate-100 group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                        {act.title}
                        {isActive && (
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-300" />
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-normal">
                        {act.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-900/80 text-[10px] text-slate-500 relative z-10">
                    <span className="font-mono">카테고리: {act.category}</span>
                    {isActive ? (
                      <span className="font-bold text-indigo-400 group-hover:underline">지금 탐구하기 &rarr;</span>
                    ) : (
                      <span className="font-mono italic text-slate-600">준비 중</span>
                    )}
                  </div>
                </CardWrapper>
              );
            })}
          </div>
        </section>

        {/* Feature info footer */}
        <section className="bg-slate-900/25 border border-slate-800/60 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-900 text-indigo-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200">선생님 전용 커스텀 기능</h4>
              <p className="text-xs text-slate-400 mt-0.5">이 포털은 새로운 학습 자료나 미니 코딩 실습이 구상될 때마다 카드를 손쉽게 무한대로 확장할 수 있도록 설계되어 있습니다.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-indigo-950/30 border border-indigo-900/20 text-[10px] font-bold text-indigo-300">
              반응형 모바일 지원
            </span>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 mt-auto bg-slate-950/40">
        <p>© 2026 수학 코딩 플레이그라운드. All rights reserved.</p>
      </footer>
    </div>
  );
}
