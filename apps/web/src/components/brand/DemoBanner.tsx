import React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function DemoBanner() {
  return (
    <div className="w-full bg-amber-50/90 dark:bg-pulse-900/90 border-b border-amber-200 dark:border-amber-500/20 px-4 py-2 text-xs transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong className="font-semibold text-amber-950 dark:text-amber-200">DEVELOPMENT ENVIRONMENT ACTIVE:</strong> Live feeds connected with automated fallback and transparency safeguards.
          </span>
        </div>
        <Link
          href="/methodology"
          className="text-amber-700 dark:text-amber-400/90 hover:text-amber-900 dark:hover:text-amber-300 underline underline-offset-2 flex items-center gap-1 transition-colors font-medium"
        >
          <span>Read data transparency methodology</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
