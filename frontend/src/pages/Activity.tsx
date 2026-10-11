import { useEffect, useState } from "react";
import { api } from "../api/client";

const DEMO_ACTIVITY = [
  { id: "1", timestamp: new Date().toISOString(), event: "🤖 Autonomous AI Agent auto-approved recommendation: 'Predictive Scale web-asg-1'", resource_id: "web-asg-1", result: "APPROVED" },
  { id: "2", timestamp: new Date(Date.now() - 120000).toISOString(), event: "⚡ Autonomous AI Agent executed scale fix to 12 instances", resource_id: "web-asg-1", result: "SUCCESS" },
  { id: "3", timestamp: new Date(Date.now() - 180000).toISOString(), event: "✅ Autonomous AI Agent verified resolution: latency down from 4200ms to 1100ms", resource_id: "web-asg-1", result: "VERIFIED" },
  { id: "4", timestamp: new Date(Date.now() - 360000).toISOString(), event: "🔍 Continuous prediction scan detected surge bottleneck", resource_id: "web-asg-1", result: "DETECTED" },
];

export default function Activity() {
  const [rows, setRows] = useState<any[]>(DEMO_ACTIVITY);

  useEffect(() => {
    api.activity()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) setRows(res);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs font-sans">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-[16px] text-slate-900">System Activity Log</h3>
          <p className="text-[12.5px] text-slate-500">Real-time Autonomous AI Agent & user audit events</p>
        </div>
        <span className="text-[12px] font-mono font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-full">
          Live Stream
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13.5px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[12px]">
              <th className="py-2.5">Time</th>
              <th className="py-2.5">Audit Event</th>
              <th className="py-2.5">Resource</th>
              <th className="py-2.5">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
            {rows.map((a, i) => (
              <tr key={i} className="hover:bg-slate-50/50">
                <td className="py-3 text-slate-500 text-[12px]">
                  {new Date(a.timestamp || Date.now()).toLocaleTimeString()}
                </td>
                <td className="py-3 text-slate-900 font-medium">{a.event}</td>
                <td className="py-3 text-sky-600 font-semibold">{a.resource_id ? a.resource_id.slice(0, 12) : "System"}</td>
                <td className="py-3 font-bold text-emerald-600">{a.result || "SUCCESS"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
