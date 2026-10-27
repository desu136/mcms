import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';

interface ReceptionistBannerProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  actionElement?: React.ReactNode;
}

function ReceptionistBanner({
  title,
  subtitle,
  icon: Icon,
  actionElement,
}: ReceptionistBannerProps) {
  const [currentDateIndex, setCurrentDateIndex] = useState(0);

  const dates = [
    { dateStr: 'Oct 19, 2026', day: 'Tuesday' },
    { dateStr: 'Oct 20, 2026', day: 'Wednesday' },
    { dateStr: 'Oct 21, 2026', day: 'Thursday' },
  ];

  const handlePrev = () => {
    setCurrentDateIndex((prev) => (prev > 0 ? prev - 1 : dates.length - 1));
  };

  const handleNext = () => {
    setCurrentDateIndex((prev) => (prev < dates.length - 1 ? prev + 1 : 0));
  };

  const current = dates[currentDateIndex] || dates[0];

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:py-2.5 sm:px-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
      {/* Left: Icon, Title, Subtitle */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
          <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.2]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight truncate">
            {title}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right side: Date picker + Custom action element */}
      <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto shrink-0">
        {/* Date Selector Widget */}
        <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <div className="text-left">
            <div className="text-[11px] font-bold text-slate-800 leading-none">
              {current?.dateStr}
            </div>
            <div className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">
              {current?.day}
            </div>
          </div>
          <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1.5 ml-0.5">
            <button
              onClick={handlePrev}
              type="button"
              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNext}
              type="button"
              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action Element / Button / Badge */}
        {actionElement}
      </div>
    </div>
  );
}

export default React.memo(ReceptionistBanner);
