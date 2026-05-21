import React from 'react';
import { Download, FileText } from 'lucide-react';

export const ThumbnailBlueprintCard: React.FC<{ blueprint: { prompt: string; text: string; mood_color_instructions: string } }> = ({ blueprint }) => {
  return (
    <div className="p-4 border border-zinc-800 bg-zinc-950">
      <h3 className="text-micro font-mono font-bold text-zinc-500 uppercase tracking-[0.3em] mb-4">
        Thumbnail_Blueprint // تصميم_الصورة
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-[8px] text-zinc-600 block mb-1">Visual_Prompt</label>
          <p className="text-[11px] text-zinc-300 font-mono">{blueprint.prompt}</p>
        </div>
        <div className="flex gap-4">
            <div>
              <label className="text-[8px] text-zinc-600 block mb-1">Text_Overlay</label>
              <p className="text-[11px] text-zinc-100 font-bold">{blueprint.text}</p>
            </div>
            <div>
              <label className="text-[8px] text-zinc-600 block mb-1">Color_Mood</label>
              <p className="text-[11px] text-zinc-300">{blueprint.mood_color_instructions}</p>
            </div>
        </div>
      </div>
    </div>
  );
};
