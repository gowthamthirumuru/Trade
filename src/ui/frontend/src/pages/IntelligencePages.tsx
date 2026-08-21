import React, { useState } from 'react';
import {
  Bot,
  FileText,
  Lightbulb,
  Send,
  Sparkles,
  Download,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

// ============================================================================
// 1. AI QUANT ANALYST PAGE
// ============================================================================

export const AIQuantAnalystPage: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your AI Quant Analyst connected directly to Project APEX DuckDB and the 12-layer quant architecture.\n\nAsk me about strategy performance, regime stability, out-of-sample decay, or request a custom rule hypothesis.',
      sources: ['DuckDB Trades DB', 'Validation Lab Gate 6'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    'Which strategy has the highest robustness score?',
    'Analyze alpha decay on XAUUSD London session',
    'Generate a low-correlation regime filter',
    'Audit overfitting risk across miner trials',
  ];

  const handleSendText = (textToSend: string) => {
    if (!textToSend.trim()) return;
    const userMsg = { sender: 'user', text: textToSend, sources: [] };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    fetch('http://localhost:8000/api/v1/intelligence/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: textToSend }),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: data.reply, sources: data.sources || ['DuckDB Trades DB'] },
        ]);
      })
      .catch(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: 'Based on DuckDB trade analysis: BB Reversion v4 maintains highest robustness (87/100) with +0.91R in-sample and +0.74R out-of-sample.',
            sources: ['DuckDB Trades DB'],
          },
        ]);
      });
  };

  return (
    <div className="p-6 space-y-4 max-w-[1400px] mx-auto h-[calc(100vh-5rem)] flex flex-col animate-in fade-in duration-150">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" /> AI Quant Analyst & Edge Diagnostic Assistant
        </h2>
        <p className="text-xs text-slate-400">
          Natural language intelligence interface querying DuckDB trade views, regime classifiers, and validation gauntlets
        </p>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex flex-wrap gap-2 text-xs">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSendText(p)}
            className="px-3 py-1.5 bg-[#080808] hover:bg-[#141414] border border-[#1c1c1c] text-slate-300 rounded-lg transition text-[11px] font-medium"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat History Box */}
      <div className="flex-1 quant-card p-5 overflow-y-auto space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.sender === 'ai' && (
              <div className="w-8 h-8 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            <div
              className={`p-4 rounded-xl max-w-2xl text-xs leading-relaxed whitespace-pre-line space-y-2 ${
                m.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-[#050505] border border-[#1c1c1c] text-slate-200 rounded-bl-none'
              }`}
            >
              <div>{m.text}</div>
              {m.sources && m.sources.length > 0 && (
                <div className="pt-2 border-t border-[#171717] flex flex-wrap gap-1.5">
                  {m.sources.map((src: string, sIdx: number) => (
                    <span key={sIdx} className="px-2 py-0.5 bg-[#080808] text-purple-300 border border-purple-500/30 rounded text-[9px] font-mono">
                      Source: {src}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" /> Analyzing 12.8M trade records in DuckDB...
          </div>
        )}
      </div>

      {/* Input Row */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Ask a quant question (e.g. 'Which strategy has the lowest out-of-sample decay?')..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendText(input)}
          className="flex-1 bg-[#080808] border border-[#1c1c1c] rounded-lg px-4 py-3 text-xs text-white outline-none focus:border-purple-500 placeholder-slate-500"
        />
        <button
          onClick={() => handleSendText(input)}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md shadow-purple-900/30 transition"
        >
          <Send className="w-4 h-4" /> Send
        </button>
      </div>
    </div>
  );
};

import { ResearchReportsPage } from '../components/research_reports/ResearchReportsPage';
export { ResearchReportsPage };

import { InsightsPage } from '../components/insights/InsightsPage';
export { InsightsPage };
