import { Link } from "react-router-dom";
import CloudFlipLogo from "../components/CloudFlipLogo";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <header className="sticky top-0 z-50 backdrop-blur bg-white/95 border-b border-slate-200">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/">
            <CloudFlipLogo size={28} />
          </Link>
          <Link to="/app" className="text-[13.5px] font-semibold text-slate-700 hover:text-slate-900">
            Open App →
          </Link>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-4 sm:px-8 py-12 space-y-8 text-[14px] text-slate-700 leading-relaxed">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">Data Governance</span>
          <h1 className="font-display font-extrabold text-[32px] text-slate-900 mt-1">Privacy Policy</h1>
          <p className="text-[13px] text-slate-500 mt-1">Last updated: October 16, 2026 · CloudFlip Data Handling</p>
        </div>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">1. Information We Collect</h2>
          <p>
            CloudFlip collects minimal telemetry necessary to provide predictive capacity scaling and anomaly detection:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Information:</strong> Name, work email address, and authentication identifiers.</li>
            <li><strong>Infrastructure Telemetry:</strong> CloudWatch aggregated metric series (CPU utilization percentages, network throughput, request counts, and latency statistics).</li>
            <li><strong>Inventory Metadata:</strong> Resource IDs, instance types, Availability Zones, and resource tags (e.g. <code>env: prod</code>).</li>
          </ul>
        </section>

        <section className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-5">
          <h2 className="font-display font-bold text-[18px] text-slate-900">2. What We Never Collect</h2>
          <p className="text-[13.5px]">
            CloudFlip is architecturally isolated from your user data. We do <strong>not</strong> collect, process, or inspect:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[13px] mt-2">
            <li>Customer Personally Identifiable Information (PII)</li>
            <li>HTTP request/response body payloads or headers</li>
            <li>Application database records or table contents</li>
            <li>Source code, proprietary algorithms, or repository commits</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">3. How We Use and Protect Data</h2>
          <p>
            Collected telemetry is used exclusively to compute ARIMA and trend forecasts, evaluate capacity threshold headroom, and trigger automated scale recommendations. We do not sell, rent, or monetize your infrastructure data. All data is encrypted in transit using TLS 1.3 and at rest using AES-256.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">4. Data Retention & Deletion</h2>
          <p>
            Metric aggregates are retained on a rolling 30-day window and automatically purged. You may request immediate deletion of all account records and historical telemetry by emailing <a href="mailto:bhavyasriofficial16@gmail.com" className="text-sky-600 underline">bhavyasriofficial16@gmail.com</a>.
          </p>
        </section>
      </main>
    </div>
  );
}
