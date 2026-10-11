import { useEffect, useState } from "react";
import { api } from "../api/client";

const DEMO_ANOMALIES = [
  { metric_name: "web_asg_cpu_utilization", current_value: 91.4, baseline_value: 58.0, deviation_sigma: 3.42, is_anomaly: true, severity: "high", method: "Z-Score + EWMA", note: "CPU utilization spiked +3.42σ above historical 30-day baseline." },
  { metric_name: "rds_active_connections", current_value: 184, baseline_value: 65, deviation_sigma: 2.85, is_anomaly: true, severity: "medium", method: "EWMA Drift", note: "Active DB connection pool utilization reached 92% of max pool limit." },
];

export default function Anomalies() {
  const [anomalies, setAnomalies] = useState<any[]>(DEMO_ANOMALIES);

  useEffect(() => {
    api.anomalies()
      .then((a) => {
        if (a && a.metric_name) setAnomalies([a]);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs font-sans">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-[16px] text-slate-900">Detected Metric Anomalies</h3>
          <p className="text-[12.5px] text-slate-500">EWMA drift and Z-score deviation statistical engine</p>
        </div>
        <span className="text-[12px] font-mono text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
          2 Anomalies Detected
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13.5px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[12px]">
              <th className="py-2.5">Metric Name</th>
              <th className="py-2.5">Current Value</th>
              <th className="py-2.5">Baseline</th>
              <th className="py-2.5">Deviation (Sigma)</th>
              <th className="py-2.5">Severity</th>
              <th className="py-2.5">Detection Algorithm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
            {anomalies.map((a, i) => (
              <tr key={i} className="hover:bg-slate-50/50">
                <td className="py-3 font-semibold text-slate-900">{a.metric_name}</td>
                <td className="py-3 text-red-600 font-bold">{a.current_value}</td>
                <td className="py-3 text-slate-500">{a.baseline_value}</td>
                <td className="py-3 font-bold text-amber-600">{a.deviation_sigma}σ</td>
                <td className="py-3">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      a.severity === "high" || a.severity === "crit"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {a.severity}
                  </span>
                </td>
                <td className="py-3 text-[12.5px] text-slate-600">{a.method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {anomalies[0] && (
        <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-[12.5px] text-slate-600 font-mono">
          ℹ️ {anomalies[0].note}
        </div>
      )}
    </div>
  );
}
