import { useEffect, useState } from "react";
import { api } from "../api/client";

const DEMO_BOTTLENECKS = [
  { constraint_type: "web_asg_request_capacity", current_value: 31800, limit_value: 36000, trend: "rising", eta_minutes: 18 },
  { constraint_type: "rds_db_connections", current_value: 184, limit_value: 200, trend: "rising", eta_minutes: 14 },
  { constraint_type: "sqs_queue_backlog", current_value: 1420, limit_value: 5000, trend: "stable", eta_minutes: null },
];

export default function Bottlenecks() {
  const [rows, setRows] = useState<any[]>(DEMO_BOTTLENECKS);

  useEffect(() => {
    api.bottlenecks()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) setRows(res);
      })
      .catch(() => {});
  }, []);

  const top = rows.find((r) => r.trend === "rising");

  return (
    <div className="space-y-5 font-sans">
      {top && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4.5 flex items-start gap-3">
          <span className="text-amber-600 text-[16px] mt-0.5">⚠️</span>
          <div>
            <h4 className="font-display font-semibold text-[14.5px] text-slate-900 mb-0.5">
              {top.constraint_type.replace(/_/g, " ")} projected bottleneck
            </h4>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Currently at {top.current_value.toLocaleString()} / {top.limit_value.toLocaleString()}
              {top.eta_minutes ? `, projected ETA to limit ~${top.eta_minutes} minutes.` : "."}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-[16px] text-slate-900">Infrastructure Capacity Constraints</h3>
            <p className="text-[12.5px] text-slate-500">Resource limits and ETA to capacity breach</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[12px]">
                <th className="py-2.5">Constraint Type</th>
                <th className="py-2.5">Current Usage</th>
                <th className="py-2.5">Capacity Limit</th>
                <th className="py-2.5">Trend</th>
                <th className="py-2.5">ETA to Breach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-3 font-semibold text-slate-900">{r.constraint_type}</td>
                  <td className="py-3 text-slate-900 font-bold">{r.current_value.toLocaleString()}</td>
                  <td className="py-3 text-slate-500">{r.limit_value.toLocaleString()}</td>
                  <td className="py-3">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                        r.trend === "rising" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {r.trend}
                    </span>
                  </td>
                  <td className="py-3 text-amber-600 font-bold">{r.eta_minutes ? `~${r.eta_minutes} min` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
