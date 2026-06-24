import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Zap, BookOpen, Settings, LayoutDashboard, Compass, Cpu } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 15 } 
    }
  };

  const cards = [
    {
      id: "content",
      title: "غرفة الكتابة",
      subtitle: "المعمل السري لطبخ الحلقات وتفصيل الاسكربتات",
      icon: <Zap className="w-8 h-8 md:w-12 md:h-12" />,
      color: "from-blue-600 to-indigo-600",
      path: "/content"
    },
    {
      id: "graph",
      title: "لوحة التحقيقات",
      subtitle: "ربط خيوط القصة ببعضها زي المحققين زمان",
      icon: <LayoutDashboard className="w-8 h-8 md:w-12 md:h-12" />,
      color: "from-emerald-500 to-teal-600",
      path: "/graph"
    },
    {
      id: "settings",
      title: "مركز القيادة",
      subtitle: "شوية إعدادات تقنية معقدة لمكنة الإنتاج",
      icon: <Cpu className="w-8 h-8 md:w-12 md:h-12" />,
      color: "from-purple-500 to-violet-700",
      path: "/settings"
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center relative overflow-hidden selection:bg-[#4f46e5]/30">
      {/* Background Ambient Effects */}
      <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[25vw] h-[25vw] bg-violet-600/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none mask-image-radial z-0"></div>

      <motion.div 
        className="relative z-10 w-full max-w-6xl px-6 flex flex-col items-center pt-10 pb-20"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="text-center mb-16 relative">
          <motion.div
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 1.5, ease: "easeOut" }}
             className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 blur-3xl rounded-full"
          />
          <div className="inline-flex items-center justify-center space-x-2 bg-[#27272a]/40 border border-white/10 rounded-full px-5 py-2 mb-8 backdrop-blur-md flex-row-reverse">
             <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
             </span>
             <span className="text-xs font-mono tracking-widest uppercase text-indigo-300 font-bold ml-2">Barwaz Studio System Online</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-arabic font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 leading-tight drop-shadow-sm mb-6 pb-2 text-center">
            ماكينة الدحيح 
          </h1>
          <p className="text-lg md:text-xl text-[#a1a1aa] font-arabic max-w-2xl mx-auto leading-relaxed">
            يا عزيزي المشاهد، أهلاً بيك في المطبخ السري اللي بتنطبخ فيه أعظم القصص. جهز كوباية الشاي بتاعتك ويلا بينا!
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl"
          variants={containerVariants}
        >
          {cards.map((card) => (
            <motion.div 
              key={card.id}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(card.path)}
              className="relative group cursor-pointer"
            >
              {/* Animated Glow Border */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${card.color} rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-500`}></div>
              
              <div className="relative h-full bg-[#121214] border border-[#27272a] group-hover:border-white/10 rounded-2xl p-8 flex flex-col items-end text-right transition-all duration-300 overflow-hidden">
                {/* Decorative Background Icon */}
                <div className="absolute -top-10 -left-10 text-white/5 transform -rotate-12 scale-150 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-[1.6]">
                  {card.icon}
                </div>

                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${card.color} p-0.5 mb-8 shadow-lg`}>
                  <div className="w-full h-full bg-[#121214] rounded-[10px] flex items-center justify-center text-white">
                    {card.icon}
                  </div>
                </div>

                <h2 className="text-2xl font-arabic font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-l group-hover:from-white group-hover:to-gray-400 transition-colors">
                  {card.title}
                </h2>
                <p className="text-[#a1a1aa] font-arabic leading-relaxed text-sm">
                  {card.subtitle}
                </p>

                <div className="mt-8 flex items-center text-xs font-mono tracking-widest uppercase text-[#71717a] group-hover:text-white/80 transition-colors font-bold w-full justify-between flex-row-reverse">
                   <span>Launch Module</span>
                   <motion.div 
                     initial={{ x: 0, opacity: 0 }}
                     whileInView={{ opacity: 1 }}
                     className="w-4 h-4"
                   >
                     →
                   </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Footer info */}
        <motion.div variants={itemVariants} className="mt-24 text-center">
            <p className="text-xs font-mono text-[#71717a] uppercase tracking-[0.2em]">Engineered for Next-Gen Storytelling</p>
            <div className="w-12 h-1 bg-gradient-to-r from-transparent via-[#4f46e5]/50 to-transparent mx-auto mt-4 rounded-full"></div>
        </motion.div>

      </motion.div>

      <style>{`
        .mask-image-radial {
          mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
        }
      `}</style>
    </div>
  );
}
