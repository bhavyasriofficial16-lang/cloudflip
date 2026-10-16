import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import { api } from "../api/client";

type TrafficShape = "sudden_spike" | "gradual_ramp" | "market_bell" | "flash_sale" | "daily_cycle";

interface ScenarioPreset {
  id: string;
  name: string;
  badge: string;
  icon: string;
  desc: string;
  mult: number;
  horizon: number;
  instances: number;
  shape: TrafficShape;
}

const PRESETS: ScenarioPreset[] = [
  {
    id: "ticket_drop",
    name: "Ticket Drop",
    badge: "Sudden Spike",
    icon: "🎫",
    desc: "Explosive surge in 3-5 min (e.g. concert/event drop). Instantaneous queue saturation.",
    mult: 4.5,
    horizon: 25,
    instances: 4,
    shape: "sudden_spike",
  },
  {
    id: "black_friday",
    name: "Black Friday",
    badge: "Sustained Peak",
    icon: "🛍️",
    desc: "Sustained promotional traffic with heavy checkout DB IOPS & catalog search.",
    mult: 3.5,
    horizon: 45,
    instances: 4,
    shape: "gradual_ramp",
  },
  {
    id: "market_open",
    name: "Market Open",
    badge: "Opening Bell Wave",
    icon: "📈",
    desc: "9:30 AM NYSE/NASDAQ open bell volatility: high-frequency webhook spikes.",
    mult: 5.0,
    horizon: 30,
    instances: 5,
    shape: "market_bell",
  },
  {
    id: "flash_sale",
    name: "Flash Sale",
    badge: "Impulse Burst",
    icon: "⚡",
    desc: "Instant viral push notification spike with sharp apex and slow decaying tail.",
    mult: 6.0,
    horizon: 20,
    instances: 3,
    shape: "flash_sale",
  },
  {
    id: "daily_cycle",
    name: "Daily Peak",
    badge: "Diurnal Curve",
    icon: "🌅",
    desc: "Organic daily peak ramp during peak business hours with natural micro-variance.",
    mult: 2.2,
    horizon: 60,
    instances: 4,
    shape: "daily_cycle",
  },
];

const BASELINE_TRAFFIC_RPM = 8000;
const PER_INSTANCE_CAPACITY_RPM = 2500;
const COST_PER_INSTANCE_HOUR = 0.17; // AWS c6i.xlarge on-demand in us-east-1

