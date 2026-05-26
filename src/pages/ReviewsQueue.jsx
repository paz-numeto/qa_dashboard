import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import { RiskBadge, EmpathyBadge, ScoreBadge } from "../components/Badges";
import { chats } from "../lib/qaService";

const RISK_ORDER = { CRIT: 0, HIGH: 1, MED: 2, LOW: 3 };

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export default function ReviewsQueue() {
  const navigate = useNavigate();

  const pending = useMemo(() => {
    const list = chats.filter((c) => c.requires_human_review);
    list.sort((a, b) => {
      const ra = RISK_ORDER[a.risk_level] ?? 99;
      const rb = RISK_ORDER[b.risk_level] ?? 99;
      if (ra !== rb) return ra - rb;
      return (a.ai_score ?? 0) - (b.ai_score ?? 0);
    });
    return list;
  }, []);

  return (
    <div>
      <Breadcrumb items={[{ label: "Reviews Queue" }]} />

      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reviews Queue
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Chats flagged for human review, ordered by risk and lowest score first.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-semibold">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          {pending.length} pending
        </span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl card-shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">Chat ID</th>
              <th className="px-4 py-3 text-left">Agent</th>
              <th className="px-4 py-3 text-left">Brand</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Score</th>
              <th className="px-4 py-3 text-left">Risk</th>
              <th className="px-4 py-3 text-left">Empathy</th>
              <th className="px-4 py-3 text-left max-w-md">Why it's flagged</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {pending.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  No chats pending human review. 🎉
                </td>
              </tr>
            ) : (
              pending.map((c) => (
                <tr
                  key={c.chat_id}
                  onClick={() => navigate(`/chats/${c.chat_id}`)}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                    {c.chat_id}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900 dark:text-gray-100 font-medium">
                      {c.agent_host_name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {c.agent_real_name}
                    </div>
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
                  <td className="px-4 py-3">
                    <EmpathyBadge rating={c.empathy_rating} />
                  </td>
                  <td
                    className="px-4 py-3 max-w-md text-gray-600 dark:text-gray-300 text-xs"
                    title={c.feedback_summary ?? ""}
                  >
                    {truncate(c.feedback_summary ?? "", 140)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
