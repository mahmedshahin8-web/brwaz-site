import React, { useState } from 'react';
import { Download, FileText, ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { generateNanoBananaImage } from '../services/imageService';

export const ThumbnailBlueprintCard: React.FC<{ blueprint: { prompt: string; text: string; mood_color_instructions: string } }> = ({ blueprint }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const url = await generateNanoBananaImage(`${blueprint.prompt}, ${blueprint.mood_color_instructions}. Cinematic lighting, 8k resolution, documentary style thumbnail. TEXT TO AVOID IN GENERATION (we will overlay it): ${blueprint.text}`);
      setImageUrl(url);
    } catch (err) {
      console.error(err);
      alert("فشل في توليد الصورة");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 border border-zinc-800 bg-zinc-950 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-micro font-arabic font-bold text-zinc-500  ">
          Thumbnail_Blueprint // تصميم_الصورة
        </h3>
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="text-[9px]  tracking-wider font-arabic bg-[#4f46e5] hover:bg-[#4f46e5] text-white px-3 py-1 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          {isGenerating ? "Synthesizing..." : "Generate AI_Thumb"}
        </button>
      </div>
      
      {imageUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-zinc-700 bg-black group">
          <img src={imageUrl} alt="Thumbnail generated" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
            <h1 className="text-3xl font-black text-white font-arabic drop-shadow-2xl translate-y-2 group-hover:translate-y-0 transition-transform">{blueprint.text}</h1>
          </div>
        </div>
      )}

      <div className="space-y-4 pt-4 border-t border-zinc-900 mt-2">
        <div>
          <label className="text-[8px] text-zinc-600 block mb-1">Visual_Prompt</label>
          <p className="text-[11px] text-zinc-300 font-arabic">{blueprint.prompt}</p>
        </div>
        <div className="flex gap-4">
            <div>
              <label className="text-[8px] text-zinc-600 block mb-1">Text_Overlay</label>
              <p className="text-[11px] text-zinc-100 font-bold font-arabic">{blueprint.text}</p>
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
