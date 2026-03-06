import { motion } from "motion/react";
import { useState } from "react";

export type MuscleGroup =
  | "chest"
  | "front_deltoid"
  | "rear_deltoid"
  | "biceps"
  | "triceps"
  | "forearms"
  | "abs"
  | "obliques"
  | "quads"
  | "hamstrings"
  | "calves"
  | "traps"
  | "lats"
  | "lower_back"
  | "glutes";

export type MuscleScores = Partial<Record<MuscleGroup, number>>;

// Intensity to hex color mapping
function scoreToColor(score: number, isToday: boolean): string {
  if (isToday) return "#EF4444"; // red
  if (score === 0) return "#374151"; // grey (darker for visibility)
  if (score === 1) return "#3B82F6"; // blue
  if (score <= 3) return "#F59E0B"; // yellow
  return "#22C55E"; // green
}

interface MusclePath {
  id: MuscleGroup;
  label: string;
  d?: string;
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  type: "path" | "ellipse";
}

// Front view muscle paths (simplified SVG shapes on a 120x220 viewBox)
const FRONT_MUSCLES: MusclePath[] = [
  // Chest (pectorals) - two areas
  {
    id: "chest",
    label: "Chest",
    type: "path",
    d: "M38 68 Q44 64 50 66 Q56 64 62 68 L60 82 Q56 86 50 87 Q44 86 40 82 Z",
  },
  // Front deltoids - left shoulder
  {
    id: "front_deltoid",
    label: "Shoulders",
    type: "ellipse",
    cx: 34,
    cy: 72,
    rx: 8,
    ry: 10,
  },
  // Front deltoid right (same muscle group)
  // Biceps left
  {
    id: "biceps",
    label: "Biceps",
    type: "ellipse",
    cx: 25,
    cy: 90,
    rx: 6,
    ry: 11,
  },
  // Forearms left
  {
    id: "forearms",
    label: "Forearms",
    type: "ellipse",
    cx: 21,
    cy: 114,
    rx: 5,
    ry: 10,
  },
  // Abs
  {
    id: "abs",
    label: "Abs",
    type: "path",
    d: "M44 89 L56 89 L57 115 L50 117 L43 115 Z",
  },
  // Obliques left
  {
    id: "obliques",
    label: "Obliques",
    type: "ellipse",
    cx: 39,
    cy: 104,
    rx: 5,
    ry: 9,
  },
  // Quads left
  {
    id: "quads",
    label: "Quads",
    type: "path",
    d: "M39 125 Q40 119 44 117 L50 117 Q54 125 55 135 Q52 148 50 150 Q48 148 45 135 Z",
  },
  // Calves left
  {
    id: "calves",
    label: "Calves",
    type: "ellipse",
    cx: 43,
    cy: 177,
    rx: 6,
    ry: 12,
  },
];

// Right side mirrors for front (rendered as separate elements with same muscle IDs)
const FRONT_MUSCLES_RIGHT: MusclePath[] = [
  {
    id: "front_deltoid",
    label: "Shoulders (R)",
    type: "ellipse",
    cx: 86,
    cy: 72,
    rx: 8,
    ry: 10,
  },
  {
    id: "biceps",
    label: "Biceps (R)",
    type: "ellipse",
    cx: 95,
    cy: 90,
    rx: 6,
    ry: 11,
  },
  {
    id: "forearms",
    label: "Forearms (R)",
    type: "ellipse",
    cx: 99,
    cy: 114,
    rx: 5,
    ry: 10,
  },
  {
    id: "obliques",
    label: "Obliques (R)",
    type: "ellipse",
    cx: 61,
    cy: 104,
    rx: 5,
    ry: 9,
  },
  {
    id: "quads",
    label: "Quads (R)",
    type: "path",
    d: "M61 125 Q60 119 56 117 L50 117 Q46 125 45 135 Q48 148 50 150 Q52 148 55 135 Z",
  },
  {
    id: "calves",
    label: "Calves (R)",
    type: "ellipse",
    cx: 57,
    cy: 177,
    rx: 6,
    ry: 12,
  },
];

