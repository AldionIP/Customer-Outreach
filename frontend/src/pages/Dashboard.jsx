import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MechaAssistant from "../components/MechaAssistant";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}`;

function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({
    totalCustomers: 0,
    followCustomers: 0,
    contactedCustomers: 0,
    surveyCustomers: 0,
    topupCustomers: 0,
    totalFollowUps: 0,
    upcomingFollowUps: 0,
    overdueFollowUps: 0,
    recentFollowUps: [],
    upcomingFollowUpItems: [],
    overdueFollowUpItems: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/dashboard`);

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const result = await response.json();

        setDashboard({
          totalCustomers: result.totalCustomers || 0,
          followCustomers: result.followCustomers || 0,
          contactedCustomers: result.contactedCustomers || 0,
          surveyCustomers: result.surveyCustomers || 0,
          topupCustomers: result.topupCustomers || 0,
          totalFollowUps: result.totalFollowUps || 0,
          upcomingFollowUps: result.upcomingFollowUps || 0,
          overdueFollowUps: result.overdueFollowUps || 0,
          recentFollowUps: result.recentFollowUps || [],
          upcomingFollowUpItems: result.upcomingFollowUpItems || [],
          overdueFollowUpItems: result.overdueFollowUpItems || [],
        });
      } catch (dashboardError) {
        console.error("Failed to fetch dashboard data:", dashboardError);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const {
    totalCustomers,
    followCustomers,
    contactedCustomers,
    surveyCustomers,
    topupCustomers,
    totalFollowUps,
    upcomingFollowUps,
    overdueFollowUps,
    recentFollowUps,
    upcomingFollowUpItems,
    overdueFollowUpItems,
  } = dashboard;

  const stats = [
    { label: "Total Customers", value: totalCustomers, accent: "cyan" },
    { label: "Udah Saya Chat", value: followCustomers, accent: "blue" },
    { label: "Customer Balas", value: contactedCustomers, accent: "violet" },
    { label: "Sudah Survei", value: surveyCustomers, accent: "emerald" },
    { label: "Berhasil Pinjam", value: topupCustomers, accent: "amber" },
    { label: "Total Follow-ups", value: totalFollowUps, accent: "cyan" },
    { label: "Upcoming", value: upcomingFollowUps, accent: "lime" },
    { label: "Overdue", value: overdueFollowUps, accent: "rose" },
  ];

  if (loading) {
    return (
      <div className="page-container">
        <div className="panel p-8 text-slate-200">
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">System booting...</p>
          <p className="mt-3 text-lg">Loading dashboard telemetry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="panel p-8 text-slate-200">
          <p className="text-sm uppercase tracking-[0.28em] text-rose-300">Connection Error</p>
          <p className="mt-3 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container content-stack">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="hud-label">
            <span className="status-dot" />
            System Status
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            Customer Outreach Command Center
          </h1>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            Real-time overview of outreach activity and customer pipeline status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-300">
          <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5">Database: Connected</span>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-300">
            Node-01 Online
          </span>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-cyan-300">Operator Overview</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-50 sm:text-3xl">Mission Active</h2>
            </div>
            <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-cyan-200">
              82% Sync
            </div>
          </div>

          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            Monitor customer conversations, follow-up planning, and conversion progress from one tactical command panel.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="primary-button" onClick={() => navigate("/customers/new")}>Add Customer</button>
            <button type="button" className="secondary-button" onClick={() => navigate("/customers/import")}>Import Customers</button>
            <button type="button" className="secondary-button" onClick={() => navigate("/outreach/whatsapp")}>Start Outreach</button>
            <button type="button" className="secondary-button" onClick={() => navigate("/reports")}>View Report</button>
          </div>
        </div>

        <div className="panel p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-violet-300">Mecha Assistant</span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-300">
              SCANNING
            </span>
          </div>
          <MechaAssistant mode="scanning" />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="panel group p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">{stat.label}</span>
              <span className={`h-2.5 w-2.5 rounded-full ${
                stat.accent === "cyan" ? "bg-cyan-400" :
                stat.accent === "blue" ? "bg-blue-400" :
                stat.accent === "violet" ? "bg-violet-400" :
                stat.accent === "emerald" ? "bg-emerald-400" :
                stat.accent === "amber" ? "bg-amber-400" :
                stat.accent === "lime" ? "bg-lime-400" : "bg-rose-400"
              }`} />
            </div>
            <div className="mt-5 text-3xl font-semibold text-slate-50">{stat.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="panel p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-50">Recent Follow-ups</h2>
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Live</span>
          </div>

          <div className="space-y-3">
            {recentFollowUps.length === 0 ? (
              <p className="text-sm text-slate-300">No follow-ups yet.</p>
            ) : (
              recentFollowUps.map((followUp) => (
                <div key={followUp.id} className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between gap-4">
                    <strong className="text-sm text-slate-100">{followUp.customer_name || "Customer"}</strong>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">Open</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{followUp.note}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {followUp.follow_up_date ? new Date(followUp.follow_up_date).toLocaleDateString() : "-"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-50">Upcoming</h2>
            <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-300">Queue</span>
          </div>

          <div className="space-y-3">
            {upcomingFollowUpItems.length === 0 ? (
              <p className="text-sm text-slate-300">No upcoming follow-ups scheduled.</p>
            ) : (
              upcomingFollowUpItems.map((followUp) => (
                <div key={followUp.id} className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between gap-4">
                    <strong className="text-sm text-slate-100">{followUp.customer_name || "Customer"}</strong>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-emerald-300">Next</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{followUp.note}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                    Due: {new Date(followUp.follow_up_date).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-50">Overdue</h2>
            <span className="text-[10px] uppercase tracking-[0.2em] text-rose-300">Critical</span>
          </div>

          <div className="space-y-3">
            {overdueFollowUpItems.length === 0 ? (
              <p className="text-sm text-slate-300">No overdue follow-ups.</p>
            ) : (
              overdueFollowUpItems.map((followUp) => (
                <div key={followUp.id} className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-3">
                  <div className="flex items-center justify-between gap-4">
                    <strong className="text-sm text-slate-100">{followUp.customer_name || "Customer"}</strong>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-rose-300">Late</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{followUp.note}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                    Due: {new Date(followUp.follow_up_date).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;