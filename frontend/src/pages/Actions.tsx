import { useEffect, useState } from "react";
import { api } from "../api/client";

const DEMO_ACTIONS = [
  {
    id: "act_101",
    action_type: "modify_asg_capacity",
    resource_name: "web-asg-1",
    previous_state: "4 instances",
    requested_state: "12 instances",
    is_simulated: true,
    execution_result: "SUCCESS — ASG capacity modified & latency verified (-74% drop)",
    timestamp: "2 mins ago",
  },
  {
    id: "act_102",
    action_type: "tune_db_connection_pool",
    resource_name: "orders-rds",
    previous_state: "200 connections",
    requested_state: "350 connections",
    is_simulated: true,
    execution_result: "SUCCESS — DB pool expanded & thread bottleneck cleared",
    timestamp: "18 mins ago",
  },
];

export default function Actions() {
  const [actions, setActions] = useState<any[]>(DEMO_ACTIONS);

  useEffect(() => {
    api.actions()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) setActions(res);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs font-sans">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-[16px] text-slate-900">Executed Remediation Actions</h3>
          <p className="text-[12.5px] text-slate-500">Autonomous AI Agent & manual approval audit trail</p>
        </div>
        <span className="text-[12px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          {actions.length} Actions Verified
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13.5px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[12px]">
              <th className="py-2.5">Action Type</th>
              <th className="py-2.5">Resource</th>
              <th className="py-2.5">State Change</th>
              <th className="py-2.5">Mode</th>
              <th className="py-2.5">Execution Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
            {actions.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/50">
                <td className="py-3 font-semibold text-slate-900">{a.action_type}</td>
                <td className="py-3 text-sky-600 font-semibold">{a.resource_name || a.resource_id?.slice(0, 8)}</td>
                <td className="py-3 text-[12.5px]">
                  <span className="text-slate-500">{typeof a.previous_state === "object" ? JSON.stringify(a.previous_state) : a.previous_state}</span>
                  <span className="text-slate-400 mx-1.5">→</span>
                  <span className="text-emerald-600 font-bold">{typeof a.requested_state === "object" ? JSON.stringify(a.requested_state) : a.requested_state}</span>
                </td>
                <td className="py-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 uppercase">
                    {a.is_simulated ? "Simulated" : "Live"}
                  </span>
                </td>
                <td className="py-3 text-[12.5px] text-emerald-700 font-semibold">{a.execution_result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
