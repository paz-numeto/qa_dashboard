// ── Small status pills ────────────────────────────────────────────────

const RISK_MAP = {
  LOW: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800",
  MED: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800",
  HIGH: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-800",
  CRIT: "bg-red-600 text-white ring-red-700 dark:bg-red-500 dark:ring-red-400",
};

export function RiskBadge({ level, className = "" }) {
  const cls = RISK_MAP[level] ?? "bg-gray-100 text-gray-700 ring-gray-200";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${cls} ${className}`}
    >
      {level}
    </span>
  );
}

const EMPATHY_MAP = {
  EXCELLENT:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800",
  GOOD: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800",
  NEUTRAL:
    "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-700/40 dark:text-gray-300 dark:ring-gray-600",
  POOR: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-800",
};

export function EmpathyBadge({ rating, className = "" }) {
  const cls = EMPATHY_MAP[rating] ?? "bg-gray-100 text-gray-700 ring-gray-200";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${cls} ${className}`}
    >
      {rating}
    </span>
  );
}

export function ScoreBadge({ score, className = "" }) {
  const n = Number(score);
  const cls =
    n >= 70
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800"
      : "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-800";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${cls} ${className}`}
    >
      {Math.round(n)}%
    </span>
  );
}
