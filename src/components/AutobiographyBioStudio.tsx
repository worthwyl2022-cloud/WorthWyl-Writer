import React, { useState } from "react";
import { NovelProject, BioItem } from "@/src/models/domain";
import Markdown from "react-markdown";
import { 
  UserCheck, 
  Sparkles, 
  Copy, 
  Check, 
  BookOpen, 
  Calendar, 
  Feather, 
  Tag, 
  ArrowRight,
  Plus
} from "lucide-react";

interface AutobiographyBioStudioProps {
  project: NovelProject;
  onUpdateProject: (updates: Partial<NovelProject>) => void;
  onInsertChapterFromBio: (title: string, content: string) => void;
}

export const AutobiographyBioStudio: React.FC<AutobiographyBioStudioProps> = ({
  project,
  onUpdateProject,
  onInsertChapterFromBio,
}) => {
  const [bioType, setBioType] = useState<
    "memoir_chapter" | "kdp_author_bio" | "jacket_bio" | "life_timeline" | "goodreads_bio"
  >("memoir_chapter");

  const [authorName, setAuthorName] = useState<string>(project.author || "Wyl Worthy");
  const [lifeEvents, setLifeEvents] = useState<string>(
    "Grew up between two divergent worlds: industrial rail yards and a family of traditional storytellers. Survived severe illness in early twenties which sparked a life-long pursuit of cartography, forgotten history, and independent technology."
  );
  const [themes, setThemes] = useState<string>(
    "Resilience, the weight of inherited memory, triumph over systemic odds, the architecture of solitude"
  );
  const [voice, setVoice] = useState<string>(
    "Evocative, raw, vulnerable yet luminous with hope, literary clarity"
  );
  const [timePeriod, setTimePeriod] = useState<string>("Late 1990s - Early 2010s");

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedResult, setGeneratedResult] = useState<BioItem | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [insertedToBook, setInsertedToBook] = useState<boolean>(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setInsertedToBook(false);
    try {
      const response = await fetch("/api/generate-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bioType,
          authorName,
          lifeEvents,
          themes,
          voice,
          timePeriod,
        }),
      });

      const data = await response.json();
      if (!data.success || !data.bio) {
        throw new Error(data.error || "Failed to generate biography");
      }
      setGeneratedResult(data.bio);
    } catch (err: any) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertAsChapter = () => {
    if (!generatedResult) return;
    onInsertChapterFromBio(
      generatedResult.title || "Memoir Chapter",
      generatedResult.content
    );
    setInsertedToBook(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1c1815] via-[#161412] to-[#121110] border border-amber-800/40 rounded-xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-amber-900/60 text-amber-300 border border-amber-700/50">
                Biographical & Memoir Engine
              </span>
              <span className="text-xs text-stone-400 font-mono">Personal Lore & Author Branding</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100">
              Autobiography & Author Persona Studio
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl leading-relaxed">
              Transform lived experiences, crucible milestones, and family histories into moving autobiography chapters, structured memoir outlines, or high-converting Amazon Author Central biographies.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form & Mode Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Format Selector */}
          <div className="bg-[#181614] border border-amber-950/50 rounded-xl p-4 shadow-sm space-y-3">
            <label className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold block">
              Select Output Format
            </label>
            <div className="grid grid-cols-1 gap-2 text-xs">
              {[
                {
                  id: "memoir_chapter" as const,
                  title: "Full Memoir / Autobiography Chapter",
                  desc: "Lyrical, narrative prose of a lived era or milestone",
                },
                {
                  id: "life_timeline" as const,
                  title: "Life Milestones to 10-Chapter Book Outline",
                  desc: "Structured autobiography outline with thematic chapters",
                },
                {
                  id: "kdp_author_bio" as const,
                  title: "Amazon KDP Author Central Bio",
                  desc: "Credibility, storytelling voice, and reader engagement",
                },
                {
                  id: "jacket_bio" as const,
                  title: "Book Jacket / Back Cover Bio",
                  desc: "120-word punchy blurb for print paperback & hardcover",
                },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setBioType(fmt.id)}
                  className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    bioType === fmt.id
                      ? "bg-amber-950/60 border-amber-600/70 text-amber-100 shadow-sm"
                      : "bg-stone-900/40 hover:bg-stone-900/80 border-stone-800 text-stone-400"
                  }`}
                >
                  <div className="font-semibold text-stone-200">{fmt.title}</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">{fmt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Memoir Data Input Card */}
          <div className="bg-[#181614] border border-amber-950/50 rounded-xl p-4 shadow-sm space-y-3.5 text-xs">
            <div>
              <label className="text-stone-300 font-medium block mb-1">Subject / Author Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-stone-300 font-medium block mb-1">
                Life Events, Crucible Memories or Raw Milestones
              </label>
              <textarea
                rows={5}
                value={lifeEvents}
                onChange={(e) => setLifeEvents(e.target.value)}
                placeholder="Detail key memories, turning points, mentors, hardships, victories, sensory memories..."
                className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-600 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="text-stone-300 font-medium block mb-1">Thematic Pillars</label>
              <input
                type="text"
                value={themes}
                onChange={(e) => setThemes(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-600 focus:outline-none"
                placeholder="e.g. Identity, reconciliation, grit, family secrets"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-stone-300 font-medium block mb-1">Era / Timeframe</label>
                <input
                  type="text"
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-600 focus:outline-none"
                  placeholder="e.g. 1985-2000"
                />
              </div>
              <div>
                <label className="text-stone-300 font-medium block mb-1">Prose Voice</label>
                <input
                  type="text"
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-600 focus:outline-none"
                  placeholder="e.g. Vulnerable, lyrical"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/40 disabled:opacity-50 transition-all cursor-pointer mt-2"
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Generating Biographical Work...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate {bioType === "memoir_chapter" ? "Memoir Chapter" : "Author Bio"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Generated Preview & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {generatedResult ? (
            <div className="bg-[#181614] border border-amber-950/50 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[580px]">
              
              {/* Header */}
              <div className="border-b border-amber-950/40 p-4 bg-stone-900/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    {bioType.replace(/_/g, " ")}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-amber-100 mt-1">
                    {generatedResult.title || authorName}
                  </h3>
                  {generatedResult.tagline && (
                    <p className="text-xs text-amber-400/80 italic mt-0.5">
                      "{generatedResult.tagline}"
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>

                  {bioType === "memoir_chapter" && (
                    <button
                      onClick={handleInsertAsChapter}
                      disabled={insertedToBook}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{insertedToBook ? "Added to Novel" : "Add as Chapter"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Tag Strip */}
              {generatedResult.suggestedThemes && generatedResult.suggestedThemes.length > 0 && (
                <div className="px-6 py-2 bg-stone-950/40 border-b border-stone-900 flex flex-wrap gap-1.5 text-[11px]">
                  {generatedResult.suggestedThemes.map((thm, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-stone-900 text-amber-300/80 border border-stone-800 font-mono">
                      #{thm}
                    </span>
                  ))}
                </div>
              )}

              {/* Content Prose */}
              <div className="p-6 flex-1 overflow-y-auto bg-[#141210]">
                <div className="prose prose-invert max-w-none prose-amber font-serif text-base leading-relaxed">
                  <Markdown>{generatedResult.content}</Markdown>
                </div>

                {/* Milestones if timeline */}
                {generatedResult.timelineMilestones && generatedResult.timelineMilestones.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-stone-800/80 space-y-3 font-sans">
                    <h4 className="font-serif font-bold text-amber-200 text-sm">
                      Autobiographical Chapter Outline
                    </h4>
                    <div className="space-y-2">
                      {generatedResult.timelineMilestones.map((ms, i) => (
                        <div key={i} className="bg-stone-900/50 p-3 rounded-lg border border-stone-800 text-xs space-y-1">
                          <div className="flex items-center justify-between text-amber-400 font-mono text-[11px]">
                            <span>Chapter {i + 1}: {ms.title}</span>
                            <span>{ms.era}</span>
                          </div>
                          <p className="text-stone-300 text-[11px] leading-relaxed">
                            {ms.narrativeSignificance}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#181614] border border-dashed border-stone-800 rounded-xl p-12 text-center text-stone-400 space-y-3">
              <UserCheck className="w-12 h-12 text-stone-700 mx-auto" />
              <h3 className="font-serif text-lg text-stone-300">Biographical Studio Ready</h3>
              <p className="text-xs max-w-sm mx-auto text-stone-400">
                Choose a biography format, fill in key memories or life themes, and click Generate to produce publication-grade memoir prose or Amazon author profiles.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
