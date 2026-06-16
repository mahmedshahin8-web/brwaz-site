import React from "react";
import { Plus, Calendar as CalendarIcon, Clock, Video, FileText, Image as ImageIcon } from "lucide-react";

export default function SchedulerPage() {
  const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  
  const scheduledItems: any[] = [];

  const renderIcon = (type: string) => {
    switch (type) {
      case "video": return <Video size={14} className="text-[#ef4444]" />;
      case "text": return <FileText size={14} className="text-[#10b981]" />;
      case "image": return <ImageIcon size={14} className="text-[#4f46e5]" />;
      default: return <Video size={14} className="text-[#a1a1aa]" />;
    }
  };

  return (
    <div className="min-h-full font-arabic text-[#fafafa] space-y-6" dir="rtl">
      {/* Header Section */}
      <header className="bg-[#121214]  rounded-lg border border-[#27272a] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_100%_0%,_#4f46e5_1px,_transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-[#fafafa] font-arabic mb-2 tracking-wide flex items-center gap-3">
             <CalendarIcon className="w-8 h-8 text-[#4f46e5]" />
             خطة النشر والمهام
          </h2>
          <p className="text-[#a1a1aa] font-arabic text-xs leading-relaxed max-w-2xl mt-2  ">
            جدولة المهام ومراقبة تدفق المحتوى عبر خطوط الإنتاج.
          </p>
        </div>
        
        <button className="bg-gradient-to-l from-[#4f46e5] to-[#6366f1] text-[#09090b] px-6 py-3 rounded-lg font-bold font-arabic hover:shadow-sm transition-all duration-300 flex items-center gap-2 active:scale-95 shrink-0 z-10">
          <Plus size={18} className="fill-[#09090b]" />
          <span>جدولة محتوى جديد</span>
        </button>
      </header>

      {/* Calendar Grid */}
      <div className="bg-[#121214]  border border-[#27272a] rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-7 gap-4 mb-4">
          {days.map((day, i) => (
            <div key={i} className="text-center font-arabic font-bold text-[#4f46e5] text-sm pb-4 border-b border-[#27272a]">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-4 auto-rows-[120px]">
          {Array.from({ length: 30 }).map((_, i) => {
            // Find items for this day (1-30)
            const items = scheduledItems.filter(item => item.day === i + 1);
            
            return (
              <div 
                key={i} 
                className="relative bg-[#09090b]/50 border border-[#27272a]/50 rounded-lg p-2 hover:border-[#4f46e5]/30 hover:bg-[#121214] transition-colors duration-300 group shadow-inner"
              >
                <span className="absolute top-2 left-3 font-arabic text-xs text-[#71717a] group-hover:text-[#4f46e5] transition-colors">
                  {i + 1}
                </span>

                <div className="mt-6 flex flex-col gap-2">
                  {items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="bg-[#27272a] border border-[#4f46e5]/20 rounded-lg p-2 flex flex-col gap-1 cursor-pointer hover:border-[#4f46e5]/50 hover:shadow-sm transition-all active:scale-95"
                    >
                      <div className="flex items-center gap-2">
                        {renderIcon(item.type)}
                        <span className="text-[10px] font-arabic text-[#a1a1aa]">{item.time}</span>
                      </div>
                      <span className="text-[10px] font-arabic font-bold text-[#fafafa] line-clamp-1">
                        {item.title}
                      </span>
                    </div>
                  ))}
                  
                  {/* Empty state hint on hover */}
                  {items.length === 0 && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center p-2">
                        <Plus size={20} className="text-[#4f46e5]/30" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
