import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../api/client";

const INITIAL_RESULT = {
  predicted_traffic_rpm: 31800,
  projected_cpu_pct: 91.4,
  projected_latency_ms: 4200,
  projected_error_rate_pct: 3.8,
  required_instances: 12,
  bottleneck: "Web ASG CPU & Request Capacity",
  estimated_additional_cost_per_hour: 142,
};

export default function Simulator() {
  const [mult, setMult] = useState(3);
  const [horizon, setHorizon] = useState(30);
  const [instances, setInstances] = useState(4);
  const [result, setResult] = useState<any>(INITIAL_RESULT);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await api.runSimulation({
        traffic_multiplier: mult,
        horizon_minutes: horizon,
        current_instances: instances,
      });
      if (r && r.predicted_traffic_rpm) {
        setResult(r);
      }
    } catch (e) {
      // Synthetic fallback calculation for demo
      const traffic = Math.round(8000 * mult);
      const reqInstances = Math.max(instances, Math.ceil(traffic / 3000));
      const cpu = Math.min(99, Math.round((traffic / (instances * 3000)) * 60));
      setResult({
        predicted_traffic_rpm: traffic,
        projected_cpu_pct: cpu,
        projected_latency_ms: cpu > 80 ? 3200 : 850,
        projected_error_rate_pct: cpu > 85 ? 2.5 : 0.1,
        required_instances: reqInstances,
        bottleneck: cpu > 80 ? "Web ASG Request Capacity" : "None",
        estimated_additional_cost_per_hour: (reqInstances - instances) * 35,
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = Array.from({ length: 11 }, (_, i) => ({
    time: i === 0 ? "now" : `+${Math.round((horizon * i) / 10)}m`,
    value: Math.round(8000 + (((result ? result.predicted_traffic_rpm : 24000) - 8000) * i) / 10),
  }));

  return (
    <div className="space-y-6 font-sans">
      {/* Simulation Setup Control Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-semibold text-[17px] text-slate-900">What-If Infrastructure Simulator</h3>
            <p className="text-[12.5px] text-slate-500">Pure mathematical forecast engine — zero risk, zero live AWS modification</p>
          </div>
          <span className="text-[12px] font-mono font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
            Simulation Safety: Enforced
          </span>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end mb-6">
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-2">
              Traffic Surge Multiplier: <span className="font-mono text-sky-600 font-bold">{mult.toFixed(1)}×</span>
            </label>
            <input
              type="range" min={1} max={10} step={0.5} value={mult}
              onChange={(e) => setMult(parseFloat(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-2">
              Forecast Horizon: <span className="font-mono text-sky-600 font-bold">{horizon} min</span>
            </label>
            <input
              type="range" min={5} max={60} step={5} value={horizon}
              onChange={(e) => setHorizon(parseInt(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-2">Current Instances</label>
            <input
              type="number" min={1} max={40} value={instances}
              onChange={(e) => setInstances(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-[14px] text-slate-900 outline-none focus:border-sky-400"
            />
          </div>

          <button
            onClick={run}
            disabled={loading}
            className="w-full bg-[#4FD1E8] text-[#04141A] font-semibold text-[14px] rounded-lg py-2.5 hover:bg-[#3ec4db] transition-colors disabled:opacity-50 shadow-xs"
          >
            {loading ? "Calculating..." : "⚡ Run Simulation"}
          </button>
        </div>

        {/* Traffic Curve Chart */}
        <div className="h-[220px] w-full pt-4 border-t border-slate-100">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
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
              <Line type="monotone" dataKey="value" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3, fill: "#0284c7" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Simulation Results Output */}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs">
              <div className="text-[12.5px] font-medium text-slate-500 mb-1">Projected CPU Utilization</div>
              <div className={`font-mono text-[26px] font-bold ${result.projected_cpu_pct > 80 ? "text-red-600" : "text-emerald-600"}`}>
                {result.projected_cpu_pct}%
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs">
              <div className="text-[12.5px] font-medium text-slate-500 mb-1">Projected Latency (p99)</div>
              <div className="font-mono text-[26px] font-bold text-slate-900">{result.projected_latency_ms} ms</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs">
              <div className="text-[12.5px] font-medium text-slate-500 mb-1">Projected Error Rate</div>
              <div className={`font-mono text-[26px] font-bold ${result.projected_error_rate_pct > 2 ? "text-red-600" : "text-emerald-600"}`}>
                {result.projected_error_rate_pct}%
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs font-mono text-[13.5px] space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600">
              <span>Predicted Peak Demand</span>
              <span className="font-bold text-slate-900">{result.predicted_traffic_rpm.toLocaleString()} req/min</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600">
              <span>Required Server Capacity</span>
              <span className="font-bold text-sky-600">{result.required_instances} instances</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600">
              <span>Identified Constraint</span>
              <span className="font-bold text-amber-600">{result.bottleneck}</span>
            </div>
            <div className="flex justify-between py-2 text-slate-600">
              <span>Estimated Cost Impact</span>
              <span className="font-bold text-emerald-600">+₹{result.estimated_additional_cost_per_hour}/hr</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
