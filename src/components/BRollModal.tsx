import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, Loader2, Download } from "lucide-react";
import { searchPexelsVideos, PexelsVideo } from "../services/pexelsService";

interface Props {
  keyword: string;
  onClose: () => void;
}

export function BRollModal({ keyword, onClose }: Props) {
  const [results, setResults] = useState<PexelsVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function search() {
      if (!keyword) return;
      try {
        setIsLoading(true);
        setError(null);
        // We might want to use visual_cue to get the best results, but let's just use the query
        // The user said: "ياخد الـ (Visual Cue) المكتوب، يفلتره لـ Keywords"
        // Since we are doing it live, maybe we just pass the keywords directly. We can clean it up a bit if needed.
        const cleanQuery = keyword.split(' ').slice(0, 3).join(' '); // A simple way to avoid overly long Pexels queries
        const videos = await searchPexelsVideos(cleanQuery);
        setResults(videos);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    search();
  }, [keyword]);

  return (
    <div className="fixed inset-0 z-[7000] flex items-center justify-center p-4 md:p-10 bg-white/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-5xl bg-white border border-gray-200 p-6 flex flex-col h-[80vh]"
      >
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-blue-600 font-mono uppercase tracking-widest text-sm flex items-center gap-2">
             <Search size={16} /> B-Roll Radar: <span className="text-gray-600">"{keyword}"</span>
           </h3>
           <button onClick={onClose} className="text-gray-600 active:scale-95 transition-colors">
             <X size={20} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              <div className="font-mono text-xs uppercase tracking-widest animate-pulse">Scanning Pexels Servers...</div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center text-red-500 font-mono text-sm max-w-md mx-auto text-center border border-red-500/20 bg-red-500/5 p-4">
              Error fetching B-Roll: {error}
            </div>
          ) : results.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-600 font-mono text-sm">
              No results found for this visual query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((video) => {
                const bestFile = video.video_files.find(f => f.quality === 'hd') || video.video_files[0];
                return (
                  <div key={video.id} className="bg-white/50 border border-gray-200 group active:scale-95 transition-colors">
                     <div className="relative aspect-video overflow-hidden">
                       <video 
                         src={bestFile?.link} 
                         poster={video.image}
                         className="w-full h-full object-cover"
                         onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                         onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                         muted
                         loop
                       />
                     </div>
                     <div className="p-3 flex justify-between items-center">
                       <span className="text-[10px] font-mono text-gray-600">{video.width}x{video.height}</span>
                       <a
                         href={bestFile?.link}
                         target="_blank"
                         rel="noopener noreferrer"
                         title="Download"
                         className="p-2 bg-white border-gray-100 shadow-sm active:scale-95 transition-colors rounded text-gray-900"
                         download
                       >
                         <Download size={14} />
                       </a>
                     </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
