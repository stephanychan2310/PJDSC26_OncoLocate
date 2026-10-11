import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export default function Tooltip({ text, children, width = 'w-64' }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span 
      className="relative inline-flex items-center ml-1 align-middle"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      <button
        type="button"
        aria-label="More information"
        className="text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-700 transition-colors p-0.5 rounded cursor-help"
      >
        {children || <HelpCircle className="w-3.5 h-3.5" />}
      </button>

      {isVisible && (
        <span 
          role="tooltip"
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 ${width} p-2.5 text-xs font-normal text-slate-700 bg-white border border-slate-100 rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.08)] pointer-events-none transition-opacity duration-150 text-left leading-relaxed`}
        >
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white" />
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-100 -z-10" />
        </span>
      )}
    </span>
  );
}
