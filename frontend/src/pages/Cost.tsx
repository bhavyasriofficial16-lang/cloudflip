import { useEffect, useState } from "react";
import { api } from "../api/client";

interface ScanFinding {
  id: string;
  scan_id: string;
  resource_id: string;
  resource_name: string;
  resource_type: string;
  category: string;
  issue: string;
  risk_level: "Zero" | "Low" | "Medium" | "High" | "Critical";
  estimated_monthly_saving: number;
  currency: string;
  pricing_formula: string;
  pricing_source: string;
  evidence: Record<string, any>;
  recommended_fix: string;
  cli_remediation?: string;
  terraform_remediation?: string;
  confidence: string;
}

interface ScanRun {
  id: string;
  status: string;
  progress_percent: number;
  current_step: string;
  started_at: string;
  completed_at?: string;
  total_monthly_waste: number;
  currency: string;
  risk_summary: Record<string, number>;
  resource_count_scanned: number;
  findings_count: number;
  is_sample_or_simulation: boolean;
  findings: ScanFinding[];
}

const CATEGORY_LABELS: Record<string, string> = {
  all: "All Findings",
  idle_compute: "Idle EC2",
  unattached_ebs: "Unattached EBS",
  unused_eip: "Unused Elastic IPs",
  old_snapshot: "Old Snapshots",
  idle_lb: "Idle Load Balancers",
  asg_misconfig: "ASG Misconfig",
  oversized_instance: "Oversized EC2",
  saturation_risk: "Saturation Risks",
};

