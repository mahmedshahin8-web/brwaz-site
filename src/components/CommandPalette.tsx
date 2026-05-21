import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { FileText, Archive, Radar, Activity, Zap, BarChart2 } from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page } }));
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-gray-50/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl bg-white border border-gray-200 shadow-2xl flex flex-col font-mono text-sm">
        <Command label="Command Menu" className="flex flex-col h-full" onClick={(e) => e.stopPropagation()} filter={(value, search) => {
          if (value.toLowerCase().includes(search.toLowerCase())) return 1;
          return 0;
        }}>
          <div className="flex items-center border-b border-gray-200 px-4">
             <span className="text-cyan-400 font-bold mr-2">{'>'}</span>
             <Command.Input 
               autoFocus 
               value={searchQuery}
               onValueChange={setSearchQuery}
               placeholder="[UNIFIED_INTELLIGENCE] // إبحث في الوثائق، الملفات، الأوامر السريعة، أو اسأل AI..." 
               className="w-full bg-transparent text-gray-900 py-4 focus:outline-none placeholder:text-gray-500 text-[10px] tracking-widest font-mono uppercase"
               dir="rtl"
             />
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto custom-scrollbar p-2" dir="rtl">
            <Command.Empty className="p-8 text-gray-600 text-center flex flex-col items-center gap-3">
               <Zap className="w-6 h-6 text-cyan-400 opacity-50" />
               <span className="uppercase tracking-widest text-[10px]">استخراج الداتا من الفضاء السيبراني...</span>
            </Command.Empty>

            {searchQuery.length > 2 && (
              <Command.Group heading="[AI_SUGGESTIONS] // البحث الذكي" className="px-2 py-2 text-gray-500 text-[10px] uppercase tracking-widest [&_[cmdk-group-heading]]:mb-2 text-right">
                <Command.Item
                  onSelect={() => { /* Mock search action */ setOpen(false); }}
                  value={`بحث عن ${searchQuery}`}
                  className="flex flex-col gap-1 px-3 py-3 text-gray-900/70 hover:bg-white border-gray-100 shadow-sm hover:text-gray-900 cursor-pointer transition-colors duration-100 aria-selected:bg-white border-gray-100 shadow-sm aria-selected:text-gray-900"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>تحليل المراجع الخاصة بـ "{searchQuery}" في الأرشيف...</span>
                  </div>
                  <span className="text-[9px] text-gray-500 mr-7">سيتم فحص 40 وثيقة و 3 كتب في [THE_VAULT]</span>
                </Command.Item>
              </Command.Group>
            )}

            <Command.Group heading="[NAVIGATION] // التنقل السريع" className="px-2 py-2 text-gray-500 text-[10px] uppercase tracking-widest [&_[cmdk-group-heading]]:mb-2 text-right">
              <Command.Item
                onSelect={() => navigateTo('warRoom')}
                value="warRoom dashboard الرئيسية"
                className="flex items-center gap-3 px-3 py-2 text-gray-900/70 hover:bg-white border-gray-100 shadow-sm hover:text-gray-900 cursor-pointer transition-colors duration-100 aria-selected:bg-white border-gray-100 shadow-sm aria-selected:text-gray-900"
              >
                <Radar className="w-4 h-4 text-cyan-400" />
                DASHBOARD // لوحة القيادة
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo('scriptEditor')}
                value="scriptEditor create مسودة نبش جديد سكريبت"
                className="flex items-center gap-3 px-3 py-2 text-gray-900/70 hover:bg-white border-gray-100 shadow-sm hover:text-gray-900 cursor-pointer transition-colors duration-100 aria-selected:bg-white border-gray-100 shadow-sm aria-selected:text-gray-900"
              >
                <FileText className="w-4 h-4 text-[#eb2630]" />
                NEW_DIG // بدء نبش جديد (محرر)
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo('archive')}
                value="archive خزائن ارشيف مستندات"
                className="flex items-center gap-3 px-3 py-2 text-gray-900/70 hover:bg-white border-gray-100 shadow-sm hover:text-gray-900 cursor-pointer transition-colors duration-100 aria-selected:bg-white border-gray-100 shadow-sm aria-selected:text-gray-900"
              >
                <Archive className="w-4 h-4 text-blue-600" />
                VAULTS // بنوك الأرشيف
              </Command.Item>
               <Command.Item
                onSelect={() => navigateTo('trends')}
                value="trends تريند رادار"
                className="flex items-center gap-3 px-3 py-2 text-gray-900/70 hover:bg-white border-gray-100 shadow-sm hover:text-gray-900 cursor-pointer transition-colors duration-100 aria-selected:bg-white border-gray-100 shadow-sm aria-selected:text-gray-900"
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                RADAR_TRENDS // التريندات
              </Command.Item>
               <Command.Item
                onSelect={() => navigateTo('analytics')}
                value="analytics احصائيات مراقبة النظام"
                className="flex items-center gap-3 px-3 py-2 text-gray-900/70 hover:bg-white border-gray-100 shadow-sm hover:text-gray-900 cursor-pointer transition-colors duration-100 aria-selected:bg-white border-gray-100 shadow-sm aria-selected:text-gray-900"
              >
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                SYSTEM_ANALYTICS // مراقبة النظام
              </Command.Item>
               <Command.Item
                onSelect={() => navigateTo('graph')}
                value="graph knowledge network خريطة العلاقات عمليات"
                className="flex items-center gap-3 px-3 py-2 text-gray-900/70 hover:bg-white border-gray-100 shadow-sm hover:text-gray-900 cursor-pointer transition-colors duration-100 aria-selected:bg-white border-gray-100 shadow-sm aria-selected:text-gray-900"
              >
                <Zap className="w-4 h-4 text-blue-600" />
                KNOWLEDGE_GRAPH // الخريطة المعرفية
              </Command.Item>
            </Command.Group>

            <Command.Group heading="[MODES] // أوضاع النظام" className="px-2 py-2 text-gray-500 text-[10px] uppercase tracking-widest [&_[cmdk-group-heading]]:mb-2 text-right border-t border-gray-200 mt-2 pt-4">
               <Command.Item
                onSelect={() => { document.documentElement.classList.toggle('zen-mode'); setOpen(false); }}
                value="zen mode تركيز"
                className="flex items-center gap-3 px-3 py-2 text-gray-900/70 hover:bg-white border-gray-100 shadow-sm hover:text-gray-900 cursor-pointer transition-colors duration-100 aria-selected:bg-white border-gray-100 shadow-sm aria-selected:text-gray-900"
              >
                <div className="w-4 h-4 border border-gray-300"></div>
                TOGGLE_ZEN_MODE // وضع التركيز
              </Command.Item>
              <Command.Item
                onSelect={() => { navigateTo('settings') }}
                value="settings اعدادات"
                className="flex items-center gap-3 px-3 py-2 text-gray-900/70 hover:bg-white border-gray-100 shadow-sm hover:text-gray-900 cursor-pointer transition-colors duration-100 aria-selected:bg-white border-gray-100 shadow-sm aria-selected:text-gray-900"
              >
                <div className="w-4 h-4 border border-gray-300 flex items-center justify-center"><div className="w-1 h-1 bg-white"></div></div>
                SYSTEM_CONFIG // تكوين النظام
              </Command.Item>
            </Command.Group>
            
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
