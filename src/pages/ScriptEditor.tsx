import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { notify } from '../lib/notify';
import { Film, Bold, Italic, List, Type, Save, Play, Plus, Trash2, Copy, MonitorPlay, Clock, Maximize, Columns, Mic, Download, MessageSquare, Link2, Map, ShieldCheck, ShieldAlert, Sparkles, Youtube, CheckCircle, Activity, HeartCrack, QrCode, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor, { useMonaco } from '@monaco-editor/react';
import { InterrogationRoom } from '../components/InterrogationRoom';
import { RedStringBoard } from '../components/RedStringBoard';
import { TacticalRadar } from '../components/TacticalRadar';
import { BlackPortal } from '../components/BlackPortal';

interface Scene {
  id: string;
  text: string;
  duration: number;
  audioBlob?: Blob;
  visualPrompt?: string;
  sources?: string[];
  sensitive_entities?: string[];
  factCheckStatus?: 'VERIFIED' | 'DISPUTED' | 'PENDING';
  factCheckIssues?: string[];
}


export const ScriptEditor: React.FC = () => {
  const [scenes, setScenes] = useState<Scene[]>(() => {
    const saved = localStorage.getItem('barwaz_script_data');
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    localStorage.setItem('barwaz_script_data', JSON.stringify(scenes));
  }, [scenes]);

  const [recordings, setRecordings] = useState<Record<string, Blob>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Teleprompter and other states...
  const [isSplitScreen, setIsSplitScreen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'traceability' | 'interrogation' | 'redString' | 'radar' | 'portal' | 'director'>('traceability');

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('toggle-zen-mode', { detail: { zenMode: isFocusMode } }));
  }, [isFocusMode]);
  const [isTeleprompterMode, setIsTeleprompterMode] = useState(false);
  const [dnaPersona, setDnaPersona] = useState('CAIRO_SLANG');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow Alt+1, Alt+2, Alt+3 to switch Personas
      if (e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          setDnaPersona('CAIRO_SLANG');
          notify.topSecret('DNA SWITCHED: CAIRO_SLANG');
        } else if (e.key === '2') {
          e.preventDefault();
          setDnaPersona('DOCU_CLASSIC');
          notify.topSecret('DNA SWITCHED: DOCU_CLASSIC');
        } else if (e.key === '3') {
          e.preventDefault();
          setDnaPersona('DARK_NOIR');
          notify.topSecret('DNA SWITCHED: DARK_NOIR');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [isHeatmapEnabled, setIsHeatmapEnabled] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(2);
  const [evidenceBlocks, setEvidenceBlocks] = useState<any[]>([]);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [cognitiveLoadColor, setCognitiveLoadColor] = useState('text-gray-900');
  const teleprompterRef = useRef<HTMLDivElement>(null);
  const monaco = useMonaco();

  useEffect(() => {
    if (isSplitScreen && scenes.length > 0) {
      const fetchContext = async () => {
        setIsRetrieving(true);
        try {
          const req = await fetch("/api/rag/retrieve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: scenes[scenes.length - 1].text, requiredAgent: null })
          });
          const res = await req.json();
          setEvidenceBlocks(res.evidence || []);
        } catch (e) {
          console.error("Retrieval failed", e);
        } finally {
          setIsRetrieving(false);
        }
      };
      const timeout = setTimeout(fetchContext, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isSplitScreen, scenes]);

  useEffect(() => {
    if (monaco) {
      monaco.languages.register({ id: 'barwaz-script' });
      monaco.languages.setMonarchTokensProvider('barwaz-script', {
        tokenizer: {
          root: [
            [/\[CAM.*?\]/, 'custom-cam'],
            [/\[LIT.*?\]/, 'custom-lit'],
            [/\[MUSIC.*?\]/, 'custom-music'],
            [/\[EVIDENCE.*?\]/, 'custom-evidence'],
            [/\[.*?\]/, 'custom-bracket']
          ]
        }
      });

      monaco.editor.defineTheme('barwaz-theme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'custom-cam', foreground: '22d3ee', fontStyle: 'bold' },
          { token: 'custom-lit', foreground: '3B82F6', fontStyle: 'bold' },
          { token: 'custom-music', foreground: 'eb2630', fontStyle: 'bold' },
          { token: 'custom-evidence', foreground: '3B82F6', fontStyle: 'bold' },
          { token: 'custom-bracket', foreground: '888888', fontStyle: 'italic' },
        ],
        colors: {
          'editor.background': '#ffffff',
          'editor.lineHighlightBackground': '#ffffff05',
          'editorLineNumber.foreground': '#333333',
          'editor.selectionBackground': '#22d3ee30',
        }
      });
    }
  }, [monaco]);

  // Recording Logic
  const startRecording = async (sceneId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordings(prev => ({ ...prev, [sceneId]: audioBlob }));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setActiveRecordingId(sceneId);
    } catch (err) {
      console.error("Recording failed:", err);
      alert("فشل الوصول إلى الميكروفون.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setActiveRecordingId(null);
    }
  };

  const handleAudioStitch = async () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const buffers: AudioBuffer[] = [];

    // Filter scenes that have recordings
    const sceneIdsWithAudio = scenes.filter(s => recordings[s.id]).map(s => s.id);
    
    if (sceneIdsWithAudio.length === 0) {
      alert("لا توجد مقاطع مسجلة ليتم دمجها.");
      return;
    }

    try {
      for (const id of sceneIdsWithAudio) {
        const blob = recordings[id];
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        buffers.push(audioBuffer);
      }

      // Calculate total duration
      const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
      const outputBuffer = audioContext.createBuffer(
        buffers[0].numberOfChannels,
        totalLength,
        buffers[0].sampleRate
      );

      // Copy each buffer to the output buffer
      let offset = 0;
      for (const buf of buffers) {
        for (let channel = 0; channel < buf.numberOfChannels; channel++) {
          outputBuffer.getChannelData(channel).set(buf.getChannelData(channel), offset);
        }
        offset += buf.length;
      }

      // Play the stitched audio
      const source = audioContext.createBufferSource();
      source.buffer = outputBuffer;
      source.connect(audioContext.destination);
      source.start();
      notify.topSecret("جاري تشغيل البروفة المدمجة...");
    } catch (err) {
      console.error("Stitching failed:", err);
      notify.breach("فشل دمج الملفات الصوتية.");
    }
  };

  const handleCommit = async () => {
    try {
      const payload = {
        id: `doc_${Date.now()}`,
        title: scenes[0]?.text.substring(0, 30) || "Dossier_Unnamed",
        content: {
          video_title: scenes[0]?.text.substring(0, 30) || "Dossier_Unnamed",
          scenes: scenes,
          createdAt: new Date().toISOString()
        }
      };
      
      const res = await fetch("/api/dossiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        notify.classified("SAVE_SUCCESS");
      } else {
        notify.breach("حدث خطأ أثناء الحفظ.");
      }
    } catch (e) {
      console.error(e);
      notify.breach("Generic Error: في تشويش على الإشارة.. المحرك محتاج إيقاظ.");
    }
  };

  // Teleprompter Auto-scroll logic
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const scrollStep = (currentTime: number) => {
      if (isTeleprompterMode && teleprompterRef.current) {
        const deltaTime = currentTime - lastTime;
        if (deltaTime > 16) {
           teleprompterRef.current.scrollTop += (teleprompterSpeed * 0.5);
           lastTime = currentTime;
        }
      }
      animationFrameId = requestAnimationFrame(scrollStep);
    };

    if (isTeleprompterMode) {
      animationFrameId = requestAnimationFrame(scrollStep);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isTeleprompterMode, teleprompterSpeed]);

  const addScene = () => {
    setScenes([...scenes, { id: `scene-${Date.now()}`, text: '', duration: 5 }]);
  };

  const removeScene = (id: string) => {
    setScenes(scenes.filter(s => s.id !== id));
  };

  const duplicateScene = (id: string) => {
    const sceneToCopy = scenes.find(s => s.id === id);
    if (sceneToCopy) {
      setScenes([...scenes, { ...sceneToCopy, id: `scene-${Date.now()}` }]);
    }
  };

  const updateSceneText = (id: string, text: string) => {
    setScenes(scenes.map(s => s.id === id ? { ...s, text } : s));
  };

  const getWordCount = () => {
    const fullText = scenes.map(s => s.text).join(' ');
    // Basic word count (split by spaces)
    const words = fullText.trim().split(/\s+/).filter(w => w.length > 0);
    return words.length;
  };

  useEffect(() => {
    // Cognitive Load Color Logic
    const words = getWordCount();
    if (words > 1000) setCognitiveLoadColor('text-[#eb2630]');
    else if (words > 500) setCognitiveLoadColor('text-blue-600');
    else setCognitiveLoadColor('text-gray-900');
  }, [scenes]);

  const renderHighlightedText = (text: string) => {
    if (!text) return null;
    
    // Split by words to apply basic text highlighting as a demo for Evidence Heatmap
    // Gold: Strong evidence (وثيقة, أرشيف, مصدر, مذكرات, رسمي, تقرير)
    // Red: Deduction/Analysis (استنتاج, تحليل, أعتقد, ربما, يبدو, نظرياً)
    const goldKeywords = ['وثيقة', 'أرشيف', 'مصدر', 'مذكرات', 'رسمي', 'تقرير', 'شهادة', 'مؤكد', 'دليل'];
    const redKeywords = ['استنتاج', 'تحليل', 'أعتقد', 'ربما', 'يبدو', 'نظرياً', 'تفسير', 'احتمال'];

    return text.split(' ').map((word, i) => {
      const cleanWord = word.replace(/[.,:;()]/g, '');
      let highlightClass = "";
      if (goldKeywords.some(kw => cleanWord.includes(kw))) {
        highlightClass = "bg-blue-600/30 shadow-[0_0_8px_rgba(240,199,34,0.4)] text-transparent rounded-sm px-1 mx-[1px]";
      } else if (redKeywords.some(kw => cleanWord.includes(kw))) {
        highlightClass = "bg-accent-danger/30 shadow-[0_0_8px_rgba(255,50,50,0.4)] text-transparent rounded-sm px-1 mx-[1px]";
      } else {
        highlightClass = "text-transparent";
      }
      return (
        <span key={i} className={highlightClass}>
          {word}{" "}
        </span>
      );
    });
  };

  const getEstimatedTime = () => {
    const words = getWordCount();
    const minutes = Math.ceil(words / 130);
    return minutes;
  };

  const handleExportTTS = () => {
    const fullText = scenes.map(s => s.text).join(' \n\n ');
    // Basic TTS clean-up algorithm
    let ttsText = fullText
      .replace(/&/g, ' و ')
      .replace(/%/g, ' بالمائة ')
      .replace(/1/g, 'واحد')
      .replace(/2/g, 'اثنين')
      .replace(/3/g, 'ثلاثة')
      // This is a dummy phonetic replacement just to show the feature logic
      .replace(/\s+/g, ' ');

    const blob = new Blob([ttsText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Barwaz_TTS_Prep.txt';
    link.click();
  };

  const handleExportSources = () => {
    const allSources = scenes.flatMap(s => s.sources || []);
    if (allSources.length === 0) {
      notify.breach("لا توجد مصادر لنسخها.");
      return;
    }
    const uniqueSources = Array.from(new Set(allSources));
    const textToCopy = "المصادر والمراجع:\n" + uniqueSources.map(s => `- ${s}`).join('\n');
    navigator.clipboard.writeText(textToCopy);
    notify.classified("COPY_SOURCES");
  };

  const handleFactCheck = async (sceneId: string) => {
    const sIdx = scenes.findIndex(s => s.id === sceneId);
    if (sIdx === -1) return;
    const sceneToVerify = scenes[sIdx];
    
    // Update status to pending
    const tempScenes = [...scenes];
    tempScenes[sIdx] = { ...tempScenes[sIdx], factCheckStatus: 'PENDING' };
    setScenes(tempScenes);

    notify.topSecret("FACT_CHECK_START");

    try {
      const res = await fetch('/api/intel/factcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: sceneToVerify.text, 
          context: tempScenes.map(t => t.text).join(" ") // send whole doc as context
        })
      });
      const data = await res.json();
      
      if (data.success && data.result) {
        const result = data.result;
        setScenes(prev => {
          const arr = [...prev];
          const idx = arr.findIndex(s => s.id === sceneId);
          if (idx !== -1) {
            arr[idx] = {
              ...arr[idx],
              factCheckStatus: result.status,
              factCheckIssues: result.issues || [],
              sources: Array.from(new Set([...(arr[idx].sources || []), ...(result.sources || [])]))
            };
          }
          return arr;
        });

        if (result.status === 'VERIFIED') {
          notify.classified("FACT_CHECK_SUCCESS");
        } else {
          notify.breach("FACT_CHECK_DISPUTED");
        }
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      console.error(e);
      notify.breach("فشلت عملية المراجعة.");
      setScenes(prev => {
        const arr = [...prev];
        const idx = arr.findIndex(s => s.id === sceneId);
        if (idx !== -1) {
          arr[idx] = { ...arr[idx], factCheckStatus: undefined };
        }
        return arr;
      });
    }
  };

  if (isTeleprompterMode) {
    return (
      <div className="fixed inset-0 bg-white text-gray-900 z-[9999] flex flex-col font-['JetBrains_Mono'] " dir="rtl">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white/50 backdrop-blur-md absolute top-0 left-0 right-0 z-50">
           <div className="flex items-center gap-4">
              <span className="text-xl text-accent-danger font-bold uppercase tracking-widest">وضع الملقن (Teleprompter)</span>
              <div className="flex items-center gap-2 bg-white border-gray-100 shadow-sm px-4 py-1 rounded border border-gray-200">
                 <span className="text-xs text-text-muted uppercase">سرعة التمرير:</span>
                 <input type="range" min="1" max="5" value={teleprompterSpeed} onChange={e => setTeleprompterSpeed(Number(e.target.value))} className="w-24 accent-accent-danger" />
              </div>
              <button 
                onClick={handleAudioStitch}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-900/40 text-cyan-400 border border-cyan-500/30 active:bg-cyan-900/60 transition-all text-xs font-bold uppercase"
              >
                <Play className="w-3 h-3" /> دمج البروفات [STITCH]
              </button>
           </div>
           <button onClick={() => setIsTeleprompterMode(false)} className="px-4 py-2 bg-gray-100 active:bg-gray-100 border border-gray-300 transition-colors uppercase text-sm font-bold">
             إغلاق
           </button>
        </div>
        <div 
          ref={teleprompterRef}
          className="flex-1 overflow-y-auto pt-32 pb-64 px-10 md:px-32 lg:px-64 scroll-smooth hide-scrollbar"
        >
           <div className="max-w-4xl mx-auto space-y-24">
             {scenes.map((scene, i) => (
                <div key={scene.id} className="relative group/tele">
                   <div className="text-5xl leading-[1.8] font-bold text-center text-gray-900/90">
                      {scene.text.split(/(\[.*?\])/).map((part, index) => {
                        if (part.startsWith('[') && part.endsWith(']')) {
                          return (
                            <span 
                              key={index} 
                              className="text-lg font-mono text-orange-400/60 block mb-4 tracking-normal"
                            >
                              {part}
                            </span>
                          );
                        }
                        return part;
                      })}
                   </div>
                   <div className="flex justify-center mt-8">
                     <button 
                       onMouseDown={() => startRecording(scene.id)}
                       onMouseUp={stopRecording}
                       onMouseLeave={stopRecording}
                       className={`px-8 py-4 flex items-center gap-4 border-2 transition-all ${
                         activeRecordingId === scene.id 
                           ? 'bg-accent-danger border-accent-danger text-gray-900 animate-pulse' 
                           : recordings[scene.id]
                             ? 'bg-green-600/20 border-green-600/40 text-green-500'
                             : 'bg-white border-gray-100 shadow-sm border-gray-200 text-gray-600 group-hover/tele:border-accent-danger/40'
                       }`}
                     >
                       <Mic className={`w-5 h-5 ${activeRecordingId === scene.id ? 'animate-bounce' : ''}`} />
                       <span className="text-sm font-bold tracking-[0.2em] uppercase">
                         {activeRecordingId === scene.id ? "جاري التسجيل..." : recordings[scene.id] ? "[RECORDED_VO]" : "[RECORD_VO]"}
                       </span>
                     </button>
                   </div>
                </div>
             ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 text-gray-900 ${isFocusMode ? 'p-0' : 'p-6'}`} dir="rtl">
      
      {/* Header - Hides in Focus Mode */}
      {!isFocusMode && (
         <header className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
           <div>
             <h1 className="text-xl font-bold flex items-center gap-2 font-mono uppercase tracking-widest">
               <span className="text-cyan-400"><MonitorPlay className="w-5 h-5" /></span>
               [SCRIPT_EDITOR] // محرر السكريبتات
             </h1>
             <p className="text-gray-600 text-[10px] mt-1 tracking-widest font-mono uppercase">
               RESTRICTED // LEVEL 4 CLEARANCE
             </p>
           </div>
           
           <div className="flex gap-4">
             {/* Style DNA Selector */}
             <div className="flex items-center gap-2 px-4 py-2 hover:bg-white border-gray-100 shadow-sm border border-gray-200 text-xs relative group cursor-pointer z-50 transition-colors duration-100">
               <Type className="w-3 h-3 text-blue-600" />
               <span className="text-blue-600 font-mono tracking-widest uppercase">DNA: {dnaPersona}</span>
               <div className="absolute top-full mt-0 right-0 w-56 bg-white border border-gray-200 hidden group-hover:block border-t-0">
                 <div className="p-3 text-[10px] text-gray-600 border-b border-gray-200 font-mono tracking-widest uppercase">Voice Vault</div>
                 <div className="p-3 bg-white border-gray-100 shadow-sm text-[10px] uppercase font-mono text-gray-900 border-r-2 border-blue-500">CAIRO_SLANG (DEFAULT)</div>
                 <div className="p-3 hover:bg-white border-gray-100 shadow-sm text-[10px] uppercase font-mono text-gray-600 transition-colors duration-100">DOCU_CLASSIC</div>
                 <div className="p-3 hover:bg-white border-gray-100 shadow-sm text-[10px] uppercase font-mono text-gray-600 transition-colors duration-100">DARK_NOIR</div>
               </div>
             </div>

             <button onClick={() => setIsSplitScreen(!isSplitScreen)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-colors duration-100 text-[10px] uppercase font-mono tracking-widest">
               <Columns className="w-3 h-3 text-cyan-400" />
               SPLIT_VIEW
             </button>
             <button onClick={() => setIsFocusMode(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-[#eb2630]/50 hover:bg-[#eb2630]/10 transition-colors duration-100 text-[10px] uppercase font-mono tracking-widest">
               <Maximize className="w-3 h-3 text-[#eb2630]" />
               ZEN_MODE
             </button>
             <button onClick={() => setIsTeleprompterMode(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-blue-500/50 hover:bg-blue-600/10 transition-colors duration-100 text-[10px] uppercase font-mono tracking-widest">
               <Mic className="w-3 h-3 text-blue-600" />
               PROMPTER
             </button>
           </div>
         </header>
      )}

      {/* Main Layout */}
      <div className={`mx-auto flex gap-6 transition-none ${isSplitScreen && !isFocusMode ? 'max-w-[95%] items-start' : 'max-w-4xl'}`}>
         
         {/* Editor Main Column */}
         <div className={`flex-1 space-y-6 ${isFocusMode ? 'mt-12 max-w-3xl mx-auto' : ''}`}>
            
            {/* Context/Stats Bar */}
            <div className="flex justify-between items-center bg-white border border-gray-200 p-4">
               <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                     <span className="text-[10px] text-gray-600 uppercase font-mono tracking-widest">EST_TIME</span>
                     <span className={`font-mono font-bold text-sm flex items-center gap-1 ${cognitiveLoadColor}`}><Clock className="w-3 h-3"/> {getEstimatedTime()} MIN</span>
                  </div>
                  <div className="w-px h-6 bg-gray-100"></div>
                  <div className="flex flex-col">
                     <span className="text-[10px] text-gray-600 uppercase font-mono tracking-widest">TOKENS // COGN_LOAD</span>
                     <span className={`font-mono font-bold text-sm ${cognitiveLoadColor}`}>{getWordCount() * 1.5} (EST)</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  {isFocusMode && (
                     <button onClick={() => setIsFocusMode(false)} className="px-4 py-2 hover:bg-gray-100 text-gray-900 border border-gray-200 transition-colors duration-100 text-[10px] uppercase font-mono mr-4 tracking-widest border-l-2 border-l-[#eb2630]">
                        EXIT_ZEN
                     </button>
                  )}
                  <button onClick={() => setIsHeatmapEnabled(!isHeatmapEnabled)} className={`flex items-center gap-2 px-4 py-2 border transition-colors duration-100 text-[10px] uppercase font-mono tracking-widest mr-4 ${isHeatmapEnabled ? 'bg-blue-600/10 border-blue-500/50 text-blue-600' : 'bg-white border-gray-200 text-gray-900/70 hover:bg-white border-gray-100 shadow-sm'}`}>
                     <List className="w-3 h-3" />
                     {isHeatmapEnabled ? 'HIDE_EVIDENCE' : 'SHOW_EVIDENCE'}
                  </button>
                  <button 
                     onClick={async () => {
                        const topic = prompt("أدخل موضوع التحقيق (Topic):", "لغز اختفاء وثيقة مايو 1999");
                        if (!topic) return;
                        setIsRetrieving(true);
                        notify.topSecret("SCRIPT_GENERATING");
                        try {
                           const res = await fetch("/api/drafts/generate", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ topic, context: scenes.map(s => s.text).join(" ") })
                           });
                           const data = await res.json();
                           if (data.success && data.scenes) {
                              const newScenes = data.scenes.map((s: any, i: number) => ({
                                 id: `draft_${Date.now()}_${i}`,
                                 text: s.text,
                                 duration: Math.ceil(s.text.split(' ').length / 130 * 60) * 1000,
                                 visualPrompt: s.bRoll + (s.sources?.length ? ` | المصادر: ${s.sources.join(" - ")}` : ''),
                                 sources: s.sources || [],
                                 sensitive_entities: s.sensitive_entities || [],
                                 factCheckStatus: 'PENDING'
                              }));
                              setScenes(newScenes);
                              notify.classified("SCRIPT_SUCCESS");
                           } else {
                              throw new Error(data.error || "Unknown error");
                           }
                        } catch(e) {
                           console.error(e);
                           notify.breach("فشل في توليد السيناريو. تأكد من إعدادات API.");
                        } finally {
                           setIsRetrieving(false);
                        }
                     }} 
                     className="flex items-center gap-2 px-6 py-2 bg-white border border-[#eb2630]/50 hover:bg-[#eb2630]/10 text-gray-900 transition-colors duration-100 text-[10px] font-mono tracking-widest uppercase mr-4"
                  >
                     <Plus className="w-3 h-3 text-[#eb2630]" />
                     MAGIC_DRAFT
                  </button>
                  <button onClick={handleCommit} className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-gray-900 transition-colors duration-100 text-[10px] font-mono tracking-widest uppercase mr-4">
                     <Save className="w-3 h-3 text-cyan-400" />
                     COMMIT
                  </button>
                  <button onClick={handleExportSources} className="flex items-center gap-2 px-6 py-2 bg-white border border-blue-500/50 hover:bg-blue-600/10 text-blue-600 transition-colors duration-100 text-[10px] font-mono tracking-widest uppercase">
                     <Link2 className="w-3 h-3 text-[3B82F6]" />
                     SOURCES
                  </button>
               </div>
            </div>

            {/* Script Area */}
            <div className="space-y-4">
               <AnimatePresence>
                 {scenes.map((scene, index) => (
                   <motion.div 
                     key={scene.id}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 0.1 }}
                     className="bg-white border border-gray-200 focus-within:border-cyan-400/50 transition-colors duration-100"
                   >
                     <div className="p-6">
                        {/* Scene Meta */}
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-4">
                            <span className="text-cyan-400 font-mono font-bold text-[10px] tracking-widest uppercase bg-cyan-500/10 px-2 py-1 border border-cyan-500/30">
                              BLOCK_{String(index + 1).padStart(2, '0')}
                            </span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                                onClick={async () => {
                                    setIsRetrieving(true); // Re-use loading UI
                                    const textContent = scene.text;
                                    notify.systemVoice("VOICE_GENERATING");
                                    try {
                                        const req = await fetch('/api/voice/generate', {
                                            method: 'POST',
                                            headers: {'Content-Type': 'application/json'},
                                            body: JSON.stringify({ text: textContent, referenceVoice: 'EGYPTIAN_INVESTIGATOR_01' })
                                        });
                                        const res = await req.json();
                                        if (res.success) {
                                            // Handle Cyber-Thriller UI Logs
                                            const formatLogs = res.logs.map((l: string) => {
                                              let type = 'SYS_MSG';
                                              if (l.includes('VRAM_MGR')) type = 'VRAM_MGR';
                                              if (l.includes('NLP_ENGINE')) type = 'NLP_ENGINE';
                                              if (l.includes('TTS_ENGINE')) type = 'TTS_ENGINE';
                                              return { sourceAgent: type, content: l };
                                            });
                                            setEvidenceBlocks(prev => [...formatLogs, ...prev]);
                                            
                                            // Process base64 Audio
                                            if (res.audioBase64) {
                                              const byteCharacters = atob(res.audioBase64);
                                              const byteNumbers = new Array(byteCharacters.length);
                                              for (let i = 0; i < byteCharacters.length; i++) {
                                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                                              }
                                              const byteArray = new Uint8Array(byteNumbers);
                                              const audioBlob = new Blob([byteArray], { type: res.mimeType || 'audio/mpeg' });
                                              setRecordings(prev => ({ ...prev, [scene.id]: audioBlob }));
                                              notify.classified("VOICE_SUCCESS");
                                            }
                                        } else {
                                           throw new Error("Voice generation failed on server");
                                        }
                                    } catch (e) {
                                        console.error(e);
                                        notify.breach("فشل توليد الصوت.");
                                    } finally {
                                        setIsRetrieving(false);
                                    }
                                }} 
                                className="p-2 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 text-gray-600 hover:text-cyan-400 transition-colors duration-100 flex items-center gap-1 text-[9px] font-mono tracking-widest uppercase" 
                                title="Synthesize Voice"
                            >
                              <Mic className="w-3 h-3" />
                              GEN_VOICE
                            </button>
                            <button onClick={() => duplicateScene(scene.id)} className="p-2 hover:bg-white border-gray-100 shadow-sm border border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900 transition-colors duration-100" title="DUPLICATE">
                              <Copy className="w-3 h-3" />
                            </button>
                            <button 
                                onClick={async () => {
                                  if (scene.factCheckStatus === 'VERIFIED') return;
                                  await handleFactCheck(scene.id);
                                }} 
                                disabled={scene.factCheckStatus === 'PENDING'}
                                className={`p-2 border border-transparent transition-all duration-300 flex items-center gap-1 text-[9px] font-mono tracking-widest uppercase ${
                                  scene.factCheckStatus === 'VERIFIED' 
                                  ? 'text-green-400 bg-green-500/10 border-green-500/30 cursor-default' 
                                  : scene.factCheckStatus === 'DISPUTED'
                                  ? 'text-accent-danger bg-accent-danger/10 border-accent-danger/30 hover:bg-accent-danger/20'
                                  : (scene.text.match(/\d{4}|(نسبة|عام|تاريخ|عدد|دولار|شهادة|رسمي)/) || scene.sensitive_entities?.length)
                                    ? 'text-blue-600 bg-blue-600/10 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)] animate-pulse hover:bg-blue-600/20 hover:scale-105'
                                    : 'text-blue-600/60 hover:text-blue-600 hover:bg-blue-600/10 hover:border-blue-500/30'
                                }`} 
                                title={scene.factCheckStatus === 'VERIFIED' ? "VERIFIED" : "VERIFY EVIDENCE"}
                            >
                              {scene.factCheckStatus === 'VERIFIED' ? <CheckCircle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                              {scene.text.match(/\d{4}|(نسبة|عام|تاريخ|عدد|دولار)/) && !scene.factCheckStatus ? 'VERIFY_DATA' : 'FACT_CHECK'}
                            </button>
                            <button onClick={() => removeScene(scene.id)} className="p-2 hover:bg-[#eb2630]/10 border border-transparent hover:border-[#eb2630]/30 text-gray-600 hover:text-[#eb2630] transition-colors duration-100" title="DELETE">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Bullshit Detector Highlights */}
                        {scene.sensitive_entities && scene.sensitive_entities.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2 items-center bg-blue-600/5 border border-blue-500/20 p-2">
                             <ShieldAlert className="w-3 h-3 text-blue-600" />
                             <span className="text-[10px] text-blue-600 font-mono tracking-widest">B.S. DETECTOR FLAGS:</span>
                             {scene.sensitive_entities.map((ent, idx) => (
                               <span key={idx} className="text-xs bg-blue-600/20 text-blue-600 px-2 py-0.5 whitespace-nowrap">
                                 {ent}
                               </span>
                             ))}
                          </div>
                        )}

                        {/* Source Auto-Linker Tip */}
                        {scene.text.match(/\b(في عام|سنة|وثيقة|الكتاب|تقرير)\b/) && !isFocusMode && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 flex items-center gap-3 bg-cyan-900/20 border border-cyan-500/30 p-2 pl-4 cursor-pointer hover:bg-cyan-900/40 transition-colors"
                          >
                             <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee] animate-pulse" />
                             <span className="text-[11px] text-cyan-200 font-bold">INFO_LINK:</span>
                             <span className="text-[10px] text-gray-600">هذه المعلومة تطابق <span className="text-gray-900">ملف_الاستخبارات_1999.pdf (صفحة 45)</span> المرفوع مؤخراً.</span>
                             <button className="mr-auto text-[9px] font-mono text-cyan-400 border border-cyan-500/30 px-2 py-1 hover:bg-cyan-500/20">تأكيد الربط</button>
                          </motion.div>
                        )}

                        {/* Fact Check Issues */}
                        {scene.factCheckStatus === 'DISPUTED' && scene.factCheckIssues && (
                           <div className="mt-2 bg-accent-danger/10 border border-accent-danger/30 p-2 text-accent-danger text-sm list-inside list-disc">
                             <div className="font-bold flex items-center gap-2 mb-1"><ShieldAlert className="w-4 h-4"/> تم رصد تناقضات:</div>
                             {scene.factCheckIssues.map((issue, idx) => (
                               <div key={idx} className="ml-4">- {issue}</div>
                             ))}
                           </div>
                        )}

                        {/* Retention Radar (رادار الملل) */}
                        {(scene.text.trim().split(/\s+/).length > 40 && !scene.text.includes('<break')) && (
                          <div className="mt-2 flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 p-2 animate-pulse">
                             <Activity className="w-4 h-4 text-orange-400" />
                             <span className="text-[10px] text-orange-400 font-mono tracking-widest font-bold">RETENTION WARNING: HIGH DROP-OFF RISK (TOO MUCH TEXT, NEED A HOOK OR BREAK)</span>
                          </div>
                        )}

                        {/* Text Area */}
                        <div className="relative mt-2 min-h-[150px] w-full border border-gray-200" dir="ltr">
                          <Editor
                            height="150px"
                            language="barwaz-script"
                            theme="barwaz-theme"
                            value={scene.text}
                            onChange={(val) => updateSceneText(scene.id, val || "")}
                            options={{
                              minimap: { enabled: false },
                              lineNumbers: 'off',
                              wordWrap: 'on',
                              wrappingIndent: 'indent',
                              scrollBeyondLastLine: false,
                              fontSize: 16,
                              fontFamily: 'Tajawal, monospace',
                              padding: { top: 16, bottom: 16 },
                              overviewRulerLanes: 0,
                              hideCursorInOverviewRuler: true,
                              scrollbar: {
                                vertical: 'hidden',
                                horizontal: 'hidden'
                              },
                            }}
                          />
                        </div>

                        {/* Audio Playback Area */}
                        {recordings[scene.id] && (
                            <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                                    <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">AUDIO_AVAILABLE</span>
                                </div>
                                <audio controls src={URL.createObjectURL(recordings[scene.id])} className="h-6" />
                            </div>
                        )}

                        {/* The Director Agent - Visual Prompts */}
                        <div className="mt-6 border-t border-gray-200 pt-4 flex flex-col space-y-3">
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase flex items-center gap-2">
                                <Film className="w-3 h-3" /> DIRECTOR_AGENT
                              </span>
                              <button className="text-[10px] bg-transparent text-gray-600 border border-gray-200 hover:text-cyan-400 hover:border-cyan-500/50 px-3 py-1.5 transition-colors duration-100 uppercase font-mono tracking-widest">
                                REGENERATE_PROMPT
                              </button>
                           </div>
                           <div className="text-[11px] text-gray-600 bg-gray-50 p-4 border border-gray-200 font-mono leading-relaxed relative group border-l-2 border-l-cyan-500/50">
                              {scene.visualPrompt ? (
                                <p>{scene.visualPrompt}</p>
                              ) : (
                                <>
                                  <span className="text-cyan-400 font-bold">[CAM]</span> Cinematic Slow-Mo, Low Angle Shot.<br/>
                                  <span className="text-cyan-400 font-bold">[LIT]</span> God Rays filtering through dust, High Contrast Noir.<br/>
                                  <span className="text-cyan-400 font-bold">[MOD]</span> Tense, Archival, Mysterious.
                                </>
                              )}
                           </div>
                        </div>

                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>

               {/* Add Scene Button */}
               <button 
                 onClick={addScene}
                 className="w-full flex items-center justify-center gap-2 p-4 bg-white border border-gray-200 hover:bg-white border-gray-100 shadow-sm text-gray-600 hover:text-gray-900 transition-colors duration-100 uppercase font-mono tracking-widest text-[10px]"
               >
                 <Plus className="w-4 h-4" />
                 ADD_BLOCK
               </button>
            </div>
         </div>

         {/* Side Panel Wrapper for Split Screen */}
         {isSplitScreen && !isFocusMode && (
            <div className="w-[350px] shrink-0 border border-gray-200 bg-white flex flex-col sticky top-6 h-[calc(100vh-140px)]">
               
               {/* Tab Selector */}
               <div className="flex border-b border-gray-200 shrink-0">
                 <button onClick={() => setActiveInspectorTab('traceability')} className={`flex-1 p-3 text-[9px] font-mono uppercase tracking-widest transition-colors ${activeInspectorTab === 'traceability' ? 'bg-gray-100 text-gray-900 border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-900 hover:bg-white border-gray-100 shadow-sm'}`}>
                   <List className="w-3 h-3 mx-auto mb-1" />
                   Trace
                 </button>
                 <button onClick={() => setActiveInspectorTab('interrogation')} className={`flex-1 p-3 text-[9px] font-mono uppercase tracking-widest transition-colors ${activeInspectorTab === 'interrogation' ? 'bg-[#eb2630]/10 text-[#eb2630] border-b-2 border-[#eb2630]' : 'text-gray-600 hover:text-[#eb2630] hover:bg-white border-gray-100 shadow-sm'}`}>
                   <MessageSquare className="w-3 h-3 mx-auto mb-1" />
                   Interrogate
                 </button>
                 <button onClick={() => setActiveInspectorTab('redString')} className={`flex-1 p-3 text-[9px] font-mono uppercase tracking-widest transition-colors ${activeInspectorTab === 'redString' ? 'bg-[#eb2630]/10 text-[#eb2630] border-b-2 border-[#eb2630]' : 'text-gray-600 hover:text-[#eb2630] hover:bg-white border-gray-100 shadow-sm'}`}>
                   <Link2 className="w-3 h-3 mx-auto mb-1" />
                   Red_String
                 </button>
                 <button onClick={() => setActiveInspectorTab('radar')} className={`flex-1 p-3 text-[9px] font-mono uppercase tracking-widest transition-colors ${activeInspectorTab === 'radar' ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-600 hover:text-cyan-400 hover:bg-white border-gray-100 shadow-sm'}`}>
                   <Map className="w-3 h-3 mx-auto mb-1" />
                   Radar
                 </button>
                 <button onClick={() => setActiveInspectorTab('portal')} className={`flex-1 p-3 text-[9px] font-mono uppercase tracking-widest transition-colors ${activeInspectorTab === 'portal' ? 'bg-fuchsia-500/10 text-fuchsia-400 border-b-2 border-fuchsia-400' : 'text-gray-600 hover:text-fuchsia-400 hover:bg-white border-gray-100 shadow-sm'}`}>
                   <Terminal className="w-3 h-3 mx-auto mb-1" />
                   Portal
                 </button>
                 <button onClick={() => setActiveInspectorTab('director')} className={`flex-1 p-3 text-[9px] font-mono uppercase tracking-widest transition-colors ${activeInspectorTab === 'director' ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-600 hover:text-cyan-400 hover:bg-white border-gray-100 shadow-sm'}`}>
                   <Film className="w-3 h-3 mx-auto mb-1" />
                   Director
                 </button>
               </div>

               {/* Tab Content */}
               <div className="flex-1 overflow-hidden">
                 {activeInspectorTab === 'interrogation' && <InterrogationRoom scriptContent={scenes.map(s => s.text).join('\n')} />}
                 {activeInspectorTab === 'redString' && <RedStringBoard />}
                 {activeInspectorTab === 'radar' && <TacticalRadar />}
                 {activeInspectorTab === 'portal' && <BlackPortal />}
                 {activeInspectorTab === 'director' && (
                   <div className="p-4 space-y-4 overflow-y-auto h-full custom-scrollbar">
                     <h3 className="font-mono text-gray-900 font-bold text-[10px] tracking-widest border-b border-gray-200 pb-3 flex items-center gap-2 uppercase">
                       <Film className="w-3 h-3 text-cyan-400" />
                       DIRECTOR_CUES
                     </h3>
                     <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest leading-relaxed mb-4">
                       المقترحات البصرية والهندسة الصوتية لكل كتلة
                     </p>
                     {scenes.map((scene, i) => (
                       <div key={scene.id} className="border border-gray-200 bg-gray-50 p-3 hover:border-cyan-500/30 transition-colors">
                         <div className="flex justify-between items-center mb-2">
                           <span className="text-[9px] text-cyan-400 font-mono tracking-widest uppercase">BLOCK_0{i + 1}</span>
                         </div>
                         {scene.visualPrompt && (
                           <div className="mb-2">
                             <span className="text-[8px] text-gray-600 font-mono uppercase tracking-widest block mb-1">VISUAL_CUE:</span>
                             <p className="text-[10px] text-gray-900/80 font-arabic">{scene.visualPrompt}</p>
                           </div>
                         )}
                         {scene.text.match(/\[.*?\]/g) && (
                           <div>
                             <span className="text-[8px] text-blue-600/60 font-mono uppercase tracking-widest block mb-1">SOUND_MARKS:</span>
                             <div className="flex flex-wrap gap-1">
                               {scene.text.match(/\[.*?\]/g)?.map((mark: string, idx: number) => (
                                 <span key={idx} className="text-[8px] bg-blue-600/10 border border-blue-500/30 text-blue-600 px-1 py-0.5 font-mono">{mark}</span>
                               ))}
                             </div>
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 )}
                 
                 {activeInspectorTab === 'traceability' && (
                   <div className="p-4 space-y-4 overflow-y-auto h-full custom-scrollbar">
                     <h3 className="font-mono text-gray-900 font-bold text-[10px] tracking-widest border-b border-gray-200 pb-3 flex items-center gap-2 uppercase">
                       <List className="w-3 h-3 text-cyan-400" />
                       TRACEABILITY_VIEWER
                     </h3>
                     <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest leading-relaxed mb-4">
                       يعرض المصادر المرتبطة وسياق كل وثيقة.
                     </p>
                     
                     {isRetrieving ? (
                       <div className="flex border border-blue-500/30 bg-blue-600/5 p-4 items-center justify-center">
                         <div className="w-4 h-4 rounded-full border-t-2 border-blue-500 animate-spin mr-3"></div>
                         <span className="text-blue-600 text-[10px] font-mono tracking-widest uppercase">RETRIEVING_VAULT_DATA...</span>
                       </div>
                     ) : evidenceBlocks.length === 0 ? (
                       <div className="border border-gray-200 bg-gray-50 p-6 text-center">
                         <p className="text-gray-600 text-[10px] font-mono tracking-widest uppercase">AWAITING_CONTEXT</p>
                       </div>
                     ) : (
                       evidenceBlocks.map((block, idx) => {
                         const isVRAM = block.sourceAgent === 'VRAM_MGR';
                         const isNLP = block.sourceAgent === 'NLP_ENGINE';
                         const isTTS = block.sourceAgent === 'TTS_ENGINE';
                         
                         let iconColor = 'text-blue-600';
                         let borderColor = 'border-blue-500/40';
                         if(isVRAM) { iconColor = 'text-[#eb2630]'; borderColor = 'border-[#eb2630]/40'; }
                         if(isNLP) { iconColor = 'text-purple-400'; borderColor = 'border-purple-400/40'; }
                         if(isTTS) { iconColor = 'text-cyan-400'; borderColor = 'border-cyan-400/40'; }

                         return (
                           <div key={idx} className="border border-gray-200 bg-gray-50 hover:border-gray-300 transition-colors duration-100">
                              <div className="p-3 border-b border-gray-200 flex items-start gap-3">
                                 <div className={`w-6 h-6 border ${borderColor} flex items-center justify-center shrink-0`}>
                                    <Type className={`w-3 h-3 ${iconColor}`} />
                                 </div>
                                 <div className="flex-1">
                                    <h4 className={`text-[10px] font-mono tracking-widest uppercase font-bold ${iconColor}`}>{block.sourceAgent || 'SYSTEM_NODE'}</h4>
                                    <p className="text-[10px] text-gray-600 mt-1 leading-relaxed">System Trace Event</p>
                                 </div>
                              </div>
                              <div className="p-3 text-[11px] text-gray-900/80 leading-relaxed font-mono tracking-wide line-clamp-3">
                                 <span className={`${iconColor} font-mono inline-block mr-2 opacity-80`}>{'>'}</span> 
                                 <span>{block.content}</span>
                              </div>
                           </div>
                         );
                       })
                     )}
                   </div>
                 )}
               </div>
            </div>
         )}
         
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
        }
      `}} />
    </div>
  );
};
