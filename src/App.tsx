/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { NovelProject, Chapter, ContinuityReflection, SequelBlueprint } from "@/src/models/domain";
import { DEFAULT_PROJECT, loadActiveProject, saveProject } from "@/src/lib/storage";
import { SnapshotFirestoreDao } from "@/src/data/db/SnapshotFirestoreDao";
import { Header } from "@/src/components/Header";
import { Navigation, TabKey } from "@/src/components/Navigation";
import { NovelStudio } from "@/src/components/NovelStudio";
import { ReflectionEngine } from "@/src/components/ReflectionEngine";
import { AutobiographyBioStudio } from "@/src/components/AutobiographyBioStudio";
import { ProofreaderSequelForge } from "@/src/components/ProofreaderSequelForge";
import { CoverStudio } from "@/src/components/CoverStudio";
import { KdpPublishingHub } from "@/src/components/KdpPublishingHub";

const snapshotDao = new SnapshotFirestoreDao();

export default function App() {
  const [project, setProject] = useState<NovelProject>(DEFAULT_PROJECT);
  const [activeTab, setActiveTab] = useState<TabKey>("studio");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isAnalyzingContinuity, setIsAnalyzingContinuity] = useState<boolean>(false);

  // Load project on mount
  useEffect(() => {
    async function init() {
      try {
        const loaded = await loadActiveProject();
        if (loaded) {
          setProject(loaded);
        }
      } catch (err) {
        console.warn("Error initializing project:", err);
      }
    }
    init();
  }, []);

  // Update project state & autosave
  const handleUpdateProject = (updates: Partial<NovelProject>) => {
    setProject((prev) => {
      const updated = {
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      // Auto-save debounced or immediate
      saveProject(updated).catch((e) => console.warn("Autosave note:", e));
      return updated;
    });
  };

  // Explicit Save button action
  const handleManualSave = async () => {
    setIsSaving(true);
    try {
      await saveProject(project);

      // Persist latest chapter to SnapshotFirestoreDao for backwards compatibility
      if (project.chapters.length > 0) {
        const latestCh = project.chapters[project.chapters.length - 1];
        await snapshotDao.insert({
          id: latestCh.id,
          novelId: project.id,
          episodeNumber: latestCh.chapterNumber,
          createdAt: Date.now(),
          text: latestCh.content,
          screenshotPath: project.cover.imageUrl || "",
          characters: latestCh.characters || [],
          locations: [],
          tags: [project.genre, project.mode],
          tone: project.tone,
          pacing: "medium",
          openThreads: latestCh.openThreads || [],
          resolvedThreads: [],
        });
      }
    } catch (err) {
      console.warn("Manual save note:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const [toastMessage, setToastMessage] = useState<{ type: "info" | "success" | "error"; text: string } | null>(null);

  const showToast = (text: string, type: "info" | "success" | "error" = "info") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((cur) => (cur?.text === text ? null : cur));
    }, 4500);
  };

  // Run Continuity Reflection (2-chapter micro or whole book macro)
  const handleRunReflection = async (type: "micro" | "macro") => {
    if (project.chapters.length < 2 && type === "micro") {
      showToast("At least 2 chapters are required to run an episodic micro-reflection.", "info");
      return;
    }

    setIsAnalyzingContinuity(true);
    try {
      const response = await fetch("/api/reflect-continuity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          novelTitle: project.title,
          premise: project.premise,
          genre: project.genre,
          chapters: project.chapters,
          currentChapterIndex: project.chapters.length,
        }),
      });

      const data = await response.json();
      if (!data.success || !data.reflection) {
        throw new Error(data.error || "Failed to analyze continuity");
      }

      const newReflection: ContinuityReflection = {
        ...data.reflection,
        id: `ref_${type}_${Date.now()}`,
        chapterIndex: project.chapters.length,
        timestamp: new Date().toISOString(),
      };

      handleUpdateProject({
        reflections: [...project.reflections, newReflection],
      });

      // Switch to reflection tab to see results
      setActiveTab("reflection");
    } catch (err: any) {
      showToast(`Continuity analysis error: ${err.message}`, "error");
    } finally {
      setIsAnalyzingContinuity(false);
    }
  };

  // Insert Memoir Chapter into Novel Project
  const handleInsertChapterFromBio = (title: string, content: string) => {
    const nextNum = project.chapters.length + 1;
    const newChapter: Chapter = {
      id: `ch_bio_${Date.now()}`,
      chapterNumber: nextNum,
      title: title || `Chapter ${nextNum}: Memoir Excerpt`,
      content,
      summary: "Biographical memoir chapter generated.",
      wordCount: content.split(/\s+/).filter(Boolean).length,
      createdAt: new Date().toISOString(),
    };

    handleUpdateProject({
      chapters: [...project.chapters, newChapter],
    });
    setActiveTab("studio");
    showToast(`Memoir chapter added as Chapter ${nextNum}!`, "success");
  };

  // Launch New Sequel Project
  const handleCreateSequelProject = (blueprint: SequelBlueprint) => {
    const sequelProject: NovelProject = {
      id: `proj_sequel_${Date.now()}`,
      title: blueprint.sequelTitle || `${project.title}: Part II`,
      subtitle: blueprint.logline?.slice(0, 50) || "The Sequel",
      author: project.author,
      genre: project.genre,
      premise: blueprint.logline || blueprint.incitingIncident || project.premise,
      tone: project.tone,
      mode: project.mode,
      targetChapters: blueprint.chapterRoadmap?.length || 12,
      chapters: (blueprint.chapterRoadmap || []).map((ch, idx) => ({
        id: `ch_sq_${Date.now()}_${idx}`,
        chapterNumber: ch.chapterNumber || idx + 1,
        title: ch.title,
        content: `# Chapter ${ch.chapterNumber}: ${ch.title}\n\n*Scene Synopsis:*\n${ch.synopsis}\n\n[Ready to draft]`,
        summary: ch.synopsis,
        wordCount: 0,
        createdAt: new Date().toISOString(),
      })),
      reflections: [],
      cover: {
        ...project.cover,
        title: blueprint.sequelTitle || `${project.title}: Part II`,
        subtitle: "A Sequel Novel",
        spineText: `${project.author} • ${blueprint.sequelTitle}`,
      },
      synopsis: blueprint.logline,
      kdpTrimSize: project.kdpTrimSize || "6x9",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProject(sequelProject);
    saveProject(sequelProject);
    setActiveTab("studio");
    showToast(`Sequel project "${sequelProject.title}" has been created with all 12 planned chapters!`, "success");
  };

  return (
    <div className="min-h-screen bg-[#100e0d] text-[#e8e4dc] flex flex-col font-sans selection:bg-amber-900 selection:text-amber-100">
      {/* Top Header */}
      <Header
        project={project}
        onUpdateProject={handleUpdateProject}
        onSave={handleManualSave}
        isSaving={isSaving}
        activeTab={activeTab}
      />

      {/* Navigation Sub-header */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        reflectionBadgeCount={project.reflections.length}
      />

      {/* Main View Container */}
      <main className="flex-1 pb-16">
        {activeTab === "studio" && (
          <NovelStudio
            project={project}
            onUpdateProject={handleUpdateProject}
            onRunReflection={handleRunReflection}
          />
        )}

        {activeTab === "reflection" && (
          <ReflectionEngine
            project={project}
            onUpdateProject={handleUpdateProject}
            onRunReflection={handleRunReflection}
            isAnalyzing={isAnalyzingContinuity}
          />
        )}

        {activeTab === "bio" && (
          <AutobiographyBioStudio
            project={project}
            onUpdateProject={handleUpdateProject}
            onInsertChapterFromBio={handleInsertChapterFromBio}
          />
        )}

        {activeTab === "proofread" && (
          <ProofreaderSequelForge
            project={project}
            onUpdateProject={handleUpdateProject}
            onCreateSequelProject={handleCreateSequelProject}
          />
        )}

        {activeTab === "cover" && (
          <CoverStudio
            project={project}
            onUpdateProject={handleUpdateProject}
          />
        )}

        {activeTab === "kdp" && (
          <KdpPublishingHub
            project={project}
            onUpdateProject={handleUpdateProject}
          />
        )}

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-14 right-6 z-50 max-w-sm animate-fade-in">
            <div
              className={`p-3.5 rounded-xl border shadow-xl flex items-center justify-between gap-3 text-xs ${
                toastMessage.type === "error"
                  ? "bg-rose-950/90 border-rose-800 text-rose-200"
                  : toastMessage.type === "success"
                  ? "bg-emerald-950/90 border-emerald-800 text-emerald-200"
                  : "bg-stone-900/90 border-amber-800/60 text-amber-100"
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="font-mono uppercase font-bold text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-black/40">
                  {toastMessage.type}
                </span>
                <span>{toastMessage.text}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-stone-400 hover:text-stone-100 p-0.5"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Global Status Bar */}
      <footer className="border-t border-amber-950/40 bg-[#0d0c0b] py-3 text-stone-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-stone-400">WorthWyl Writer Active</span>
            <span>•</span>
            <span>Continuity Loop: 2-Chapter Micro & 5-10 Macro</span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://kdp.amazon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 transition-colors"
            >
              Kindle Direct Publishing (KDP)
            </a>
            <span>•</span>
            <span>Firestore Synced</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
