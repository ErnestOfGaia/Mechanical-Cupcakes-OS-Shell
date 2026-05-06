'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RoleCount { role: string; _count: { id: number } }
interface QuizResult { role: string; language: string; quiz_score: number; createdAt: string }
interface QuizAvg    { role: string; _avg: { quiz_score: number | null }; _count: { id: number } }

interface Stats {
  generatedAt:          string;
  activeSessions:       RoleCount[];
  sessionsByRoleToday:  RoleCount[];
  sessionsByRoleWeek:   RoleCount[];
  totalSessionsAllTime: number;
  recipes:              { total: number; published: number };
  quiz: {
    recentResults:  QuizResult[];
    averageByRole:  QuizAvg[];
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  prep: 'Prep', cook: 'Cook', server: 'Server', admin: 'Admin',
};

function sumCounts(arr: RoleCount[]): number {
  return arr.reduce((s, r) => s + r._count.id, 0);
}

function countForRole(arr: RoleCount[], role: string): number {
  return arr.find(r => r.role === role)?._count?.id ?? 0;
}

// ── Stat card component (easy to add new ones) ────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-5">
      <p className="text-xs font-medium text-[#888] uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-[#1B3A5C] mt-1">{value}</p>
      {sub && <p className="text-xs text-[#aaa] mt-1">{sub}</p>}
    </div>
  );
}

// ── Role breakdown row ────────────────────────────────────────────────────────

function RoleRow({ label, today, week, active }: {
  label: string; today: number; week: number; active: number;
}) {
  return (
    <tr className="border-t border-[#f0f0f0]">
      <td className="py-2 pr-4 font-medium text-[#526a8d]">{label}</td>
      <td className="py-2 pr-4 text-center">{active}</td>
      <td className="py-2 pr-4 text-center">{today}</td>
      <td className="py-2 text-center">{week}</td>
    </tr>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router  = useRouter();
  const [stats, setStats]     = useState<Stats | null>(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.status === 403) { router.push('/login'); return; }
      if (!res.ok) throw new Error('Failed to load stats.');
      setStats(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchStats(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">

      {/* Header */}
      <nav className="bg-[#1B3A5C] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚓</span>
          <div>
            <p className="font-bold text-lg leading-none">Pellito Admin</p>
            <p className="text-xs text-white/60">Deckhand Analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchStats}
            className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md transition-colors"
          >
            ↺ Refresh
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {loading && <p className="text-[#888] text-center py-20">Loading dashboard…</p>}
        {error   && <p className="text-red-600 bg-red-50 rounded-lg p-4">{error}</p>}

        {stats && (
          <>
            <p className="text-xs text-[#aaa] mb-6">
              Last updated: {new Date(stats.generatedAt).toLocaleString()}
            </p>

            {/* ── Top stat cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Active Users"
                value={sumCounts(stats.activeSessions)}
                sub="Sessions open right now"
              />
              <StatCard
                label="Users Today"
                value={sumCounts(stats.sessionsByRoleToday)}
                sub="Sessions started today"
              />
              <StatCard
                label="Users This Week"
                value={sumCounts(stats.sessionsByRoleWeek)}
                sub="Last 7 days"
              />
              <StatCard
                label="All-Time Sessions"
                value={stats.totalSessionsAllTime}
                sub="Since launch"
              />
            </div>

            {/* ── Second row ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <StatCard label="Total Recipes"     value={stats.recipes.total}     sub="In the database" />
              <StatCard label="Published Recipes" value={stats.recipes.published} sub="Live for staff" />
              <StatCard
                label="Draft Recipes"
                value={stats.recipes.total - stats.recipes.published}
                sub="Pending review"
              />
            </div>

            {/* ── Usage by role table ── */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-5 mb-8">
              <h2 className="font-bold text-[#1B3A5C] mb-4">Usage by Role</h2>
              <table className="w-full text-sm text-[#444]">
                <thead>
                  <tr className="text-xs text-[#888] uppercase">
                    <th className="text-left pb-2">Role</th>
                    <th className="text-center pb-2">Active Now</th>
                    <th className="text-center pb-2">Today</th>
                    <th className="text-center pb-2">This Week</th>
                  </tr>
                </thead>
                <tbody>
                  {['prep', 'cook', 'server'].map(r => (
                    <RoleRow
                      key={r}
                      label={ROLE_LABELS[r]}
                      active={countForRole(stats.activeSessions, r)}
                      today={countForRole(stats.sessionsByRoleToday, r)}
                      week={countForRole(stats.sessionsByRoleWeek, r)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Quiz performance ── */}
            {stats.quiz.averageByRole.length > 0 && (
              <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-5 mb-8">
                <h2 className="font-bold text-[#1B3A5C] mb-4">Quiz Performance by Role</h2>
                <table className="w-full text-sm text-[#444]">
                  <thead>
                    <tr className="text-xs text-[#888] uppercase">
                      <th className="text-left pb-2">Role</th>
                      <th className="text-center pb-2">Avg Score</th>
                      <th className="text-center pb-2">Total Quizzes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.quiz.averageByRole.map(r => (
                      <tr key={r.role} className="border-t border-[#f0f0f0]">
                        <td className="py-2 font-medium text-[#526a8d]">{ROLE_LABELS[r.role] ?? r.role}</td>
                        <td className="py-2 text-center">
                          {r._avg.quiz_score != null ? r._avg.quiz_score.toFixed(1) : '—'}
                        </td>
                        <td className="py-2 text-center">{r._count.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Recent quiz activity ── */}
            {stats.quiz.recentResults.length > 0 && (
              <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-5">
                <h2 className="font-bold text-[#1B3A5C] mb-4">Recent Quiz Activity</h2>
                <table className="w-full text-sm text-[#444]">
                  <thead>
                    <tr className="text-xs text-[#888] uppercase">
                      <th className="text-left pb-2">Role</th>
                      <th className="text-left pb-2">Language</th>
                      <th className="text-center pb-2">Score</th>
                      <th className="text-right pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.quiz.recentResults.map((r, i) => (
                      <tr key={i} className="border-t border-[#f0f0f0]">
                        <td className="py-2 text-[#526a8d] font-medium">{ROLE_LABELS[r.role] ?? r.role}</td>
                        <td className="py-2">{r.language}</td>
                        <td className="py-2 text-center font-bold">{r.quiz_score}</td>
                        <td className="py-2 text-right text-[#aaa] text-xs">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
