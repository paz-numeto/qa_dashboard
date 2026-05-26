import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import KpiCard from "../components/KpiCard";
import { RiskBadge, ScoreBadge } from "../components/Badges";
import { ViolationStackedBar, RiskDonut } from "../components/Charts";
import {
  agents,
  filteredChats,
  computeAggregates,
  rankAgents,
  periodRange,
} from "../lib/qaService";

const PERIOD_OPTIONS = [
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
];

export default function Dashboard() {
  // URL-bound state so filter selections survive refresh / share
  const [params, setParams] = useSearchParams();
  const period = params.get("period") || "this_week";
  const selectedAgents = params.getAll("agents");

  const [agentSearch, setAgentSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  // close picker on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const setPeriod = (newPeriod) => {
    const next = new URLSearchParams(params);
    next.set("period", newPeriod);
    setParams(next, { replace: true });
  };

  const toggleAgent = (agentId) => {
    const next = new URLSearchParams(params);
    const list = next.getAll("agents");
    next.delete("agents");
    if (list.includes(agentId)) {
      list.filter((id) => id !== agentId).forEach((id) => next.append("agents", id));
    } else {
      [...list, agentId].forEach((id) => next.append("agents", id));
    }
    setParams(next, { replace: true });
  };

  const clearAgents = () => {
    const next = new URLSearchParams(params);
    next.delete("agents");
    setParams(next, { replace: true });
  };

  // ── Derived data (memoized) ──────────────────────────────────────────
  const scopedChats = useMemo(
    () => filteredChats(period, selectedAgents),
    [period, selectedAgents.join("|")] // join used to keep dep array stable
  );
  const aggregates = useMemo(() => computeAggregates(scopedChats), [scopedChats]);
  const prevPeriod =
    period === "this_week"
      ? "last_week"
      : period === "this_month"
      ? "last_month"
      : "last_week";
  const prevAgg = useMemo(
    () => computeAggregates(filteredChats(prevPeriod, selectedAgents)),
    [prevPeriod, selectedAgents.join("|")]
  );
  const delta =
    prevAgg.avg_score > 0
      ? Math.round(
          ((aggregates.avg_score - prevAgg.avg_score) / prevAgg.avg_score) * 1000
        ) / 10
      : 0;
  const ranking = useMemo(() => rankAgents(scopedChats, 5), [scopedChats]);
  const [start, end] = periodRange(period);

  // Agent picker filtered by search
  const search = agentSearch.trim().toLowerCase();
  const agentOptions = search
    ? agents.filter(
        (a) =>
          a.real_name.toLowerCase().includes(search) ||
          a.host_name.toLowerCase().includes(search)
      )
    : agents;

  const tierData = aggregates.violation_counts_by_tier;
  const tierTotal = Object.values(tierData).reduce((a, b) => a + b, 0);
  const riskTotal = Math.max(
    1,
    Object.values(aggregates.risk_distribution).reduce((a, b) => a + b, 0)
  );

  return (
    <div>
      <Breadcrumb items={[{ label: "Executive Overview" }]} />

      {/* Header row: title + period + agent filter */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Executive Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Period: <span className="font-medium">{start}</span> →{" "}
            <span className="font-medium">{end}</span> · {agents.length} agents ·{" "}
            {aggregates.total} chats in scope
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period dropdown */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PERIOD_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Agent multi-select */}
          <div className="relative" ref={pickerRef}>
            <button
              type="button"
              onClick={() => setPickerOpen((v) => !v)}
              className="text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200 flex items-center gap-2 min-w-[180px] justify-between"
            >
              <span>
                {selectedAgents.length === 0
                  ? "All Agents"
                  : `${selectedAgents.length} selected`}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {pickerOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-30">
                <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                  <input
                    type="text"
                    value={agentSearch}
                    onChange={(e) => setAgentSearch(e.target.value)}
                    placeholder="Search by real or host name…"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="max-h-72 overflow-y-auto py-1">
                  {agentOptions.length === 0 ? (
                    <div className="px-3 py-4 text-center text-sm text-gray-500">
                      No agents match.
                    </div>
                  ) : (
                    agentOptions.map((a) => (
                      <button
                        key={a.agent_id}
                        type="button"
                        onClick={() => toggleAgent(a.agent_id)}
                        className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAgents.includes(a.agent_id)}
                          readOnly
                          className="rounded text-blue-600"
                        />
                        <span className="flex-1 text-sm">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {a.host_name}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {" · "}
                            {a.real_name}
                          </span>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {a.office}
                        </span>
                      </button>
                    ))
                  )}
                </div>
                {selectedAgents.length > 0 && (
                  <div className="border-t border-gray-100 dark:border-gray-700 p-2">
                    <button
                      onClick={clearAgents}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Clear selection
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Team Average Score"
          value={aggregates.avg_score.toFixed(1)}
          suffix="%"
          delta={delta}
          deltaLabel={
            period === "this_week" || period === "last_week"
              ? "vs last week"
              : "vs last month"
          }
          tone="green"
        />
        <KpiCard label="Total Chats Reviewed" value={aggregates.total} tone="blue" />
        <KpiCard label="Critical Risk Count" value={aggregates.crit_count} tone="red" />
        <KpiCard
          label="Pending Human Review"
          value={aggregates.pending_review}
          tone="yellow"
        />
      </div>

      {/* Top / Bottom performer panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PerformerPanel
          title="Top Performers"
          subtitle="by avg score"
          rows={ranking.top}
        />
        <PerformerPanel
          title="Bottom Performers"
          subtitle="needs attention"
          rows={ranking.bottom}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl card-shadow p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Violation Frequency by Tier
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Total: {tierTotal}
            </span>
          </div>
          <ViolationStackedBar tierData={tierData} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl card-shadow p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Risk Distribution
          </h3>
          <RiskDonut riskData={aggregates.risk_distribution} />
          <ul className="mt-3 space-y-1.5 text-sm">
            {["LOW", "MED", "HIGH", "CRIT"].map((lvl) => {
              const n = aggregates.risk_distribution[lvl] ?? 0;
              return (
                <li key={lvl} className="flex items-center justify-between">
                  <RiskBadge level={lvl} />
                  <span className="text-gray-700 dark:text-gray-300">
                    {n} ({Math.round((n / riskTotal) * 100)}%)
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Sub-component: Top/Bottom performer panel ────────────────────────
function PerformerPanel({ title, subtitle, rows }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl card-shadow">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</span>
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
        {rows.length === 0 ? (
          <li className="px-5 py-6 text-sm text-gray-500 text-center">
            No chats in this period.
          </li>
        ) : (
          rows.map((a, i) => (
            <li key={a.agent_id}>
              <Link
                to={`/agents/${a.agent_id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
              >
                <span className="w-6 text-sm font-semibold text-gray-400">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {a.host_name}
                    <span className="text-gray-400 dark:text-gray-500 font-normal">
                      {" "}
                      ({a.real_name})
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {a.chat_count} chats reviewed
                  </div>
                </div>
                <ScoreBadge score={a.avg_score} />
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
