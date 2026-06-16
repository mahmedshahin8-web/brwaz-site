import React from "react";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { MoodType } from "../../types";
import { MOODS } from "../../config/moods";

interface MoodSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mood: MoodType) => void;
  currentMood: MoodType;
}

export const MoodSelectionModal: React.FC<MoodSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentMood,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-[#27272a]/50/95  overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#27272a]/50 border border-[#27272a] p-8 lg:p-10 shadow-[0_0_100px_rgba(0,0,0,1)] animate-liquid overflow-hidden rounded">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#4f46e5]/20" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#4f46e5]/5 blur-[100px] rounded" />

        <button
          onClick={onClose}
          className="absolute top-10 right-10 text-[#71717a] transition-all duration-300 group active:scale-95"
        >
          <X className="w-10 h-10 transition-transform group-active:scale-95" />
        </button>

        <header className="mb-10 text-center border-b border-[#27272a] pb-8">
          <h2 className="text-2xl font-arabic font-black text-[#fafafa] tracking-tighter mb-2">
            الأسلوب العام للفيديو
          </h2>
          <p className="text-sm font-arabic text-[#a1a1aa]">
            اختر الروح والجو العام الذي ترغب في أن يظهر به الفيديو
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOODS.map((m) => (
            <button
              key={m.type}
              onClick={() => onSelect(m.type as MoodType)}
              className={`text-right p-6 transition-all duration-300 relative group h-full rounded ${
                currentMood === m.type
                  ? "bg-[#4f46e5]/5 border border-[#4f46e5]/40"
                  : "bg-[#27272a]/50/60  border border-[#27272a]"
              }`}
            >
              <div className="flex items-center justify-end gap-4 mb-8">
                {currentMood === m.type && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs font-arabic text-[#4f46e5] font-bold"
                  >
                    محدد حالياً
                  </motion.span>
                )}
                <div
                  className={`w-14 h-14 flex items-center justify-center border rounded ${currentMood === m.type ? "border-[#4f46e5]/40 bg-[#4f46e5]/10" : "border-[#27272a] bg-[#27272a]/50"}`}
                >
                  <m.icon
                    className={`w-7 h-7 ${currentMood === m.type ? "text-[#4f46e5]" : "text-[#71717a]"}`}
                  />
                </div>
              </div>
              <h4
                className={`text-xl font-arabic font-black mb-4 ${currentMood === m.type ? "text-[#4f46e5]" : "text-[#fafafa]"}`}
              >
                {m.type}
              </h4>
              <p className="text-sm text-[#a1a1aa] leading-relaxed font-arabic opacity-80">
                {m.description}
              </p>

              {currentMood === m.type && (
                <div className="absolute bottom-0 right-0 w-16 h-1 bg-[#4f46e5] shadow-[0_0_15px_rgba(240,199,34,0.4)]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
