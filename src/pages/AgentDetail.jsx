import { useMemo, useState } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import { RiskBadge, ScoreBadge } from "../components/Badges";
import { ScoreHistoryLine, AgentViolationBar } from "../components/Charts";
import {
  getAgent,
  getAgentAggregate,
  chatsForAgent,
} from "../lib/qaService";

const EMPTY_TIERS = Object.fromEntries(
  Array.from({ length: 10 }, (_, i) => [`Tier ${i + 1}`, 0])
);
const PER_PAGE = 8;

export default function AgentDetail() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  // All hooks must run before any early return (Rules of Hooks).
  const agent = getAgent(agentId);
  const aggregate = getAgentAggregate(agentId) ?? {};
  const chats = useMemo(
    () => (agent ? chatsForAgent(agentId) : []),
    [agentId, agent]
  );

  if (!agent) return <Navigate to="/dashboard" replace />;

  const totalChats = chats.length;
  const totalPages = Math.max(1, Math.ceil(totalChats / PER_PAGE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const offset = (safePage - 1) * PER_PAGE;
  const pagedChats = chats.slice(offset, offset + PER_PAGE);

  const scoreHistory = aggregate.score_history ?? [];
  const tierData = aggregate.violation_counts_by_tier ?? EMPTY_TIERS;

  const office = agent.office ?? "";
  const officeBadgeClass =
    office === "CR"
      ? "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
      : "bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-900/30 dark:text-purple-300";

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Executive Overview", to: "/dashboard" },
          { label: agent.host_name },
        ]}
      />

      {/* Profile header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl card-shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center text-white text-xl font-bold flex-shrink-0">
              {agent.host_name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {agent.host_name}
                </h1>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset ${officeBadgeClass}`}
                >
                  {office}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {agent.real_name} · {agent.agent_id}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Avg Score
              </div>
              <div className="mt-1">
                <ScoreBadge
                  score={aggregate.avg_score ?? 0}
                  className="text-base px-3 py-1"
                />
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Chats Reviewed
              </div>
              <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {totalChats}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Score history + violations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl card-shadow p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Score History
          </h3>
          {scoreHistory.length > 0 ? (
            <ScoreHistoryLine history={scoreHistory} />
          ) : (
            <div className="text-sm text-gray-500 py-12 text-center">
              Not enough data points.
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl card-shadow p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Violation Breakdown
          </h3>
          <AgentViolationBar tierData={tierData} />
        </div>
      </div>

      {/* Executive summary */}
      {aggregate.executive_summary && (
        <div className="bg-white dark:bg-gray-800 rounded-xl card-shadow p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 grid place-items-center flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Executive Summary
              </h3>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {aggregate.executive_summary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dossier table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl card-shadow">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Agent Dossier · All Reviewed Chats
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {totalChats} entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Chat #</th>
                <th className="px-4 py-3 text-left">Chat ID</th>
                <th className="px-4 py-3 text-left">Brand</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Score</th>
                <th className="px-4 py-3 text-left">Risk</th>
                <th className="px-4 py-3 text-left max-w-xs">Feedback Summary</th>
                <th className="px-4 py-3 text-center">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {pagedChats.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No chats for this agent.
                  </td>
                </tr>
              ) : (
                pagedChats.map((c, i) => {
                  const seq = offset + i + 1;
                  const sumShort = truncate(c.feedback_summary ?? "", 140);
                  return (
                    <tr
                      key={c.chat_id}
                      onClick={() => navigate(`/chats/${c.chat_id}`)}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
                    >
                      <td className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                        {seq}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                        {c.chat_id}
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                        {c.brand}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {c.date}
                      </td>
                      <td className="px-4 py-3">
                        <ScoreBadge score={c.ai_score} />
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge level={c.risk_level} />
                      </td>
                      <td
                        className="px-4 py-3 max-w-xs text-gray-600 dark:text-gray-300"
                        title={c.feedback_summary ?? ""}
                      >
                        {sumShort}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {c.requires_human_review ? (
                          <span
                            title="Requires human review"
                            className="inline-flex w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 items-center justify-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </span>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Page {safePage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              {safePage > 1 && (
                <button
                  onClick={() => setPage(safePage - 1)}
                  className="px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Prev
                </button>
              )}
              {safePage < totalPages && (
                <button
                  onClick={() => setPage(safePage + 1)}
                  className="px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
