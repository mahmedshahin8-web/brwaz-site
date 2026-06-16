import React, { useState } from 'react';
import { cn } from '../lib/utils';

interface CitationCardProps {
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceType: 'Archive.org' | 'ARIJ' | 'General';
  citation: string;
}

export const CitationEvidenceCard: React.FC<CitationCardProps> = ({ 
  sourceId, 
  sourceTitle, 
  sourceUrl, 
  sourceType, 
  citation 
}) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <div 
      className={cn(
        "relative p-4 border border-amber-900/40 bg-zinc-950 cursor-pointer transition-none",
        "bg-[url('/grid.png')] bg-repeat",
        !revealed && "active:scale-95"
      )}
      onClick={() => setRevealed(!revealed)}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[9px] font-bold text-amber-700 font-medium">
          Evidence_Tag // {sourceId}
        </span>
        <span className="text-[8px] font-medium text-amber-900">
          {sourceType}
        </span>
      </div>
      
      <h4 className="text-[11px] font-medium text-amber-100/90 leading-tight mb-2">
        {sourceTitle}
      </h4>

      {revealed && (
        <div className="mt-4 pt-4 border-t border-amber-900/30 animate-none">
          <p className="text-micro italic text-zinc-400 mb-2 font-arabic">
            "{citation}"
          </p>
          <a 
            href={sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[9px] text-amber-600 underline font-arabic active:scale-95"
          >
            [Access_Original_Document]
          </a>
        </div>
      )}
    </div>
  );
};
