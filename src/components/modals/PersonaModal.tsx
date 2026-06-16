import React from "react";
import { X, Mic, Eye, Video, Headphones } from "lucide-react";
import { PersonaType } from "../../types";

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (persona: PersonaType) => void;
  currentPersona: PersonaType;
}

export const PersonaModal: React.FC<PersonaModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentPersona,
}) => {
  if (!isOpen) return null;

  const personas: { type: PersonaType; icon: any; title: string; description: string }[] = [
    {
      type: "النبّاش",
      icon: Mic,
      title: "النبّاش (مقدم استقصائي)",
      description:
        "يتميز بصوت رخيم، ونبرة مثيرة للاهتمام. محقق يبحث عن الحقيقة في أعماق الأرشيف.",
    },
    {
      type: "برواز التكنو",
      icon: Eye,
      title: "محلل التكنولوجيا",
      description: "محلل مستقبلي يحذر من الوجه المظلم للتقنية بأسلوب رصين.",
    },
    {
      type: "برواز الحكاوي",
      icon: Headphones,
      title: "الحكواتي (الراوي الحميمي)",
      description:
        "يأخذ المشاهد في رحلة مليئة بالنوستالجيا وسرد شعبي كلاسيكي.",
    },
    {
      type: "شاهد على العصر",
      icon: Video,
      title: "شاهد على العصر",
      description:
        "يعتمد على الوثائق والأرشيف واقتباسات الشهود لسرد سيرة ومسيرة الشخصيات.",
    },
    {
      type: "الشاهد الصامت",
      icon: Eye,
      title: "الشاهد الصامت",
      description:
        "سرد من منظور غير اعتيادي (تقمص روح كائن أو جماد حضر الواقعة).",
    },
  ];

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-[#27272a]/50/95  overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#27272a]/50 border border-[#27272a] p-8 lg:p-10 shadow-[0_0_100px_rgba(0,0,0,1)] animate-liquid overflow-hidden rounded">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#4f46e5]/20" />
        <button
          onClick={onClose}
          className="absolute top-10 right-10 text-[#71717a] transition-all duration-300 group active:scale-95"
        >
          <X className="w-10 h-10 transition-transform group-active:scale-95" />
        </button>
        <header className="mb-10 text-center border-b border-[#27272a] pb-8">
          <h2 className="text-2xl font-arabic font-black text-[#fafafa] tracking-tighter mb-2">
            اختيار الراوي
          </h2>
          <p className="text-sm font-arabic text-[#a1a1aa]">
            حدد الشخصية المناسبة لتقديم وسرد هذا الفيديو
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {personas.map((p) => (
            <button
              key={p.type}
              onClick={() => onSelect(p.type)}
              className={`text-right p-6 transition-all duration-300 relative group h-full rounded ${
                currentPersona === p.type
                  ? "bg-[#4f46e5]/5 border border-[#4f46e5]/40"
                  : "bg-[#27272a]/50/60  border border-[#27272a]"
              }`}
            >
              <div className="flex items-center justify-end gap-4 mb-8">
                <div
                  className={`w-14 h-14 flex items-center justify-center border rounded ${currentPersona === p.type ? "border-[#4f46e5]/40 bg-[#4f46e5]/10" : "border-[#27272a] bg-[#27272a]/50"}`}
                >
                  <p.icon
                    className={`w-7 h-7 ${currentPersona === p.type ? "text-[#4f46e5]" : "text-[#71717a]"}`}
                  />
                </div>
              </div>
              <h4
                className={`text-xl font-arabic font-black mb-4 ${currentPersona === p.type ? "text-[#4f46e5]" : "text-[#fafafa]"}`}
              >
                {p.title}
              </h4>
              <p className="text-sm text-[#a1a1aa] leading-relaxed font-arabic opacity-80">
                {p.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
