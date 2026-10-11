import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Card, Badge } from "../components/ui";

export default function Recommendations() {
  const [recs, setRecs] = useState<any[]>([]);
  const [policy, setPolicy] = useState<{
    auto_remediation_mode: string;
    confidence_threshold: number;
    max_cost_impact: number;
  }>({
    auto_remediation_mode: "FULL_AUTONOMOUS",
    confidence_threshold: 0.85,
    max_cost_impact: 500.0,
  });
  const [runningSweep, setRunningSweep] = useState(false);
  const [sweepMsg, setSweepMsg] = useState<string | null>(null);

  const load = () => {
    api.recommendations().then(setRecs).catch(() => {});
    api.getAgentPolicy().then(setPolicy).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const updateMode = async (mode: string) => {
    try {
      const updated = await api.updateAgentPolicy({
        ...policy,
        auto_remediation_mode: mode,
      });
      setPolicy({
        auto_remediation_mode: updated.auto_remediation_mode,
        confidence_threshold: updated.confidence_threshold,
        max_cost_impact: updated.max_cost_impact,
      });
    } catch (e: any) {
      alert("Failed to update agent policy: " + e.message);
    }
  };

  const triggerAgent = async () => {
    setRunningSweep(true);
    setSweepMsg(null);
    try {
      const res = await api.triggerAutonomousSweep();
      setSweepMsg(`🤖 Agent executed autonomous remediation sweep! Checked ${res.sweep_summary.length} items.`);
      load();
    } catch (e: any) {
      setSweepMsg("Sweep failed: " + e.message);
    } finally {
      setRunningSweep(false);
    }
  };

  const decide = async (id: string, approve: boolean) => {
    if (approve) await api.approveRecommendation(id);
    else await api.rejectRecommendation(id);
    load();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Autonomous AI Agent Banner & Control Panel */}
      <Card className="p-5 border-cyan/40 bg-gradient-to-r from-cyan/10 via-surface to-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[18px]">🤖</span>
            <span className="font-display font-bold text-[16px] text-textMain">
              Autonomous AI Remediation Agent
            </span>
            <Badge tone={policy.auto_remediation_mode === "OFF" ? "crit" : "healthy"}>
              Mode: {policy.auto_remediation_mode}
            </Badge>
          </div>
          <p className="text-[12.5px] text-textDim mt-1">
            Predicts bottlenecks 15–30m in advance, directly executes resolution, and verifies metric improvements with auto-rollback.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={policy.auto_remediation_mode}
            onChange={(e) => updateMode(e.target.value)}
            className="bg-surface border border-border text-textMain rounded-md px-3 py-1.5 text-[13px] font-medium"
          >
            <option value="OFF">Human Approval Only (OFF)</option>
            <option value="SEMI_AUTONOMOUS">Semi-Autonomous (Auto-fix Low Risk)</option>
            <option value="FULL_AUTONOMOUS">Full Autonomous (Direct Auto-Fix & Verify)</option>
          </select>

          <button
            onClick={triggerAgent}
            disabled={runningSweep}
            className="bg-cyan text-[#04141A] font-semibold text-[13px] rounded-md px-4 py-1.5 transition-opacity disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5"
          >
            <span>⚡</span> {runningSweep ? "Solving..." : "Run AI Fix Sweep"}
          </button>
        </div>
      </Card>

      {sweepMsg && (
        <div className="bg-cyan/15 border border-cyan/40 text-cyan rounded-lg p-3 text-[13px] font-mono">
          {sweepMsg}
        </div>
      )}

      {/* Recommendations List */}
      <div className="flex flex-col gap-2.5">
        {recs.map((r) => (
          <Card key={r.id} className="p-5 grid grid-cols-[1fr_auto] gap-4 items-start">
            <div>
              <div className="font-display font-semibold text-[14.5px] mb-1">{r.title}</div>
              <div className="font-mono text-[19px] my-2">
                {Object.values(r.current_state)[0] as any} <span className="text-textFaint mx-2">→</span>
                <span className="text-cyan">{Object.values(r.recommended_state)[0] as any}</span>
              </div>
              <div className="text-[12.5px] text-textDim">{r.reason}</div>
              <ul className="text-[12.5px] text-textDim leading-relaxed mt-2 ml-4 list-disc">
                {r.evidence.map((e: string, i: number) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Badge tone={r.confidence === "high" ? "info" : "warn"}>Confidence: {r.confidence}</Badge>
              {r.estimated_cost_per_hour && (
                <span className="text-[11.5px] text-textFaint">Est. cost: +₹{r.estimated_cost_per_hour}/hr</span>
              )}
              {r.status === "pending" ? (
                <div className="flex gap-2">
                  <button onClick={() => decide(r.id, true)} className="text-[13px] font-semibold bg-cyan text-[#04141A] rounded-md px-3.5 py-1.5">
                    Approve
                  </button>
                  <button onClick={() => decide(r.id, false)} className="text-[13px] font-semibold border border-border rounded-md px-3.5 py-1.5">
                    Reject
                  </button>
                </div>
              ) : (
                <Badge tone={r.status === "approved" ? "healthy" : "crit"}>{r.status}</Badge>
              )}
            </div>
          </Card>
        ))}
        {recs.length === 0 && <p className="text-textFaint text-[13px]">No pending recommendations.</p>}
      </div>
    </div>
  );
}

