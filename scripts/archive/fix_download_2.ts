import fs from 'fs';

let content = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf-8');

const missingBlock = `        errorMsg.includes("429") ||
        errorMsg.toLowerCase().includes("quota") ||
        errorMsg.includes("RESOURCE_EXHAUSTED") ||
        errorMsg.includes("عفواً");
      const isFailedProxy =
        errorMsg.includes("Failed to call") ||
        (!isApiKeysFailure &&
          (errorMsg.includes("500") || errorMsg.includes("6")));

      if (isApiKeysFailure) {
        notify.breach("مشكلة في مفاتيح API");
        setError(errorMsg.replace("Ollama Proxy Error: 500 -", "").trim());
      } else if (isQuota) {
        notify.breach(\`تجاوزت الحد المسموح حالياً. يرجى الانتظار دقيقة واحدة واعادة المحاولة.\`);
        setError(\`تجاوزت الحد المجاني لموديل AI (Quota Exceeded). يرجى الانتظار 60 ثانية والمحاولة مرة أخرى.\`);
      } else if (isFailedProxy) {
        notify.breach("واجهنا مشكلة في خوادم النظام بسبب طول المحتوى.");
        setError(
          "يبدو أن الاتصال تعثر بسبب استغراق الذكاء الاصطناعي وقتاً طويلاً في التفكير. يمكنك المحاولة مرة أخرى، أو تقليل مدة الحلقة.",
        );
      } else {
        setError(err.message || "حدث خطأ أثناء الاتصال بالخادم");
        notify.breach(err.message || "حدث خطأ أثناء الاتصال بالخادم");
      }
    } finally {
      setIsLoading(false);
      if (duration !== 60 || hasError) {
        setProgress(0);
        setStatus("");
      }
    }
  };

  const handleApproveResearchMap = async () => {
    if (!researchMap) return;
    setIsLoading(true);
    setError("");
    let cumulativeScenes: EpisodeScene[] = [];
    let previousSummary = "";

    let hasErrorInApprove = false;
    abortControllerRef.current = new AbortController();

    try {
      if (!researchMap.chapters || !Array.isArray(researchMap.chapters)) {
        throw new Error("فشلت قراءة الفصول، يرجى إعادة المحاولة.");
      }
      const targetWordsPerChapter = Math.round(
        (duration * 130) / Math.max(1, researchMap.chapters.length),
      );
      for (let i = 0; i < researchMap.chapters.length; i++) {
        if (abortControllerRef.current?.signal.aborted)
          throw new Error("AbortError");
        setCurrentChapterIndex(i);
        setStatus(
          \`[!] يتم تحميض أحداث الفصل \${i + 1} من \${researchMap.chapters.length}: \${researchMap.chapters[i].chapter_title}...\`,
        );
        setProgress(10 + Math.round((i / researchMap.chapters.length) * 70));

        let retryCount = 0;
        let chapterScenes: EpisodeScene[] = [];
        while (retryCount < 2) {
          try {
            chapterScenes = await generateChapter(
              researchMap.chapters[i],
              researchMap.research_data,
              mood,
              previousSummary,
              i === 0,
              i === researchMap.chapters.length - 1,
              researchMap.video_title,
              targetWordsPerChapter,
              undefined,
              undefined,
              abortControllerRef.current?.signal,
            );
            if (chapterScenes && chapterScenes.length > 0) {
              break;
            }
          } catch (e: any) {
            console.warn(\`Retry chapter \${i + 1}\`, e);
            if (
              e.message?.includes("عفواً") ||
              e.message?.toLowerCase().includes("quota") ||
              e.message?.includes("429")
            ) {
              throw e;
            }
          }
          retryCount++;
          if (abortControllerRef.current?.signal.aborted)
            throw new Error("AbortError");
        }

        if (chapterScenes.length > 0) {
          const chapterText = chapterScenes.map((s) => s.voice_over).join(" ");
          previousSummary += \`\\n- الفصل \${i + 1} (\${researchMap.chapters[i].chapter_title}): تم سرد \${chapterText.substring(0, 150)}...\`;
        } else {
          throw new Error("تعذر توليد أحد الفصول، يرجى المحاولة مرة أخرى.");
        }

        cumulativeScenes = [...cumulativeScenes, ...chapterScenes];
        setGeneratedScenes(cumulativeScenes);
      }

      if (abortControllerRef.current?.signal.aborted)
        throw new Error("AbortError");
      setStatus("[!] يتم تجميع ملف القضية والأدلة النهائية...");
      setProgress(90);
      const packagingResult = await generatePackaging(
        researchMap.video_title,
        researchMap.research_data,
        mood,
        cumulativeScenes,
      );

      const fullData = {
        video_title: researchMap.video_title,
        mood: mood,
        thumbnail: packagingResult.thumbnail,
        opening_sketch: cumulativeScenes[0],
        scenes: cumulativeScenes.slice(1),
        sources: researchMap.sources,
        publishing_kit: packagingResult.publishing_kit,
        shorts: packagingResult.shorts,
        audit_report: packagingResult.audit_report,
      };

      setData(fullData);

      setIsGeneratingFragments(true);
      try {
        const fullScript = [
          fullData.opening_sketch.voice_over,
          ...fullData.scenes.map((s) => s.voice_over),
        ].join(" ");
        const { generateFragmenterContent } = await import("../lib/gemini");
        const fragments = await generateFragmenterContent(
          researchMap.video_title,
          activeMood,
          fullScript,
          useOllama ? "ollama" : "gemini",
        );
        setFragmenterData(fragments);
      } catch (e) {
        console.warn("Fragmenter failed", e);
      } finally {
        setIsGeneratingFragments(false);
      }

      const allVoiceovers = [fullData.opening_sketch, ...fullData.scenes]
        .map((s) => s.voice_over)
        .join("\\n\\n");
      setRawScriptText(allVoiceovers);
      const extracted = extractAndCleanScript(allVoiceovers);
      const optimized = convertToEgyptian(extracted);
      setFinalVoiceScript(optimized);

      setProgress(100);
      setPipelineStep(3);
      setTimeout(() => setActiveTab("script"), 500);
    } catch (err: any) {
      if (err.message === "AbortError") {
        notify.info("تم إيقاف عملية الصياغة.");
      } else {
        hasErrorInApprove = true;
        const msg = err.message || "حدث خطأ أثناء الصياغة";
        setError(\`فشل الصياغة: \${msg}\`);
        notify.breach(\`فشل الصياغة: \${msg}\`);
      }
    } finally {
      setIsLoading(false);
      if (hasErrorInApprove) {
        setStatus("");
        setProgress(0);
      }
    }
  };

`;

const startIdx = content.indexOf('const isQuota =\n         const handleDownloadDossierTxt = async () => {');

if (startIdx !== -1) {
    const head = content.substring(0, startIdx + 15);
    const tail = "\n" + content.substring(startIdx + 26);
    
    fs.writeFileSync('src/pages/ContentCreationPage.tsx', head + missingBlock + tail);
    console.log("Successfully restored the missing functions.");
} else {
    console.log("Could not find boundaries.");
}
