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
        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] focus:outline-none transition-colors p-0.5 rounded cursor-help"
      >
        {children || <HelpCircle className="w-3.5 h-3.5" />}
      </button>

      {isVisible && (
        <span 
          role="tooltip"
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 ${width} p-2.5 text-xs font-normal text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.15)] pointer-events-none transition-opacity duration-150 text-left leading-relaxed`}
        >
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[var(--card)]" />
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--border)] -z-10" />
        </span>
      )}
    </span>
  );
}
