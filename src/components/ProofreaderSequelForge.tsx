import React, { useState } from "react";
import { NovelProject, ProofreadAnalysis, SequelBlueprint } from "@/src/models/domain";
import Markdown from "react-markdown";
import { 
  FileSearch, 
  Sparkles, 
  Upload, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Layers, 
  GitFork,
  BookPlus,
  RefreshCw
} from "lucide-react";

interface ProofreaderSequelForgeProps {
  project: NovelProject;
  onUpdateProject: (updates: Partial<NovelProject>) => void;
  onCreateSequelProject: (blueprint: SequelBlueprint) => void;
}

export const ProofreaderSequelForge: React.FC<ProofreaderSequelForgeProps> = ({
  project,
  onUpdateProject,
  onCreateSequelProject,
}) => {
  const [action, setAction] = useState<"proofread" | "extend" | "sequel_forge">("proofread");
  const [contentToProcess, setContentToProcess] = useState<string>("");
  const [documentTitle, setDocumentTitle] = useState<string>(project.title);
  const [authorNotes, setAuthorNotes] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"critique" | "polished" | "sequel">("critique");
  const [copied, setCopied] = useState<boolean>(false);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocumentTitle(file.name.replace(/\.[^/.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContentToProcess(text);
    };
    reader.readAsText(file);
  };

  const handleProcess = async () => {
    if (!contentToProcess.trim()) {
      alert("Please upload or paste text before running analysis.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/proofread-and-extend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          content: contentToProcess,
          title: documentTitle,
          genre: project.genre,
          notes: authorNotes,
        }),
      });

      const data = await response.json();
      if (!data.success || !data.result) {
        throw new Error(data.error || "Failed to process text");
      }

      setResult(data.result);
      if (action === "proofread") {
        setActiveTab("critique");
      } else if (action === "extend") {
        setActiveTab("polished");
      } else {
        setActiveTab("sequel");
      }
    } catch (err: any) {
      alert(`Processing error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyPolishedToChapter = () => {
    if (!result?.polishedText) return;
    const newChapter = {
      id: `ch_revised_${Date.now()}`,
      chapterNumber: project.chapters.length + 1,
      title: `${documentTitle} (Polished)`,
      content: result.polishedText,
      summary: result.editorialChangesSummary || "Polished manuscript uploaded.",
      wordCount: result.polishedText.split(/\s+/).filter(Boolean).length,
      createdAt: new Date().toISOString(),
    };
    onUpdateProject({
      chapters: [...project.chapters, newChapter],
    });
    alert("Polished text added as a new chapter in your Novel Studio!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1b1916] via-[#161412] to-[#121110] border border-amber-800/40 rounded-xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-amber-900/60 text-amber-300 border border-amber-700/50">
                Manuscript Editorial & Franchise Forge
              </span>
              <span className="text-xs text-stone-400 font-mono">Proofread • Extend • Sequel Architect</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100">
              Proofreader & Sequel Forge
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl leading-relaxed">
              Upload any manuscript excerpt, chapter draft, or outline. WorthWyl Writer conducts deep developmental and line-level proofreading, seamlessly extends the prose, or analyzes Book 1 to forge a full 12-chapter franchise sequel.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Upload & Mode Selection (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Action Mode Toggle */}
          <div className="bg-[#181614] border border-amber-950/50 rounded-xl p-4 shadow-sm space-y-3">
            <label className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold block">
              Editorial Objective
            </label>
            <div className="grid grid-cols-1 gap-2 text-xs">
              {[
                {
                  id: "proofread" as const,
                  title: "Developmental & Line Proofreading",
                  desc: "Critique, flaw detection, and publication-ready prose rewrite",
                },
                {
                  id: "extend" as const,
                  title: "Narrative Continuation & Extension",
                  desc: "Pick up seamlessly from the final sentence and escalate tension",
                },
                {
                  id: "sequel_forge" as const,
                  title: "Franchise Sequel Forge (Book 2 Architecture)",
                  desc: "Trace surviving characters, unresolved lore & generate full 12-chapter sequel",
                },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setAction(btn.id)}
                  className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    action === btn.id
                      ? "bg-amber-950/60 border-amber-600/70 text-amber-100 shadow-sm"
                      : "bg-stone-900/40 hover:bg-stone-900/80 border-stone-800 text-stone-400"
                  }`}
                >
                  <div className="font-semibold text-stone-200">{btn.title}</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">{btn.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Manuscript Input & File Drop */}
          <div className="bg-[#181614] border border-amber-950/50 rounded-xl p-4 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-stone-300 font-medium">Document / Excerpt Title</label>
              <label className="cursor-pointer text-amber-400 hover:text-amber-300 font-medium flex items-center space-x-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload .txt or .md</span>
                <input
                  type="file"
                  accept=".txt,.md,.markdown"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-600 focus:outline-none"
              placeholder="e.g. Chapter 4 Draft / Book 1 Finale"
            />

            <div>
              <label className="text-stone-300 font-medium block mb-1">
                Manuscript Text or Outline
              </label>
              <textarea
                rows={7}
                value={contentToProcess}
                onChange={(e) => setContentToProcess(e.target.value)}
                placeholder="Paste your rough chapter, manuscript excerpt, or story outline here..."
                className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-600 focus:outline-none resize-none leading-relaxed font-serif text-xs"
              />
            </div>

            <div>
              <label className="text-stone-300 font-medium block mb-1">
                Specific Author Notes or Focus (Optional)
              </label>
              <input
                type="text"
                value={authorNotes}
                onChange={(e) => setAuthorNotes(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-600 focus:outline-none"
                placeholder="e.g. Tighten pacing; fix passive voice; ensure Corin's secret is protected"
              />
            </div>

            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/40 disabled:opacity-50 transition-all cursor-pointer mt-1"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Manuscript...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {action === "proofread"
                      ? "Proofread & Polish Manuscript"
                      : action === "extend"
                      ? "Extend Narrative Seamlessly"
                      : "Forge Franchise Sequel"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Analysis & Output Display (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="bg-[#181614] border border-amber-950/50 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[600px]">
              
              {/* Output Tab Selector */}
              <div className="border-b border-amber-950/40 p-3 bg-stone-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex space-x-1">
                  {action === "proofread" && (
                    <>
                      <button
                        onClick={() => setActiveTab("critique")}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                          activeTab === "critique"
                            ? "bg-amber-900/60 text-amber-200 font-semibold"
                            : "text-stone-400 hover:text-stone-300"
                        }`}
                      >
                        Developmental Critique
                      </button>
                      <button
                        onClick={() => setActiveTab("polished")}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                          activeTab === "polished"
                            ? "bg-amber-900/60 text-amber-200 font-semibold"
                            : "text-stone-400 hover:text-stone-300"
                        }`}
                      >
                        Polished Manuscript
                      </button>
                    </>
                  )}

                  {action === "extend" && (
                    <button
                      onClick={() => setActiveTab("polished")}
                      className="px-3 py-1.5 rounded-lg bg-amber-900/60 text-amber-200 font-semibold"
                    >
                      Extended Prose
                    </button>
                  )}

                  {action === "sequel_forge" && (
                    <button
                      onClick={() => setActiveTab("sequel")}
                      className="px-3 py-1.5 rounded-lg bg-amber-900/60 text-amber-200 font-semibold"
                    >
                      Sequel Architecture
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      handleCopy(
                        action === "proofread"
                          ? result.polishedText || result.critique
                          : action === "extend"
                          ? result.extendedText
                          : JSON.stringify(result, null, 2)
                      )
                    }
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-[11px]"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>

                  {action === "proofread" && result.polishedText && (
                    <button
                      onClick={handleApplyPolishedToChapter}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-[11px]"
                    >
                      <BookPlus className="w-3 h-3" />
                      <span>Add as Chapter</span>
                    </button>
                  )}

                  {action === "sequel_forge" && (
                    <button
                      onClick={() => onCreateSequelProject(result)}
                      className="flex items-center space-x-1 px-3 py-1 rounded bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-[11px]"
                    >
                      <GitFork className="w-3 h-3" />
                      <span>Launch Book 2 Project</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="p-6 flex-1 overflow-y-auto bg-[#141210] space-y-6">
                
                {/* 1. Critique Tab */}
                {activeTab === "critique" && (
                  <div className="space-y-6 text-xs">
                    <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 space-y-2">
                      <h4 className="font-mono text-amber-400 font-bold uppercase text-[11px]">
                        Developmental & Thematic Assessment
                      </h4>
                      <p className="text-sm text-stone-200 leading-relaxed font-serif">
                        {result.critique}
                      </p>
                    </div>

                    {result.strengths && result.strengths.length > 0 && (
                      <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 space-y-2">
                        <h4 className="font-mono text-emerald-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Narrative Strengths</span>
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-stone-300">
                          {result.strengths.map((str: string, i: number) => (
                            <li key={i}>{str}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.corrections && result.corrections.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-mono text-amber-400 font-bold uppercase text-[11px]">
                          Line-Level Editorial Fixes ({result.corrections.length})
                        </h4>
                        <div className="space-y-2">
                          {result.corrections.map((corr: any, i: number) => (
                            <div key={i} className="bg-stone-900/50 border border-stone-800 rounded-lg p-3 space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-mono">
                                <span className="uppercase text-amber-500 font-semibold">[{corr.type}]</span>
                                <span className="text-stone-500">{corr.reason}</span>
                              </div>
                              <div className="text-stone-400 line-through text-[11px]">{corr.original}</div>
                              <div className="text-emerald-300 font-medium text-[11px]">→ {corr.suggestion}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Polished / Extended Text Tab */}
                {activeTab === "polished" && (
                  <div className="prose prose-invert max-w-none prose-amber font-serif text-base leading-relaxed">
                    <Markdown>{result.polishedText || result.extendedText}</Markdown>
                  </div>
                )}

                {/* 3. Sequel Forge Tab */}
                {activeTab === "sequel" && (
                  <div className="space-y-6 text-xs font-sans">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-amber-950/50 to-stone-900/70 border border-amber-700/40 rounded-xl p-5 space-y-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-900 text-amber-200">
                        Official Sequel Blueprint
                      </span>
                      <h3 className="text-2xl font-bold font-serif text-amber-100">
                        {result.sequelTitle}
                      </h3>
                      <p className="text-stone-300 text-sm font-serif italic">
                        "{result.logline}"
                      </p>
                      {result.incitingIncident && (
                        <div className="pt-2 text-stone-400 border-t border-amber-900/40 text-[11px]">
                          <strong className="text-amber-300">New Catalyst:</strong> {result.incitingIncident}
                        </div>
                      )}
                    </div>

                    {/* Surviving Characters */}
                    {result.survivingCharacters && (
                      <div className="space-y-3">
                        <h4 className="font-mono text-amber-400 font-bold uppercase text-[11px]">
                          Surviving Character Trajectories in Book 2
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {result.survivingCharacters.map((char: any, i: number) => (
                            <div key={i} className="bg-stone-900/60 border border-stone-800 rounded-lg p-3 space-y-1">
                              <div className="font-bold text-amber-200 text-sm">{char.name}</div>
                              <div className="text-stone-400 text-[11px]">
                                <strong>Aftermath:</strong> {char.arcAfterBook1}
                              </div>
                              <div className="text-amber-400/90 text-[11px]">
                                <strong>Sequel Conflict:</strong> {char.sequelConflict}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Unresolved Lore */}
                    {result.unresolvedLoreCarryovers && (
                      <div className="bg-stone-900/40 border border-stone-800 rounded-xl p-4 space-y-2">
                        <h4 className="font-mono text-amber-400 font-bold uppercase text-[11px]">
                          Unresolved Mysteries & Lore Carryovers
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-stone-300">
                          {result.unresolvedLoreCarryovers.map((lore: string, i: number) => (
                            <li key={i}>{lore}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 3-Act Structure */}
                    {result.threeActBreakdown && (
                      <div className="space-y-3">
                        <h4 className="font-mono text-amber-400 font-bold uppercase text-[11px]">
                          Three-Act Narrative Structure
                        </h4>
                        <div className="space-y-2">
                          <div className="bg-stone-900/50 p-3 rounded-lg border border-stone-800">
                            <span className="text-amber-300 font-bold font-mono">Act I (Setup & Escalation):</span>
                            <p className="text-stone-300 mt-1 leading-relaxed">{result.threeActBreakdown.actOne}</p>
                          </div>
                          <div className="bg-stone-900/50 p-3 rounded-lg border border-stone-800">
                            <span className="text-amber-300 font-bold font-mono">Act II (The Crucible & Midpoint):</span>
                            <p className="text-stone-300 mt-1 leading-relaxed">{result.threeActBreakdown.actTwo}</p>
                          </div>
                          <div className="bg-stone-900/50 p-3 rounded-lg border border-stone-800">
                            <span className="text-amber-300 font-bold font-mono">Act III (Climax & Resolution):</span>
                            <p className="text-stone-300 mt-1 leading-relaxed">{result.threeActBreakdown.actThree}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Chapter Roadmap */}
                    {result.chapterRoadmap && result.chapterRoadmap.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-mono text-amber-400 font-bold uppercase text-[11px]">
                          12-Chapter Sequel Roadmap
                        </h4>
                        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                          {result.chapterRoadmap.map((ch: any) => (
                            <div key={ch.chapterNumber} className="bg-stone-900/60 p-3 rounded-lg border border-stone-800 text-xs space-y-1">
                              <div className="font-bold text-amber-200">
                                Chapter {ch.chapterNumber}: {ch.title}
                              </div>
                              <p className="text-stone-400 leading-relaxed text-[11px]">
                                {ch.synopsis}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#181614] border border-dashed border-stone-800 rounded-xl p-12 text-center text-stone-400 space-y-3">
              <FileSearch className="w-12 h-12 text-stone-700 mx-auto" />
              <h3 className="font-serif text-lg text-stone-300">Editorial Engine Ready</h3>
              <p className="text-xs max-w-sm mx-auto text-stone-400">
                Upload or paste manuscript text, choose your objective (proofread, extend, or sequel forge), and click to generate deep developmental analysis or new prose.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
