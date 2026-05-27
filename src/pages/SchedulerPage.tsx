import React from "react";
import { Plus, Calendar as CalendarIcon, Clock, Video, FileText, Image as ImageIcon } from "lucide-react";

export default function SchedulerPage() {
  const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  
  const scheduledItems: any[] = [];

  const renderIcon = (type: string) => {
    switch (type) {
      case "video": return <Video size={16} className="text-[#eb2630]" />;
      case "text": return <FileText size={16} className="text-[#3b82f6]" />;
      case "image": return <ImageIcon size={16} className="text-blue-600" />;
      default: return <Video size={16} />;
    }
  };

  return (
    <div className="min-h-full bg-[#020202] text-gray-900 p-8 space-y-8" dir="rtl">
      {/* Header */}
      <header className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3 text-blue-600">
          <CalendarIcon size={28} />
          <h1 className="text-4xl font-arabic font-black tracking-tighter uppercase leading-none">خطة النشر</h1>
        </div>
        
        <button className="bg-white text-black px-6 py-3 rounded-sm font-arabic font-bold flex items-center gap-2 active:scale-95 transition-colors">
          <Plus size={18} />
          جدولة محتوى جديد
        </button>
      </header>

      {/* Calendar Grid */}
      <div className="bg-gray-50/60 border border-gray-200 rounded-sm p-6 backdrop-blur-xl">
        <div className="grid grid-cols-7 gap-4 mb-4">
          {days.map((day, i) => (
            <div key={i} className="text-center font-arabic font-bold text-gray-600 pb-4 border-b border-gray-200">
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
                className="relative bg-gray-50 border border-gray-200 rounded-sm p-2 active:scale-95 border-gray-100 shadow-sm active:scale-95 transition-colors duration-300 group"
              >
                <span className="absolute top-2 left-2 font-mono text-xs text-gray-500 group-active:scale-95 transition-colors">
                  {i + 1}
                </span>

                <div className="mt-6 flex flex-col gap-2">
                  {items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white border border-gray-200 rounded-sm p-2 flex flex-col gap-1 cursor-pointer active:scale-95 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {renderIcon(item.type)}
                        <span className="text-xs font-mono text-gray-600">{item.time}</span>
                      </div>
                      <span className="text-[10px] font-arabic font-bold text-gray-900 line-clamp-1">
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
