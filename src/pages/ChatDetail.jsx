import { useMemo, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import { RiskBadge, EmpathyBadge } from "../components/Badges";
import {
  getChat,
  chatsForAgent,
  sampleTranscripts,
} from "../lib/qaService";

export default function ChatDetail() {
  const { chatId } = useParams();
  const chat = getChat(chatId);
  const [showTranscript, setShowTranscript] = useState(false);
  const transcriptKeys = Object.keys(sampleTranscripts);
  const [activeTranscript, setActiveTranscript] = useState(transcriptKeys[0]);

  // All hooks before any early return (Rules of Hooks).
  // Audit sequence # = position when chats ordered oldest-first
  const sequence = useMemo(() => {
    if (!chat) return 0;
    const agentChats = chatsForAgent(chat.agent_id); // newest-first
    const oldestFirst = [...agentChats].reverse();
    const idx = oldestFirst.findIndex((c) => c.chat_id === chat.chat_id);
    return idx >= 0 ? idx + 1 : 0;
  }, [chat]);

  if (!chat) return <Navigate to="/dashboard" replace />;

  const score = chat.ai_score ?? 0;
  const isPass = score >= 70;
  const criticalViolation = (chat.violations ?? []).find(
    (v) => (v.tier ?? 99) <= 3
  );
  const hasCritical = !!criticalViolation;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Executive Overview", to: "/dashboard" },
          { label: chat.agent_host_name, to: `/agents/${chat.agent_id}` },
          { label: `Chat #${chat.chat_id}` },
        ]}
      />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl card-shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Chat #{chat.chat_id}
              </h1>
              <RiskBadge level={chat.risk_level} />
              <EmpathyBadge rating={chat.empathy_rating} />
              {chat.requires_human_review && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0V7zm-.75 6.5a1 1 0 100 2 1 1 0 000-2z" />
                  </svg>
                  Pending Human Review
                </span>
              )}
            </div>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm">
              <MetaField label="Agent">
                <Link
                  to={`/agents/${chat.agent_id}`}
                  className="hover:underline text-gray-900 dark:text-gray-100 font-medium"
                >
                  {chat.agent_host_name}
                </Link>
                <span className="text-gray-500 dark:text-gray-400 font-normal block text-xs">
                  {chat.agent_real_name}
                </span>
              </MetaField>
              <MetaField label="Brand">{chat.brand}</MetaField>
              <MetaField label="Date">{chat.date}</MetaField>
              <MetaField label="Customer ID">
                <span className="font-mono text-xs">{chat.customer_id}</span>
              </MetaField>
            </dl>
          </div>

          <button
            type="button"
            onClick={() => setShowTranscript(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            View Full Transcript
          </button>
        </div>
      </div>

      {/* § 1 QA Summary */}
      <Section number="1" title="QA Summary">
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCell label="Audit Sequence">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              #{sequence}
            </span>
          </SummaryCell>
          <SummaryCell label="Score">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {score}%
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ring-1 ring-inset ${
                  isPass
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {isPass ? "PASS" : "FAIL"}
              </span>
            </div>
          </SummaryCell>
          <SummaryCell label="Critical Failures">
            <span
              className={`text-lg font-semibold ${
                hasCritical
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {hasCritical ? (
                <>
                  Yes{" "}
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                    (Tier {criticalViolation.tier})
                  </span>
                </>
              ) : (
                "No"
              )}
            </span>
          </SummaryCell>
          <SummaryCell label="Empathy Rating">
            <EmpathyBadge rating={chat.empathy_rating} />
          </SummaryCell>
        </div>
        {chat.positive_highlight && (
          <div className="px-5 py-4 bg-emerald-50/50 dark:bg-emerald-900/10 border-t border-emerald-100 dark:border-emerald-900/30 text-sm">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              ✓ Positive highlight:
            </span>
            <span className="text-gray-700 dark:text-gray-300 ml-1">
              {chat.positive_highlight}
            </span>
          </div>
        )}
      </Section>

      {/* § 2 Risk Alerts & Patterns */}
      <Section
        number="2"
        title="Risk Alerts & Patterns"
        meta={`${(chat.violations ?? []).length} violations`}
      >
        <div className="p-5 space-y-4">
          {(chat.violations ?? []).length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-6">
              No violations recorded.
            </div>
          ) : (
            (chat.violations ?? []).map((v, i) => (
              <article
                key={i}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-900/30"
              >
                <header className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                      Tier {v.tier}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {v.category}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400 flex-shrink-0">
                    {v.deduction} pts
                  </span>
                </header>
                {v.evidence && (
                  <blockquote className="my-2 pl-3 border-l-2 border-gray-300 dark:border-gray-600 text-sm italic text-gray-600 dark:text-gray-400">
                    "{v.evidence}"
                  </blockquote>
                )}
                {v.explanation && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {v.explanation}
                  </p>
                )}
              </article>
            ))
          )}
        </div>
      </Section>

      {/* § 3 Revenue Opportunity Report */}
      <Section
        number="3"
        title="Revenue Opportunity Report"
        meta={`${(chat.revenue_opportunities_missed ?? []).length} missed`}
      >
        <div className="p-5 space-y-4">
          {(chat.revenue_opportunities_missed ?? []).length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-6">
              No missed revenue opportunities recorded.
            </div>
          ) : (
            (chat.revenue_opportunities_missed ?? []).map((opp, i) => (
              <article
                key={i}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-900/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                    {opp.type ?? "Opportunity"}
                  </span>
                </div>
                {opp.description && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                    {opp.description}
                  </p>
                )}
                {opp.evidence && (
                  <blockquote className="pl-3 border-l-2 border-gray-300 dark:border-gray-600 text-sm italic text-gray-600 dark:text-gray-400">
                    "{opp.evidence}"
                  </blockquote>
                )}
              </article>
            ))
          )}
        </div>
      </Section>

      {/* § 4 Leadership Summary */}
      <Section number="4" title="Leadership Summary">
        <div className="p-5">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {chat.feedback_summary || "No summary available."}
          </p>
          {chat.human_feedback && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Human Reviewer Feedback
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                {chat.human_feedback}
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* § 5 Coaching Plan */}
      <Section
        number="5"
        title="Coaching Plan"
        meta={`${(chat.coaching_plan ?? []).length} items`}
      >
        <div className="p-5 space-y-4">
          {(chat.coaching_plan ?? []).length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-6">
              No coaching items.
            </div>
          ) : (
            (chat.coaching_plan ?? []).map((item, i) => {
              // Split out "Example script:" if present so it renders as a quoted block
              const text = item.recommendation ?? "";
              const m = text.match(/^(.*?)Example script:\s*(.*)$/is);
              const body = m ? m[1].trim() : text.trim();
              const script = m ? m[2].trim() : null;
              return (
                <article
                  key={i}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-900/10"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {item.title || "Coaching point"}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {body}
                  </p>
                  {script && (
                    <div className="mt-3 p-3 rounded-md bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                        Example script
                      </div>
                      <blockquote className="text-sm italic text-gray-700 dark:text-gray-300">
                        {script}
                      </blockquote>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </Section>

      {/* Transcript slide-out modal */}
      {showTranscript && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-gray-900/50"
            onClick={() => setShowTranscript(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl flex flex-col">
            <header className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Full Transcript
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Sample placeholder — real transcripts will be wired in once
                  available.
                </p>
              </div>
              <button
                onClick={() => setShowTranscript(false)}
                className="w-8 h-8 grid place-items-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </header>

            <div className="px-5 py-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2 text-xs">
              <span className="text-gray-500 dark:text-gray-400">Sample:</span>
              {transcriptKeys.map((k) => (
                <button
                  key={k}
                  onClick={() => setActiveTranscript(k)}
                  className={`px-2 py-1 rounded-md ${
                    activeTranscript === k
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {k.replace(/_/g, " ")}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <pre className="font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {sampleTranscripts[activeTranscript]}
              </pre>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────
function Section({ number, title, meta, children }) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl card-shadow mb-6">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          <span className="text-blue-600 dark:text-blue-400 mr-2">§ {number}</span>
          {title}
        </h2>
        {meta && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{meta}</span>
        )}
      </header>
      {children}
    </section>
  );
}

function MetaField({ label, children }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </dt>
      <dd className="text-gray-900 dark:text-gray-100 font-medium">{children}</dd>
    </div>
  );
}

function SummaryCell({ label, children }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
