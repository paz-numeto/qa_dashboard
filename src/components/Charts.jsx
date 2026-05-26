import { useEffect, useState } from "react";
import Chart from "react-apexcharts";

// ── helpers ───────────────────────────────────────────────────────────
function useThemeReactiveDark() {
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );
  useEffect(() => {
    const handler = (e) => setDark(!!e.detail?.dark);
    window.addEventListener("theme-changed", handler);
    return () => window.removeEventListener("theme-changed", handler);
  }, []);
  return dark;
}

const TIER_COLORS = {
  "Tier 1": "#7f1d1d",
  "Tier 2": "#991b1b",
  "Tier 3": "#dc2626",
  "Tier 4": "#ef4444",
  "Tier 5": "#f97316",
  "Tier 6": "#f59e0b",
  "Tier 7": "#eab308",
  "Tier 8": "#3b82f6",
  "Tier 9": "#6366f1",
  "Tier 10": "#6b7280",
};

// ── Stacked horizontal bar: one bar with tier slices ─────────────────
export function ViolationStackedBar({ tierData }) {
  const dark = useThemeReactiveDark();
  const labels = Object.keys(tierData);
  const series = labels.map((l) => ({ name: l, data: [tierData[l]] }));
  const colors = labels.map((l) => TIER_COLORS[l] || "#9CA3AF");

  const options = {
    chart: {
      type: "bar",
      stacked: true,
      height: 320,
      toolbar: { show: false },
      foreColor: dark ? "#cbd5e1" : "#475569",
    },
    plotOptions: {
      bar: { horizontal: true, borderRadius: 4, barHeight: "55%" },
    },
    colors,
    xaxis: {
      categories: ["Total Violations"],
      labels: { style: { colors: dark ? "#94a3b8" : "#64748b" } },
    },
    yaxis: { labels: { show: false } },
    legend: {
      position: "bottom",
      labels: { colors: dark ? "#cbd5e1" : "#334155" },
    },
    dataLabels: {
      enabled: true,
      style: { fontSize: "11px", fontWeight: 600 },
      formatter: (v) => (v > 0 ? v : ""),
    },
    tooltip: { theme: dark ? "dark" : "light" },
    grid: { borderColor: dark ? "#374151" : "#e5e7eb" },
  };

  return (
    <Chart
      // Key on dark forces a re-render so foreColor/grid pick up the new theme cleanly.
      key={dark ? "d" : "l"}
      options={options}
      series={series}
      type="bar"
      height={320}
    />
  );
}

// ── Risk donut ────────────────────────────────────────────────────────
const RISK_COLOR = {
  LOW: "#10B981",
  MED: "#F59E0B",
  HIGH: "#EF4444",
  CRIT: "#991B1B",
};
export function RiskDonut({ riskData }) {
  const dark = useThemeReactiveDark();
  const labels = Object.keys(riskData);
  const series = Object.values(riskData);

  const options = {
    chart: { type: "donut", height: 280, foreColor: dark ? "#cbd5e1" : "#475569" },
    labels,
    colors: labels.map((l) => RISK_COLOR[l] || "#9CA3AF"),
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              color: dark ? "#f1f5f9" : "#0f172a",
            },
          },
        },
      },
    },
    dataLabels: { enabled: true, style: { fontSize: "12px", fontWeight: 700 } },
    tooltip: { theme: dark ? "dark" : "light" },
  };

  return (
    <Chart
      key={dark ? "d" : "l"}
      options={options}
      series={series}
      type="donut"
      height={280}
    />
  );
}

// ── Score history line ────────────────────────────────────────────────
export function ScoreHistoryLine({ history }) {
  const dark = useThemeReactiveDark();
  const options = {
    chart: {
      type: "line",
      height: 280,
      toolbar: { show: false },
      foreColor: dark ? "#cbd5e1" : "#475569",
    },
    colors: ["#3B82F6"],
    stroke: { curve: "smooth", width: 3 },
    markers: {
      size: 5,
      colors: ["#3B82F6"],
      strokeColors: "#fff",
      strokeWidth: 2,
    },
    xaxis: {
      type: "category",
      labels: { style: { colors: dark ? "#94a3b8" : "#64748b" } },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
      labels: {
        formatter: (v) => v + "%",
        style: { colors: dark ? "#94a3b8" : "#64748b" },
      },
    },
    grid: { borderColor: dark ? "#374151" : "#e5e7eb" },
    tooltip: { theme: dark ? "dark" : "light", y: { formatter: (v) => v + "%" } },
    dataLabels: { enabled: false },
  };
  const series = [
    {
      name: "Avg Score",
      data: history.map((p) => ({ x: p.date, y: p.avg_score })),
    },
  ];
  return (
    <Chart
      key={dark ? "d" : "l"}
      options={options}
      series={series}
      type="line"
      height={280}
    />
  );
}

// ── Agent's violation breakdown (distributed horizontal bar) ─────────
export function AgentViolationBar({ tierData }) {
  const dark = useThemeReactiveDark();
  const labels = Object.keys(tierData);
  const values = labels.map((l) => tierData[l]);
  const colors = labels.map((l) => TIER_COLORS[l] || "#9CA3AF");

  const options = {
    chart: {
      type: "bar",
      height: 280,
      toolbar: { show: false },
      foreColor: dark ? "#cbd5e1" : "#475569",
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: "60%",
        distributed: true,
      },
    },
    colors,
    xaxis: {
      categories: labels,
      labels: { style: { colors: dark ? "#94a3b8" : "#64748b" } },
    },
    yaxis: { labels: { style: { colors: dark ? "#cbd5e1" : "#475569" } } },
    legend: { show: false },
    dataLabels: { enabled: true, formatter: (v) => (v > 0 ? v : "") },
    grid: { borderColor: dark ? "#374151" : "#e5e7eb" },
    tooltip: { theme: dark ? "dark" : "light" },
  };

  const series = [{ name: "Violations", data: values }];

  return (
    <Chart
      key={dark ? "d" : "l"}
      options={options}
      series={series}
      type="bar"
      height={280}
    />
  );
}
