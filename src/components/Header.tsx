import React from "react";
import { NovelProject } from "@/src/models/domain";
import { 
  BookOpen, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Save, 
  ExternalLink,
  Feather
} from "lucide-react";

interface HeaderProps {
  project: NovelProject;
  onUpdateProject: (updates: Partial<NovelProject>) => void;
  onSave: () => void;
  isSaving: boolean;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onUpdateProject,
  onSave,
  isSaving,
}) => {
  const totalWords = project.chapters.reduce(
    (acc, ch) => acc + (ch.wordCount || ch.content.split(/\s+/).filter(Boolean).length),
    0
  );

  const latestReflection = project.reflections[project.reflections.length - 1];
  const focusScore = latestReflection ? latestReflection.focusScore : 94;

  return (
    <header className="border-b border-amber-900/30 bg-[#121110] text-[#e8e4dc] sticky top-0 z-30 shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 via-amber-700 to-amber-950 flex items-center justify-center shadow-lg shadow-amber-950/50 border border-amber-500/30">
              <Feather className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-xl tracking-wide text-amber-100 flex items-center gap-1.5">
                  WorthWyl <span className="text-amber-400 font-sans text-xs uppercase px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 font-semibold tracking-wider">Writer</span>
                </span>
                <span className="hidden md:inline-block text-xs text-amber-300/60 font-mono">v3.4 Publishing Suite</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-stone-400">
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => onUpdateProject({ title: e.target.value })}
                  className="bg-transparent border-b border-transparent hover:border-amber-700/50 focus:border-amber-500 focus:outline-none text-stone-300 font-medium truncate max-w-[200px] sm:max-w-[280px]"
                  title="Click to rename novel"
                />
                <span className="text-stone-600">•</span>
                <span className="truncate max-w-[120px] text-stone-400 hidden sm:inline">{project.author}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hidden lg:flex items-center space-x-6 text-xs text-stone-300 font-mono">
            <div className="flex items-center space-x-2 bg-stone-900/70 border border-stone-800 px-3 py-1.5 rounded-md">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>{project.chapters.length} Chapters</span>
              <span className="text-stone-600">|</span>
              <span className="text-amber-200 font-semibold">~{totalWords.toLocaleString()} words</span>
            </div>

            <div className="flex items-center space-x-2 bg-stone-900/70 border border-stone-800 px-3 py-1.5 rounded-md" title="Episodic continuity focus rating">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Continuity:</span>
              <span className="text-emerald-400 font-bold">{focusScore}% Focus</span>
            </div>

            <div className="flex items-center space-x-2 bg-stone-900/70 border border-stone-800 px-3 py-1.5 rounded-md">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span className="capitalize">{project.mode}</span>
            </div>
          </div>

          {/* Actions: Save & Amazon KDP Quick Link */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <a
              href="https://kdp.amazon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-amber-200 bg-amber-950/60 hover:bg-amber-900/70 border border-amber-700/50 transition-colors shadow-sm"
              title="Go to Amazon Kindle Direct Publishing"
            >
              <span>Amazon KDP</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-stone-950 transition-colors shadow disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Project"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
