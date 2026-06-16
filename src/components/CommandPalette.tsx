import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { FileText, Archive, Radar, Activity, Zap, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Toggle on Cmd+K or Ctrl+K or /
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        // Only if we aren't typing in an input
        if (e.key === '/' && (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA')) {
            return;
        }
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigateTo = (page: string) => {
    navigate(`/${page}`);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-[#27272a]/50/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl bg-[#121214]  border border-[#27272a] shadow-2xl flex flex-col font-arabic text-sm">
        <Command label="Command Menu" className="flex flex-col h-full" onClick={(e) => e.stopPropagation()} filter={(value, search) => {
          if (value.toLowerCase().includes(search.toLowerCase())) return 1;
          return 0;
        }}>
          <div className="flex items-center border-b border-[#27272a] px-4">
             <span className="text-cyan-400 font-bold mr-2">{'>'}</span>
             <Command.Input 
               autoFocus 
               value={searchQuery}
               onValueChange={setSearchQuery}
               placeholder="[UNIFIED_INTELLIGENCE] // إبحث في الوثائق، الملفات، الأوامر السريعة، أو اسأل AI..." 
               className="w-full bg-transparent text-[#fafafa] py-4 focus:outline-none placeholder:text-[#71717a] text-[10px]  font-arabic "
               dir="rtl"
             />
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto custom-scrollbar p-2" dir="rtl">
            <Command.Empty className="p-8 text-[#a1a1aa] text-center flex flex-col items-center gap-3">
               <Zap className="w-6 h-6 text-cyan-400 opacity-50" />
               <span className="  text-[10px]">استخراج الداتا من الفضاء السيبراني...</span>
            </Command.Empty>

            {searchQuery.length > 2 && (
              <Command.Group heading="[AI_SUGGESTIONS] // البحث الذكي" className="px-2 py-2 text-[#71717a] text-[10px] font-medium [&_[cmdk-group-heading]]:mb-2 text-right">
                <Command.Item
                  onSelect={() => { 
                     navigate('/script-editor', { state: { magicDraftTopic: searchQuery } });
                     setOpen(false); 
                  }}
                  value={`بحث عن ${searchQuery}`}
                  className="flex flex-col gap-1 px-3 py-3 text-[#fafafa]/70 active:scale-95 border-[#27272a] shadow-sm active:scale-95 cursor-pointer transition-colors duration-100 aria-selected:bg-[#121214]  border-[#27272a] shadow-sm aria-selected:text-[#fafafa]"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>تحليل المراجع الخاصة بـ "{searchQuery}" في الأرشيف...</span>
                  </div>
                  <span className="text-[9px] text-[#71717a] mr-7">سيتم فحص 40 وثيقة و 3 كتب في [THE_VAULT]</span>
                </Command.Item>
              </Command.Group>
            )}

            <Command.Group heading="التنقل السريع" className="px-2 py-2 text-[#71717a] text-[10px] font-medium [&_[cmdk-group-heading]]:mb-2 text-right">
              <Command.Item
                onSelect={() => navigateTo('dashboard')}
                value="warRoom dashboard الرئيسية"
                className="flex items-center gap-3 px-3 py-2 text-[#fafafa]/70 active:scale-95 border-[#27272a] shadow-sm active:scale-95 cursor-pointer transition-colors duration-100 aria-selected:bg-[#121214]  border-[#27272a] shadow-sm aria-selected:text-[#fafafa]"
              >
                <Radar className="w-4 h-4 text-cyan-400" />
                DASHBOARD // المركز الرئيسي
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo('script-editor')}
                value="scriptEditor create مسودة نبش جديد سكريبت"
                className="flex items-center gap-3 px-3 py-2 text-[#fafafa]/70 active:scale-95 border-[#27272a] shadow-sm active:scale-95 cursor-pointer transition-colors duration-100 aria-selected:bg-[#121214]  border-[#27272a] shadow-sm aria-selected:text-[#fafafa]"
              >
                <FileText className="w-4 h-4 text-[#ef4444]" />
                NEW_DIG // بدء كتابة السيناريو
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo('archive')}
                value="archive خزائن ارشيف مستندات"
                className="flex items-center gap-3 px-3 py-2 text-[#fafafa]/70 active:scale-95 border-[#27272a] shadow-sm active:scale-95 cursor-pointer transition-colors duration-100 aria-selected:bg-[#121214]  border-[#27272a] shadow-sm aria-selected:text-[#fafafa]"
              >
                <Archive className="w-4 h-4 text-[#4f46e5]" />
                VAULTS // المسودات والأرشيف
              </Command.Item>
               <Command.Item
                onSelect={() => navigateTo('trends')}
                value="trends تريند رادار"
                className="flex items-center gap-3 px-3 py-2 text-[#fafafa]/70 active:scale-95 border-[#27272a] shadow-sm active:scale-95 cursor-pointer transition-colors duration-100 aria-selected:bg-[#121214]  border-[#27272a] shadow-sm aria-selected:text-[#fafafa]"
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                RADAR_TRENDS // التريندات
              </Command.Item>
               <Command.Item
                onSelect={() => navigateTo('analytics')}
                value="analytics احصائيات مراقبة النظام"
                className="flex items-center gap-3 px-3 py-2 text-[#fafafa]/70 active:scale-95 border-[#27272a] shadow-sm active:scale-95 cursor-pointer transition-colors duration-100 aria-selected:bg-[#121214]  border-[#27272a] shadow-sm aria-selected:text-[#fafafa]"
              >
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                PERFORMANCE_REPORTS // تقارير الأداء
              </Command.Item>
               <Command.Item
                onSelect={() => navigateTo('graph')}
                value="graph knowledge network خريطة العلاقات عمليات"
                className="flex items-center gap-3 px-3 py-2 text-[#fafafa]/70 active:scale-95 border-[#27272a] shadow-sm active:scale-95 cursor-pointer transition-colors duration-100 aria-selected:bg-[#121214]  border-[#27272a] shadow-sm aria-selected:text-[#fafafa]"
              >
                <Zap className="w-4 h-4 text-[#4f46e5]" />
                ENTITY_RADAR // رادار الكيانات
              </Command.Item>
            </Command.Group>

            <Command.Group heading="أوضاع النظام" className="px-2 py-2 text-[#71717a] text-[10px] font-medium [&_[cmdk-group-heading]]:mb-2 text-right border-t border-[#27272a] mt-2 pt-4">
               <Command.Item
                onSelect={() => { document.documentElement.classList.toggle('zen-mode'); setOpen(false); }}
                value="zen mode تركيز"
                className="flex items-center gap-3 px-3 py-2 text-[#fafafa]/70 active:scale-95 border-[#27272a] shadow-sm active:scale-95 cursor-pointer transition-colors duration-100 aria-selected:bg-[#121214]  border-[#27272a] shadow-sm aria-selected:text-[#fafafa]"
              >
                <div className="w-4 h-4 border border-[#4f46e5]/30"></div>
                TOGGLE_ZEN_MODE // وضع التركيز
              </Command.Item>
              <Command.Item
                onSelect={() => { navigateTo('settings') }}
                value="settings اعدادات"
                className="flex items-center gap-3 px-3 py-2 text-[#fafafa]/70 active:scale-95 border-[#27272a] shadow-sm active:scale-95 cursor-pointer transition-colors duration-100 aria-selected:bg-[#121214]  border-[#27272a] shadow-sm aria-selected:text-[#fafafa]"
              >
                <div className="w-4 h-4 border border-[#4f46e5]/30 flex items-center justify-center"><div className="w-1 h-1 bg-[#121214] "></div></div>
                SYSTEM_CONFIG // تكوين النظام
              </Command.Item>
            </Command.Group>
            
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