// Back view muscle paths
const BACK_MUSCLES: MusclePath[] = [
  // Traps (trapezius)
  {
    id: "traps",
    label: "Traps",
    type: "path",
    d: "M42 56 Q50 52 58 56 L60 68 Q55 72 50 73 Q45 72 40 68 Z",
  },
  // Rear deltoids left
  {
    id: "rear_deltoid",
    label: "Rear Delt",
    type: "ellipse",
    cx: 34,
    cy: 72,
    rx: 8,
    ry: 9,
  },
  // Lats left
  {
    id: "lats",
    label: "Lats",
    type: "path",
    d: "M35 80 Q32 90 33 102 Q36 108 42 110 L44 90 Q40 85 35 80 Z",
  },
  // Triceps left
  {
    id: "triceps",
    label: "Triceps",
    type: "ellipse",
    cx: 24,
    cy: 88,
    rx: 6,
    ry: 11,
  },
  // Lower back
  {
    id: "lower_back",
    label: "Lower Back",
    type: "path",
    d: "M43 110 L57 110 L58 124 L50 126 L42 124 Z",
  },
  // Glutes left
  {
    id: "glutes",
    label: "Glutes",
    type: "path",
    d: "M41 126 Q38 128 38 138 Q40 148 44 150 Q47 148 50 150 Q50 140 46 128 Z",
  },
  // Hamstrings left
  {
    id: "hamstrings",
    label: "Hamstrings",
    type: "path",
    d: "M41 152 Q40 160 40 170 Q42 180 44 183 Q47 182 50 183 Q50 170 48 155 Q44 152 41 152 Z",
  },
  // Calves back left
  {
    id: "calves",
    label: "Calves",
    type: "ellipse",
    cx: 43,
    cy: 197,
    rx: 6,
    ry: 11,
  },
];

const BACK_MUSCLES_RIGHT: MusclePath[] = [
  {
    id: "rear_deltoid",
    label: "Rear Delt (R)",
    type: "ellipse",
    cx: 86,
    cy: 72,
    rx: 8,
    ry: 9,
  },
  {
    id: "lats",
    label: "Lats (R)",
    type: "path",
    d: "M65 80 Q68 90 67 102 Q64 108 58 110 L56 90 Q60 85 65 80 Z",
  },
  {
    id: "triceps",
    label: "Triceps (R)",
    type: "ellipse",
    cx: 96,
    cy: 88,
    rx: 6,
    ry: 11,
  },
  {
    id: "glutes",
    label: "Glutes (R)",
    type: "path",
    d: "M59 126 Q62 128 62 138 Q60 148 56 150 Q53 148 50 150 Q50 140 54 128 Z",
  },
  {
    id: "hamstrings",
    label: "Hamstrings (R)",
    type: "path",
    d: "M59 152 Q60 160 60 170 Q58 180 56 183 Q53 182 50 183 Q50 170 52 155 Q56 152 59 152 Z",
  },
  {
    id: "calves",
    label: "Calves (R)",
    type: "ellipse",
    cx: 57,
    cy: 197,
    rx: 6,
    ry: 11,
  },
];

interface MuscleElementProps {
  muscle: MusclePath;
  color: string;
  onHover: (label: string | null) => void;
}

function MuscleElement({ muscle, color, onHover }: MuscleElementProps) {
  const commonProps = {
    fill: color,
    stroke: "rgba(255,255,255,0.15)",
    strokeWidth: 0.5,
    style: { cursor: "pointer", transition: "fill 0.3s ease" },
    onMouseEnter: () => onHover(muscle.label),
    onMouseLeave: () => onHover(null),
  };

  if (muscle.type === "ellipse" && muscle.cx !== undefined) {
    return (
      <ellipse
        cx={muscle.cx}
        cy={muscle.cy}
        rx={muscle.rx}
        ry={muscle.ry}
        {...commonProps}
      />
    );
  }
  if (muscle.type === "path" && muscle.d) {
    return <path d={muscle.d} {...commonProps} />;
  }
  return null;
}

// Body outline SVGs
function FrontBodyOutline() {
  return (
    <g stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" fill="none">
      {/* Head */}
      <ellipse cx="50" cy="37" rx="14" ry="18" />
      {/* Neck */}
      <rect x="45" y="54" width="10" height="8" rx="2" />
      {/* Torso */}
      <path d="M26 62 Q30 58 42 58 L58 58 Q70 58 74 62 L78 90 L74 120 L26 120 L22 90 Z" />
      {/* Left arm */}
      <path d="M26 64 Q18 70 16 80 L14 108 Q14 120 18 128 L22 130" />
      {/* Right arm */}
      <path d="M74 64 Q82 70 84 80 L86 108 Q86 120 82 128 L78 130" />
      {/* Left leg */}
      <path d="M34 120 Q30 130 30 150 L30 180 Q30 196 33 205" />
      <path d="M50 120 Q48 130 46 150 L46 180 Q46 196 44 206" />
      {/* Right leg */}
      <path d="M50 120 Q52 130 54 150 L54 180 Q54 196 56 206" />
      <path d="M66 120 Q70 130 70 150 L70 180 Q70 196 67 205" />
      {/* Feet */}
      <ellipse cx="37" cy="208" rx="8" ry="4" />
      <ellipse cx="63" cy="208" rx="8" ry="4" />
    </g>
  );
}

