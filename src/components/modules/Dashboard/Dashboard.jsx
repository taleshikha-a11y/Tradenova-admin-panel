import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  FileText,
  Maximize2,
  Mic,
  Send,
  Plus,
  BarChart2,
  Activity,
  Layers,
  Users,
  CreditCard,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import dashboardData from '../../../data/dashboardData.json';

export default function Dashboard({ setActiveTab }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('Month');
  const [selectedAIModel, setSelectedAIModel] = useState('GPT-4o');
  const [aiInput, setAiInput] = useState('');
  const [aiChatMessages, setAiChatMessages] = useState([
    {
      role: 'user',
      text: 'Where should I focus trading today?'
    },
    {
      role: 'assistant',
      text: '✦ Trade Focus:\n• Buy & watch: NIFTY 24500 CE, BANKNIFTY 52000 PE (high intraday momentum)\n• Avoid: Low liquidity midcap strikes (wider spreads observed today)'
    }
  ]);
  const [activeCandleTooltip, setActiveCandleTooltip] = useState(7);

  const { metrics, recentOrders, systemHealth } = dashboardData;

  // Candlestick data points for CashPanel chart
  const candlesticks = [
    { open: 74.328, close: 74.331, high: 74.333, low: 74.327, up: true, date: 'Nov 01' },
    { open: 74.331, close: 74.323, high: 74.332, low: 74.321, up: false, date: 'Nov 03' },
    { open: 74.323, close: 74.326, high: 74.328, low: 74.320, up: true, date: 'Nov 05' },
    { open: 74.326, close: 74.322, high: 74.327, low: 74.316, up: false, date: 'Nov 07' },
    { open: 74.322, close: 74.325, high: 74.327, low: 74.318, up: true, date: 'Nov 09' },
    { open: 74.325, close: 74.334, high: 74.336, low: 74.324, up: true, date: 'Nov 10' },
    { open: 74.334, close: 74.330, high: 74.335, low: 74.328, up: false, date: 'Nov 11' },
    { open: 74.330, close: 74.338, high: 74.339, low: 74.329, up: true, date: 'Nov 12', price: '$1.250' },
    { open: 74.338, close: 74.332, high: 74.339, low: 74.330, up: false, date: 'Nov 13' },
    { open: 74.332, close: 74.329, high: 74.334, low: 74.327, up: false, date: 'Nov 14' },
    { open: 74.329, close: 74.336, high: 74.337, low: 74.328, up: true, date: 'Nov 15' },
    { open: 74.336, close: 74.333, high: 74.338, low: 74.325, up: false, date: 'Nov 16' },
  ];

  const handleSendAI = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setAiInput('');
    setAiChatMessages((prev) => [
      ...prev,
      { role: 'user', text: userMsg },
      {
        role: 'assistant',
        text: `✦ Analysis for "${userMsg}":\n• Algorithmic signal: Market breadth is positive with +0.84 Sharpe.\n• Risk parameter: Maximum slippage tolerance 0.5% maintained across broker queues.`
      }
    ]);
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden animate-in fade-in duration-300">
      {/* Top Breadcrumb & Hero Header matching CashPanel */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 w-full">
        <div className="min-w-0">
          {/* Breadcrumb pill button */}
          <div className="inline-flex items-center gap-2 mb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className="w-8 h-8 rounded-full bg-white/90 border border-[#CFDEEB] flex items-center justify-center text-slate-700 hover:bg-white shadow-xs transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-600 truncate">
              Dashboard / My Portfolio
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 font-sans truncate">
            My Portfolio
          </h1>

          {/* Sub-Pills matching CashPanel: Stock Portfolio & Crypto Portfolio (Clickable) */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mt-3 sm:mt-4">
            {/* Stock Portfolio Pill with salmon texture */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setActiveTab('orders')}
              className="bg-white/90 backdrop-blur-md pl-3.5 pr-2.5 py-1.5 rounded-full border border-[#CFDEEB] flex items-center gap-2 sm:gap-3 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer select-none"
              title="Click to view live orders"
            >
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 whitespace-nowrap">
                Stock Portfolio <span className="font-bold text-blue-600">/ ₹ 4,15,632</span>
              </span>
              <div
                className="w-12 sm:w-16 h-4 sm:h-5 rounded-full bg-gradient-to-r from-[#FF8A80] to-[#FF5252] opacity-85 shrink-0"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.4) 4px, rgba(255,255,255,0.4) 8px)'
                }}
              />
            </div>

            {/* Crypto Portfolio Pill with yellow + blue accent */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setActiveTab('strategies')}
              className="bg-white/90 backdrop-blur-md pl-3.5 pr-2.5 py-1.5 rounded-full border border-[#CFDEEB] flex items-center gap-2 sm:gap-3 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer select-none"
              title="Click to view algorithmic strategies"
            >
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 whitespace-nowrap">
                Algo Portfolio <span className="font-bold text-blue-600">/ ₹ 3,15,632</span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#FFD54F]" />
                <div
                  className="w-10 sm:w-14 h-4 sm:h-5 rounded-full bg-gradient-to-r from-[#42A5F5] to-[#1E88E5]"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.4) 4px, rgba(255,255,255,0.4) 8px)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: ICONIC CashPanel SEMI-CIRCULAR GAUGE ARC */}
        <div className="relative w-full max-w-sm mx-auto xl:mx-0 bg-white/40 backdrop-blur-sm rounded-4xl p-3 sm:p-4 flex flex-col items-center justify-center shrink-0">
          <div className="relative w-64 sm:w-72 h-32 sm:h-36 flex items-end justify-center">
            {/* Glowing Semi-Circular SVG Arc */}
            <svg viewBox="0 0 240 120" className="w-64 sm:w-72 h-32 sm:h-36 overflow-visible">
              <defs>
                <linearGradient id="arcGlow" x1="0" y1="1" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="arcStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="50%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#60A5FA" />
                </linearGradient>
              </defs>

              {/* Background Arc Shadow / Glow */}
              <path d="M 20 110 A 100 100 0 0 1 220 110" fill="url(#arcGlow)" />

              {/* Main Glowing Border Arc */}
              <path
                d="M 20 110 A 100 100 0 0 1 220 110"
                fill="none"
                stroke="url(#arcStroke)"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />

              {/* Progress Tracker Curve */}
              <path
                d="M 20 110 A 100 100 0 0 1 180 32"
                fill="none"
                stroke="#1E6BFB"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Indicator Dots on Arc */}
              <circle cx="20" cy="110" r="4" fill="#38BDF8" />
              <circle cx="60" cy="46" r="4" fill="#60A5FA" />
              <circle cx="120" cy="10" r="5" fill="#1E6BFB" stroke="#ffffff" strokeWidth="2" />
              <circle cx="180" cy="32" r="4" fill="#60A5FA" />
              <circle cx="220" cy="110" r="4" fill="#38BDF8" />
            </svg>

            {/* Inner Content matching screenshot 2 */}
            <div className="absolute inset-x-0 bottom-1 sm:bottom-2 text-center flex flex-col items-center">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Total portfolio value
              </span>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mt-0.5">
                $44,553.00
              </p>
              <button
                onClick={() => setActiveTab('orders')}
                className="mt-1 sm:mt-2 inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-50 rounded-full text-xs font-bold text-slate-800 shadow-xs border border-[#CFDEEB] transition-transform active:scale-95"
              >
                <span>View</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Card 1 (Graph with Candlesticks) & Card 2 (AI Assistant) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
        {/* CARD 1: Graph with Candlestick Chart (7 cols on xl) */}
        <div className="xl:col-span-7 bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-card flex flex-col justify-between min-w-0 overflow-hidden">
          <div>
            {/* Header: Graph title, tools icons */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-slate-800" />
                <h3 className="font-bold text-sm text-slate-900">Graph</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="Activity tool"
                >
                  <Activity className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="Expand graph"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Candlestick visualization & Right metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1 min-w-0">
              {/* Candlestick Area (3 cols on md) */}
              <div className="md:col-span-3 relative h-48 sm:h-52 flex flex-col justify-between min-w-0">
                {/* Horizontal price dashed lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {['74.3230', '74.3325', '74.3320', '74.3215', '74.3210'].map((price, idx) => (
                    <div key={idx} className="flex items-center gap-2 w-full">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono w-11 sm:w-12 shrink-0">
                        {price}
                      </span>
                      <div className="flex-1 border-b border-dashed border-slate-100" />
                    </div>
                  ))}
                </div>

                {/* Candles rendered */}
                <div className="relative h-40 sm:h-44 pl-12 sm:pl-14 pr-1 flex items-center justify-between gap-1 z-10 min-w-0">
                  {candlesticks.map((candle, idx) => {
                    const isGreen = candle.up;
                    const isTooltip = idx === activeCandleTooltip;
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveCandleTooltip(idx)}
                        className="flex flex-col items-center justify-center flex-1 h-full cursor-pointer relative group"
                      >
                        {/* Interactive floating white tooltip card */}
                        {isTooltip && (
                          <div className="absolute -top-7 z-20 bg-white border border-slate-200/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl shadow-lg text-center whitespace-nowrap animate-in zoom-in-95">
                            <span className="block text-[8px] sm:text-[9px] text-slate-400 font-medium">
                              {candle.date}, 2026
                            </span>
                            <span className="block text-[11px] sm:text-xs font-black text-slate-900 font-mono">
                              {candle.price || '$1.250'}
                            </span>
                          </div>
                        )}

                        {/* Top wick */}
                        <div
                          className={`w-[1.5px] h-2.5 sm:h-3 ${
                            isGreen ? 'bg-[#10B981]' : 'bg-[#EF4444]'
                          }`}
                        />
                        {/* Candle Body */}
                        <div
                          className={`w-2.5 sm:w-3 rounded-[3px] transition-all group-hover:scale-110 ${
                            isGreen ? 'bg-[#10B981] h-8 sm:h-10' : 'bg-[#EF4444] h-10 sm:h-12'
                          }`}
                        />
                        {/* Bottom wick */}
                        <div
                          className={`w-[1.5px] h-2.5 sm:h-3 ${
                            isGreen ? 'bg-[#10B981]' : 'bg-[#EF4444]'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Month labels at bottom */}
                <div className="pl-12 sm:pl-14 flex justify-between text-[9px] sm:text-[10px] font-semibold text-slate-400">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                </div>
              </div>

              {/* Right Stats matching screenshot 2 */}
              <div className="md:col-span-1 flex md:flex-col justify-between md:justify-start gap-3 sm:gap-4 pt-2 md:pt-1 border-t md:border-t-0 md:border-l border-slate-100 md:pl-4 text-xs">
                <div>
                  <p className="text-slate-400 text-[10px] sm:text-[11px] font-medium leading-tight">
                    Gain to pain ratio
                  </p>
                  <p className="font-black text-slate-900 text-xs sm:text-sm mt-0.5">1.8</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] sm:text-[11px] font-medium leading-tight">
                    Reward to risk ration
                  </p>
                  <p className="font-black text-slate-900 text-xs sm:text-sm mt-0.5">2.4</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] sm:text-[11px] font-medium leading-tight">
                    Leverage used
                  </p>
                  <p className="font-black text-slate-900 text-xs sm:text-sm mt-0.5">$120,000</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Timeframe Selector matching CashPanel */}
          <div className="pt-3 sm:pt-4 mt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
                aria-label="Toggle line chart"
              >
                <Activity className="w-3.5 h-3.5" />
              </button>
              <button
                className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
                aria-label="Toggle bar chart"
              >
                <BarChart2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Timeframe pills */}
            <div className="bg-slate-100/80 p-0.5 sm:p-1 rounded-full flex items-center gap-1 text-[11px] sm:text-xs border border-slate-200/50">
              {['Year', 'Month', 'Week', 'Day'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-3 py-1 rounded-full text-xs transition-all ${
                    selectedTimeframe === tf
                      ? 'bg-[#111827] text-white shadow-md font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#EAF1F8] font-semibold'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 2: AI Assistant matching screenshot 2 (5 cols on xl) */}
        <div className="xl:col-span-5 bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-card flex flex-col justify-between min-w-0 overflow-hidden">
          <div>
            {/* Header: AI Assistant with icons */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-slate-800" />
                <h3 className="font-bold text-sm text-slate-900">AI Assistant</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="AI documentation"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
                <button
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="Expand AI"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Box */}
            <div className="space-y-2.5 max-h-48 sm:max-h-56 overflow-y-auto pr-1">
              {aiChatMessages.map((msg, mIdx) => (
                <div
                  key={mIdx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`p-2.5 sm:p-3 rounded-2xl text-xs max-w-[95%] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-slate-100 text-slate-800 font-medium'
                        : 'bg-slate-50 text-slate-700 border border-slate-100'
                    }`}
                  >
                    <p className="whitespace-pre-line text-[11px] sm:text-xs">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Model Pills Chips matching screenshot 2 */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3 pt-3 border-t border-slate-100">
              {['GPT-4o', 'Document AI', 'Financial AI', 'Candle analyst'].map((model) => (
                <button
                  key={model}
                  onClick={() => setSelectedAIModel(model)}
                  className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] transition-all ${
                    selectedAIModel === model
                      ? 'bg-[#111827] text-white shadow-md font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#EAF1F8] font-semibold bg-slate-100/80'
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar at bottom matching CashPanel */}
          <form
            onSubmit={handleSendAI}
            className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-slate-100 rounded-full"
          >
            <button
              type="button"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 shadow-xs shrink-0"
              aria-label="Add attachment"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <input
              type="text"
              placeholder="Enter Task for AI Assistant"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              className="flex-1 bg-transparent text-[11px] sm:text-xs text-slate-800 placeholder-slate-400 focus:outline-none px-1 sm:px-2 min-w-0"
            />
            <button
              type="button"
              className="p-1 sm:p-1.5 text-slate-400 hover:text-slate-700 shrink-0"
              title="Voice Prompt"
              aria-label="Voice input"
            >
              <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="submit"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1E6BFB] hover:bg-blue-600 flex items-center justify-center text-white shadow-md transition-colors shrink-0"
              aria-label="Send query"
            >
              <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Second Grid: Card 3 (Transfers / Recent Orders) & Card 4 (Spending Overview / System Metrics) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* CARD 3: Transfers matching screenshot 2 */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-card min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#111827]" />
              <h3 className="font-bold text-sm text-slate-900">Transfers & Live Orders</h3>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="View all orders"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {recentOrders.map((ord) => (
              <div
                key={ord.id}
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-slate-50 hover:bg-[#EDF3F8] transition-colors gap-2"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <img
                    src={ord.avatar}
                    alt={ord.user}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-white shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{ord.user}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {ord.strategy} &bull; {ord.time}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-extrabold text-slate-900 font-mono">{ord.amount}</p>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ord.status === 'Executed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : ord.status === 'Pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 4: Spending Overview matching screenshot 2 */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-card flex flex-col justify-between min-w-0 overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#111827]" />
                <h3 className="font-bold text-sm text-slate-900">
                  Spending Overview & Engine Status
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('payments')}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
                aria-label="View payments"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-baseline justify-between mb-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                $44,553.00
              </span>
              <span className="text-xs font-bold text-rose-500">-$30.00 This week</span>
            </div>

            {/* Segmented multi-colored bar matching CashPanel */}
            <div className="w-full h-3 rounded-full overflow-hidden flex gap-1 bg-slate-100 p-0.5">
              <div className="h-full rounded-full bg-[#1E6BFB] w-[45%]" title="Broker Volume" />
              <div className="h-full rounded-full bg-[#FFD54F] w-[25%]" title="Options F&O" />
              <div className="h-full rounded-full bg-[#9575CD] w-[20%]" title="Equity Intraday" />
              <div className="h-full rounded-full bg-slate-300 w-[10%]" title="Fees/Slippage" />
            </div>

            {/* System service badges below */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-5">
              {systemHealth.map((sh, idx) => (
                <div
                  key={idx}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveTab('brokers')}
                  className="p-2.5 sm:p-3 bg-slate-50 hover:bg-slate-100/90 rounded-2xl min-w-0 cursor-pointer transition-all hover:scale-[1.02] select-none"
                  title="Click to check broker adapters & gateways"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 truncate">{sh.service}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ml-1" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono truncate">
                    {sh.ping} &bull; {sh.uptime}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 sm:pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span className="truncate">Trading Engine: 6/6 Adapters Online</span>
            <span className="font-bold text-emerald-600 shrink-0 ml-2">Optimal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
