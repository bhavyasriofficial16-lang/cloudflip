import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../api/client";

export default function Overview() {
  const [resources, setResources] = useState<any[]>([]);
  const [daemon, setDaemon] = useState<any>({ status: "RUNNING", total_sweeps: 0, total_actions_executed: 0, interval_seconds: 30 });
  const [busySweep, setBusySweep] = useState(false);
  const [traffic, setTraffic] = useState<any[]>([
    { time: "0m", current: 8200, predicted: null },
    { time: "4m", current: 8900, predicted: null },
    { time: "8m", current: 9500, predicted: null },
    { time: "12m", current: 10100, predicted: 10100 },
    { time: "16m", current: null, predicted: 16500 },
    { time: "20m", current: null, predicted: 24000 },
    { time: "24m", current: null, predicted: 31800 },
  ]);

  const fetchDaemon = () => {
    api.getDaemonStatus().then(setDaemon).catch(() => {});
  };

  useEffect(() => {
    fetchDaemon();
    const interval = setInterval(fetchDaemon, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerSweep = async () => {
    setBusySweep(true);
    try {
      const res = await api.triggerDaemonSweep();
      setDaemon(res.daemon);
      alert("✅ Immediate telemetry sweep completed! Forecast and remediation loop evaluated.");
    } catch (e: any) {
      alert("Sweep failed: " + e.message);
    } finally {
      setBusySweep(false);
    }
  };

  const toggleDaemon = async () => {
    try {
      if (daemon.status === "RUNNING") {
        const res = await api.stopDaemon();
        setDaemon(res.daemon);
      } else {
        const res = await api.startDaemon();
        setDaemon(res.daemon);
      }
    } catch (e: any) {
      alert("Toggle failed: " + e.message);
    }
  };

  useEffect(() => {
    api.resources()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setResources(res);
        }
      })
      .catch(() => {});

    api.metrics("normal", 20)
      .then((d) => {
        if (d && Array.isArray(d.series) && d.series.length > 0) {
          const points = d.series.map((p: any, i: number) => ({
            time: `${i * 2}m`,
            current: p.value,
            predicted: i > 12 ? Math.round(p.value * 1.8) : null,
          }));
          setTraffic(points);
        }
      })
      .catch(() => {});
  }, []);

  const healthyCount = resources.length ? resources.filter((r) => r.status === "healthy").length : 23;
  const totalCount = resources.length || 27;


  return (
    <div className="space-y-6 font-sans">
      {/* Demo Warning Banner */}
      <div className="flex items-center gap-2.5 text-[13px] font-medium text-amber-800 bg-amber-50 border border-amber-200/80 rounded-xl px-4 py-3 shadow-xs">
        <span className="text-amber-600 font-bold">⚠</span>
        <span>DEMO / SIMULATION — no real AWS resources are modified. All data below is synthetic.</span>
      </div>

      {/* 24/7 Autonomous SRE Daemon Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {daemon.status === "RUNNING" ? (
              <>
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </>
            ) : (
              <span className="inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 font-display font-bold text-[14.5px]">
              <span>24/7 Autonomous Remediation Daemon</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                daemon.status === "RUNNING" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300"
              }`}>
                {daemon.status}
              </span>
            </div>
            <p className="text-[12px] text-slate-300 mt-0.5">
              Continuously polling telemetry every {daemon.interval_seconds || 30}s · Evaluating EMA trend forecasting & closed-loop remediation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-[12px] text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span>Sweeps: <strong>#{daemon.total_sweeps}</strong></span>
            <span>·</span>
            <span>Auto-Fixes: <strong className="text-emerald-400">{daemon.total_actions_executed}</strong></span>
          </div>

          <button
            onClick={handleTriggerSweep}
            disabled={busySweep}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-[12.5px] px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shadow-xs disabled:opacity-50"
          >
            {busySweep ? "Sweeping…" : "⚡ Run Sweep Now"}
          </button>
          
          <button
            onClick={toggleDaemon}
            className="text-[12px] border border-slate-600 hover:bg-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            {daemon.status === "RUNNING" ? "Pause" : "Resume"}
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Resources */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-[13px] font-medium text-slate-500 mb-2">Resources</div>
          <div className="font-mono text-[32px] font-bold text-slate-900 leading-none mb-2">{totalCount}</div>
          <div className="text-[12px] font-medium text-slate-400">8 services · 1 region</div>
        </div>

        {/* Card 2: Healthy */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-[13px] font-medium text-slate-500 mb-2">Healthy</div>
          <div className="font-mono text-[32px] font-bold text-emerald-600 leading-none mb-2">{healthyCount}</div>
          <div className="text-[12px] font-medium text-emerald-600">
            {Math.round((healthyCount / totalCount) * 100)}% of fleet
          </div>
        </div>

        {/* Card 3: Anomalies */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-[13px] font-medium text-slate-500 mb-2">Anomalies</div>
          <div className="font-mono text-[32px] font-bold text-amber-600 leading-none mb-2">2</div>
          <div className="text-[12px] font-medium text-amber-600">active now</div>
        </div>

        {/* Card 4: Predicted Issues */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-[13px] font-medium text-slate-500 mb-2">Predicted issues</div>
          <div className="font-mono text-[32px] font-bold text-red-600 leading-none mb-2">2</div>
          <div className="text-[12px] font-medium text-red-600">next 30 min</div>
        </div>
      </div>

      {/* Red Alert Banner */}
      <div className="bg-red-50/70 border border-red-200 rounded-xl p-4.5 flex items-start gap-3">
        <span className="text-red-500 text-[16px] mt-0.5">⚠</span>
        <div>
          <h4 className="font-display font-semibold text-[14.5px] text-slate-900 mb-0.5">
            Potential capacity shortage predicted in approximately 18 minutes
          </h4>
          <p className="text-[13px] text-slate-600 leading-relaxed">
            Web tier is trending toward its measured request capacity. See Predictions and Recommendations for the full evidence chain.
          </p>
        </div>
      </div>

      {/* Side by Side Charts & Capacity Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5 items-start">
        {/* Left: Traffic Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-[15px] text-slate-900">
              Traffic — current vs predicted
            </h3>
            <span className="text-[12px] font-mono text-slate-400">req/min</span>
          </div>

          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={traffic}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="current"
                  name="Current Traffic"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#0284c7" }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Predicted Demand"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: "#d97706" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Capacity Plan */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
          <h3 className="font-display font-semibold text-[15px] text-slate-900 mb-5">
            Capacity plan
          </h3>

          <div className="space-y-3.5 mb-6">
            <div className="flex justify-between items-baseline text-[13px] py-2 border-b border-slate-100">
              <span className="text-slate-600">Current capacity</span>
              <span className="font-mono font-semibold text-slate-900">10,000 req/min</span>
            </div>
            <div className="flex justify-between items-baseline text-[13px] py-2 border-b border-slate-100">
              <span className="text-slate-600">Predicted demand (30m)</span>
              <span className="font-mono font-semibold text-amber-600">31,800 req/min</span>
            </div>
            <div className="flex justify-between items-baseline text-[13px] py-2 border-b border-slate-100">
              <span className="text-slate-600">Recommended capacity</span>
              <span className="font-mono font-semibold text-sky-600">36,000 req/min</span>
            </div>
            <div className="flex justify-between items-baseline text-[13px] py-2 border-b border-slate-100">
              <span className="text-slate-600">Estimated additional cost</span>
              <span className="font-mono font-semibold text-slate-900">₹142/hr</span>
            </div>
          </div>

          <Link
            to="/app/simulator"
            className="w-full bg-[#4FD1E8] text-[#04141A] font-semibold text-[14px] rounded-lg py-2.5 text-center hover:bg-[#3ec4db] transition-colors shadow-xs"
          >
            Open in simulator
          </Link>
        </div>
      </div>
    </div>
  );
}
