import React from 'react';

export default function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'slate',
  onClick,
  valueColor,
  isActive = false,
  subtitle
}) {
  const colorMap = {
    slate: {
      bg: 'bg-slate-100 text-slate-600',
      val: 'text-slate-900',
      trend: 'text-slate-500',
      activeRing: 'ring-2 ring-slate-900/80 border-slate-900 bg-slate-50/40'
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      val: 'text-blue-600',
      trend: 'text-blue-600',
      activeRing: 'ring-2 ring-blue-500/80 border-blue-500 bg-blue-50/30'
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      val: 'text-emerald-600',
      trend: 'text-emerald-600',
      activeRing: 'ring-2 ring-emerald-500/80 border-emerald-500 bg-emerald-50/30'
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      val: 'text-indigo-600',
      trend: 'text-purple-600',
      activeRing: 'ring-2 ring-indigo-500/80 border-indigo-500 bg-indigo-50/30'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      val: 'text-amber-500',
      trend: 'text-amber-600',
      activeRing: 'ring-2 ring-amber-500/80 border-amber-500 bg-amber-50/30'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      val: 'text-rose-600',
      trend: 'text-rose-600',
      activeRing: 'ring-2 ring-rose-500/80 border-rose-500 bg-rose-50/30'
    }
  };

  const scheme = colorMap[color] || colorMap.slate;
  const finalValColor = valueColor || scheme.val;

  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`group bg-white rounded-3xl p-4 border shadow-card hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer select-none flex flex-col justify-between active:scale-[0.98] ${
        isActive
          ? `${scheme.activeRing} shadow-md`
          : 'border-slate-100 hover:border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {isActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 animate-ping" />
          )}
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider truncate">
            {title}
          </p>
        </div>
        {Icon && (
          <div
            className={`p-1.5 rounded-xl ${scheme.bg} group-hover:scale-110 transition-transform shrink-0`}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <p className={`text-2xl font-black tracking-tight ${finalValColor}`}>
          {value}
        </p>
        {change && (
          <span className={`text-[11px] font-bold ${scheme.trend}`}>
            {change}
          </span>
        )}
        {subtitle && !change && (
          <span className="text-[10px] text-slate-400 font-medium">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
