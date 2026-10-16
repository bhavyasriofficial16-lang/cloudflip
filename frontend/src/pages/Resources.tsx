import { useEffect, useState } from "react";
import { api } from "../api/client";

const DEMO_RESOURCES = [
  { id: "1", name: "web-asg-1", resource_type: "Auto Scaling Group", region: "us-east-1", status: "warning", tags: { env: "prod", app: "web" } },
  { id: "2", name: "orders-rds", resource_type: "RDS PostgreSQL", region: "us-east-1", status: "healthy", tags: { env: "prod", app: "database" } },
  { id: "3", name: "payment-sqs", resource_type: "SQS Queue", region: "us-east-1", status: "healthy", tags: { env: "prod", app: "queue" } },
  { id: "4", name: "alb-frontend", resource_type: "Application Load Balancer", region: "us-east-1", status: "healthy", tags: { env: "prod" } },
  { id: "5", name: "cache-redis", resource_type: "ElastiCache Redis", region: "us-east-1", status: "healthy", tags: { env: "prod" } },
];

export default function Resources() {
  const [resources, setResources] = useState<any[]>(DEMO_RESOURCES);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = () => {
    api.resources()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) setResources(res);
      })
      .catch(() => {});
  };

  const handleDiscover = async () => {
    setBusy(true);
    try {
      const res = await api.discoverAWS();
      alert(res.message || `Discovered ${res.discovered_total || 0} real resources from AWS.`);
      fetchResources();
    } catch (err: any) {
      alert("AWS Discovery failed: " + err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs font-sans">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-[16px] text-slate-900">Discovered Cloud Resources</h3>
          <p className="text-[12.5px] text-slate-500">Live fleet inventory and health statuses</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDiscover}
            disabled={busy}
            className="text-[12.5px] font-semibold bg-[#4FD1E8] text-[#04141A] hover:bg-[#3ec4db] px-3.5 py-1.5 rounded-lg shadow-xs disabled:opacity-50 transition-colors"
          >
            {busy ? "Scanning AWS Fleet…" : "⚡ Discover Real AWS Fleet"}
          </button>
          <span className="text-[12px] font-mono text-slate-500">Total: {resources.length} resources</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13.5px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[12px]">
              <th className="py-2.5">Resource Name</th>
              <th className="py-2.5">Type</th>
              <th className="py-2.5">Region</th>
              <th className="py-2.5">Health Status</th>
              <th className="py-2.5">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
            {resources.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/50">
                <td className="py-3 font-semibold text-slate-900">{r.name}</td>
                <td className="py-3">{r.resource_type}</td>
                <td className="py-3">{r.region}</td>
                <td className="py-3">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      r.status === "healthy"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : r.status === "warning"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="py-3 text-[12px] text-slate-500">
                  {Object.entries(r.tags || {}).map(([k, v]) => `${k}:${v}`).join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