function BackBodyOutline() {
  return (
    <g stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" fill="none">
      {/* Head */}
      <ellipse cx="50" cy="37" rx="14" ry="18" />
      {/* Neck */}
      <rect x="45" y="54" width="10" height="8" rx="2" />
      {/* Torso */}
      <path d="M26 62 Q30 58 42 58 L58 58 Q70 58 74 62 L78 90 L74 130 L26 130 L22 90 Z" />
      {/* Left arm */}
      <path d="M26 64 Q18 70 16 80 L14 108 Q14 120 18 128 L22 130" />
      {/* Right arm */}
      <path d="M74 64 Q82 70 84 80 L86 108 Q86 120 82 128 L78 130" />
      {/* Left leg */}
      <path d="M34 130 Q30 142 30 162 L30 192 Q30 206 33 215" />
      <path d="M50 130 Q48 142 46 162 L46 192 Q46 206 44 216" />
      {/* Right leg */}
      <path d="M50 130 Q52 142 54 162 L54 192 Q54 206 56 216" />
      <path d="M66 130 Q70 142 70 162 L70 192 Q70 206 67 215" />
      {/* Feet */}
      <ellipse cx="37" cy="218" rx="8" ry="4" />
      <ellipse cx="63" cy="218" rx="8" ry="4" />
    </g>
  );
}

const LEGEND = [
  { color: "#374151", label: "Not trained" },
  { color: "#3B82F6", label: "Light (1 session)" },
  { color: "#F59E0B", label: "Moderate (2-3)" },
  { color: "#22C55E", label: "Well trained (4+)" },
  { color: "#EF4444", label: "Trained today" },
];

interface MuscleHeatmapProps {
  scores: MuscleScores;
  todayMuscles: Set<MuscleGroup>;
}

export default function MuscleHeatmap({
  scores,
  todayMuscles,
}: MuscleHeatmapProps) {
  const [view, setView] = useState<"front" | "back">("front");
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  function getColor(id: MuscleGroup): string {
    const isToday = todayMuscles.has(id);
    const score = scores[id] ?? 0;
    return scoreToColor(score, isToday);
  }

  const frontMuscles = [...FRONT_MUSCLES, ...FRONT_MUSCLES_RIGHT];
  const backMuscles = [...BACK_MUSCLES, ...BACK_MUSCLES_RIGHT];
  const muscles = view === "front" ? frontMuscles : backMuscles;

  return (
    <div className="space-y-4" data-ocid="heatmap.canvas_target">
      {/* Front/Back Toggle */}
      <div className="flex gap-2 justify-center">
        <button
          type="button"
          onClick={() => setView("front")}
          data-ocid="heatmap.front_tab"
          className={`px-5 py-2 rounded-full text-sm font-body font-medium transition-all duration-200 ${
            view === "front"
              ? "bg-primary text-primary-foreground shadow-glow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Front
        </button>
        <button
          type="button"
          onClick={() => setView("back")}
          data-ocid="heatmap.back_tab"
          className={`px-5 py-2 rounded-full text-sm font-body font-medium transition-all duration-200 ${
            view === "back"
              ? "bg-primary text-primary-foreground shadow-glow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Back
        </button>
      </div>

      {/* Hovered muscle label */}
      <div className="h-6 flex items-center justify-center">
        {hoveredMuscle ? (
          <motion.span
            key={hoveredMuscle}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-body font-semibold text-foreground bg-card/80 px-3 py-0.5 rounded-full border border-border/50"
          >
            {hoveredMuscle}
          </motion.span>
        ) : (
          <span className="text-xs text-muted-foreground font-body">
            Hover over muscles to see details
          </span>
        )}
      </div>

      {/* SVG Body */}
      <div className="flex justify-center">
        <motion.div
          key={view}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="relative"
        >
          <svg
            viewBox="0 0 100 220"
            width="180"
            height="396"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Human body muscle heatmap diagram"
            style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.4))" }}
          >
            {/* Dark background fill for body shape */}
            <rect width="100" height="220" fill="transparent" />

            {/* Body outline */}
            {view === "front" ? <FrontBodyOutline /> : <BackBodyOutline />}

            {/* Muscle groups */}
            {muscles.map((muscle, i) => (
              <MuscleElement
                key={`${muscle.id}-${i}`}
                muscle={muscle}
                color={getColor(muscle.id)}
                onHover={setHoveredMuscle}
              />
            ))}
          </svg>
        </motion.div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 px-2 pt-2">
        {LEGEND.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-muted-foreground font-body">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
