/** Hardcoded colors for the 4 default categories */
const DEFAULT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Travail:   { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  Design:    { bg: "bg-pink-500/10",   text: "text-pink-400",   border: "border-pink-500/20"   },
  Études:    { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/20"   },
  Personnel: { bg: "bg-green-500/10",  text: "text-green-400",  border: "border-green-500/20"  },
};

/** Colour palette for custom / unknown categories */
const PALETTE = [
  { bg: "bg-cyan-500/10",   text: "text-cyan-400",   border: "border-cyan-500/20"   },
  { bg: "bg-amber-500/10",  text: "text-amber-400",  border: "border-amber-500/20"  },
  { bg: "bg-rose-500/10",   text: "text-rose-400",   border: "border-rose-500/20"   },
  { bg: "bg-teal-500/10",   text: "text-teal-400",   border: "border-teal-500/20"   },
  { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
  { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
  { bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/20"    },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

export function getCategoryColors(category: string) {
  return DEFAULT_COLORS[category] ?? PALETTE[hashString(category) % PALETTE.length];
}
