import React from "react";
import { X, Download, Upload, Trash2 } from "lucide-react";
import { EpisodeData } from "../../types";

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  archive: EpisodeData[];
  onSetArchive: React.Dispatch<React.SetStateAction<EpisodeData[]>>;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  onClose,
  archive,
  onSetArchive,
}) => {
  if (!isOpen) return null;

  const handleExport = () => {
    const dataStr = JSON.stringify(archive, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `barwaz_archive_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedData)) {
          onSetArchive(importedData);
        } else {
          alert("Invalid archive format.");
        }
      } catch (err) {
        alert("Failed to parse archive file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-[#27272a]/50/95  overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#27272a]/50 border border-[#27272a] p-8 lg:p-10 shadow-[0_0_100px_rgba(0,0,0,1)] animate-liquid overflow-hidden rounded">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#4f46e5]/20" />
        <button
          onClick={onClose}
          className="absolute top-10 right-10 text-[#71717a] transition-all duration-300 group active:scale-95 z-10"
        >
          <X className="w-10 h-10 transition-transform group-active:scale-95" />
        </button>
        <header className="mb-10 text-center border-b border-[#27272a] pb-8 relative">
          <h2 className="text-2xl font-arabic font-black text-[#fafafa] tracking-tighter mb-2">
            الأرشيف والسجلات
          </h2>
          <p className="text-sm font-arabic text-[#a1a1aa]">
            مركز النسخ الاحتياطي (Offline Backup) لجميع مسودات التقارير
          </p>
          <div className="absolute top-0 left-0 flex gap-4 text-left" dir="ltr">
             <button
               onClick={handleExport}
               className="p-2 border border-[#27272a] text-[#4f46e5] hover:bg-[#4f46e5]/10 rounded-lg flex items-center gap-2 text-[10px] font-arabic transition-all  "
             >
               <Download size={14} /> EXPORT BACKUP
             </button>
             <label className="p-2 border border-[#27272a] text-emerald-500 hover:bg-emerald-500/10 rounded-lg flex items-center gap-2 text-[10px] font-arabic transition-all cursor-pointer  ">
               <Upload size={14} /> IMPORT BACKUP
               <input type="file" accept=".json" onChange={handleImport} className="hidden" />
             </label>
          </div>
        </header>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-4 text-right" dir="rtl">
          {archive.length === 0 ? (
            <div className="text-center py-20 text-[#71717a] font-arabic">
               لا توجد سجلات مؤرشفة حالياً.
            </div>
          ) : (
            archive.map((ep, i) => (
              <div key={i} className="bg-[#121214]  p-6 border border-[#27272a] rounded-xl flex flex-col gap-4 relative group transition-all hover:border-[#4f46e5]/40">
                <div className="absolute top-0 right-0 w-1 h-full bg-[#4f46e5] rounded-r-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-4">
                     <span className="text-xs font-arabic text-[#71717a]">#{String(archive.length - i).padStart(3, '0')}</span>
                     <h4 className="text-lg font-arabic font-bold text-[#fafafa]">{ep.video_title}</h4>
                   </div>
                   <button 
                     onClick={() => onSetArchive(prev => prev.filter((_, idx) => idx !== i))}
                     className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2 bg-red-500/10 rounded-lg"
                     title="حذف من الأرشيف"
                   >
                     <Trash2 size={14} />
                   </button>
                </div>
                <p className="text-sm text-[#a1a1aa] font-arabic leading-relaxed line-clamp-2">
                   {ep.publishing_kit?.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                   {ep.publishing_kit?.tags?.slice(0, 3).map((tag, idx) => (
                     <span key={idx} className="text-[9px] bg-[#27272a] text-[#a1a1aa] px-2 py-1 rounded-lg">{tag}</span>
                   ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
