import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/db";
import { NovelProject, Chapter, ContinuityReflection } from "@/src/models/domain";

const LOCAL_STORAGE_KEY = "worthwyl_writer_active_project";
const ALL_PROJECTS_KEY = "worthwyl_writer_projects_list";

export const DEFAULT_PROJECT: NovelProject = {
  id: "proj_" + Date.now(),
  title: "Chronicles of the Obsidian Spire",
  subtitle: "The Shattered Horizon",
  author: "Wyl Worthy",
  genre: "Epic Speculative Fiction",
  premise:
    "When a subterranean archive opens beneath an orbital metropolis, a disgraced cartographer uncovers memory cylinders revealing the world's stars never died—they were partitioned.",
  tone: "Atmospheric, philosophical, high-stakes suspense, vivid sensory depth",
  mode: "fiction",
  targetChapters: 12,
  chapters: [
    {
      id: "ch_1",
      chapterNumber: 1,
      title: "The Silent Vault",
      content: `The dampness of the lower undercrofts had a smell like copper filings and ancient rain. Corin adjusted the brass cowl of his lantern, its luminescent oil guttering against the draught that sighed through the fissure in the foundation wall.\n\n"Seven hundred years," Sula whispered behind him, her fingers tracing the geometric seals stamped into the bedrock. "No tectonic shift caused this. Something exhaled from below."\n\nCorin touched the obsidian rim of the aperture. It was warm—unnaturally so for stone buried beneath three kilometers of pressurized ballast. Below them, through the lattice of the fractured seal, a pale amber luminescence pulse-timed with the cadence of an artificial heartbeat. He pulled the leather cartographer's cylinder from his shoulder strap and unrolled the survey parchment from the Year of the Eclipse. Every line matched, save for the single blank void where they now knelt.\n\n"If the partition fails," Corin murmured, checking the tension on his rappelling harness, "the city above will learn what holds the sky in place."\n\n"Let them learn," Sula replied, clicking her carbine's safety off. "Ignorance has never kept an empire afloat."`,
      summary:
        "Corin and Sula breach the subterranean fissure beneath the orbital undercroft, discovering the warm obsidian seal and realizing the celestial partition may be failing.",
      userNotes: "Establish the atmosphere, the strange warmth of the obsidian stone, and Corin's forbidden maps.",
      wordCount: 184,
      characters: ["Corin (Disgraced Cartographer)", "Sula (Veteran Scout)"],
      openThreads: ["What is breathing beneath the obsidian seal?", "Who partitioned the stars 700 years ago?"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "ch_2",
      chapterNumber: 2,
      title: "The Cartographer's Descent",
      content: `The rope hummed beneath Corin's gloves as he descended through the amber mist. The air tasted of ozone and dry parchment—an archive preserved in an airtight vacuum until the fissure broke its seal.\n\nThirty meters down, the rough basalt gave way to smooth, seamless pylons of black glass. Embedded within each pillar were cylindrical glass ampoules, each containing a suspension of iridescent mercury that shifted when his lantern swept across it.\n\n"Corin," Sula's voice cracked over the copper acoustic tube. "Vibration on the upper gantry. The Archon's marshals are tracing our atmospheric breach. You have less than twenty minutes."\n\nHe swung his boots toward a cantilevered terrace. Landing with a muted thud, his lamp illuminated a circular console. In its center rested a sphere of interlocking rings, spinning silently without gears or motors. Inscribed along the equator was a star coordinate that every imperial academy taught was mathematically impossible.\n\nCorin touched the sphere. The mercury in the flanking ampoules ignited into brilliant sapphire script. The language wasn't archaic dialect—it was his grandmother's forbidden dialect of the Outer Expanse.`,
      summary:
        "Corin rappels into the subterranean archive, discovering the glass ampoules of iridescent mercury and a celestial sphere inscribed in his family's forbidden dialect as the Archon's marshals close in.",
      userNotes: "Build tension with the clock ticking; reveal the connection to his grandmother's heritage.",
      wordCount: 202,
      characters: ["Corin", "Sula (over comms)", "The Archon's Marshals (approaching)"],
      openThreads: ["Corin's family heritage link to the archive", "Twenty-minute countdown before marshals arrive"],
      createdAt: new Date().toISOString(),
    },
  ],
  reflections: [
    {
      id: "ref_1_2",
      type: "micro",
      chapterIndex: 2,
      inspectedRange: "Chapters 1 - 2",
      summary:
        "Tight continuity achieved across the descent. The immediate danger of the Archon's marshals establishes urgent pacing, while the discovery of the sphere links the mythic lore directly to Corin's personal bloodline.",
      characters:
        "Corin: Transitioned from careful surveyor to desperate investigator. Sula: Grounding presence maintaining tactical awareness.",
      activePlotThreads: [
        { thread: "Impending breach by the Archon's marshals (20 min countdown)", status: "advancing", riskOfDrift: "low" },
        { thread: "The celestial sphere and Corin's grandmother's dialect", status: "open", riskOfDrift: "low" },
        { thread: "What exhales beneath the partition?", status: "open", riskOfDrift: "medium" },
      ],
      pacingAndTone: "Suspenseful, high aesthetic focus, excellent balance of world-building and immediate tension.",
      guidance:
        "Chapter 3 must resolve the 20-minute countdown: either Corin extracts a memory cylinder before the marshals descend, or Sula is forced into an ambush on the upper catwalk.",
      potentialHoles: [
        "Ensure Corin takes or secures the celestial sphere before leaving the console, or explain why he cannot carry it.",
      ],
      focusScore: 96,
      timestamp: new Date().toISOString(),
    },
  ],
  cover: {
    title: "Chronicles of the Obsidian Spire",
    subtitle: "The Shattered Horizon",
    author: "Wyl Worthy",
    genre: "Epic Speculative Fiction",
    mood: "Mysterious, dark amber & obsidian, high contrast, cinematic atmosphere",
    palette: "Obsidian & Amber Gold",
    prompt:
      "A solitary cloaked cartographer standing before a colossal subterranean black glass sphere with floating iridescent star maps and glowing amber mist, cinematic lighting, book cover composition, 8k",
    imageUrl: null,
    spineText: "WORTHY • CHRONICLES OF THE OBSIDIAN SPIRE",
    backBlurb:
      "Seven hundred years beneath a sky of manufactured stars, cartographer Corin thought he had mapped every stone of the orbital empire. Then the bedrock exhaled. Deep beneath the undercrofts lies an archive holding the coordinates of a forgotten cosmos—and the evidence that their sun was never eclipsed, but stolen.",
    authorBioSnippet:
      "Wyl Worthy writes speculative epics exploring forgotten history, cartography, and the architectures of forbidden empires.",
    fontFamily: "cinzel",
  },
  synopsis:
    "An epic speculative journey following a disgraced cartographer who unearths an ancient star archive beneath an orbital megalopolis.",
  kdpTrimSize: "6x9",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export async function saveProject(project: NovelProject): Promise<void> {
  // Always update local storage
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(project));
  } catch (e) {
    console.warn("Local storage save error:", e);
  }

  // Attempt Firestore persistence
  try {
    const docRef = doc(db, "novels", project.id);
    await setDoc(docRef, {
      ...project,
      updatedAt: new Date().toISOString(),
    });
  } catch (firestoreErr) {
    console.warn("Firestore save warning (continuing with local cache):", firestoreErr);
  }
}

export async function loadActiveProject(): Promise<NovelProject> {
  // Check local storage first for fastest load
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      return JSON.parse(local) as NovelProject;
    }
  } catch (e) {
    console.warn("Local load error:", e);
  }

  // Check Firestore
  try {
    const colRef = collection(db, "novels");
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const data = snap.docs[0].data() as NovelProject;
      return data;
    }
  } catch (e) {
    console.warn("Firestore query error:", e);
  }

  return DEFAULT_PROJECT;
}