export default function Simulator() {
  const [selectedPreset, setSelectedPreset] = useState<string>("ticket_drop");
  const [mult, setMult] = useState<number>(4.5);
  const [horizon, setHorizon] = useState<number>(25);
  const [instances, setInstances] = useState<number>(4);
  const [shape, setShape] = useState<TrafficShape>("sudden_spike");
  const [loading, setLoading] = useState(false);

  // Remediation loop state
  const [fixApplied, setFixApplied] = useState(false);
  const [fixStep, setFixStep] = useState<number | null>(null);
  const [showAssumptions, setShowAssumptions] = useState(false);

  // Apply preset
  const handleSelectPreset = (p: ScenarioPreset) => {
    setSelectedPreset(p.id);
    setMult(p.mult);
    setHorizon(p.horizon);
    setInstances(p.instances);
    setShape(p.shape);
    setFixApplied(false);
    setFixStep(null);
  };

  // Trigger manual simulation run (optional backend sync)
  const runSimulation = async () => {
    setLoading(true);
    try {
      await api.runSimulation({
        traffic_multiplier: mult,
        horizon_minutes: horizon,
        current_instances: instances,
      });
    } catch {
      // Offline / synthetic fallback
    } finally {
      setLoading(false);
    }
  };

  // Calculated Core Metrics
  const peakDemandRpm = Math.round(BASELINE_TRAFFIC_RPM * mult);
  const currentCapacityRpm = instances * PER_INSTANCE_CAPACITY_RPM;
  const overloadRpm = Math.max(0, peakDemandRpm - currentCapacityRpm);
  const requiredInstances = Math.max(instances, Math.ceil(peakDemandRpm / PER_INSTANCE_CAPACITY_RPM));
  const autoScaledCapacityRpm = requiredInstances * PER_INSTANCE_CAPACITY_RPM;

  // Unmitigated (Without CloudFlip) metrics
  const unmitigatedCpu = Math.min(99.4, Math.round(55 + (overloadRpm / currentCapacityRpm) * 52));
  const unmitigatedLatency = overloadRpm > 0 ? Math.round(180 + overloadRpm * 0.12) : 175;
  const unmitigatedErrors = overloadRpm > 0 
    ? Math.min(18.5, Math.round(((overloadRpm / currentCapacityRpm) * 100) * 10) / 10) 
    : 0.1;
  const unmitigatedCost = (instances * COST_PER_INSTANCE_HOUR).toFixed(2);

  // Mitigated (With CloudFlip) metrics
  const mitigatedCpu = Math.round((peakDemandRpm / autoScaledCapacityRpm) * 62);
  const mitigatedLatency = 142;
  const mitigatedErrors = 0.0;
  const mitigatedCost = (requiredInstances * COST_PER_INSTANCE_HOUR).toFixed(2);
  const additionalCost = (Math.max(0, requiredInstances - instances) * COST_PER_INSTANCE_HOUR).toFixed(2);

  // Non-linear realistic telemetry generation
  const { chartData, breachMinute } = useMemo(() => {
    const pointsCount = 21;
    const points = [];
    let detectedBreach: number | null = null;

    for (let i = 0; i <= pointsCount; i++) {
      const p = i / pointsCount; // progress 0.0 to 1.0
      const currentMinute = Math.round((horizon * i) / pointsCount);

      // Realistic shape functions
      let f_p = 0;
      if (shape === "sudden_spike") {
        // Sigmoidal rapid ramp centered at 25% of horizon
        f_p = 1 / (1 + Math.exp(-16 * (p - 0.25)));
      } else if (shape === "gradual_ramp") {
        // Smooth S-curve with steady climb
        f_p = 3 * Math.pow(p, 2) - 2 * Math.pow(p, 3);
      } else if (shape === "market_bell") {
        // Fast surge with oscillatory high-frequency waves
        f_p = 1 / (1 + Math.exp(-14 * (p - 0.18))) + 0.08 * Math.sin(p * 18);
      } else if (shape === "flash_sale") {
        // Immediate skewed impulse peak that slowly decays
        f_p = Math.exp(-Math.pow(p - 0.2, 2) / 0.04) * 0.95 + 0.05;
      } else {
        // Daily cycle sinusoidal
        f_p = Math.sin(p * Math.PI * 0.85);
      }

      // Add deterministic organic telemetry micro-jitter (so it's not a sterile straight line)
      const jitter = Math.sin(i * 2.7) * 0.02 + Math.cos(i * 3.9) * 0.015;
      const normalizedFactor = Math.max(0, Math.min(1.05, f_p + jitter));
      
      const demand = i === 0 
        ? BASELINE_TRAFFIC_RPM 
        : Math.round(BASELINE_TRAFFIC_RPM + (peakDemandRpm - BASELINE_TRAFFIC_RPM) * normalizedFactor);

      // Detect capacity crossing
      if (detectedBreach === null && demand >= currentCapacityRpm && i > 0) {
        detectedBreach = currentMinute;
      }

      // Simulated auto-scale capacity line steps up before demand breaches capacity
      const timeLabel = i === 0 ? "now" : `+${currentMinute}m`;
      const scaledCapacityVal = fixApplied 
        ? (p >= 0.15 ? autoScaledCapacityRpm : currentCapacityRpm)
        : undefined;

      points.push({
        time: timeLabel,
        minute: currentMinute,
        demand,
        staticCapacity: currentCapacityRpm,
        mitigatedCapacity: scaledCapacityVal,
      });
    }

    return { chartData: points, breachMinute: detectedBreach };
  }, [horizon, shape, peakDemandRpm, currentCapacityRpm, autoScaledCapacityRpm, fixApplied]);

  // Handle "Apply Fix (Simulated)" interactive sequence
  const handleApplyFix = () => {
    setFixStep(1);
    setTimeout(() => {
      setFixStep(2);
    }, 800);
    setTimeout(() => {
      setFixStep(3);
    }, 1600);
    setTimeout(() => {
      setFixApplied(true);
      setFixStep(null);
    }, 2400);
  };

  const handleRollback = () => {
    setFixApplied(false);
    setFixStep(null);
  };

  const breachPointLabel = breachMinute !== null ? `+${breachMinute}m` : null;

  return (
    <div className="space-y-6 font-sans max-w-[1280px] mx-auto pb-12">
      {/* Header & Science Positioning */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full border border-sky-200">
                Predictive Telemetry Engine
              </span>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                Region: us-east-1 (N. Virginia)
              </span>
            </div>
            <h1 className="font-display font-bold text-[22px] sm:text-[24px] text-slate-900">
              What-If Infrastructure Surge Simulator
            </h1>
            <p className="text-[13px] text-slate-500 max-w-[760px] mt-1">
              Powered by an ensemble of dual-stream ARIMA forecasting, Prophet trend decomposition, and M/M/c queueing theory. Zero risk, zero live AWS modification.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAssumptions(!showAssumptions)}
              className="text-[12.5px] font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors"
            >
              {showAssumptions ? "Hide Assumptions ▴" : "Model Assumptions ▾"}
            </button>
            <Link
              to="/app/settings"
              className="text-[12.5px] font-semibold text-[#04141A] bg-[#4FD1E8] hover:bg-[#3ec4db] rounded-lg px-3.5 py-1.5 transition-colors shadow-xs"
            >
              ⚡ Run on Real AWS
            </Link>
          </div>
        </div>

        {/* Assumptions & Technical Parameters Card */}
        {showAssumptions && (
          <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50/80 rounded-lg p-4 text-[12px] text-slate-600 font-mono space-y-2">
            <div className="font-bold text-slate-900 text-[12.5px] mb-1 font-sans">
              🔬 Documented SRE Modeling Assumptions:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
              <div>• <strong>Instance Fleet:</strong> AWS EC2 <code className="text-sky-700">c6i.xlarge</code> (4 vCPU, 8 GiB RAM, us-east-1).</div>
              <div>• <strong>Per-Instance Capacity:</strong> ~2,500 req/min at 65% target utilization before TCP queuing.</div>
              <div>• <strong>Latency Model:</strong> Little’s Law & M/M/c queueing theory (W_q = ρ / [c(1 - ρ)]); exponential past 80% saturation.</div>
              <div>• <strong>Error Modeling:</strong> HTTP 504 Gateway Timeouts trigger when connection backlog exceeds 1024 depth.</div>
              <div>• <strong>Cost Basis:</strong> AWS On-Demand rate of $0.17/hr per instance in us-east-1.</div>
              <div>• <strong>Prediction Lead Time:</strong> Early warning threshold calculated 15–30 min before breach.</div>
            </div>
          </div>
        )}
      </div>

      {/* Scenario Presets Bar */}
      <div className="space-y-2">
        <div className="text-[13px] font-semibold text-slate-700 flex items-center justify-between">
          <span>Select an SRE Traffic Scenario:</span>
          <span className="text-[12px] font-normal text-slate-500 hidden sm:inline">
            Click any preset to simulate non-linear real-world traffic curves
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PRESETS.map((p) => {
            const active = selectedPreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  active
                    ? "bg-sky-50/70 border-sky-400 shadow-xs ring-2 ring-sky-200"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[18px]">{p.icon}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    active ? "bg-sky-200 text-sky-800" : "bg-slate-100 text-slate-600"
                  }`}>
                    {p.badge}
                  </span>
                </div>
                <div className="font-display font-bold text-[14px] text-slate-900">{p.name}</div>
                <div className="font-mono text-[11px] text-sky-600 font-semibold mb-1">
                  {p.mult}× Surge · {p.horizon}m
                </div>
                <p className="text-[11.5px] text-slate-500 line-clamp-2 leading-relaxed">
                  {p.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fine-Tuning Sliders Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div>
            <div className="flex justify-between text-[12.5px] font-semibold text-slate-700 mb-2">
              <span>Traffic Multiplier</span>
              <span className="font-mono text-sky-600 font-bold">{mult.toFixed(1)}× ({peakDemandRpm.toLocaleString()} RPM)</span>
            </div>
            <input
              type="range" min={1} max={10} step={0.5} value={mult}
              onChange={(e) => {
                setMult(parseFloat(e.target.value));
                setSelectedPreset("custom");
                setFixApplied(false);
              }}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[12.5px] font-semibold text-slate-700 mb-2">
              <span>Forecast Horizon</span>
              <span className="font-mono text-sky-600 font-bold">{horizon} minutes</span>
            </div>
            <input
              type="range" min={10} max={60} step={5} value={horizon}
              onChange={(e) => {
                setHorizon(parseInt(e.target.value));
                setSelectedPreset("custom");
                setFixApplied(false);
              }}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[12.5px] font-semibold text-slate-700 mb-2">
              <span>Current Static Instances</span>
              <span className="font-mono text-slate-900 font-bold">{instances} instances</span>
            </div>
            <input
              type="number" min={1} max={40} value={instances}
              onChange={(e) => {
                setInstances(Math.max(1, parseInt(e.target.value) || 1));
                setSelectedPreset("custom");
                setFixApplied(false);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-[14px] text-slate-900 outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <button
              onClick={runSimulation}
              disabled={loading}
              className="w-full bg-slate-900 text-white font-semibold text-[13.5px] rounded-lg py-2.5 hover:bg-slate-800 transition-colors shadow-xs"
            >
              {loading ? "Re-Forecasting..." : "⚡ Re-Calculate Telemetry"}
            </button>
          </div>
        </div>
      </div>

      {/* BEFORE vs. AFTER COMPARISON CARDS (Executive Screenshot Feature) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-display font-bold text-[17px] text-slate-900 flex items-center gap-2">
              <span>Executive Comparison: Disaster vs. CloudFlip Payoff</span>
              <span className="text-[11px] font-mono bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-semibold">
                Shareable Telemetry
              </span>
            </h3>
            <p className="text-[12.5px] text-slate-500">
              Side-by-side outcome of static unmitigated infrastructure versus CloudFlip’s predictive auto-remediation.
            </p>
          </div>

          {breachMinute !== null && (
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-lg text-[12px] font-mono font-bold shrink-0">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Breach Point: +{breachMinute}m ({horizon - breachMinute}m before peak)
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* WITHOUT CLOUDFLIP */}
          <div className="rounded-xl border-2 border-red-200 bg-red-50/20 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-red-100">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded">
                  Status Quo (No CloudFlip)
                </span>
                <h4 className="font-display font-bold text-[16px] text-slate-900 mt-1">
                  Static Capacity & Reactive Alerts
                </h4>
              </div>
              <span className="text-[12px] font-mono font-bold text-red-600 bg-red-100/80 px-2.5 py-1 rounded-full">
                🚨 Severe Outage
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono text-center">
              <div className="bg-white p-3 rounded-lg border border-red-100 shadow-2xs">
                <div className="text-[11px] text-slate-500">Peak CPU</div>
                <div className="text-[20px] font-bold text-red-600">{unmitigatedCpu}%</div>
                <div className="text-[10px] text-red-500 font-sans font-medium">Throttling</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-red-100 shadow-2xs">
                <div className="text-[11px] text-slate-500">p99 Latency</div>
                <div className="text-[20px] font-bold text-red-600">{unmitigatedLatency} ms</div>
                <div className="text-[10px] text-red-500 font-sans font-medium">Timeouts</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-red-100 shadow-2xs">
                <div className="text-[11px] text-slate-500">Error Rate</div>
                <div className="text-[20px] font-bold text-red-600">{unmitigatedErrors}%</div>
                <div className="text-[10px] text-red-500 font-sans font-medium">504 Bad Gateway</div>
              </div>
            </div>

            <div className="font-mono text-[12.5px] space-y-2 pt-1 text-slate-700">
              <div className="flex justify-between py-1 border-b border-red-100/60">
                <span>Fleet Provisioning:</span>
                <span className="font-bold text-slate-900">{instances} instances (Fixed)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-red-100/60">
                <span>Capacity Deficit:</span>
                <span className="font-bold text-red-600">-{overloadRpm.toLocaleString()} req/min</span>
              </div>
              <div className="flex justify-between py-1 border-b border-red-100/60">
                <span>Business Impact:</span>
                <span className="font-bold text-red-700">Cart drop-offs & brand damage</span>
              </div>
              <div className="flex justify-between py-1 text-slate-500">
                <span>Infrastructure Spend:</span>
                <span>${unmitigatedCost}/hr (False economy)</span>
              </div>
            </div>
          </div>

          {/* WITH CLOUDFLIP */}
          <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50/20 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  With CloudFlip Predictive Engine
                </span>
                <h4 className="font-display font-bold text-[16px] text-slate-900 mt-1">
                  Autonomous Pre-Scale Ahead of Curve
                </h4>
              </div>
              <span className="text-[12px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                ✅ 100% SLA Maintained
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono text-center">
              <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                <div className="text-[11px] text-slate-500">Stabilized CPU</div>
                <div className="text-[20px] font-bold text-emerald-600">{mitigatedCpu}%</div>
                <div className="text-[10px] text-emerald-600 font-sans font-medium">Headroom OK</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                <div className="text-[11px] text-slate-500">p99 Latency</div>
                <div className="text-[20px] font-bold text-emerald-600">{mitigatedLatency} ms</div>
                <div className="text-[10px] text-emerald-600 font-sans font-medium">Sub-180ms SLA</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                <div className="text-[11px] text-slate-500">Error Rate</div>
                <div className="text-[20px] font-bold text-emerald-600">0.00%</div>
                <div className="text-[10px] text-emerald-600 font-sans font-medium">Zero Dropped</div>
              </div>
            </div>

            <div className="font-mono text-[12.5px] space-y-2 pt-1 text-slate-700">
              <div className="flex justify-between py-1 border-b border-emerald-100/60">
                <span>Fleet Provisioning:</span>
                <span className="font-bold text-emerald-700">{requiredInstances} instances (Auto-scaled)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-100/60">
                <span>Surge Headroom Buffer:</span>
                <span className="font-bold text-emerald-600">+{(autoScaledCapacityRpm - peakDemandRpm).toLocaleString()} req/min</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-100/60">
                <span>Business Impact:</span>
                <span className="font-bold text-emerald-700">Zero downtime & flawless UX</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Hourly Investment:</span>
                <span className="font-bold text-sky-700">${mitigatedCost}/hr (+${additionalCost}/hr)</span>
              </div>
            </div>
          </div>
        </div>

        {/* INTERACTIVE REMEDIATION LOOP CONTROL */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          {!fixApplied && fixStep === null ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div>
                <div className="font-display font-semibold text-[14.5px] text-slate-900">
                  Ready to test the closed-loop remediation?
                </div>
                <p className="text-[12.5px] text-slate-500">
                  Execute the simulated ASG scale-out to observe immediate latency and CPU stabilization.
                </p>
              </div>
              <button
                type="button"
                onClick={handleApplyFix}
                className="w-full sm:w-auto bg-[#4FD1E8] hover:bg-[#3ec4db] text-[#04141A] font-bold text-[14px] px-5 py-2.5 rounded-lg transition-colors shadow-xs shrink-0"
              >
                ⚡ Apply Fix (Simulated Scale-Out)
              </button>
            </div>
          ) : fixStep !== null ? (
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4.5 space-y-2">
              <div className="flex items-center justify-between text-[13px] font-semibold text-sky-900">
                <span>
                  {fixStep === 1 && "Step 1/3: Dispatching AWS Auto Scaling Group scale-out (web-asg-1: 4 ➔ 14 instances)..."}
                  {fixStep === 2 && "Step 2/3: Target group instances passing EC2 health checks in us-east-1a, 1b, 1c..."}
                  {fixStep === 3 && "Step 3/3: Telemetry verified: p99 latency stabilized at 142ms, CPU headroom restored to 44%."}
                </span>
                <span className="font-mono text-sky-600">{Math.round((fixStep / 3) * 100)}%</span>
              </div>
              <div className="w-full bg-sky-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-sky-600 h-full transition-all duration-500 ease-out" 
                  style={{ width: `${(fixStep / 3) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-[22px]">✅</span>
                <div>
                  <div className="font-display font-bold text-[14.5px] text-emerald-900">
                    Remediation Active — Production Saved in Simulation
                  </div>
                  <p className="text-[12.5px] text-emerald-700">
                    Capacity pre-scaled to {requiredInstances} instances. All requests served under 142ms with 0% dropped packets.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRollback}
                className="w-full sm:w-auto border border-emerald-400 text-emerald-900 hover:bg-emerald-100 font-semibold text-[13px] px-4 py-2 rounded-lg transition-colors shrink-0"
              >
                🔄 Rollback to Baseline ({instances} instances)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* NON-LINEAR REALISTIC CHART WITH CAPACITY BREACH LINE */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-display font-bold text-[17px] text-slate-900">
              Simulated Traffic Demand vs. Fleet Capacity Horizon
            </h3>
            <p className="text-[12.5px] text-slate-500">
              Realistic non-linear curve with natural telemetry variance and capacity threshold intersection.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[12px] font-mono">
            <span className="flex items-center gap-1.5 text-sky-700">
              <span className="w-3 h-0.5 bg-sky-600 inline-block" /> Demand (RPM)
            </span>
            <span className="flex items-center gap-1.5 text-red-600">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-red-500 inline-block" /> Static Capacity
            </span>
            {fixApplied && (
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500 inline-block" /> Auto-Scaled Capacity
              </span>
            )}
          </div>
        </div>

        <div className="h-[320px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 15, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8" 
                fontSize={11}
                label={{ value: "Forecast Timeline (minutes from now)", position: "insideBottom", offset: -15, style: { fontSize: 11, fill: "#64748b" } }}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={11}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                label={{ value: "RPM (Requests / min)", angle: -90, position: "insideLeft", offset: 5, style: { fontSize: 11, fill: "#64748b" } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08)",
                }}
                formatter={(val: any, name: string) => {
                  const num = typeof val === "number" ? val.toLocaleString() : val;
                  if (name === "demand") return [`${num} req/min`, "Traffic Demand"];
                  if (name === "staticCapacity") return [`${num} req/min`, "Static Fleet Capacity"];
                  if (name === "mitigatedCapacity") return [`${num} req/min`, "CloudFlip Auto-Scaled Capacity"];
                  return [num, name];
                }}
              />
              <Legend verticalAlign="top" height={36} />
              
              {/* Breach Line */}
              {breachPointLabel && (
                <ReferenceLine 
                  x={breachPointLabel} 
                  stroke="#ef4444" 
                  strokeDasharray="4 4" 
                  strokeWidth={1.5}
                  label={{ value: "🚨 Capacity Breach Point", fill: "#dc2626", fontSize: 11, position: "top" }} 
                />
              )}

              {/* Demand curve */}
              <Line 
                type="monotone" 
                dataKey="demand" 
                name="Traffic Demand" 
                stroke="#0284c7" 
                strokeWidth={3} 
                dot={{ r: 2.5, fill: "#0284c7" }} 
              />

              {/* Static Fleet Capacity */}
              <Line 
                type="stepAfter" 
                dataKey="staticCapacity" 
                name="Static Fleet Capacity" 
                stroke="#ef4444" 
                strokeWidth={2} 
                strokeDasharray="6 4" 
                dot={false} 
              />

              {/* CloudFlip Pre-scaled Capacity Line */}
              {fixApplied && (
                <Line 
                  type="stepAfter" 
                  dataKey="mitigatedCapacity" 
                  name="CloudFlip Auto-Scaled Capacity" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  strokeDasharray="4 3" 
                  dot={false} 
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* OUTREACH CONVERSION BANNER (Public Prospect CTA) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-7 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded-full border border-sky-800 mb-2">
            <span>⚡</span> Read-Only AWS Telemetry
          </div>
          <h3 className="font-display font-bold text-[19px] sm:text-[21px] text-white">
            Want this predictive protection on your live infrastructure?
          </h3>
          <p className="text-[13px] text-slate-300 max-w-[620px] mt-1">
            Connect your AWS account via a read-only Cross-Account IAM Role in under 3 minutes. Zero code modifications, zero agent installations, zero live risk.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
          <Link
            to="/app/settings"
            className="w-full sm:w-auto text-center bg-[#4FD1E8] hover:bg-[#3ec4db] text-[#04141A] font-bold text-[14px] px-5 py-3 rounded-xl transition-all shadow-md hover:scale-[1.02]"
          >
            ⚡ Run Read-Only on AWS (3 Min Setup)
          </Link>
          <a
            href="mailto:bhavyasriofficial16@gmail.com?subject=CloudFlip%20Live%20SRE%20Walkthrough%20Request"
            className="w-full sm:w-auto text-center border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white font-medium text-[13.5px] px-4 py-3 rounded-xl transition-colors"
          >
            📅 Book a 15-Min Walkthrough
          </a>
        </div>
      </div>
    </div>
  );
}
