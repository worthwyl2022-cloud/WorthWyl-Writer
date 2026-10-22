import React from "react";
import { 
  BookMarked, 
  BrainCircuit, 
  UserCheck, 
  FileSearch, 
  Palette, 
  UploadCloud 
} from "lucide-react";

export type TabKey = 
  | "studio" 
  | "reflection" 
  | "bio" 
  | "proofread" 
  | "cover" 
  | "kdp";

interface NavigationProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  reflectionBadgeCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  reflectionBadgeCount = 0,
}) => {
  const tabs = [
    {
      key: "studio" as TabKey,
      label: "Novel Studio",
      subtitle: "Autonomous & Co-Writing",
      icon: BookMarked,
    },
    {
      key: "reflection" as TabKey,
      label: "Continuity Engine",
      subtitle: "Micro 2-Ch & Macro Audit",
      icon: BrainCircuit,
      badge: reflectionBadgeCount > 0 ? `${reflectionBadgeCount}` : undefined,
    },
    {
      key: "bio" as TabKey,
      label: "Autobiography & Bio",
      subtitle: "Memoir & Author Personas",
      icon: UserCheck,
    },
    {
      key: "proofread" as TabKey,
      label: "Proofread & Sequel",
      subtitle: "Critique, Extend & Forge",
      icon: FileSearch,
    },
    {
      key: "cover" as TabKey,
      label: "Cover Studio",
      subtitle: "Visual Art & 3D Spread",
      icon: Palette,
    },
    {
      key: "kdp" as TabKey,
      label: "KDP Publishing",
      subtitle: "Amazon Portal & Package",
      icon: UploadCloud,
    },
  ];

  return (
    <nav className="bg-[#181614] border-b border-amber-950/40 sticky top-16 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onSelectTab(tab.key)}
                className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-lg text-left transition-all whitespace-nowrap text-sm cursor-pointer ${
                  isActive
                    ? "bg-amber-900/40 text-amber-100 border border-amber-600/50 shadow-inner"
                    : "text-stone-400 hover:text-stone-200 hover:bg-stone-900/60 border border-transparent"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-amber-400" : "text-stone-400"
                  }`}
                />
                <div>
                  <div className="flex items-center space-x-1.5 font-medium leading-tight">
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-400 font-sans leading-none mt-0.5">
                    {tab.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
