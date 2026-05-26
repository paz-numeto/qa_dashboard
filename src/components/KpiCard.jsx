const TONE_DOT = {
  green: "bg-emerald-500",
  blue: "bg-blue-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
  gray: "bg-gray-400",
};

function deltaTone(delta) {
  if (delta === null || delta === undefined) return null;
  if (delta > 0) return "text-emerald-600 dark:text-emerald-400";
  if (delta < 0) return "text-red-600 dark:text-red-400";
  return "text-gray-500";
}

export default function KpiCard({
  label,
  value,
  suffix = "",
  delta = null,
  deltaLabel = "vs last period",
  tone = "green",
}) {
  const dot = TONE_DOT[tone] ?? TONE_DOT.green;
  const tColor = deltaTone(delta);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl card-shadow p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
        {label}
      </div>
      <div className="mt-2 text-4xl font-bold text-gray-900 dark:text-white leading-none">
        {value}
        {suffix}
      </div>
      {delta !== null && delta !== undefined && (
        <div className={`mt-3 flex items-center gap-1 text-sm font-medium ${tColor}`}>
          {delta > 0 && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5.293 12.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 11-1.414 1.414L10 9.414l-3.293 3.293a1 1 0 01-1.414 0z" />
            </svg>
          )}
          {delta < 0 && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M14.707 7.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L10 10.586l3.293-3.293a1 1 0 011.414 0z" />
            </svg>
          )}
          {Math.abs(delta)}%
          <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">
            {deltaLabel}
          </span>
        </div>
      )}
    </div>
  );
}
