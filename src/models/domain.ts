export type NovelMode = "fiction" | "autobiography" | "memoir";

export type Chapter = {
  id: string;
  chapterNumber: number;
  title: string;
  content: string;
  summary: string;
  userNotes?: string;
  wordCount: number;
  characters?: string[];
  openThreads?: string[];
  createdAt: string;
};

export type PlotThread = {
  thread: string;
  status: "open" | "advancing" | "resolved";
  riskOfDrift: "low" | "medium" | "high";
};

export type ContinuityReflection = {
  id: string;
  type: "micro" | "macro";
  chapterIndex: number;
  inspectedRange: string;
  summary: string;
  characters: string;
  activePlotThreads: PlotThread[];
  pacingAndTone: string;
  guidance: string;
  potentialHoles: string[];
  focusScore: number;
  timestamp: string;
};

export type CoverDesign = {
  title: string;
  subtitle?: string;
  author: string;
  genre: string;
  mood: string;
  palette: string;
  prompt: string;
  imageUrl: string | null;
  spineText: string;
  backBlurb: string;
  authorBioSnippet: string;
  fontFamily: "cinzel" | "lora" | "sans" | "mono";
};

export type NovelProject = {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  genre: string;
  premise: string;
  tone: string;
  mode: NovelMode;
  targetChapters: number;
  outline?: string;
  chapters: Chapter[];
  reflections: ContinuityReflection[];
  cover: CoverDesign;
  synopsis: string;
  kdpTrimSize: "5x8" | "6x9" | "7x10" | "8.5x11";
  createdAt: string;
  updatedAt: string;
};

export type ProofreadItem = {
  type: "grammar" | "pacing" | "continuity" | "voice";
  original: string;
  suggestion: string;
  reason: string;
};

export type ProofreadAnalysis = {
  critique: string;
  strengths: string[];
  areasForImprovement: string[];
  editorialChangesSummary: string;
  corrections: ProofreadItem[];
  polishedText: string;
};

export type SequelBlueprint = {
  sequelTitle: string;
  logline: string;
  incitingIncident: string;
  survivingCharacters: Array<{ name: string; arcAfterBook1: string; sequelConflict: string }>;
  unresolvedLoreCarryovers: string[];
  threeActBreakdown: {
    actOne: string;
    actTwo: string;
    actThree: string;
  };
  chapterRoadmap: Array<{ chapterNumber: number; title: string; synopsis: string }>;
};

export type BioItem = {
  bioType: "memoir_chapter" | "kdp_author_bio" | "jacket_bio" | "goodreads_bio" | "life_timeline";
  title: string;
  tagline: string;
  content: string;
  suggestedThemes: string[];
  marketingKeywords: string[];
  timelineMilestones?: Array<{ era: string; title: string; narrativeSignificance: string }>;
};

// Legacy compatibility for Android / DAO
export type Novel = {
  id: string;
  title: string;
  genre: string;
  status: "in_progress" | "complete";
  createdAt: string;
  updatedAt: string;
};

export type Episode = {
  id: string;
  novelId: string;
  episodeNumber: number;
  text: string;
  createdAt: string;
};

export type EpisodeSnapshot = {
  id: string;
  novelId: string;
  episodeNumber: number;
  createdAt: string;
  text: string;
  screenshotUrl: string;
  characters: string[];
  locations: string[];
  tags: string[];
  tone: string;
  pacing: "slow" | "medium" | "fast";
  openThreads: string[];
  resolvedThreads: string[];
};

export type ContinuityState = {
  characters: Record<string, { firstSeen: number; lastSeen: number }>;
  locations: Record<string, { firstSeen: number; lastSeen: number }>;
  openThreads: string[];
  resolvedThreads: string[];
};

