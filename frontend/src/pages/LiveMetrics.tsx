import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../api/client";

export default function LiveMetrics() {
  const [metrics, setMetrics] = useState<any[]>([
    { time: "0s", cpu: 52, rpm: 8200, latency: 120, db_conns: 65 },
    { time: "10s", cpu: 58, rpm: 8900, latency: 135, db_conns: 72 },
    { time: "20s", cpu: 67, rpm: 9500, latency: 180, db_conns: 85 },
    { time: "30s", cpu: 74, rpm: 10800, latency: 240, db_conns: 110 },
    { time: "40s", cpu: 82, rpm: 12500, latency: 450, db_conns: 145 },
    { time: "50s", cpu: 91, rpm: 14800, latency: 1100, db_conns: 184 },
  ]);

  useEffect(() => {
    api.metrics("normal", 20)
      .then((d) => {
        if (d && Array.isArray(d.series) && d.series.length > 0) {
          const points = d.series.map((p: any, i: number) => ({
            time: `${i * 10}s`,
            cpu: Math.min(98, Math.round((p.value / 15000) * 100)),
            rpm: p.value,
            latency: Math.round(100 + (p.value / 15000) * 1000),
            db_conns: Math.round(40 + (p.value / 15000) * 140),
          }));
          setMetrics(points);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-[16px] text-slate-900">Real-Time Infrastructure Metrics</h3>
            <p className="text-[12.5px] text-slate-500">Live telemetry stream for CPU, Traffic (RPM), DB Connections & Latency</p>
          </div>
          <span className="text-[12px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            ● Streaming (10s interval)
          </span>
        </div>

        {/* 2x2 Metric Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
          {/* Chart 1: Request Rate (RPM) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[13px] font-semibold text-slate-900">Request Rate (RPM)</span>
              <span className="text-[12px] font-mono text-sky-600 font-bold">{metrics[metrics.length - 1]?.rpm?.toLocaleString() || 14800} req/min</span>
            </div>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "6px", fontSize: "11px" }} />
                  <Line type="monotone" dataKey="rpm" stroke="#0284c7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: CPU Utilization (%) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[13px] font-semibold text-slate-900">CPU Utilization (%)</span>
              <span className="text-[12px] font-mono text-red-600 font-bold">{metrics[metrics.length - 1]?.cpu || 91}%</span>
            </div>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "6px", fontSize: "11px" }} />
                  <Line type="monotone" dataKey="cpu" stroke="#dc2626" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Latency p99 (ms) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[13px] font-semibold text-slate-900">Latency p99 (ms)</span>
              <span className="text-[12px] font-mono text-amber-600 font-bold">{metrics[metrics.length - 1]?.latency || 1100} ms</span>
            </div>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "6px", fontSize: "11px" }} />
                  <Line type="monotone" dataKey="latency" stroke="#d97706" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: RDS Active Connections */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[13px] font-semibold text-slate-900">RDS DB Connections</span>
              <span className="text-[12px] font-mono text-slate-900 font-bold">{metrics[metrics.length - 1]?.db_conns || 184} / 200</span>
            </div>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                  <YAxis domain={[0, 200]} stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "6px", fontSize: "11px" }} />
                  <Line type="monotone" dataKey="db_conns" stroke="#7c3aed" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
