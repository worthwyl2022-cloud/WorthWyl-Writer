import React, { useState, useRef, useEffect } from "react";
import { NovelProject, Chapter, ContinuityReflection } from "@/src/models/domain";
import { 
  Sparkles, 
  BookOpen, 
  FileText, 
  Upload, 
  Play, 
  Pause, 
  Square, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Flame, 
  X, 
  ArrowRight,
  ShieldCheck,
  Check
} from "lucide-react";

interface CreateEntireNovelModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: NovelProject;
  onUpdateProject: (updates: Partial<NovelProject>) => void;
  onSelectChapterIndex: (index: number) => void;
}

export const CreateEntireNovelModal: React.FC<CreateEntireNovelModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
  onSelectChapterIndex,
}) => {
  // Generation configuration state
  const [sourceMode, setSourceMode] = useState<"idea" | "outline">("idea");
  const [novelTitle, setNovelTitle] = useState<string>(project.title || "The Obsidian Horizon");
  const [genre, setGenre] = useState<string>(project.genre || "Epic Speculative Fiction");
  const [premise, setPremise] = useState<string>(project.premise || "");
  const [tone, setTone] = useState<string>(project.tone || "Atmospheric, literary, high stakes, rich sensory depth");
  const [outlineText, setOutlineText] = useState<string>(project.outline || "");
  
  // Chapter count: presets or infinite custom input
  const [targetChapters, setTargetChapters] = useState<number>(project.targetChapters || 12);
  const [customChapterInput, setCustomChapterInput] = useState<string>(String(project.targetChapters || 12));
  
  // Word count per chapter (strict minimum 2,000)
  const [wordsPerChapter, setWordsPerChapter] = useState<number>(2200);

  // Strategy if chapters already exist
  const [startStrategy, setStartStrategy] = useState<"fresh" | "continue">("fresh");

  // Execution state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentStepText, setCurrentStepText] = useState<string>("");
  const [currentChapterProcessing, setCurrentChapterProcessing] = useState<number>(1);
  const [generatedChaptersLog, setGeneratedChaptersLog] = useState<Chapter[]>([]);
  const [totalWordsGenerated, setTotalWordsGenerated] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  // Refs for pause/cancel signal
  const isPausedRef = useRef<boolean>(false);
  const isCancelledRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Keep local fields in sync when modal opens
  useEffect(() => {
    if (isOpen) {
      setNovelTitle(project.title);
      setGenre(project.genre);
      setPremise(project.premise);
      setTone(project.tone);
      if (project.outline) setOutlineText(project.outline);
      if (project.targetChapters) {
        setTargetChapters(project.targetChapters);
        setCustomChapterInput(String(project.targetChapters));
      }
      setStartStrategy(project.chapters.length > 0 ? "continue" : "fresh");
    }
  }, [isOpen, project]);

  if (!isOpen) return null;

  // Handle file upload for outline (.txt, .md, .json)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setOutlineText(content);
        setSourceMode("outline");
      }
    };
    reader.readAsText(file);
  };

  const handleCustomChapterChange = (val: string) => {
    setCustomChapterInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setTargetChapters(num);
    }
  };

  // The Novel Generation Pipeline Loop
  const handleStartGeneration = async () => {
    setErrorMessage(null);
    setIsGenerating(true);
    setIsPaused(false);
    setIsComplete(false);
    isPausedRef.current = false;
    isCancelledRef.current = false;

    // Determine initial chapters and starting chapter index
    let activeChapters: Chapter[] = startStrategy === "continue" ? [...project.chapters] : [];
    let activeReflections: ContinuityReflection[] = startStrategy === "continue" ? [...project.reflections] : [];

    setGeneratedChaptersLog([...activeChapters]);
    const initialWords = activeChapters.reduce(
      (sum, ch) => sum + (ch.wordCount || ch.content.split(/\s+/).filter(Boolean).length),
      0
    );
    setTotalWordsGenerated(initialWords);

    // Save baseline configurations to project
    onUpdateProject({
      title: novelTitle,
      genre,
      premise,
      tone,
      outline: outlineText,
      targetChapters,
      chapters: activeChapters,
      reflections: activeReflections,
    });

    const startIdx = activeChapters.length + 1;
    const finalTarget = Math.max(startIdx, targetChapters);

    try {
      for (let chNum = startIdx; chNum <= finalTarget; chNum++) {
        // Check for cancellation
        if (isCancelledRef.current) {
          break;
        }

        // Wait if paused
        while (isPausedRef.current) {
          if (isCancelledRef.current) break;
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        if (isCancelledRef.current) break;

        setCurrentChapterProcessing(chNum);

        // =========================================================================
        // CONTINUITY REFLECTION RULE 1:
        // Every couple of chapters (after chapter 2, 4, 6, etc.), reflect upon the
        // last two chapters before writing the next one to stay laser focused!
        // =========================================================================
        let shortReflection: ContinuityReflection | null = null;
        if (activeChapters.length >= 2) {
          setCurrentStepText(
            `Continuity Loop: Reflecting upon last 2 chapters (Ch. ${activeChapters.length - 1} & Ch. ${activeChapters.length}) to prevent plot drift...`
          );

          try {
            const refRes = await fetch("/api/reflect-continuity", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "micro",
                novelTitle,
                premise,
                genre,
                chapters: activeChapters,
                currentChapterIndex: activeChapters.length,
              }),
            });
            const refData = await refRes.json();
            if (refData.success && refData.reflection) {
              const newRef: ContinuityReflection = {
                ...refData.reflection,
                id: `ref_micro_${Date.now()}_ch${chNum}`,
                chapterIndex: activeChapters.length,
                timestamp: new Date().toISOString(),
              };
              activeReflections = [...activeReflections, newRef];
              shortReflection = newRef;
              onUpdateProject({ reflections: activeReflections });
            }
          } catch (refErr) {
            console.warn("Auto micro reflection note:", refErr);
          }
        }

        // =========================================================================
        // CONTINUITY REFLECTION RULE 2:
        // At the end of every 5 (or 10) chapters, reflect on EVERYTHING from beginning
        // to end that it's written so far before moving forward!
        // =========================================================================
        let macroReflection: ContinuityReflection | null = null;
        if (activeChapters.length >= 5 && activeChapters.length % 5 === 0) {
          setCurrentStepText(
            `Macro Continuity Audit: Analyzing entire manuscript from Chapter 1 to ${activeChapters.length} before advancing...`
          );

          try {
            const macroRes = await fetch("/api/reflect-continuity", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "macro",
                novelTitle,
                premise,
                genre,
                chapters: activeChapters,
                currentChapterIndex: activeChapters.length,
              }),
            });
            const macroData = await macroRes.json();
            if (macroData.success && macroData.reflection) {
              const newMacroRef: ContinuityReflection = {
                ...macroData.reflection,
                id: `ref_macro_${Date.now()}_ch${chNum}`,
                chapterIndex: activeChapters.length,
                timestamp: new Date().toISOString(),
              };
              activeReflections = [...activeReflections, newMacroRef];
              macroReflection = newMacroRef;
              onUpdateProject({ reflections: activeReflections });
            }
          } catch (macroErr) {
            console.warn("Auto macro reflection note:", macroErr);
          }
        }

        // =========================================================================
        // DRAFT CHAPTER PROSE (MINIMUM 2,000 WORDS)
        // =========================================================================
        setCurrentStepText(
          `Synthesizing Chapter ${chNum} of ${finalTarget} (Target: minimum 2,000 words, rich prose & dialogue)...`
        );

        const response = await fetch("/api/generate-chapter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            novelTitle,
            genre,
            premise,
            outline: sourceMode === "outline" ? outlineText : "",
            tone,
            chapterIndex: chNum,
            totalChapters: finalTarget,
            mode: "autonomous",
            userNotes: sourceMode === "outline" ? "Follow the outline beats strictly for this chapter." : "",
            previousChapters: activeChapters.map((c) => ({
              chapterNumber: c.chapterNumber,
              title: c.title,
              summary: c.summary,
            })),
            shortTermReflection: shortReflection,
            macroReflection: macroReflection,
            targetWordCount: wordsPerChapter,
          }),
        });

        const data = await response.json();
        if (!data.success || !data.chapter) {
          throw new Error(data.error || `Failed to generate Chapter ${chNum}`);
        }

        const generated = data.chapter;
        const actualWordCount = generated.content
          ? generated.content.split(/\s+/).filter(Boolean).length
          : generated.wordCount || wordsPerChapter;

        const newChapter: Chapter = {
          id: `ch_full_${Date.now()}_${chNum}`,
          chapterNumber: chNum,
          title: generated.title || `Chapter ${chNum}`,
          content: generated.content || "",
          summary: generated.summary || "Full chapter drafted.",
          wordCount: actualWordCount,
          characters: generated.charactersIntroducedOrEvolved || [],
          openThreads: generated.openThreadsCreatedOrAdvanced || [],
          createdAt: new Date().toISOString(),
        };

        // Append to active set and update project immediately
        activeChapters = [...activeChapters, newChapter];
        setGeneratedChaptersLog([...activeChapters]);
        
        const updatedTotalWords = activeChapters.reduce(
          (sum, ch) => sum + (ch.wordCount || ch.content.split(/\s+/).filter(Boolean).length),
          0
        );
        setTotalWordsGenerated(updatedTotalWords);

        onUpdateProject({
          chapters: activeChapters,
          reflections: activeReflections,
          updatedAt: new Date().toISOString(),
        });
      }

      if (!isCancelledRef.current) {
        setIsComplete(true);
        setCurrentStepText("All chapters successfully synthesized!");
      }
    } catch (err: any) {
      console.error("Full novel generation error:", err);
      setErrorMessage(err.message || "An unexpected error occurred during synthesis.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStopAndKeep = () => {
    isCancelledRef.current = true;
    setIsGenerating(false);
    setIsPaused(false);
    setCurrentStepText("Synthesis stopped by author. All completed chapters have been saved.");
  };

  const handleFinishAndOpenStudio = () => {
    if (generatedChaptersLog.length > 0) {
      onSelectChapterIndex(0);
    }
    onClose();
  };

  const presetChapterCounts = [5, 10, 15, 20, 30, 50];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#181614] border border-amber-900/60 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-amber-950/60 bg-gradient-to-r from-stone-900 via-[#1e1b18] to-stone-900 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-amber-100 flex items-center gap-2">
                <span>Create Entire Novel</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/40">
                  Autonomous Novelist
                </span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Generate a full-length book with continuity reflection loops and at least 2,000 words per chapter.
              </p>
            </div>
          </div>

          {!isGenerating && (
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* Active Generation Progress Dashboard */}
          {isGenerating || isComplete || generatedChaptersLog.length > 0 && isCancelledRef.current ? (
            <div className="space-y-6">
              
              {/* Status Header */}
              <div className="bg-stone-900/90 border border-amber-800/40 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-500 font-semibold">
                      {isComplete ? "Synthesis Complete" : isPaused ? "Synthesis Paused" : "Autonomous Synthesis in Progress"}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-amber-100 mt-0.5">
                      {novelTitle}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-3 text-xs font-mono">
                    <div className="bg-stone-950/80 px-3 py-1.5 rounded-lg border border-stone-800">
                      <span className="text-stone-400">Chapters: </span>
                      <strong className="text-amber-300">
                        {generatedChaptersLog.length} / {targetChapters}
                      </strong>
                    </div>
                    <div className="bg-stone-950/80 px-3 py-1.5 rounded-lg border border-stone-800">
                      <span className="text-stone-400">Total Words: </span>
                      <strong className="text-emerald-400">
                        {totalWordsGenerated.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-stone-950 rounded-full h-3 overflow-hidden border border-stone-800">
                    <div
                      className="bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-500 h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (generatedChaptersLog.length / targetChapters) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-stone-400">
                    <span>
                      {Math.round((generatedChaptersLog.length / targetChapters) * 100)}% complete
                    </span>
                    <span>
                      {isGenerating ? `Processing Chapter ${currentChapterProcessing}...` : `${generatedChaptersLog.length} chapters authored`}
                    </span>
                  </div>
                </div>

                {/* Current Active Step Banner */}
                {currentStepText && (
                  <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg p-3 text-xs text-amber-200 flex items-center space-x-2">
                    {isGenerating && !isPaused && (
                      <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                    )}
                    <span className="leading-relaxed">{currentStepText}</span>
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="bg-rose-950/50 border border-rose-800 rounded-lg p-3 text-xs text-rose-300 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong>Error: </strong> {errorMessage}
                    </div>
                  </div>
                )}

                {/* Controls (Pause, Resume, Stop) */}
                {isGenerating && (
                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Resume Synthesis</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pause Synthesis</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleStopAndKeep}
                      className="px-4 py-2 rounded-lg bg-rose-950/70 hover:bg-rose-900/80 text-rose-200 border border-rose-800/60 text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 text-rose-400" />
                      <span>Stop & Keep Drafted Chapters</span>
                    </button>
                  </div>
                )}

                {/* Completed Banner */}
                {isComplete && (
                  <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 text-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-bold text-sm">Full Novel Synthesis Finished!</div>
                        <div className="text-xs text-stone-300">
                          {generatedChaptersLog.length} chapters crafted ({totalWordsGenerated.toLocaleString()} words). Ready for studio inspection or publishing.
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleFinishAndOpenStudio}
                      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow cursor-pointer transition-all"
                    >
                      Open Novel in Studio
                    </button>
                  </div>
                )}
              </div>

              {/* Generated Chapters List Feed */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400 font-semibold flex items-center justify-between">
                  <span>Synthesized Manuscript Feed</span>
                  <span>{generatedChaptersLog.length} Chapters Created</span>
                </h4>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {generatedChaptersLog.map((ch) => {
                    const words = ch.wordCount || ch.content.split(/\s+/).filter(Boolean).length;
                    return (
                      <div
                        key={ch.id}
                        className="bg-stone-900/60 border border-stone-800/70 rounded-lg p-3 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-amber-500">
                              Chapter {ch.chapterNumber}:
                            </span>
                            <span className="font-serif font-bold text-stone-200 text-sm">
                              {ch.title}
                            </span>
                            <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-mono border border-emerald-800/40">
                              ✓ {words.toLocaleString()} words
                            </span>
                          </div>
                          <p className="text-stone-400 text-[11px] line-clamp-2 leading-relaxed">
                            {ch.summary}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Setup Configuration Form */
            <div className="space-y-6">

              {/* Source Mode Toggle: Idea vs Outline */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                  1. Story Foundation Source
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSourceMode("idea")}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      sourceMode === "idea"
                        ? "bg-amber-950/50 border-amber-500 text-amber-100 shadow-sm"
                        : "bg-stone-900/50 border-stone-800 text-stone-400 hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center space-x-2 font-bold text-sm text-stone-200 mb-1">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Based on Overarching Idea</span>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Draft from your premise, world rules, and character stakes. The engine invents dynamic plot progression.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSourceMode("outline")}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      sourceMode === "outline"
                        ? "bg-amber-950/50 border-amber-500 text-amber-100 shadow-sm"
                        : "bg-stone-900/50 border-stone-800 text-stone-400 hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center space-x-2 font-bold text-sm text-stone-200 mb-1">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>Based on Uploaded / Pasted Outline</span>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Upload or paste a detailed chapter outline or scene roadmap. The engine strictly follows your specified beats.
                    </p>
                  </button>
                </div>
              </div>

              {/* Novel Core Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-stone-400 block mb-1 font-medium">Novel Title</label>
                  <input
                    type="text"
                    value={novelTitle}
                    onChange={(e) => setNovelTitle(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-200 focus:border-amber-500 focus:outline-none"
                    placeholder="e.g., The Iron Star Partition"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1 font-medium">Genre & Subgenre</label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-sm text-stone-200 focus:border-amber-500 focus:outline-none"
                    placeholder="e.g., Epic Speculative Fiction / Cyberpunk"
                  />
                </div>
              </div>

              {/* Source-Specific Inputs */}
              {sourceMode === "idea" ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-stone-400 block mb-1 font-medium">
                      Overarching Premise / Logline / Core Conflict
                    </label>
                    <textarea
                      rows={3}
                      value={premise}
                      onChange={(e) => setPremise(e.target.value)}
                      placeholder="Describe the inciting incident, protagonist's core goal, the antagonist or existential threat, and what is at stake..."
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg p-3 text-xs text-stone-200 focus:border-amber-500 focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 block mb-1 font-medium">Tone & Aesthetic Voice</label>
                    <input
                      type="text"
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 focus:border-amber-500 focus:outline-none"
                      placeholder="e.g., Atmospheric, literary depth, razor-sharp dialogue, cinematic tension"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-stone-400 font-medium">
                      Detailed Chapter Outline or Narrative Beats
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer bg-stone-900 px-2.5 py-1 rounded border border-stone-800"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Outline (.txt, .md)</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".txt,.md,.markdown,.json"
                      className="hidden"
                    />
                  </div>

                  <textarea
                    rows={6}
                    value={outlineText}
                    onChange={(e) => setOutlineText(e.target.value)}
                    placeholder={`Paste your outline here, e.g.:\nChapter 1: The Vault Breached - Corin discovers the forbidden seal.\nChapter 2: The Cartographer's Descent - Escape through the subterranean pylons.\nChapter 3: The Archon's Interrogation - Sula is captured by marshals...`}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg p-3 text-xs text-stone-200 focus:border-amber-500 focus:outline-none resize-none font-mono leading-relaxed"
                  />
                </div>
              )}

              {/* Target Chapter Count Selection (Infinite Possibility) */}
              <div className="space-y-3 bg-stone-900/40 border border-stone-800/80 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                    2. Target Chapter Count (Infinite Flexibility)
                  </label>
                  <span className="text-xs text-stone-400 font-mono">
                    Target: <strong className="text-amber-300">{targetChapters} Chapters</strong> (~{(targetChapters * wordsPerChapter).toLocaleString()} words)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {presetChapterCounts.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        setTargetChapters(count);
                        setCustomChapterInput(String(count));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                        targetChapters === count
                          ? "bg-amber-600 text-stone-950 font-bold"
                          : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
                      }`}
                    >
                      {count} Chapters
                    </button>
                  ))}

                  {/* Custom / Arbitrary Input for Infinite Chapters */}
                  <div className="flex items-center space-x-1.5 bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1">
                    <span className="text-[11px] text-stone-500 font-mono">Custom:</span>
                    <input
                      type="number"
                      min="1"
                      max="150"
                      value={customChapterInput}
                      onChange={(e) => handleCustomChapterChange(e.target.value)}
                      className="w-14 bg-transparent text-xs font-mono text-amber-200 focus:outline-none text-center"
                      placeholder="e.g. 24"
                    />
                    <span className="text-[11px] text-stone-500 font-mono">chs</span>
                  </div>
                </div>
              </div>

              {/* Prose Length Guarantee (At Least 2,000 Words) */}
              <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-stone-200 font-serif">
                      Strict Minimum Length Guarantee
                    </span>
                  </div>
                  <span className="bg-emerald-950 border border-emerald-800/40 text-emerald-300 text-[11px] px-2 py-0.5 rounded font-mono font-medium">
                    At Least 2,000 Words / Chapter
                  </span>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed">
                  Every chapter is authored as an expansive, full-length narrative episode with sensory staging, multi-beat dramatic progression, and extended dialogue.
                </p>

                <div className="flex items-center space-x-3 text-xs font-mono pt-1">
                  <button
                    type="button"
                    onClick={() => setWordsPerChapter(2000)}
                    className={`px-3 py-1 rounded transition-colors ${
                      wordsPerChapter === 2000
                        ? "bg-amber-800/80 text-amber-100 font-semibold border border-amber-600"
                        : "bg-stone-900 text-stone-400 hover:text-stone-300 border border-stone-800"
                    }`}
                  >
                    2,000 words (Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWordsPerChapter(2500)}
                    className={`px-3 py-1 rounded transition-colors ${
                      wordsPerChapter === 2500
                        ? "bg-amber-800/80 text-amber-100 font-semibold border border-amber-600"
                        : "bg-stone-900 text-stone-400 hover:text-stone-300 border border-stone-800"
                    }`}
                  >
                    2,500 words (Deep Prose)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWordsPerChapter(3200)}
                    className={`px-3 py-1 rounded transition-colors ${
                      wordsPerChapter === 3200
                        ? "bg-amber-800/80 text-amber-100 font-semibold border border-amber-600"
                        : "bg-stone-900 text-stone-400 hover:text-stone-300 border border-stone-800"
                    }`}
                  >
                    3,200 words (Epic Scope)
                  </button>
                </div>
              </div>

              {/* Continuity Reflection Architecture Notice */}
              <div className="border border-stone-800 rounded-xl p-4 bg-stone-950/40 space-y-2 text-xs">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5 font-serif">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Integrated WorthWyl Continuity Engine</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-stone-400">
                  <div className="bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
                    <span className="text-amber-400 font-semibold block mb-0.5">
                      🔄 2-Chapter Micro-Reflection:
                    </span>
                    Every 2 chapters, the engine reflects upon the previous two chapters before drafting the next, verifying character psychology, emotional state, and immediate plot consequences.
                  </div>
                  <div className="bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
                    <span className="text-emerald-400 font-semibold block mb-0.5">
                      🏛️ 5-Chapter Macro Audit:
                    </span>
                    Every 5 chapters, the engine performs a comprehensive whole-book audit from Chapter 1 to current, diagnosing thematic progression, pacing cadence, and resolving hanging threads.
                  </div>
                </div>
              </div>

              {/* Strategy if chapters already exist */}
              {project.chapters.length > 0 && (
                <div className="bg-stone-900/80 border border-amber-900/30 rounded-xl p-4 space-y-2 text-xs">
                  <div className="text-stone-300 font-semibold">
                    Existing Manuscript Detected ({project.chapters.length} Chapters)
                  </div>
                  <div className="flex items-center space-x-4 pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer text-stone-300">
                      <input
                        type="radio"
                        name="startStrategy"
                        value="fresh"
                        checked={startStrategy === "fresh"}
                        onChange={() => setStartStrategy("fresh")}
                        className="text-amber-500 focus:ring-0"
                      />
                      <span>Start Fresh from Chapter 1 (Overwrites current draft)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-stone-300">
                      <input
                        type="radio"
                        name="startStrategy"
                        value="continue"
                        checked={startStrategy === "continue"}
                        onChange={() => setStartStrategy("continue")}
                        className="text-amber-500 focus:ring-0"
                      />
                      <span>Continue from Chapter {project.chapters.length + 1}</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Launch Button */}
              <button
                type="button"
                onClick={handleStartGeneration}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-bold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl shadow-amber-950/60 cursor-pointer transition-all"
              >
                <Sparkles className="w-5 h-5 text-stone-950" />
                <span>
                  Begin Full Novel Synthesis ({targetChapters} Chapters • Min {(targetChapters * wordsPerChapter).toLocaleString()} Words)
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-amber-950/60 bg-stone-950/60 flex items-center justify-between text-xs text-stone-500 font-mono">
          <span>WorthWyl Writer • Autonomous Novelist Engine</span>
          {!isGenerating && (
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
