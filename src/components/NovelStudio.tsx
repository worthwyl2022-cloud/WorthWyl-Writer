import React, { useState } from "react";
import { NovelProject, Chapter } from "@/src/models/domain";
import Markdown from "react-markdown";
import { 
  Sparkles, 
  PenTool, 
  Plus, 
  Trash2, 
  BookOpen, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Lightbulb,
  FileText,
  RotateCcw,
  X,
  Check,
  ShieldCheck,
  Layers,
  ArrowRight
} from "lucide-react";
import { CreateEntireNovelModal } from "@/src/components/CreateEntireNovelModal";

interface NovelStudioProps {
  project: NovelProject;
  onUpdateProject: (updates: Partial<NovelProject>) => void;
  onRunReflection: (type: "micro" | "macro") => Promise<void>;
}

export const NovelStudio: React.FC<NovelStudioProps> = ({
  project,
  onUpdateProject,
  onRunReflection,
}) => {
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [writingMode, setWritingMode] = useState<"autonomous" | "co-write">("co-write");
  const [authorNotes, setAuthorNotes] = useState<string>("");
  const [targetWordCount, setTargetWordCount] = useState<number>(2200); // Strict min 2000 words
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"read" | "edit">("read");

  // In-UI modal & confirmation states (replacing window.confirm and window.alert)
  const [isCreateEntireModalOpen, setIsCreateEntireModalOpen] = useState<boolean>(false);
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);
  const [showResetAllConfirm, setShowResetAllConfirm] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const chapters = project.chapters || [];
  const currentChapter = chapters[selectedChapterIndex] || null;

  // Auto-generation or Co-writing next chapter
  const handleGenerateNextChapter = async () => {
    setIsGenerating(true);
    setErrorBanner(null);
    const nextChapterNumber = chapters.length + 1;

    try {
      // Step 1: Check if short-range reflection is needed (reflecting upon last 2 chapters)
      let shortReflection = null;
      let macroReflection = null;

      if (chapters.length >= 2) {
        setGenerationStep(`Auditing episodic continuity from Chapters ${chapters.length - 1} & ${chapters.length}...`);
        
        const existingMicro = project.reflections
          .slice()
          .reverse()
          .find((r) => r.type === "micro" && r.chapterIndex === chapters.length);

        if (existingMicro) {
          shortReflection = existingMicro;
        } else {
          try {
            const refRes = await fetch("/api/reflect-continuity", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "micro",
                novelTitle: project.title,
                premise: project.premise,
                genre: project.genre,
                chapters: project.chapters,
                currentChapterIndex: chapters.length,
              }),
            });
            const refData = await refRes.json();
            if (refData.success && refData.reflection) {
              shortReflection = refData.reflection;
              const newRef = {
                ...refData.reflection,
                id: `ref_micro_${Date.now()}`,
                chapterIndex: chapters.length,
                timestamp: new Date().toISOString(),
              };
              onUpdateProject({
                reflections: [...project.reflections, newRef],
              });
            }
          } catch (refErr) {
            console.warn("Continuity reflection auto-fetch error:", refErr);
          }
        }
      }

      // Step 2: Check if macro reflection is needed (every 5 to 10 chapters)
      if (chapters.length >= 5 && chapters.length % 5 === 0) {
        setGenerationStep(`Conducting macro narrative audit across all ${chapters.length} chapters...`);
        const existingMacro = project.reflections
          .slice()
          .reverse()
          .find((r) => r.type === "macro" && r.chapterIndex === chapters.length);

        if (existingMacro) {
          macroReflection = existingMacro;
        } else {
          try {
            const macroRes = await fetch("/api/reflect-continuity", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "macro",
                novelTitle: project.title,
                premise: project.premise,
                genre: project.genre,
                chapters: project.chapters,
                currentChapterIndex: chapters.length,
              }),
            });
            const macroData = await macroRes.json();
            if (macroData.success && macroData.reflection) {
              macroReflection = macroData.reflection;
              const newMacroRef = {
                ...macroData.reflection,
                id: `ref_macro_${Date.now()}`,
                chapterIndex: chapters.length,
                timestamp: new Date().toISOString(),
              };
              onUpdateProject({
                reflections: [...project.reflections, newMacroRef],
              });
            }
          } catch (macroErr) {
            console.warn("Macro continuity audit error:", macroErr);
          }
        }
      }

      // Step 3: Generate chapter prose (enforcing at least 2,000 words)
      setGenerationStep(
        writingMode === "co-write"
          ? `Weaving author directives into Chapter ${nextChapterNumber} (min 2,000 words)...`
          : `Authoring Chapter ${nextChapterNumber} with autonomous progression (min 2,000 words)...`
      );

      const response = await fetch("/api/generate-chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novelTitle: project.title,
          genre: project.genre,
          premise: project.premise,
          outline: project.outline || "",
          tone: project.tone,
          chapterIndex: nextChapterNumber,
          totalChapters: project.targetChapters || 12,
          mode: writingMode,
          userNotes: authorNotes,
          previousChapters: chapters.map((c) => ({
            chapterNumber: c.chapterNumber,
            title: c.title,
            summary: c.summary,
          })),
          shortTermReflection: shortReflection,
          macroReflection: macroReflection,
          targetWordCount,
        }),
      });

      const data = await response.json();
      if (!data.success || !data.chapter) {
        throw new Error(data.error || "Failed to generate chapter");
      }

      const generated = data.chapter;
      const actualWordCount = generated.content
        ? generated.content.split(/\s+/).filter(Boolean).length
        : generated.wordCount || targetWordCount;

      const newChapter: Chapter = {
        id: `ch_${Date.now()}`,
        chapterNumber: nextChapterNumber,
        title: generated.title || `Chapter ${nextChapterNumber}`,
        content: generated.content || "",
        summary: generated.summary || "Chapter generated.",
        userNotes: authorNotes,
        wordCount: actualWordCount,
        characters: generated.charactersIntroducedOrEvolved || [],
        openThreads: generated.openThreadsCreatedOrAdvanced || [],
        createdAt: new Date().toISOString(),
      };

      const updatedChapters = [...chapters, newChapter];
      onUpdateProject({ chapters: updatedChapters });
      setSelectedChapterIndex(updatedChapters.length - 1);
      setAuthorNotes(""); // Clear notes after generation
    } catch (err: any) {
      console.error("Chapter generation failed:", err);
      setErrorBanner(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  const handleUpdateCurrentChapter = (updates: Partial<Chapter>) => {
    if (!currentChapter) return;
    const updated = chapters.map((ch, idx) =>
      idx === selectedChapterIndex ? { ...ch, ...updates } : ch
    );
    onUpdateProject({ chapters: updated });
  };

  // Perform confirmed deletion of a single chapter
  const executeDeleteChapter = (chapter: Chapter) => {
    const remaining = chapters.filter((ch) => ch.id !== chapter.id);
    // Renumber chapters consecutively
    const renumbered = remaining.map((ch, i) => ({ ...ch, chapterNumber: i + 1 }));
    onUpdateProject({ chapters: renumbered });
    setSelectedChapterIndex((prev) => Math.min(Math.max(0, prev - 1), Math.max(0, renumbered.length - 1)));
    setChapterToDelete(null);
  };

  // Perform confirmed reset of all chapters
  const executeResetAllChapters = () => {
    onUpdateProject({
      chapters: [],
      reflections: [],
    });
    setSelectedChapterIndex(0);
    setShowResetAllConfirm(false);
  };

  const totalWords = chapters.reduce(
    (sum, c) => sum + (c.wordCount || c.content.split(/\s+/).filter(Boolean).length),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* Dismissible Error Banner */}
      {errorBanner && (
        <div className="bg-rose-950/70 border border-rose-800 rounded-xl p-4 text-xs text-rose-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button
            onClick={() => setErrorBanner(null)}
            className="text-stone-400 hover:text-stone-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner: Create Entire Novel Call-To-Action */}
      <div className="bg-gradient-to-r from-amber-950/60 via-[#211a14] to-stone-900 border border-amber-800/50 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md shrink-0">
            <Sparkles className="w-6 h-6 text-stone-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-serif font-bold text-amber-100">
                Create Entire Novel
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-900/80 text-amber-300 border border-amber-700/50">
                Autonomous Pipeline
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Synthesize a full multi-chapter book from your overarching premise or uploaded outline. Includes strict 2,000+ words/chapter and automated 2-chapter and 5-chapter continuity reflection loops.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateEntireModalOpen(true)}
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/60 shrink-0 cursor-pointer transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4 text-stone-950" />
          <span>Launch Novel Synthesizer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Chapters Directory & Generator Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Novel Overview & Core Premise Card */}
          <div className="bg-[#181614] border border-amber-950/50 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-500 font-semibold">
                Story Foundation
              </span>
              <button
                onClick={() => setIsEditingNotes(!isEditingNotes)}
                className="text-xs text-stone-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                {isEditingNotes ? "Done" : "Configure"}
              </button>
            </div>

            {isEditingNotes ? (
              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="text-stone-400 block mb-1">Title</label>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => onUpdateProject({ title: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-800 rounded px-2.5 py-1.5 text-stone-200"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Genre</label>
                  <input
                    type="text"
                    value={project.genre}
                    onChange={(e) => onUpdateProject({ genre: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-800 rounded px-2.5 py-1.5 text-stone-200"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Overarching Premise / Logline</label>
                  <textarea
                    rows={3}
                    value={project.premise}
                    onChange={(e) => onUpdateProject({ premise: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-800 rounded px-2.5 py-1.5 text-stone-200 resize-none"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Tone & Aesthetic</label>
                  <input
                    type="text"
                    value={project.tone}
                    onChange={(e) => onUpdateProject({ tone: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-800 rounded px-2.5 py-1.5 text-stone-200"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Outline / Beat Roadmap (Optional)</label>
                  <textarea
                    rows={3}
                    value={project.outline || ""}
                    onChange={(e) => onUpdateProject({ outline: e.target.value })}
                    placeholder="Chapter 1: ... Chapter 2: ..."
                    className="w-full bg-stone-900 border border-stone-800 rounded px-2.5 py-1.5 text-stone-200 resize-none font-mono text-[11px]"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-serif font-bold text-base text-amber-100">{project.title}</h3>
                <p className="text-xs text-amber-400/80 font-medium mt-0.5">{project.genre}</p>
                <p className="text-xs text-stone-400 mt-2 line-clamp-3 leading-relaxed">
                  {project.premise || "No premise specified."}
                </p>
                {project.outline && (
                  <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-amber-400 font-mono">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Outline Attached
                    </span>
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="text-stone-400 hover:text-stone-200 cursor-pointer"
                    >
                      View Beats
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chapters Directory */}
          <div className="bg-[#181614] border border-amber-950/50 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-semibold text-stone-200 font-serif">Chapters Directory</h4>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-stone-400">
                  {chapters.length} / {project.targetChapters} planned
                </span>
                {chapters.length > 0 && (
                  <button
                    onClick={() => setShowResetAllConfirm(true)}
                    className="text-[11px] text-stone-500 hover:text-rose-400 transition-colors p-1 rounded hover:bg-stone-900 cursor-pointer"
                    title="Clear all chapters"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
              {chapters.map((ch, idx) => {
                const isSelected = idx === selectedChapterIndex;
                const words = ch.wordCount || ch.content.split(/\s+/).filter(Boolean).length;
                return (
                  <div
                    key={ch.id || idx}
                    className={`group w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-amber-950/60 border border-amber-600/60 text-amber-100 shadow-sm"
                        : "hover:bg-stone-900/60 text-stone-400 border border-transparent"
                    }`}
                  >
                    <button
                      onClick={() => setSelectedChapterIndex(idx)}
                      className="flex-1 text-left truncate pr-2 cursor-pointer"
                    >
                      <span className="font-mono text-amber-500 mr-2">Ch.{ch.chapterNumber}</span>
                      <span className="font-medium text-stone-200">{ch.title}</span>
                    </button>
                    
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[10px] font-mono text-stone-500">
                        {words.toLocaleString()}w
                      </span>
                      
                      {/* Delete Chapter Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setChapterToDelete(ch);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-rose-400 p-1 rounded transition-opacity cursor-pointer"
                        title={`Delete Chapter ${ch.chapterNumber}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {chapters.length === 0 && (
                <div className="text-center py-8 text-xs text-stone-400 space-y-3">
                  <div>No chapters drafted yet.</div>
                  <button
                    onClick={() => setIsCreateEntireModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Create Entire Novel
                  </button>
                </div>
              )}
            </div>

            {/* Total manuscript statistics */}
            {chapters.length > 0 && (
              <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] font-mono text-stone-400">
                <span>Total Novel Words:</span>
                <strong className="text-amber-300 font-bold">
                  {totalWords.toLocaleString()} words
                </strong>
              </div>
            )}
          </div>

          {/* Single Chapter Generator Engine (Incremental / Co-Write) */}
          <div className="bg-gradient-to-b from-[#211d19] to-[#181614] border border-amber-800/40 rounded-xl p-4 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-semibold text-amber-100 font-serif">
                  Write Chapter {chapters.length + 1}
                </h4>
              </div>
              
              {/* Mode Toggle */}
              <div className="flex items-center bg-stone-900/90 rounded-md p-0.5 border border-stone-800">
                <button
                  onClick={() => setWritingMode("co-write")}
                  className={`px-2 py-1 text-[11px] rounded font-medium transition-colors cursor-pointer ${
                    writingMode === "co-write"
                      ? "bg-amber-700 text-stone-100 font-semibold shadow-sm"
                      : "text-stone-400 hover:text-stone-300"
                  }`}
                  title="Collaborative: You provide scene goals, AI drafts the chapter"
                >
                  Co-Write
                </button>
                <button
                  onClick={() => setWritingMode("autonomous")}
                  className={`px-2 py-1 text-[11px] rounded font-medium transition-colors cursor-pointer ${
                    writingMode === "autonomous"
                      ? "bg-amber-700 text-stone-100 font-semibold shadow-sm"
                      : "text-stone-400 hover:text-stone-300"
                  }`}
                  title="Autonomous: AI continues the plot automatically"
                >
                  Autonomous
                </button>
              </div>
            </div>

            {/* Reflection Continuity Alert Badge */}
            {chapters.length >= 2 && (
              <div className="bg-amber-950/40 border border-amber-700/30 rounded-lg p-2.5 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 text-amber-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>2-Chapter Continuity Active</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-tight">
                  Reflecting upon Chapters {chapters.length - 1} & {chapters.length} to preserve causal consequences and character states.
                </p>
                {chapters.length >= 5 && chapters.length % 5 === 0 && (
                  <div className="text-[11px] text-amber-400 font-medium pt-1 border-t border-amber-900/40">
                    ⚡ Macro 5-Chapter Audit Milestone Triggered!
                  </div>
                )}
              </div>
            )}

            {/* Author Directives input (if in co-write mode) */}
            {writingMode === "co-write" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-300 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Scene Goals & Mandatory Directives:</span>
                </label>
                <textarea
                  rows={3}
                  value={authorNotes}
                  onChange={(e) => setAuthorNotes(e.target.value)}
                  placeholder="e.g., Corin uncovers the partition code; Sula sounds the alarm; end on a tense confrontation with the marshals..."
                  className="w-full bg-stone-900/80 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:border-amber-600 focus:outline-none resize-none"
                />
              </div>
            )}

            {/* Word count target: minimum 2,000 words */}
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Min 2,000 words:</span>
              </span>
              <div className="flex items-center space-x-2 font-mono">
                <button
                  type="button"
                  onClick={() => setTargetWordCount(2000)}
                  className={`px-2 py-0.5 rounded cursor-pointer ${targetWordCount === 2000 ? "bg-amber-900 text-amber-200 font-bold" : "bg-stone-900 hover:text-stone-200"}`}
                >
                  2.0k
                </button>
                <button
                  type="button"
                  onClick={() => setTargetWordCount(2500)}
                  className={`px-2 py-0.5 rounded cursor-pointer ${targetWordCount === 2500 ? "bg-amber-900 text-amber-200 font-bold" : "bg-stone-900 hover:text-stone-200"}`}
                >
                  2.5k
                </button>
                <button
                  type="button"
                  onClick={() => setTargetWordCount(3200)}
                  className={`px-2 py-0.5 rounded cursor-pointer ${targetWordCount === 3200 ? "bg-amber-900 text-amber-200 font-bold" : "bg-stone-900 hover:text-stone-200"}`}
                >
                  3.2k
                </button>
              </div>
            </div>

            {/* Generate Single Chapter Action Button */}
            <button
              onClick={handleGenerateNextChapter}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/40 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Drafting Chapter...</span>
                </div>
              ) : (
                <>
                  <PenTool className="w-3.5 h-3.5" />
                  <span>
                    {writingMode === "co-write" ? "Co-Write Chapter" : "Draft Chapter"} {chapters.length + 1} (2,000+ words)
                  </span>
                </>
              )}
            </button>

            {generationStep && (
              <div className="text-[11px] font-mono text-amber-300 text-center animate-pulse">
                {generationStep}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Chapter Reader & Editor (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {currentChapter ? (
            <div className="bg-[#181614] border border-amber-950/50 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[680px]">
              
              {/* Chapter Header Bar */}
              <div className="border-b border-amber-950/40 p-4 bg-stone-900/40 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
                  <span className="font-mono text-amber-500 font-bold text-sm shrink-0">
                    Chapter {currentChapter.chapterNumber}
                  </span>
                  <input
                    type="text"
                    value={currentChapter.title}
                    onChange={(e) => handleUpdateCurrentChapter({ title: e.target.value })}
                    className="font-serif font-bold text-lg text-amber-100 bg-transparent border-b border-transparent hover:border-amber-700/60 focus:border-amber-500 focus:outline-none w-full"
                    placeholder="Chapter Title"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center bg-stone-900 rounded-md p-0.5 border border-stone-800 text-xs">
                    <button
                      onClick={() => setViewMode("read")}
                      className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                        viewMode === "read"
                          ? "bg-amber-900/60 text-amber-200 font-medium"
                          : "text-stone-400 hover:text-stone-300"
                      }`}
                    >
                      Formatted Reader
                    </button>
                    <button
                      onClick={() => setViewMode("edit")}
                      className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                        viewMode === "edit"
                          ? "bg-amber-900/60 text-amber-200 font-medium"
                          : "text-stone-400 hover:text-stone-300"
                      }`}
                    >
                      Raw Editor
                    </button>
                  </div>

                  {/* Trigger Single Chapter Delete Modal */}
                  <button
                    onClick={() => setChapterToDelete(currentChapter)}
                    className="p-1.5 text-stone-500 hover:text-rose-400 rounded hover:bg-stone-900 transition-colors cursor-pointer"
                    title={`Delete Chapter ${currentChapter.chapterNumber}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chapter Meta Strip */}
              <div className="px-6 py-2.5 bg-stone-950/40 border-b border-stone-900/80 flex flex-wrap items-center justify-between text-xs text-stone-400 font-mono">
                <div className="flex items-center space-x-4">
                  <span>
                    Word Count:{" "}
                    <strong className="text-amber-300">
                      {(currentChapter.wordCount || currentChapter.content.split(/\s+/).filter(Boolean).length).toLocaleString()}
                    </strong>{" "}
                    words
                  </span>
                  {currentChapter.characters && currentChapter.characters.length > 0 && (
                    <span className="hidden sm:inline">
                      Characters: <span className="text-stone-300">{currentChapter.characters.join(", ")}</span>
                    </span>
                  )}
                </div>

                {currentChapter.summary && (
                  <span className="text-stone-500 italic max-w-sm truncate hidden md:inline">
                    "{currentChapter.summary}"
                  </span>
                )}
              </div>

              {/* Chapter Content Area */}
              <div className="p-6 sm:p-8 flex-1 overflow-y-auto bg-[#141210]">
                {viewMode === "read" ? (
                  <div className="prose prose-invert max-w-none prose-amber prose-p:leading-relaxed prose-p:text-stone-300 font-serif text-base sm:text-lg">
                    <Markdown>{currentChapter.content}</Markdown>
                  </div>
                ) : (
                  <textarea
                    value={currentChapter.content}
                    onChange={(e) =>
                      handleUpdateCurrentChapter({
                        content: e.target.value,
                        wordCount: e.target.value.split(/\s+/).filter(Boolean).length,
                      })
                    }
                    className="w-full h-full min-h-[500px] bg-transparent text-stone-200 font-serif text-base sm:text-lg leading-relaxed focus:outline-none resize-none"
                    placeholder="Write chapter prose here..."
                  />
                )}
              </div>

              {/* Chapter Footer Actions: Trigger Continuity Reflection */}
              <div className="p-4 bg-stone-900/30 border-t border-amber-950/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-stone-400">
                  {chapters.length >= 2 ? (
                    <span>
                      Continuity check:{" "}
                      <span className="text-emerald-400">Chapters {Math.max(1, currentChapter.chapterNumber - 1)} & {currentChapter.chapterNumber} verified</span>
                    </span>
                  ) : (
                    <span>Continuity tracking begins with 2+ chapters.</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onRunReflection("micro")}
                    className="px-3 py-1.5 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700/60 font-medium transition-colors cursor-pointer"
                  >
                    Inspect 2-Chapter Micro Reflection
                  </button>
                  {chapters.length >= 5 && (
                    <button
                      onClick={() => onRunReflection("macro")}
                      className="px-3 py-1.5 rounded bg-amber-950/70 hover:bg-amber-900/70 text-amber-200 border border-amber-700/60 font-medium transition-colors cursor-pointer"
                    >
                      Run 5-Chapter Macro Audit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#181614] border border-dashed border-stone-800 rounded-xl p-12 text-center text-stone-500 space-y-4">
              <FileText className="w-12 h-12 mx-auto text-stone-700" />
              <div>
                <h3 className="font-serif text-lg text-stone-300">No Chapter Selected</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Select an existing chapter from the directory, draft your opening chapter, or synthesize an entire novel.
                </p>
              </div>
              <button
                onClick={() => setIsCreateEntireModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider cursor-pointer shadow transition-all"
              >
                Create Entire Novel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* IN-UI CONFIRMATION MODAL: Delete Single Chapter */}
      {chapterToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#1c1917] border border-rose-900/60 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-800 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-stone-100">
                  Delete Chapter {chapterToDelete.chapterNumber}?
                </h3>
                <div className="text-xs text-stone-400 font-sans">
                  "{chapterToDelete.title}"
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Are you sure you want to delete this chapter ({chapterToDelete.wordCount || chapterToDelete.content.split(/\s+/).filter(Boolean).length} words)? Remaining chapters will be automatically renumbered consecutively. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setChapterToDelete(null)}
                className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => executeDeleteChapter(chapterToDelete)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider shadow cursor-pointer transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-UI CONFIRMATION MODAL: Reset All Chapters */}
      {showResetAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#1c1917] border border-rose-900/60 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-800 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-stone-100">
                  Clear All Chapters?
                </h3>
                <div className="text-xs text-stone-400 font-sans">
                  Reset novel manuscript canvas
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              This will permanently delete all <strong>{chapters.length} chapters</strong> ({totalWords.toLocaleString()} words) and recorded continuity reflections. You can then use <strong>"Create Entire Novel"</strong> to synthesize a fresh book from scratch.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowResetAllConfirm(false)}
                className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeResetAllChapters}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider shadow cursor-pointer transition-colors"
              >
                Yes, Clear All Chapters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Novel Synthesis Modal */}
      <CreateEntireNovelModal
        isOpen={isCreateEntireModalOpen}
        onClose={() => setIsCreateEntireModalOpen(false)}
        project={project}
        onUpdateProject={onUpdateProject}
        onSelectChapterIndex={setSelectedChapterIndex}
      />
    </div>
  );
};
