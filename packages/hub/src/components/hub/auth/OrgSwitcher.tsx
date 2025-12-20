'use client';

import { Building2 } from 'lucide-react';

export function OrgSwitcher() {
  return (
    <div className="px-2 py-2">
      <div className="w-full flex items-center gap-2 px-2 py-2 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
          <Building2 className="w-4 h-4" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-medium text-neutral-100 truncate">IntegrateWise</div>
          <div className="text-[10px] text-neutral-500">Enterprise Hub</div>
        </div>
      </div>
    </div>
  );
}