export default function Cost() {
  const [currentScan, setCurrentScan] = useState<ScanRun | null>(null);
  const [scansList, setScansList] = useState<ScanRun[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeRisk, setActiveRisk] = useState("all");
  const [selectedFinding, setSelectedFinding] = useState<ScanFinding | null>(null);
  const [remediationTab, setRemediationTab] = useState<"cli" | "terraform">("cli");
  const [copied, setCopied] = useState(false);

  // Strategy comparison rows from existing API
  const [strategyRows, setStrategyRows] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch available scans or load sample report
    api.getScans()
      .then((scans) => {
        if (Array.isArray(scans) && scans.length > 0) {
          setScansList(scans);
          // Set latest completed scan
          const latest = scans[0];
          api.getScan(latest.id).then(setCurrentScan).catch(() => {});
        } else {
          // If no scans in DB, load sample report
          api.getSampleScan().then((sample) => {
            setCurrentScan(sample);
            setScansList([sample]);
          }).catch(() => {});
        }
      })
      .catch(() => {
        api.getSampleScan().then((sample) => {
          setCurrentScan(sample);
          setScansList([sample]);
        }).catch(() => {});
      });

    // 2. Fetch strategy comparison
    api.costCompare().then(setStrategyRows).catch(() => {});
  }, []);

  const handleStartScan = async () => {
    try {
      setScanning(true);
      setScanProgress(5);
      setScanStep("Initializing read-only scanner & validating IAM STS role...");

      const startRes = await api.startScan({ is_demo: false });
      const scanId = startRes.id;

      // Poll scan status until completed
      const pollInterval = window.setInterval(async () => {
        try {
          const statusRes = await api.getScanStatus(scanId);
          setScanProgress(statusRes.progress_percent);
          setScanStep(statusRes.current_step);

          if (statusRes.status === "completed") {
            window.clearInterval(pollInterval);
            const fullScan = await api.getScan(scanId);
            setCurrentScan(fullScan);
            setScansList((prev) => [fullScan, ...prev.filter((s) => s.id !== scanId)]);
            setScanning(false);
          } else if (statusRes.status === "failed") {
            window.clearInterval(pollInterval);
            setScanning(false);
            alert(`Scan failed: ${statusRes.current_step}`);
          }
        } catch {
          window.clearInterval(pollInterval);
          setScanning(false);
        }
      }, 1200);
    } catch (err: any) {
      setScanning(false);
      alert("Failed to start scan: " + err.message);
    }
  };

  const handleSelectHistoricalScan = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    api.getScan(id).then(setCurrentScan).catch(() => {});
  };

  const handleExportJson = () => {
    if (!currentScan) return;
    const blob = new Blob([JSON.stringify(currentScan, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cloudflip-savings-risk-audit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter findings
  const findings = currentScan?.findings || [];
  const filteredFindings = findings.filter((f) => {
    const matchCat = activeCategory === "all" || f.category.toLowerCase() === activeCategory.toLowerCase();
    const matchRisk = activeRisk === "all" || f.risk_level.toLowerCase() === activeRisk.toLowerCase();
    return matchCat && matchRisk;
  });

  const totalWaste = currentScan?.total_monthly_waste || 0;
  const annualWaste = totalWaste * 12;
  const risksCount = (currentScan?.risk_summary?.high || 0) + (currentScan?.risk_summary?.critical || 0) + (currentScan?.risk_summary?.medium || 0);

  return (
    <div className="space-y-6 font-sans max-w-6xl">
      {/* Header & Run Scan Trigger */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display font-bold text-[20px] text-slate-900">
              AWS Savings & Reliability Risk Scan
            </h2>
            <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              100% Read-Only
            </span>
            {currentScan?.is_sample_or_simulation && (
              <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Sample Report
              </span>
            )}
          </div>
          <p className="text-[13px] text-slate-500">
            Automated 14-day audit across 8 categories: idle compute, unattached EBS, unused Elastic IPs, old snapshots, idle ALBs, ASG limits, and queue saturation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {scansList.length > 1 && (
            <select
              value={currentScan?.id || ""}
              onChange={handleSelectHistoricalScan}
              className="text-[12.5px] border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 bg-white"
            >
              {scansList.map((s, idx) => (
                <option key={s.id} value={s.id}>
                  Scan {idx + 1}: ${(s.total_monthly_waste || 0).toFixed(0)}/mo waste ({new Date(s.started_at).toLocaleDateString()})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleExportJson}
            className="text-[13px] font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg px-3.5 py-2 transition-colors flex items-center gap-1.5"
          >
            <span>📥</span> Export Audit JSON
          </button>

          <button
            onClick={handleStartScan}
            disabled={scanning}
            className="text-[13px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {scanning ? (
              <>
                <span className="animate-spin text-sm">⏳</span>
                <span>Scanning AWS Account...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Run 10-Minute Read-Only Scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* In-Flight Scanning Progress Modal / Banner */}
      {scanning && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-md animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[13px] mb-2 font-mono">
            <span className="flex items-center gap-2 text-emerald-400 font-semibold">
              <span className="animate-spin">🌀</span> {scanStep || "Executing read-only inspection..."}
            </span>
            <span className="font-bold text-slate-200">{scanProgress}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(5, scanProgress)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
            <span>Read-Only Telemetry (No write access)</span>
            <span>Target completion: &lt; 2 minutes</span>
          </div>
        </div>
      )}

      {/* Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Identified Monthly Waste
          </div>
          <div className="font-mono text-[28px] font-bold text-emerald-600">
            ${totalWaste.toFixed(2)}
            <span className="text-[14px] text-slate-500 font-sans font-normal"> / mo</span>
          </div>
          <div className="text-[12px] text-emerald-700 font-medium mt-1">
            ↑ ${annualWaste.toLocaleString()}/yr recoverable cloud spend
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Reliability & Outage Risks
          </div>
          <div className="font-mono text-[28px] font-bold text-amber-600">
            {risksCount}
            <span className="text-[14px] text-slate-500 font-sans font-normal"> risks</span>
          </div>
          <div className="text-[12px] text-slate-500 mt-1">
            Queue saturation & ASG limits
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Actionable Findings
          </div>
          <div className="font-mono text-[28px] font-bold text-slate-900">
            {findings.length}
            <span className="text-[14px] text-slate-500 font-sans font-normal"> findings</span>
          </div>
          <div className="text-[12px] text-sky-700 font-medium mt-1">
            {currentScan?.risk_summary?.zero || 0} zero-risk quick wins
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Audit Integrity & Source
          </div>
          <div className="font-mono text-[16px] font-bold text-slate-800 mt-1">
            {currentScan?.is_sample_or_simulation ? "Simulated Sample" : "Live AWS Telemetry"}
          </div>
          <div className="text-[11.5px] text-slate-500 mt-2 font-mono truncate">
            {currentScan?.completed_at ? new Date(currentScan.completed_at).toLocaleString() : "Audit ready"}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Detailed Findings */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-[16px] text-slate-900">
                Evidence-Backed Scan Findings ({filteredFindings.length})
              </h3>
              <p className="text-[12.5px] text-slate-500">
                Every saving calculation cites its exact 14-day metric window, formula, and pricing source.
              </p>
            </div>

            {/* Risk Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-[12px]">
              {["all", "zero", "low", "medium", "high"].map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRisk(r)}
                  className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                    activeRisk === r
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {r === "all" ? "All Risks" : `${r} Risk`}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
              <button
                key={catKey}
                onClick={() => setActiveCategory(catKey)}
                className={`text-[12px] px-3 py-1 rounded-full border transition-all ${
                  activeCategory === catKey
                    ? "bg-slate-900 text-white border-slate-900 font-semibold"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Findings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11.5px] uppercase tracking-wider">
                <th className="py-2.5">Resource ID & Type</th>
                <th className="py-2.5">Issue & 14-Day Signal</th>
                <th className="py-2.5">Risk Level</th>
                <th className="py-2.5">Monthly Saving</th>
                <th className="py-2.5 text-right">Evidence & Fix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredFindings.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 align-top">
                    <div className="font-mono font-semibold text-slate-900">{item.resource_id}</div>
                    <div className="text-[11.5px] text-slate-500">{item.resource_name}</div>
                    <span className="inline-block mt-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {item.resource_type}
                    </span>
                  </td>

                  <td className="py-3.5 max-w-[340px] align-top">
                    <div className="font-medium text-slate-900 leading-snug">{item.issue}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-1 bg-slate-50 p-1.5 rounded border border-slate-200/60">
                      📐 {item.pricing_formula}
                    </div>
                  </td>

                  <td className="py-3.5 align-top">
                    <span
                      className={`font-semibold text-[11px] px-2 py-0.5 rounded-full border ${
                        item.risk_level === "Zero"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : item.risk_level === "Low"
                          ? "bg-sky-50 text-sky-800 border-sky-200"
                          : item.risk_level === "Medium"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-red-50 text-red-800 border-red-200"
                      }`}
                    >
                      {item.risk_level} Risk
                    </span>
                  </td>

                  <td className="py-3.5 align-top font-mono">
                    {item.estimated_monthly_saving > 0 ? (
                      <span className="font-bold text-emerald-600 text-[14px]">
                        +${item.estimated_monthly_saving.toFixed(2)}/mo
                      </span>
                    ) : (
                      <span className="font-semibold text-amber-600 text-[12px]">
                        Reliability / 0% Outage
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 text-right align-top">
                    <button
                      onClick={() => setSelectedFinding(item)}
                      className="text-[12px] font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Inspect Fix →
                    </button>
                  </td>
                </tr>
              ))}
              {filteredFindings.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No findings match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Finding & Evidence Modal */}
      {selectedFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="font-display font-bold text-[16px] text-slate-900">
                  {selectedFinding.resource_name} ({selectedFinding.resource_id})
                </h4>
                <div className="text-[12px] text-emerald-700 font-medium">
                  {selectedFinding.estimated_monthly_saving > 0
                    ? `Estimated Saving: +$${selectedFinding.estimated_monthly_saving.toFixed(2)}/month`
                    : "Reliability Hardening: Eliminates Outage Risk"}
                </div>
              </div>
              <button
                onClick={() => setSelectedFinding(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-[13px]">
              {/* Evidence Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                <div className="text-[11.5px] font-semibold uppercase text-slate-500 tracking-wider">
                  Audited Telemetry & Formula
                </div>
                <div className="font-mono text-[12px] text-slate-800 font-semibold">
                  {selectedFinding.pricing_formula}
                </div>
                <div className="text-[11.5px] text-slate-500">
                  Source: <span className="font-mono text-slate-700">{selectedFinding.pricing_source}</span>
                </div>
                {selectedFinding.evidence && (
                  <pre className="text-[11px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700 overflow-x-auto">
                    {JSON.stringify(selectedFinding.evidence, null, 2)}
                  </pre>
                )}
              </div>

              {/* Recommended Fix */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-900 text-[12.5px]">
                <strong>Recommended Fix:</strong> {selectedFinding.recommended_fix}
              </div>

              {/* CLI & Terraform Snippets */}
              {(selectedFinding.cli_remediation || selectedFinding.terraform_remediation) && (
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                    <div className="flex gap-2">
                      {selectedFinding.cli_remediation && (
                        <button
                          onClick={() => setRemediationTab("cli")}
                          className={`px-3 py-1 text-[12px] font-semibold rounded-md transition-colors ${
                            remediationTab === "cli"
                              ? "bg-slate-900 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          AWS CLI Script
                        </button>
                      )}
                      {selectedFinding.terraform_remediation && (
                        <button
                          onClick={() => setRemediationTab("terraform")}
                          className={`px-3 py-1 text-[12px] font-semibold rounded-md transition-colors ${
                            remediationTab === "terraform"
                              ? "bg-slate-900 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          Terraform IaC
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        handleCopyCode(
                          remediationTab === "cli"
                            ? selectedFinding.cli_remediation || ""
                            : selectedFinding.terraform_remediation || ""
                        )
                      }
                      className="text-[11.5px] font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1"
                    >
                      {copied ? "✅ Copied!" : "📋 Copy Code"}
                    </button>
                  </div>

                  <pre className="p-3.5 bg-slate-900 text-emerald-400 font-mono text-[12px] rounded-lg overflow-x-auto whitespace-pre leading-relaxed">
                    {remediationTab === "cli"
                      ? selectedFinding.cli_remediation
                      : selectedFinding.terraform_remediation}
                  </pre>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedFinding(null)}
                  className="px-4 py-2 text-[12.5px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scaling Strategy Comparison (Preserved from baseline) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="mb-4">
          <h3 className="font-display font-semibold text-[16px] text-slate-900">
            Scaling Strategy & Capacity Model Comparison
          </h3>
          <p className="text-[12.5px] text-slate-500">
            Compare static over-provisioning against CloudFlip’s predictive dynamic lead-time scaling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {strategyRows.map((r) => (
            <div key={r.strategy} className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs">
              <h4 className="font-display font-bold text-[15px] text-slate-900 mb-4 capitalize">
                {r.strategy.replace(/_/g, " ")} Strategy
              </h4>

              <div className="space-y-2.5 font-mono text-[13px]">
                <div className="flex justify-between py-1.5 border-b border-slate-200/60 text-slate-600">
                  <span>Monitored Resources</span>
                  <span className="font-bold text-slate-900">{r.resource_count} instances</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60 text-slate-600">
                  <span>Predicted Error Rate</span>
                  <span className={`font-bold ${parseFloat(r.predicted_errors) > 2 ? "text-red-600" : "text-emerald-600"}`}>
                    {r.predicted_errors || "low"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-600">
                  <span>Est. Hourly Cost</span>
                  <span className="font-bold text-sky-600">${r.estimated_cost_per_hour}/hr</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
