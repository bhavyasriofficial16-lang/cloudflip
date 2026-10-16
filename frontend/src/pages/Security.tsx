import { Link } from "react-router-dom";
import CloudFlipLogo from "../components/CloudFlipLogo";

export default function Security() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur bg-white/95 border-b border-slate-200">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/">
            <CloudFlipLogo size={28} />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/simulator" className="text-[13.5px] font-semibold text-slate-600 hover:text-slate-900">
              Surge Simulator
            </Link>
            <Link to="/pricing" className="text-[13.5px] font-semibold text-slate-600 hover:text-slate-900">
              Pricing
            </Link>
            <Link
              to="/app"
              className="bg-[#4FD1E8] hover:bg-[#3ec4db] text-[#04141A] font-bold text-[13.5px] px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              Open App
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[880px] mx-auto px-4 sm:px-8 py-12 sm:py-16 space-y-10">
        {/* Title & Trust Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-3">
            🔒 Trust & Security Architecture Whitepaper
          </div>
          <h1 className="font-display font-extrabold text-[32px] sm:text-[40px] text-slate-900 leading-tight">
            Security, Permissions & Data Governance
          </h1>
          <p className="text-[15px] text-slate-600 mt-3 leading-relaxed">
            CloudFlip is designed from first principles for zero-trust enterprise environments. We strictly enforce the principle of least privilege, separate read and write access, and guarantee fail-open resilience in writing.
          </p>
        </div>

        {/* Fail-Open Guarantee Callout */}
        <div className="bg-sky-50 border-2 border-sky-300 rounded-xl p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="text-[24px]">🛡️</span>
            <div>
              <h2 className="font-display font-bold text-[16px] text-sky-950">
                The Fail-Open Architectural Guarantee (In Writing)
              </h2>
              <p className="text-[13.5px] text-sky-900 mt-1 leading-relaxed">
                CloudFlip operates entirely out-of-band via asynchronous AWS CloudWatch APIs. CloudFlip does <strong>not</strong> sit in your application’s critical network path. If CloudFlip experiences a complete service disruption, <strong>your application and AWS infrastructure will continue running with zero impact</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Access Model & Permissions */}
        <section className="space-y-4">
          <h2 className="font-display font-bold text-[22px] text-slate-900 border-b border-slate-200 pb-2">
            1. Access Model & Dual IAM Architecture
          </h2>
          <p className="text-[14px] text-slate-600 leading-relaxed">
            We never ask for root credentials or static long-lived secret keys. CloudFlip links to your cloud environment via AWS Security Token Service (STS) Cross-Account IAM Roles secured by an account-specific <code className="text-sky-700 bg-slate-100 px-1 py-0.5 rounded text-[12.5px]">ExternalID</code> to prevent Confused Deputy attacks.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Default: 100% Read-Only
              </span>
              <h3 className="font-display font-bold text-[16px] text-slate-900 mt-2 mb-1">
                Telemetry Ingestion Role
              </h3>
              <p className="text-[12.5px] text-slate-600 leading-relaxed mb-3">
                Used to pull historical CloudWatch trends and inventory topology. Structurally incapable of altering any resource.
              </p>
              <div className="font-mono text-[11px] text-slate-700 bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                <div>• <code className="text-sky-700">cloudwatch:GetMetricData</code></div>
                <div>• <code className="text-sky-700">cloudwatch:ListMetrics</code></div>
                <div>• <code className="text-sky-700">ec2:DescribeInstances</code></div>
                <div>• <code className="text-sky-700">autoscaling:Describe*</code></div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                Opt-In: Scoped Remediation
              </span>
              <h3 className="font-display font-bold text-[16px] text-slate-900 mt-2 mb-1">
                Scaling Action Role
              </h3>
              <p className="text-[12.5px] text-slate-600 leading-relaxed mb-3">
                Activated only if you opt into Approval or Autonomous remediation modes. Scoped strictly to target Auto Scaling Groups.
              </p>
              <div className="font-mono text-[11px] text-slate-700 bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                <div>• <code className="text-sky-700">autoscaling:SetDesiredCapacity</code></div>
                <div>• <code className="text-sky-700">autoscaling:UpdateAutoScalingGroup</code></div>
                <div className="text-slate-400 font-sans italic text-[10.5px] pt-1">
                  *Cannot terminate individual VMs, delete databases, or modify VPCs.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. What Data Is Stored */}
        <section className="space-y-4">
          <h2 className="font-display font-bold text-[22px] text-slate-900 border-b border-slate-200 pb-2">
            2. Data Storage, Retention & Privacy
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono text-[11.5px]">
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">What CloudFlip Ingests</th>
                  <th className="py-2.5">Retention Policy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 font-semibold text-slate-900">CloudWatch Telemetry</td>
                  <td className="py-3">Aggregated numbers only (CPU %, Memory %, NetworkIn, Request Count, p99 Latency).</td>
                  <td className="py-3 font-mono text-[12px]">30 days (rolling purge)</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-900">Customer Payloads</td>
                  <td className="py-3 text-red-600 font-semibold">NEVER. Zero HTTP request payloads, headers, or body text.</td>
                  <td className="py-3 font-mono text-[12px]">Not ingested</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-900">Source Code & PII</td>
                  <td className="py-3 text-red-600 font-semibold">NEVER. Zero access to application databases, code repos, or customer PII.</td>
                  <td className="py-3 font-mono text-[12px]">Not ingested</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-900">Action Audit Logs</td>
                  <td className="py-3">Timestamped record of every simulated or executed scaling event, trigger, and result.</td>
                  <td className="py-3 font-mono text-[12px]">365 days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Safety Guardrails & Kill Switch */}
        <section className="space-y-4">
          <h2 className="font-display font-bold text-[22px] text-slate-900 border-b border-slate-200 pb-2">
            3. Safety Guardrails & Emergency Kill Switch
          </h2>
          <p className="text-[14px] text-slate-600 leading-relaxed">
            Automated systems without strict boundaries are dangerous. CloudFlip enforces programmatic guardrails that cannot be breached:
          </p>

          <ul className="space-y-2 text-[13.5px] text-slate-700 list-disc pl-5">
            <li><strong>Hard Instance Ceilings:</strong> You define the maximum allowed instances (e.g. max 16). CloudFlip will never scale past this ceiling under any circumstance.</li>
            <li><strong>Cooldown Enforcing:</strong> Minimum 15-minute cooldown between automated scaling adjustments to prevent thrashing and flapping.</li>
            <li><strong>Daily Action Cap:</strong> Hard stop of maximum 6 remediation actions per 24 hours.</li>
            <li><strong>Instant Kill Switch:</strong> One-click master toggle in Settings that instantly drops all automation back to passive shadow logging.</li>
            <li><strong>Instant Access Revocation:</strong> You can permanently sever CloudFlip’s connection in 5 seconds by deleting the IAM Role in your AWS Console.</li>
          </ul>
        </section>

        {/* 4. Encryption & Infrastructure */}
        <section className="space-y-4">
          <h2 className="font-display font-bold text-[22px] text-slate-900 border-b border-slate-200 pb-2">
            4. Encryption & Tenant Isolation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-[20px] mb-1">🔐</div>
              <div className="font-display font-bold text-[14px] text-slate-900">In Transit</div>
              <p className="text-[12px] text-slate-500 mt-1">TLS 1.3 enforced on all API endpoints and telemetry streams.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-[20px] mb-1">🗄️</div>
              <div className="font-display font-bold text-[14px] text-slate-900">At Rest</div>
              <p className="text-[12px] text-slate-500 mt-1">AES-256 encryption across PostgreSQL storage volumes and caches.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-[20px] mb-1">🏢</div>
              <div className="font-display font-bold text-[14px] text-slate-900">Tenant Isolation</div>
              <p className="text-[12px] text-slate-500 mt-1">Row-Level Security (RLS) guarantees zero cross-tenant data leakage.</p>
            </div>
          </div>
        </section>

        {/* Contact Security Team */}
        <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-display font-bold text-[15px] text-slate-900">Need a Security Review or Vendor Assessment?</div>
            <p className="text-[12.5px] text-slate-500 mt-0.5">We provide completed SIG-Lite questionnaires and standard DPAs for prospective pilots.</p>
          </div>
          <a
            href="mailto:bhavyasriofficial16@gmail.com?subject=CloudFlip%20Security%20Review%20Request"
            className="bg-slate-900 text-white font-semibold text-[13px] px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          >
            Contact Security Officer
          </a>
        </div>
      </main>
    </div>
  );
}
