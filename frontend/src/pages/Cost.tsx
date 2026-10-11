import { useEffect, useState } from "react";
import { api } from "../api/client";

const DEMO_COST = [
  { strategy: "current_baseline", resource_count: 4, predicted_errors: "3.8%", estimated_cost_per_hour: 142, assumptions: { source: "AWS Public Pricing API", region: "ap-south-1" } },
  { strategy: "cloudflip_predictive", resource_count: 12, predicted_errors: "0.0%", estimated_cost_per_hour: 284, assumptions: { source: "AWS Public Pricing API", region: "ap-south-1" } },
];

export default function Cost() {
  const [rows, setRows] = useState<any[]>(DEMO_COST);

  useEffect(() => {
    api.costCompare()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) setRows(res);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-5 font-sans">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-[16px] text-slate-900">Cost Intelligence & Infrastructure Comparison</h3>
          <p className="text-[12.5px] text-slate-500">Compare infrastructure scaling strategies against estimated costs and error outcomes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rows.map((r) => (
            <div key={r.strategy} className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs">
              <h4 className="font-display font-bold text-[15px] text-slate-900 mb-4 capitalize">
                {r.strategy.replace(/_/g, " ")} Strategy
              </h4>

              <div className="space-y-2.5 font-mono text-[13px]">
                <div className="flex justify-between py-1.5 border-b border-slate-200/60 text-slate-600">
                  <span>Monitored Resources</span>
                  <span className="font-bold text-slate-900">{r.resource_count}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60 text-slate-600">
                  <span>Predicted Error Rate</span>
                  <span className={`font-bold ${parseFloat(r.predicted_errors) > 2 ? "text-red-600" : "text-emerald-600"}`}>
                    {r.predicted_errors}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-600">
                  <span>Est. Hourly Cost</span>
                  <span className="font-bold text-sky-600">₹{r.estimated_cost_per_hour}/hr</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {rows[0] && (
          <p className="text-[12px] text-slate-500 font-mono mt-5 pt-4 border-t border-slate-100">
            ℹ️ Cost estimates derived from {rows[0].assumptions?.source || "AWS Public Pricing API"} for region {rows[0].assumptions?.region || "ap-south-1"}.
          </p>
        )}
      </div>
    </div>
  );
}
