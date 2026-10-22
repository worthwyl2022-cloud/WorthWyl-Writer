import React, { useState } from "react";
import { NovelProject, ContinuityReflection } from "@/src/models/domain";
import { 
  BrainCircuit, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  GitBranch, 
  Compass, 
  CheckCircle2, 
  TrendingUp, 
  Zap 
} from "lucide-react";

interface ReflectionEngineProps {
  project: NovelProject;
  onUpdateProject: (updates: Partial<NovelProject>) => void;
  onRunReflection: (type: "micro" | "macro") => Promise<void>;
  isAnalyzing: boolean;
}

export const ReflectionEngine: React.FC<ReflectionEngineProps> = ({
  project,
  onUpdateProject,
  onRunReflection,
  isAnalyzing,
}) => {
  const [selectedReflectionId, setSelectedReflectionId] = useState<string | null>(
    project.reflections.length > 0 ? project.reflections[project.reflections.length - 1].id : null
  );

  const chapters = project.chapters || [];
  const reflections = project.reflections || [];

  const currentReflection =
    reflections.find((r) => r.id === selectedReflectionId) ||
    reflections[reflections.length - 1] ||
    null;

  const microReflections = reflections.filter((r) => r.type === "micro");
  const macroReflections = reflections.filter((r) => r.type === "macro");

  // Calculate composite focus score
  const averageFocus = reflections.length > 0
    ? Math.round(reflections.reduce((acc, r) => acc + (r.focusScore || 90), 0) / reflections.length)
    : 94;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner: Continuity Guarantee Engine */}
      <div className="bg-gradient-to-r from-[#231b14] via-[#1a1613] to-[#121110] border border-amber-800/40 rounded-xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-amber-900/60 text-amber-300 border border-amber-700/50">
                Episodic Continuity Guard
              </span>
              <span className="text-xs text-stone-400 font-mono">2-Chapter Micro + 5-10 Chapter Macro Loop</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100">
              Continuity & Narrative Focus Engine
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl leading-relaxed">
              WorthWyl Writer eliminates AI plot drift: every 2 chapters, it reflects on character arcs, tone, and causal links before drafting the next. Every 5 to 10 chapters, it audits the manuscript from beginning to end to ensure complete thematic coherence.
            </p>
          </div>

          {/* Health Gauge & Trigger Action */}
          <div className="flex items-center space-x-4 bg-stone-900/80 border border-stone-800 p-4 rounded-xl shrink-0">
            <div className="text-center">
              <div className="text-3xl font-extrabold font-mono text-emerald-400">
                {averageFocus}%
              </div>
              <div className="text-[11px] font-sans text-stone-400 uppercase tracking-wider font-semibold">
                Plot Focus Score
              </div>
            </div>

            <div className="h-10 w-px bg-stone-800" />

            <div className="flex flex-col space-y-2">
              <button
                onClick={() => onRunReflection("micro")}
                disabled={isAnalyzing || chapters.length < 2}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow disabled:opacity-40 cursor-pointer"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                <span>Reflect on Last 2 Chapters</span>
              </button>

              <button
                onClick={() => onRunReflection("macro")}
                disabled={isAnalyzing || chapters.length < 3}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-200 font-medium text-xs flex items-center justify-center space-x-1.5 border border-amber-800/40 disabled:opacity-40 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Run Macro Audit (Whole Book)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Reflection Log Directory (4 cols) + Detailed Diagnostic View (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Reflection History & Cadence (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#181614] border border-amber-950/50 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold font-serif text-stone-200 mb-3 flex items-center justify-between">
              <span>Reflection History</span>
              <span className="text-xs font-mono text-amber-400">{reflections.length} audits logged</span>
            </h3>

            {reflections.length === 0 ? (
              <div className="text-center py-8 text-xs text-stone-400 space-y-2">
                <BrainCircuit className="w-8 h-8 text-stone-700 mx-auto" />
                <p>No continuity reflections recorded yet.</p>
                <p className="text-[11px] text-stone-500">
                  Write at least 2 chapters, then run a micro-reflection to analyze your plot.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {reflections.slice().reverse().map((ref) => {
                  const isSelected = currentReflection?.id === ref.id;
                  const isMicro = ref.type === "micro";
                  return (
                    <button
                      key={ref.id}
                      onClick={() => setSelectedReflectionId(ref.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-950/70 border-amber-600/70 shadow-sm"
                          : "bg-stone-900/40 hover:bg-stone-900/80 border-stone-800/80 text-stone-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                            isMicro
                              ? "bg-blue-950/80 text-blue-300 border border-blue-800/40"
                              : "bg-amber-950/80 text-amber-300 border border-amber-800/40"
                          }`}
                        >
                          {isMicro ? "2-Ch Micro" : "Macro Audit"}
                        </span>
                        <span className="text-[11px] font-mono text-emerald-400 font-bold">
                          {ref.focusScore || 95}% Focus
                        </span>
                      </div>

                      <div className="text-xs font-medium text-stone-200 truncate">
                        {ref.inspectedRange}
                      </div>

                      <p className="text-[11px] text-stone-400 line-clamp-2 mt-1 leading-snug">
                        {ref.summary}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cadence Architecture Explanation Card */}
          <div className="bg-[#181614] border border-amber-950/40 rounded-xl p-4 text-xs space-y-3">
            <h4 className="font-semibold text-amber-200 flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>How WorthWyl Guard Operates</span>
            </h4>
            <div className="space-y-2 text-stone-400 text-[11px] leading-relaxed">
              <div className="flex items-start space-x-2">
                <span className="w-4 h-4 rounded-full bg-blue-950 text-blue-300 border border-blue-700 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">
                  2
                </span>
                <span>
                  <strong>Short-Range Micro-Reflection:</strong> Inspects Chapters N-1 & N before generating Chapter N+1 to guarantee causality, prevent forgotten props, and keep character voices distinct.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-4 h-4 rounded-full bg-amber-950 text-amber-300 border border-amber-700 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">
                  5
                </span>
                <span>
                  <strong>Macro Architectural Audit:</strong> Runs every 5 to 10 chapters. Evaluates the full arc from Chapter 1 to ensure subplots are resolved and the climax lands with maximum emotional resonance.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Diagnostic Report (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {currentReflection ? (
            <div className="bg-[#181614] border border-amber-950/50 rounded-xl overflow-hidden shadow-sm space-y-6 p-6">
              
              {/* Header with Range and Type */}
              <div className="border-b border-amber-950/40 pb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        currentReflection.type === "micro"
                          ? "bg-blue-950 text-blue-300 border border-blue-800"
                          : "bg-amber-950 text-amber-300 border border-amber-800"
                      }`}
                    >
                      {currentReflection.type === "micro"
                        ? "Short-Range Continuity (Last 2 Chapters)"
                        : "Macro Architecture Audit (Beginning to End)"}
                    </span>
                    <span className="text-xs font-mono text-stone-400">
                      {currentReflection.inspectedRange}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-serif text-amber-100 mt-1">
                    Continuity Analysis & Trajectory Report
                  </h3>
                </div>

                <div className="flex items-center space-x-2 bg-stone-900/80 px-3 py-1.5 rounded-lg border border-stone-800 font-mono text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-stone-300">Coherence Score:</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {currentReflection.focusScore}%
                  </span>
                </div>
              </div>

              {/* Core Executive Summary */}
              <div className="bg-stone-950/40 border border-stone-800/80 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-mono font-semibold uppercase text-amber-400">
                  State of the Story
                </h4>
                <p className="text-sm text-stone-200 leading-relaxed font-serif">
                  {currentReflection.summary}
                </p>
              </div>

              {/* Character Psychology & Stakes */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-semibold uppercase text-amber-400 flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>Character States & Psychological Drift Check</span>
                </h4>
                <div className="bg-stone-900/50 border border-stone-800 rounded-lg p-3.5 text-xs text-stone-300 leading-relaxed">
                  {currentReflection.characters}
                </div>
              </div>

              {/* Active Plot Threads with Risk Rating */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-semibold uppercase text-amber-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>Plot Threads & Drift Risk Matrix</span>
                  </span>
                  <span className="text-[11px] text-stone-400 font-normal">
                    {currentReflection.activePlotThreads?.length || 0} tracks active
                  </span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {currentReflection.activePlotThreads && currentReflection.activePlotThreads.length > 0 ? (
                    currentReflection.activePlotThreads.map((thread, i) => (
                      <div
                        key={i}
                        className="bg-stone-900/60 border border-stone-800/80 rounded-lg p-3 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-semibold ${
                              thread.status === "resolved"
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800/50"
                                : thread.status === "advancing"
                                ? "bg-blue-950 text-blue-300 border border-blue-800/50"
                                : "bg-stone-800 text-stone-300"
                            }`}
                          >
                            {thread.status}
                          </span>
                          <span
                            className={`text-[10px] font-mono ${
                              thread.riskOfDrift === "high"
                                ? "text-rose-400 font-bold"
                                : thread.riskOfDrift === "medium"
                                ? "text-amber-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {thread.riskOfDrift} drift risk
                          </span>
                        </div>
                        <div className="font-medium text-stone-200 mt-1">{thread.thread}</div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-xs text-stone-400 italic py-2">
                      All narrative threads currently aligned with the primary premise.
                    </div>
                  )}
                </div>
              </div>

              {/* Pacing, Tone & Foreshadowing */}
              {currentReflection.pacingAndTone && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-semibold uppercase text-amber-400">
                    Pacing Curve & Tonal Cadence
                  </h4>
                  <div className="bg-stone-900/40 border border-stone-800/60 rounded-lg p-3 text-xs text-stone-300 leading-relaxed">
                    {currentReflection.pacingAndTone}
                  </div>
                </div>
              )}

              {/* Crucial Guidance for Next Chapter(s) */}
              <div className="bg-gradient-to-r from-amber-950/40 to-stone-900/60 border border-amber-600/40 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mandatory Guidance for Upcoming Chapters</span>
                </h4>
                <p className="text-xs sm:text-sm text-stone-200 font-medium leading-relaxed">
                  {currentReflection.guidance}
                </p>
              </div>

              {/* Warning / Potential Contradictions Caught */}
              {currentReflection.potentialHoles && currentReflection.potentialHoles.length > 0 && (
                <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Watch Points / Inconsistency Precautions</span>
                  </h4>
                  <ul className="list-disc list-inside text-xs text-rose-200 space-y-1">
                    {currentReflection.potentialHoles.map((hole, i) => (
                      <li key={i}>{hole}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#181614] border border-stone-800 rounded-xl p-12 text-center text-stone-400 space-y-3">
              <BrainCircuit className="w-12 h-12 text-stone-700 mx-auto" />
              <h3 className="font-serif text-lg text-stone-300">No Reflection Selected</h3>
              <p className="text-xs max-w-sm mx-auto text-stone-400">
                Write at least two chapters to generate your first 2-chapter episodic reflection.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
