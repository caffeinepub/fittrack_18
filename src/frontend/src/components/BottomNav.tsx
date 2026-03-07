import {
  Crown,
  LayoutDashboard,
  PersonStanding,
  Scale,
  Trophy,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "motion/react";
import type { TabName } from "../App";

interface BottomNavProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
  isPremium?: boolean;
}

function BicepIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Workouts"
      role="img"
      style={{ color: "black" }}
    >
      <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 6.29 14.86 5 16.14V19h2l1.14-1.14.86.86h3l4-4-.57-.57 3.14-3.14.57.57L20.57 14.86zM7 17H6v-1.29l5.57-5.57 1.29 1.29L7 17z" />
    </svg>
  );
}

const tabs: {
  id: TabName;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "nutrition", label: "Nutrition", icon: UtensilsCrossed },
  { id: "workouts", label: "Workouts", icon: BicepIcon },
  { id: "weight", label: "Weight", icon: Scale },
  { id: "body", label: "Body", icon: PersonStanding },
  { id: "compete", label: "Compete", icon: Trophy },
];

export default function BottomNav({
  activeTab,
  onTabChange,
  isPremium,
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-ocid={`nav.${tab.id}.tab`}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 relative transition-colors duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary shadow-glow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.id === "body" && !isPremium && (
                  <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center">
                    <Crown className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              <span className="text-[10px] font-body font-medium tracking-wide">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
