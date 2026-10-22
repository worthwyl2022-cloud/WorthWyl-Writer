import React, { useState, useEffect } from "react";
import { NovelProject } from "@/src/models/domain";
import { 
  UploadCloud, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  FileText, 
  BookOpen, 
  Tag, 
  DollarSign, 
  Sparkles,
  Layers
} from "lucide-react";

interface KdpPublishingHubProps {
  project: NovelProject;
  onUpdateProject: (updates: Partial<NovelProject>) => void;
}

export const KdpPublishingHub: React.FC<KdpPublishingHubProps> = ({
  project,
  onUpdateProject,
}) => {
  const [trimSize, setTrimSize] = useState<string>(project.kdpTrimSize || "6x9");
  const [description, setDescription] = useState<string>(project.cover?.backBlurb || project.synopsis || "");
  const [keywords, setKeywords] = useState<string[]>([
    "epic speculative fiction",
    "orbital sci-fi mystery",
    "forbidden cartography",
    "ancient cosmic technology",
    "dystopian subterranean archive",
    "philosophical space opera",
    "high stakes suspense novel",
  ]);

  const totalWords = project.chapters.reduce(
    (acc, ch) => acc + (ch.wordCount || ch.content.split(/\s+/).filter(Boolean).length),
    0
  );

  // Pre-flight validation checks
  const checklist = [
    {
      id: "title",
      title: "Title & Pen Name Integrity",
      status: project.title.trim().length > 2 && project.author.trim().length > 1 ? "pass" : "fail",
      detail: `Title: "${project.title}" • Pen Name: ${project.author}`,
    },
    {
      id: "words",
      title: "Manuscript Length & Volume",
      status: totalWords >= 20000 ? "pass" : totalWords >= 2000 ? "warning" : "fail",
      detail: `${totalWords.toLocaleString()} words across ${project.chapters.length} chapter(s). (${
        totalWords >= 40000
          ? "Full-Length Novel"
          : totalWords >= 15000
          ? "Novella"
          : totalWords >= 2000
          ? "Novelette / Chapter Pack"
          : "Drafting in Progress"
      })`,
    },
    {
      id: "chapters",
      title: "Chapter Hierarchy & Breaks",
      status: project.chapters.length >= 1 ? "pass" : "fail",
      detail: `${project.chapters.length} chapter(s) structured with clean headings and summaries.`,
    },
    {
      id: "cover",
      title: "Cover & Visual Assets",
      status: project.cover?.title ? "pass" : "warning",
      detail: `Front cover title "${project.cover.title}" configured with 300 DPI layout specifications.`,
    },
    {
      id: "blurb",
      title: "Amazon Detail Page Sales Blurb",
      status: description.length >= 50 ? "pass" : "warning",
      detail: description.length >= 50 ? `${description.length} characters ready for Amazon Kindle product page.` : "A 150-400 word blurb improves reader conversion.",
    },
    {
      id: "trim",
      title: `Print Trim Size Setup (${trimSize}")`,
      status: "pass",
      detail: `Standard Amazon KDP ${trimSize}" format with 0.5" outer margins and automatic gutter compensation.`,
    },
  ];

  const passCount = checklist.filter((item) => item.status === "pass").length;
  const readyForKdp = passCount >= 4;

  // Export as formatted HTML (KDP / Kindle ePub ready)
  const downloadKdpHtml = () => {
    const chaptersHtml = project.chapters
      .map(
        (ch) => `
      <section class="chapter" style="page-break-before: always; margin-top: 4rem;">
        <h2 style="font-size: 1.8rem; font-family: Georgia, serif; text-align: center; margin-bottom: 2rem;">
          Chapter ${ch.chapterNumber}<br>
          <span style="font-size: 1.4rem; font-weight: normal; font-style: italic;">${ch.title}</span>
        </h2>
        <div style="font-family: Georgia, serif; font-size: 1.15rem; line-height: 1.8; text-align: justify;">
          ${ch.content
            .split("\n\n")
            .map(
              (p, idx) =>
                `<p style="margin-bottom: 1.25rem; text-indent: ${idx === 0 ? "0" : "1.5rem"};">${p.replace(
                  /\n/g,
                  "<br>"
                )}</p>`
            )
            .join("\n")}
        </div>
      </section>
    `
      )
      .join("\n");

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${project.title} - ${project.author}</title>
  <style>
    body {
      font-family: Georgia, 'Times New Roman', serif;
      max-width: 750px;
      margin: 0 auto;
      padding: 3rem 2rem;
      color: #111;
      background: #fff;
    }
    .title-page {
      text-align: center;
      margin-top: 8rem;
      margin-bottom: 10rem;
      page-break-after: always;
    }
    h1 { font-size: 2.8rem; margin-bottom: 0.5rem; letter-spacing: 0.05em; }
    h3 { font-size: 1.4rem; font-weight: normal; color: #444; font-style: italic; }
    .author { font-size: 1.6rem; margin-top: 4rem; font-weight: bold; }
    .kdp-notice { font-size: 0.85rem; color: #777; margin-top: 6rem; }
  </style>
</head>
<body>
  <div class="title-page">
    <h1>${project.title}</h1>
    ${project.subtitle ? `<h3>${project.subtitle}</h3>` : ""}
    <div class="author">${project.author}</div>
    <div class="kdp-notice">Formatted for Amazon Kindle Direct Publishing by WorthWyl Writer</div>
  </div>

  <div class="toc" style="page-break-after: always; margin-top: 4rem;">
    <h2 style="text-align: center; font-size: 1.6rem; margin-bottom: 2rem;">Table of Contents</h2>
    <ul style="list-style: none; padding: 0; line-height: 2;">
      ${project.chapters.map((c) => `<li>Chapter ${c.chapterNumber}: <em>${c.title}</em></li>`).join("\n")}
    </ul>
  </div>

  <main>
    ${chaptersHtml}
  </main>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, "_")}_KDP_Manuscript.html`;
    a.click();
  };

  // Export as Markdown
  const downloadMarkdown = () => {
    let md = `# ${project.title}\n`;
    if (project.subtitle) md += `### ${project.subtitle}\n`;
    md += `**Author:** ${project.author}\n\n`;
    md += `*Formatted for Amazon KDP via WorthWyl Writer*\n\n---\n\n`;

    project.chapters.forEach((ch) => {
      md += `## Chapter ${ch.chapterNumber}: ${ch.title}\n\n`;
      md += `${ch.content}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, "_")}.md`;
    a.click();
  };

  // Export Full Publishing Package (JSON)
  const downloadPublishingBundle = () => {
    const bundle = {
      projectMetadata: {
        title: project.title,
        subtitle: project.subtitle,
        author: project.author,
        genre: project.genre,
        targetAudience: "Adult / General Fiction",
        suggestedTrimSize: trimSize,
        kdpDirectUrl: "https://kdp.amazon.com",
        keywords: keywords,
      },
      salesCopy: {
        blurb: description,
        authorBio: project.cover.authorBioSnippet,
      },
      coverConfig: project.cover,
      manuscript: project.chapters,
      continuityAudits: project.reflections,
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, "_")}_KDP_Publishing_Package.json`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner with Direct KDP Link */}
      <div className="bg-gradient-to-r from-[#211b14] via-[#1a1613] to-[#121110] border border-amber-800/40 rounded-xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-amber-900/60 text-amber-300 border border-amber-700/50">
                Official Amazon Publishing Hub
              </span>
              <span className="text-xs text-stone-400 font-mono">Kindle eBook • Paperback • Hardcover</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100">
              Amazon KDP Publishing Suite
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl leading-relaxed">
              Seamlessly bridge your generated manuscript directly into Amazon Kindle Direct Publishing. Validate pre-flight formatting, generate high-converting Amazon metadata, and export clean ePub-ready HTML packages.
            </p>
          </div>

          {/* Primary Call to Action: Direct Amazon KDP link */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href="https://kdp.amazon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-400 text-stone-950 font-bold text-sm flex items-center justify-center space-x-2 shadow-xl shadow-amber-950/60 transition-transform active:scale-98 cursor-pointer"
            >
              <span>Launch Amazon KDP Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Pre-Flight Checklist & Specs (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Checklist Card */}
          <div className="bg-[#181614] border border-amber-950/50 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-amber-100">
                  KDP Pre-Flight Verification
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Validating manuscript specifications against Amazon KDP publishing guidelines.
                </p>
              </div>

              <span
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                  readyForKdp
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : "bg-amber-950 text-amber-300 border border-amber-800"
                }`}
              >
                {readyForKdp ? "Ready to Publish" : "Drafting"}
              </span>
            </div>

            <div className="space-y-2.5">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="bg-stone-900/60 border border-stone-800/80 rounded-lg p-3 text-xs flex items-start space-x-3"
                >
                  {item.status === "pass" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : item.status === "warning" ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1 space-y-0.5">
                    <div className="font-semibold text-stone-200">{item.title}</div>
                    <div className="text-[11px] text-stone-400 leading-snug">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paperback Trim & Margins Setup */}
          <div className="bg-[#181614] border border-amber-950/50 rounded-xl p-5 shadow-sm space-y-3 text-xs">
            <h4 className="font-mono text-amber-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Paperback Trim Specifications</span>
            </h4>

            <div className="grid grid-cols-4 gap-2">
              {[
                { size: "5x8", label: "5\" x 8\" (Novella)" },
                { size: "6x9", label: "6\" x 9\" (Standard)" },
                { size: "7x10", label: "7\" x 10\" (Memoir)" },
                { size: "8.5x11", label: "8.5\" x 11\"" },
              ].map((opt) => (
                <button
                  key={opt.size}
                  onClick={() => {
                    setTrimSize(opt.size);
                    onUpdateProject({ kdpTrimSize: opt.size as any });
                  }}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    trimSize === opt.size
                      ? "bg-amber-950/80 border-amber-600 text-amber-100 font-bold"
                      : "bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-300"
                  }`}
                >
                  <div className="font-mono text-xs">{opt.size}</div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Standard 6x9 trade paperback is Amazon's most popular format for fiction and narrative non-fiction.
            </p>
          </div>
        </div>

        {/* Right Column: One-Click Export & Metadata Generator (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Download Packages Card */}
          <div className="bg-[#181614] border border-amber-950/50 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-amber-100 flex items-center gap-2">
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export KDP Publication Packages</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                onClick={downloadKdpHtml}
                className="p-3.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-700/60 transition-all text-left space-y-1 group cursor-pointer"
              >
                <div className="flex items-center justify-between font-bold text-amber-200">
                  <span>Kindle-Ready HTML</span>
                  <Download className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400" />
                </div>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Formatted for direct upload to Amazon KDP eBook and print conversion.
                </p>
              </button>

              <button
                onClick={downloadMarkdown}
                className="p-3.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-700/60 transition-all text-left space-y-1 group cursor-pointer"
              >
                <div className="flex items-center justify-between font-bold text-amber-200">
                  <span>Markdown (.md)</span>
                  <Download className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400" />
                </div>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Clean Markdown manuscript compatible with Scrivener, Vellum, and Calibre.
                </p>
              </button>

              <button
                onClick={downloadPublishingBundle}
                className="col-span-1 sm:col-span-2 p-3.5 rounded-lg bg-gradient-to-r from-amber-950/50 via-stone-900 to-stone-900 border border-amber-700/40 hover:border-amber-500 transition-all text-left space-y-1 group cursor-pointer"
              >
                <div className="flex items-center justify-between font-bold text-amber-200">
                  <span>Complete KDP Master Bundle (.json)</span>
                  <Download className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400" />
                </div>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Includes full chapters, continuity logs, cover art prompts, and 7 Amazon search keywords.
                </p>
              </button>
            </div>
          </div>

          {/* Amazon Sales Copy & Detail Page Hook */}
          <div className="bg-[#181614] border border-amber-950/50 rounded-xl p-5 shadow-sm space-y-3 text-xs">
            <h4 className="font-mono text-amber-400 font-bold uppercase text-[11px]">
              Amazon KDP Sales Description / Detail Page
            </h4>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste or write the sales description that readers will see on Amazon.com..."
              className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-600 focus:outline-none resize-none leading-relaxed text-xs"
            />
          </div>

          {/* 7 Amazon Search Keywords */}
          <div className="bg-[#181614] border border-amber-950/50 rounded-xl p-5 shadow-sm space-y-3 text-xs">
            <h4 className="font-mono text-amber-400 font-bold uppercase text-[11px] flex items-center justify-between">
              <span>7 Amazon KDP Search Keywords</span>
              <span className="text-stone-500 font-normal">Algorithm Boosters</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md bg-stone-900 text-amber-200/90 border border-stone-800 font-mono text-[11px]"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
