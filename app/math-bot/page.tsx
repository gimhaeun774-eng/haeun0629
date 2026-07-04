'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  Send,
  Bot,
  User,
  Sparkles,
  RotateCcw,
  Loader2,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const PRESET_QUESTIONS = [
  { emoji: '🔺', text: '회전체가 뭐예요?' },
  { emoji: '⭕', text: '원의 넓이를 구하는 공식이 뭔가요?' },
  { emoji: '📐', text: '삼각형의 내각의 합이 왜 180°인가요?' },
  { emoji: '📈', text: '일차함수와 이차함수의 차이점을 알려주세요' },
  { emoji: '🎲', text: '재미있는 수학 이야기 해줘요!' },
  { emoji: '🧮', text: '소수(소인수)가 뭔가요?' },
];

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-2xl flex items-center justify-center shadow-md ${
          isUser
            ? 'bg-gradient-to-tr from-indigo-500 to-sky-500'
            : 'bg-gradient-to-tr from-violet-600 to-purple-500'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] px-4 py-3 rounded-3xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
          isUser
            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-sm'
            : 'bg-slate-800 border border-slate-700/60 text-slate-100 rounded-bl-sm'
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-violet-600 to-purple-500 shadow-md">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-slate-800 border border-slate-700/60 px-4 py-3 rounded-3xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export default function MathBotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        '안녕하세요! 👋 저는 여러분의 수학 학습을 도와주는 AI 수학 튜터예요!\n\n수학에 대한 궁금한 것은 무엇이든 물어보세요. 아래 버튼을 눌러 빠르게 시작할 수도 있어요! 😊',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: content.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '알 수 없는 오류가 발생했습니다.');
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply },
      ]);
    } catch (err: any) {
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ 오류: ${err.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          '안녕하세요! 👋 저는 여러분의 수학 학습을 도와주는 AI 수학 튜터예요!\n\n수학에 대한 궁금한 것은 무엇이든 물어보세요. 아래 버튼을 눌러 빠르게 시작할 수도 있어요! 😊',
      },
    ]);
    setInput('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-violet-500 selection:text-white relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-violet-500 to-purple-500 rounded-2xl shadow-lg shadow-violet-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-violet-200 to-slate-400 bg-clip-text text-transparent">
              AI 수학 튜터
            </h1>
            <p className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">
              Math AI Chatbot — powered by OpenAI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>대화 초기화</span>
          </button>
          <Link
            href="/"
            className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">메인 화면으로</span>
          </Link>
        </div>
      </header>

      {/* Main Chat Layout */}
      <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 pb-4 pt-6 gap-4">
        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 min-h-0 custom-scrollbar">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Preset questions */}
        {messages.length <= 2 && (
          <div className="flex flex-wrap gap-2 py-2">
            {PRESET_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q.text)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900/80 hover:bg-violet-950/60 border border-slate-800 hover:border-violet-800/60 text-slate-300 hover:text-violet-300 rounded-2xl transition cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur"
              >
                <span>{q.emoji}</span>
                <span>{q.text}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-3 flex items-end gap-3 backdrop-blur shadow-xl shadow-slate-950/50">
          <div className="flex-shrink-0 w-8 h-8 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-sky-500 shadow">
            <User className="w-4 h-4 text-white" />
          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="수학 질문을 입력해 보세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-600 resize-none focus:outline-none leading-relaxed min-h-[36px] max-h-[160px] py-1.5 disabled:opacity-50"
          />

          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-500/20 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-600">
          AI 튜터의 답변은 참고용입니다. 중요한 개념은 교과서나 선생님께도 확인해 보세요.
        </p>
      </main>
    </div>
  );
}
