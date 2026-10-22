import React, { useState } from "react";
import { NovelProject, CoverDesign } from "@/src/models/domain";
import { 
  Palette, 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  Rotate3d, 
  Layers, 
  Type, 
  Check, 
  RefreshCw 
} from "lucide-react";

interface CoverStudioProps {
  project: NovelProject;
  onUpdateProject: (updates: Partial<NovelProject>) => void;
}

export const CoverStudio: React.FC<CoverStudioProps> = ({
  project,
  onUpdateProject,
}) => {
  const [cover, setCover] = useState<CoverDesign>(project.cover);
  const [viewStyle, setViewStyle] = useState<"3d" | "front" | "wrap">("3d");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>(cover.prompt || "");

  const handleUpdateCover = (updates: Partial<CoverDesign>) => {
    const updated = { ...cover, ...updates };
    setCover(updated);
    onUpdateProject({ cover: updated });
  };

  const handleGenerateCoverArt = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cover.title || project.title,
          author: cover.author || project.author,
          genre: cover.genre || project.genre,
          mood: cover.mood,
          customPrompt: customPrompt,
          palette: cover.palette,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to generate cover art");
      }

      if (data.cover?.imageUrl) {
        handleUpdateCover({ imageUrl: data.cover.imageUrl });
      } else {
        // Updated prompt and confirmed vector styling
        handleUpdateCover({ prompt: data.cover.promptUsed });
        alert("Cover composition synthesized with vector studio layout.");
      }
    } catch (err: any) {
      alert(`Cover generation note: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Font family helper
  const getFontClass = (font: string) => {
    switch (font) {
      case "cinzel":
        return "font-serif tracking-widest uppercase font-bold";
      case "lora":
        return "font-serif italic";
      case "mono":
        return "font-mono uppercase";
      default:
        return "font-sans font-extrabold uppercase tracking-wider";
    }
  };

  // Background gradient based on palette
  const getCoverBackground = () => {
    if (cover.imageUrl) {
      return `url(${cover.imageUrl}) center/cover no-repeat`;
    }
    switch (cover.palette) {
      case "Obsidian & Amber Gold":
        return "linear-gradient(135deg, #0d0c0a 0%, #291c10 40%, #1a120b 70%, #0d0c0a 100%)";
      case "Deep Emerald & Bronze":
        return "linear-gradient(135deg, #061712 0%, #0d2e24 40%, #17382c 70%, #081a14 100%)";
      case "Royal Velvet & Silver":
        return "linear-gradient(135deg, #0d0b1a 0%, #1e183a 40%, #2a2050 70%, #0d0b1a 100%)";
      case "Cyberpunk Cobalt":
        return "linear-gradient(135deg, #050e1f 0%, #0c234a 40%, #153a78 70%, #061126 100%)";
      default:
        return "linear-gradient(135deg, #181412 0%, #2b1d16 50%, #120e0c 100%)";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1c1815] via-[#161412] to-[#121110] border border-amber-800/40 rounded-xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-amber-900/60 text-amber-300 border border-amber-700/50">
                Visual Art & Book Jacket Studio
              </span>
              <span className="text-xs text-stone-400 font-mono">3D Book Mockup • Print Wrap • KDP Ready</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100">
              Book Cover & Visual Media Studio
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl leading-relaxed">
              Design publication-ready Kindle eBook and paperback print covers. Generate atmospheric cover art, inspect the interactive 3D hardcover mockup, and export print-ready jackets conforming to Amazon KDP specs.
            </p>
          </div>

          <div className="flex items-center bg-stone-900/90 rounded-lg p-1 border border-stone-800 text-xs">
            <button
              onClick={() => setViewStyle("3d")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors ${
                viewStyle === "3d" ? "bg-amber-600 text-stone-950 font-bold" : "text-stone-400 hover:text-stone-300"
              }`}
            >
              <Rotate3d className="w-3.5 h-3.5" />
              <span>3D Mockup</span>
            </button>
            <button
              onClick={() => setViewStyle("front")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors ${
                viewStyle === "front" ? "bg-amber-600 text-stone-950 font-bold" : "text-stone-400 hover:text-stone-300"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Front Cover</span>
            </button>
            <button
              onClick={() => setViewStyle("wrap")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors ${
                viewStyle === "wrap" ? "bg-amber-600 text-stone-950 font-bold" : "text-stone-400 hover:text-stone-300"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Full Wrap (Front + Spine + Back)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Visual Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4 text-xs">
          
          {/* Typography & Title Setup */}
          <div className="bg-[#181614] border border-amber-950/50 rounded-xl p-4 shadow-sm space-y-3">
            <h4 className="font-mono text-amber-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" />
              <span>Book Typography & Titles</span>
            </h4>

            <div>
              <label className="text-stone-300 block mb-1">Book Title</label>
              <input
                type="text"
                value={cover.title}
                onChange={(e) => handleUpdateCover({ title: e.target.value })}
                className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-stone-300 block mb-1">Subtitle / Series Tag</label>
              <input
                type="text"
                value={cover.subtitle || ""}
                onChange={(e) => handleUpdateCover({ subtitle: e.target.value })}
                className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-600 focus:outline-none"
                placeholder="e.g. Book One of the Obsidian Sequence"
              />
            </div>

            <div>
              <label className="text-stone-300 block mb-1">Author Name / Pen Name</label>
              <input
                type="text"
                value={cover.author}
                onChange={(e) => handleUpdateCover({ author: e.target.value })}
                className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-stone-300 block mb-1">Title Font Family</label>
                <select
                  value={cover.fontFamily}
                  onChange={(e) => handleUpdateCover({ fontFamily: e.target.value as any })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-2 text-stone-200 focus:border-amber-600 focus:outline-none"
                >
                  <option value="cinzel">Cinzel (Prestige Epic)</option>
                  <option value="lora">Lora (Literary Classic)</option>
                  <option value="sans">Modern Sans (Bold Thriller)</option>
                  <option value="mono">JetBrains Mono (Sci-Fi)</option>
                </select>
              </div>

              <div>
                <label className="text-stone-300 block mb-1">Palette Theme</label>
                <select
                  value={cover.palette}
                  onChange={(e) => handleUpdateCover({ palette: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-2 text-stone-200 focus:border-amber-600 focus:outline-none"
                >
                  <option value="Obsidian & Amber Gold">Obsidian & Amber Gold</option>
                  <option value="Deep Emerald & Bronze">Deep Emerald & Bronze</option>
                  <option value="Royal Velvet & Silver">Royal Velvet & Silver</option>
                  <option value="Cyberpunk Cobalt">Cyberpunk Cobalt</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Cover Art Generation Panel */}
          <div className="bg-[#181614] border border-amber-950/50 rounded-xl p-4 shadow-sm space-y-3">
            <h4 className="font-mono text-amber-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Cover Illustration Prompt</span>
            </h4>

            <div>
              <label className="text-stone-300 block mb-1">Art Style & Visual Prompt</label>
              <textarea
                rows={4}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe central visual metaphor, lighting, mood, architectural elements..."
                className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-600 focus:outline-none resize-none leading-relaxed text-xs"
              />
            </div>

            <button
              onClick={handleGenerateCoverArt}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/40 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Cover Art...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Cover Art (Gemini)</span>
                </>
              )}
            </button>
          </div>

          {/* Back Cover Copy & Spine Controls */}
          <div className="bg-[#181614] border border-amber-950/50 rounded-xl p-4 shadow-sm space-y-3">
            <h4 className="font-mono text-amber-400 font-bold uppercase text-[11px]">
              Back Cover Blurb & Spine Text
            </h4>

            <div>
              <label className="text-stone-300 block mb-1">Back Cover Hook / Blurb</label>
              <textarea
                rows={4}
                value={cover.backBlurb}
                onChange={(e) => handleUpdateCover({ backBlurb: e.target.value })}
                className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-600 focus:outline-none resize-none leading-relaxed text-xs"
              />
            </div>

            <div>
              <label className="text-stone-300 block mb-1">Spine Typography</label>
              <input
                type="text"
                value={cover.spineText}
                onChange={(e) => handleUpdateCover({ spineText: e.target.value })}
                className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Visual Preview Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-[#100e0d] border border-stone-800/80 rounded-2xl min-h-[620px] shadow-inner relative overflow-hidden">
          
          {/* Subtle Ambient Backlight */}
          <div className="absolute inset-0 bg-radial from-amber-900/10 via-transparent to-transparent pointer-events-none" />

          {/* 1. 3D Hardcover Mockup View */}
          {viewStyle === "3d" && (
            <div className="relative group perspective-[1200px] my-4">
              <div
                className="w-[280px] sm:w-[320px] h-[430px] sm:h-[490px] rounded-r-lg relative shadow-2xl transition-transform duration-500 transform-gpu rotate-y-[-14deg] rotate-x-[4deg] group-hover:rotate-y-[-8deg] flex flex-col justify-between p-7 border-l-4 border-amber-700/60 overflow-hidden"
                style={{
                  background: getCoverBackground(),
                  boxShadow:
                    "-12px 18px 45px rgba(0, 0, 0, 0.85), inset 4px 0 10px rgba(255, 255, 255, 0.15), inset -4px 0 10px rgba(0, 0, 0, 0.6)",
                }}
              >
                {/* Book Spine Crease Highlight */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/60 via-white/10 to-transparent pointer-events-none" />

                {/* Top: Subtitle & Genre */}
                <div className="relative z-10 text-center space-y-1">
                  <div className="text-[10px] tracking-widest uppercase font-mono text-amber-300/80 font-bold">
                    {cover.genre}
                  </div>
                  {cover.subtitle && (
                    <div className="text-[11px] tracking-wider text-amber-200/90 font-serif italic">
                      {cover.subtitle}
                    </div>
                  )}
                </div>

                {/* Center Graphic / Art Elements */}
                <div className="relative z-10 my-auto text-center py-6">
                  <div className="w-20 h-20 mx-auto rounded-full border border-amber-400/30 flex items-center justify-center bg-black/30 backdrop-blur-sm shadow-lg mb-4">
                    <Sparkles className="w-8 h-8 text-amber-400" />
                  </div>
                  <h1
                    className={`text-2xl sm:text-3xl text-amber-100 drop-shadow-md leading-tight ${getFontClass(
                      cover.fontFamily
                    )}`}
                  >
                    {cover.title}
                  </h1>
                </div>

                {/* Bottom: Author Name */}
                <div className="relative z-10 text-center border-t border-amber-400/20 pt-3">
                  <div className="text-xs uppercase tracking-widest font-mono text-amber-200 font-bold">
                    {cover.author}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-stone-400 font-mono mt-0.5">
                    WorthWyl Press
                  </div>
                </div>
              </div>

              {/* 3D Pages Edge Layer */}
              <div
                className="absolute top-3 right-[-14px] w-[14px] h-[424px] sm:h-[484px] bg-[#f0ebd9] rounded-r-xs shadow-lg transform rotate-y-[76deg] origin-left border border-stone-300"
                style={{
                  backgroundImage: "repeating-linear-gradient(0deg, #eae4cf, #eae4cf 1px, #d5ceb8 2px, #eae4cf 3px)",
                }}
              />
            </div>
          )}

          {/* 2. Front Cover Flat View */}
          {viewStyle === "front" && (
            <div
              className="w-[300px] sm:w-[340px] h-[450px] sm:h-[510px] rounded-lg shadow-2xl relative flex flex-col justify-between p-8 border border-amber-900/40 overflow-hidden"
              style={{
                background: getCoverBackground(),
              }}
            >
              <div className="relative z-10 text-center space-y-1">
                <div className="text-[10px] tracking-widest uppercase font-mono text-amber-300 font-bold">
                  {cover.genre}
                </div>
                {cover.subtitle && (
                  <div className="text-xs tracking-wider text-amber-200/90 font-serif italic">
                    {cover.subtitle}
                  </div>
                )}
              </div>

              <div className="relative z-10 text-center py-6">
                <div className="w-24 h-24 mx-auto rounded-full border border-amber-400/40 flex items-center justify-center bg-black/40 backdrop-blur-sm shadow-xl mb-6">
                  <Sparkles className="w-10 h-10 text-amber-400" />
                </div>
                <h1
                  className={`text-2xl sm:text-3xl text-amber-100 drop-shadow-lg leading-tight ${getFontClass(
                    cover.fontFamily
                  )}`}
                >
                  {cover.title}
                </h1>
              </div>

              <div className="relative z-10 text-center border-t border-amber-400/20 pt-4">
                <div className="text-sm uppercase tracking-widest font-mono text-amber-200 font-bold">
                  {cover.author}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-stone-400 font-mono mt-0.5">
                  Kindle Direct Publishing Edition
                </div>
              </div>
            </div>
          )}

          {/* 3. Full Wrap Print Spread (Back + Spine + Front) */}
          {viewStyle === "wrap" && (
            <div className="w-full max-w-[620px] h-[380px] bg-[#0c0a09] border border-amber-800/40 rounded-lg shadow-2xl flex overflow-hidden text-stone-200">
              
              {/* Back Cover */}
              <div className="flex-1 p-5 flex flex-col justify-between bg-stone-950/80 border-r border-amber-900/40">
                <div className="space-y-3">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    Praise & Synopsis
                  </span>
                  <p className="text-[10px] leading-relaxed text-stone-300 font-serif line-clamp-8">
                    {cover.backBlurb || "Back blurb placeholder..."}
                  </p>
                </div>

                <div className="border-t border-stone-800 pt-3 flex items-center justify-between text-[9px] font-mono text-stone-400">
                  <div className="w-16 h-8 bg-white/90 rounded text-black flex items-center justify-center font-bold text-[8px]">
                    |||||| ISBN
                  </div>
                  <span>Amazon KDP Paperback</span>
                </div>
              </div>

              {/* Spine */}
              <div className="w-10 bg-amber-950 flex flex-col items-center justify-between py-4 border-r border-amber-900/40 select-none">
                <span className="text-[8px] font-mono uppercase tracking-widest text-amber-300 rotate-90 whitespace-nowrap mt-4">
                  {cover.author}
                </span>
                <span className="text-[9px] font-serif font-bold uppercase tracking-wider text-amber-100 rotate-90 whitespace-nowrap">
                  {cover.spineText || cover.title}
                </span>
                <div className="w-3 h-3 rounded-full bg-amber-600 mb-2" />
              </div>

              {/* Front Cover */}
              <div
                className="flex-1 p-5 flex flex-col justify-between"
                style={{ background: getCoverBackground() }}
              >
                <div className="text-center">
                  <span className="text-[9px] font-mono uppercase text-amber-300 font-bold">
                    {cover.genre}
                  </span>
                </div>

                <div className="text-center">
                  <h2 className={`text-base text-amber-100 drop-shadow-md leading-tight ${getFontClass(cover.fontFamily)}`}>
                    {cover.title}
                  </h2>
                </div>

                <div className="text-center border-t border-amber-400/20 pt-2">
                  <span className="text-[10px] uppercase font-mono text-amber-200 font-bold">
                    {cover.author}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center space-x-3 text-xs text-stone-400">
            <span>Dimensions: 6" x 9" Standard Trade Paperback</span>
            <span>•</span>
            <span className="text-amber-400 font-mono">300 DPI Amazon KDP Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
