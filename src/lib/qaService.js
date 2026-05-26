// ──────────────────────────────────────────────────────────────────────
// qaService.js — JS port of the Laravel QaDataService.
// Pure functions over the bundled JSON file.
// ──────────────────────────────────────────────────────────────────────
import data from "../data/qaData.json";

export const metadata = data.metadata ?? {};
export const agents = data.agents ?? [];
export const chats = data.chats ?? [];
export const teamAggregates = data.team_aggregates ?? {};
export const agentAggregates = data.agent_aggregates ?? {};
export const sampleTranscripts = data.sample_transcripts ?? {};

// ─── Lookups ─────────────────────────────────────────────────────────
export function getAgent(agentId) {
  return agents.find((a) => a.agent_id === agentId) ?? null;
}

export function getAgentAggregate(agentId) {
  return agentAggregates[agentId] ?? null;
}

export function getChat(chatId) {
  return chats.find((c) => c.chat_id === chatId) ?? null;
}

/** All chats for one agent, newest first. */
export function chatsForAgent(agentId) {
  return chats
    .filter((c) => c.agent_id === agentId)
    .sort((a, b) => {
      const ka = a.datetime ?? a.date;
      const kb = b.datetime ?? b.date;
      return kb.localeCompare(ka);
    });
}

// ─── Date helpers ─────────────────────────────────────────────────────
function parseISODate(s) {
  // Treat "YYYY-MM-DD" as UTC midnight for stable comparisons across TZs.
  const [y, m, d] = s.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}
function fmtUTC(ts) {
  const d = new Date(ts);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addDays(ts, days) {
  return ts + days * 86_400_000;
}
function firstOfMonth(ts) {
  const d = new Date(ts);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
}
function lastOfMonth(ts) {
  const d = new Date(ts);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0);
}

/**
 * Returns [startDate, endDate] strings (YYYY-MM-DD) for the named period.
 * Anchored to metadata.period_end so the demo always has data inside
 * the "This Week" window.
 */
export function periodRange(period) {
  const anchorStr = metadata.period_end ?? fmtUTC(Date.now());
  const anchorTs = parseISODate(anchorStr);

  switch (period) {
    case "last_week":
      return [fmtUTC(addDays(anchorTs, -13)), fmtUTC(addDays(anchorTs, -7))];
    case "this_month":
      return [fmtUTC(firstOfMonth(anchorTs)), fmtUTC(lastOfMonth(anchorTs))];
    case "last_month": {
      const prevMonth = new Date(anchorTs);
      prevMonth.setUTCMonth(prevMonth.getUTCMonth() - 1);
      return [fmtUTC(firstOfMonth(prevMonth.getTime())), fmtUTC(lastOfMonth(prevMonth.getTime()))];
    }
    case "this_week":
    default:
      return [metadata.period_start ?? fmtUTC(addDays(anchorTs, -6)), anchorStr];
  }
}

/**
 * Filter chats to a [start, end] date window AND an agent list.
 * agentIds=[] means all agents.
 */
export function filteredChats(period, agentIds = []) {
  const [start, end] = periodRange(period);
  const startTs = parseISODate(start);
  const endTs = parseISODate(end);
  const agentSet = new Set(agentIds);

  return chats.filter((c) => {
    const ts = parseISODate(c.date);
    if (ts < startTs || ts > endTs) return false;
    if (agentSet.size > 0 && !agentSet.has(c.agent_id)) return false;
    return true;
  });
}

// ─── Aggregate computation ────────────────────────────────────────────
const EMPTY_TIERS = Object.fromEntries(
  Array.from({ length: 10 }, (_, i) => [`Tier ${i + 1}`, 0])
);

export function computeAggregates(chatList) {
  const total = chatList.length;
  if (total === 0) {
    return {
      avg_score: 0,
      total: 0,
      crit_count: 0,
      pending_review: 0,
      risk_distribution: { LOW: 0, MED: 0, HIGH: 0, CRIT: 0 },
      empathy_distribution: { EXCELLENT: 0, GOOD: 0, NEUTRAL: 0, POOR: 0 },
      violation_counts_by_tier: { ...EMPTY_TIERS },
    };
  }

  let scoreSum = 0;
  let crit = 0;
  let pending = 0;
  const risk = { LOW: 0, MED: 0, HIGH: 0, CRIT: 0 };
  const empathy = { EXCELLENT: 0, GOOD: 0, NEUTRAL: 0, POOR: 0 };
  const tiers = { ...EMPTY_TIERS };

  for (const c of chatList) {
    scoreSum += c.ai_score ?? 0;
    if (c.risk_level === "CRIT") crit++;
    if (c.requires_human_review) pending++;
    if (risk[c.risk_level] !== undefined) risk[c.risk_level]++;
    if (empathy[c.empathy_rating] !== undefined) empathy[c.empathy_rating]++;
    for (const v of c.violations ?? []) {
      const key = `Tier ${v.tier ?? 0}`;
      if (tiers[key] !== undefined) tiers[key]++;
    }
  }

  return {
    avg_score: Math.round((scoreSum / total) * 10) / 10,
    total,
    crit_count: crit,
    pending_review: pending,
    risk_distribution: risk,
    empathy_distribution: empathy,
    violation_counts_by_tier: tiers,
  };
}

/** Top N and bottom N agents computed from a chat slice. */
export function rankAgents(chatList, limit = 5) {
  const byAgent = new Map();
  for (const c of chatList) {
    const id = c.agent_id;
    if (!byAgent.has(id)) {
      byAgent.set(id, {
        agent_id: id,
        real_name: c.agent_real_name,
        host_name: c.agent_host_name,
        scores: [],
      });
    }
    byAgent.get(id).scores.push(c.ai_score);
  }
  const ranked = [...byAgent.values()].map((row) => ({
    agent_id: row.agent_id,
    real_name: row.real_name,
    host_name: row.host_name,
    avg_score:
      Math.round(
        (row.scores.reduce((a, b) => a + b, 0) / row.scores.length) * 10
      ) / 10,
    chat_count: row.scores.length,
  }));
  ranked.sort((a, b) => b.avg_score - a.avg_score);

  return {
    top: ranked.slice(0, limit),
    bottom: [...ranked].reverse().slice(0, limit),
    all: ranked,
  };
}

/** Count of pending-review chats — used by the sidebar badge. */
export function pendingReviewCount() {
  return chats.filter((c) => c.requires_human_review).length;
}
