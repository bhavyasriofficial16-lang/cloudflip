import { Link } from "react-router-dom";
import CloudFlipLogo from "../components/CloudFlipLogo";
import { openCookiePreferences } from "../components/CookieConsent";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <header className="sticky top-0 z-50 backdrop-blur bg-white/95 border-b border-slate-200">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/">
            <CloudFlipLogo size={28} />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="text-[13.5px] font-semibold text-slate-700 hover:text-slate-900">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-[13.5px] font-semibold text-slate-700 hover:text-slate-900">
              Cookie Policy
            </Link>
            <Link to="/app" className="text-[13.5px] font-semibold text-slate-700 hover:text-slate-900">
              Open App →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[840px] mx-auto px-4 sm:px-8 py-12 space-y-9 text-[14px] text-slate-700 leading-relaxed">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Data Governance & Privacy Architecture
          </span>
          <h1 className="font-display font-extrabold text-[32px] sm:text-[38px] text-slate-900 mt-1">
            Privacy Policy
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Last updated: November 1, 2026 · Designed to support EU GDPR, UK GDPR, California CCPA, and India's Digital Personal Data Protection (DPDP) Act 2023
          </p>
        </div>

        {/* Section 1: Information We Collect */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">1. Information We Collect</h2>
          <p>
            CloudFlip collects only the minimal technical telemetry necessary to generate predictive capacity forecasts and anomaly detection:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Information:</strong> Name, work email address, organization name, and authentication identifiers.</li>
            <li><strong>Infrastructure Telemetry:</strong> Aggregated CloudWatch metric time-series (CPU utilization percentages, network throughput, request counts, and p95/p99 tail latency statistics).</li>
            <li><strong>Security & Anti-Bot Telemetry:</strong> Client browser headers, IP addresses (hashed for rate-limiting), and human verification validation tokens.</li>
            <li><strong>Inventory Metadata:</strong> Resource IDs, instance types, Availability Zones, Auto Scaling Group names, and operational tags (e.g., <code>env: prod</code>).</li>
          </ul>
        </section>

        {/* Section 2: What We Never Collect */}
        <section className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-5">
          <h2 className="font-display font-bold text-[18px] text-slate-900">2. What We Never Collect (Architectural Isolation)</h2>
          <p className="text-[13.5px]">
            CloudFlip connects to your environment using narrow, least-privilege IAM policies. By architectural design, our systems are incapable of inspecting or storing:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[13px] mt-2">
            <li>Personally Identifiable Information (PII) of your end-users or application customers.</li>
            <li>HTTP request/response body payloads, customer session cookies, or URL query parameters.</li>
            <li>Application database records, backups, tables, or S3 object contents.</li>
            <li>Source code, proprietary application logic, or Git repository contents.</li>
          </ul>
        </section>

        {/* Section 3: Cookies and Tracking */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">3. Cookies & Tracking Technologies</h2>
          <p>
            We use strictly necessary cookies for session authentication and anti-bot verification, and optional cookies to evaluate telemetry UI latency. We do not sell, rent, or monetize personal information. For full details on cookie categories and duration, see our{" "}
            <Link to="/cookies" className="text-sky-600 font-semibold hover:underline">
              Cookie Policy
            </Link>
            . You can modify your preferences at any time using our{" "}
            <button
              type="button"
              onClick={openCookiePreferences}
              className="text-sky-600 font-semibold underline"
            >
              Cookie Preferences Manager
            </button>
            .
          </p>
        </section>

        {/* Section 4: Data Rights & SLA */}
        <section className="space-y-3 bg-sky-50/70 border border-sky-200 rounded-xl p-5">
          <h2 className="font-display font-bold text-[18px] text-slate-900">
            4. Your Data Rights & Response Service Level Agreement (SLA)
          </h2>
          <p className="text-[13.5px] text-slate-700">
            In alignment with the EU GDPR, UK GDPR, California CCPA, and India DPDP Act 2023, data principals hold explicit rights regarding their personal data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700 text-[13px] mt-2">
            <li><strong>Right to Know & Access:</strong> You can request a summary of your account profile details (such as account email, organization name, subscription tier, and connected IAM role ARN references) and telemetry metadata stored in our systems.</li>
            <li><strong>Right to Rectification:</strong> You can update inaccurate account details directly in Settings or by contacting support.</li>
            <li><strong>Right to Erasure & Deletion:</strong> You may request permanent deletion of all telemetry records, simulation histories, and account details.</li>
            <li><strong>Right to Data Portability:</strong> Export historical telemetry datasets in JSON/CSV format.</li>
            <li><strong>Non-Discrimination:</strong> We never penalize or alter service tiers for exercising privacy rights.</li>
          </ul>
          <p className="text-[12.5px] text-sky-950 font-medium mt-2 pt-2 border-t border-sky-200">
            ⏱️ <strong>Response Times:</strong> We acknowledge all formal privacy requests within <strong>48 hours</strong> and fulfill data export or permanent erasure requests within <strong>30 calendar days</strong>.
          </p>
        </section>

        {/* Section 5: Data Protection & Operating Impact */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">5. How We Protect Data & Production Workload Impact</h2>
          <p>
            Collected telemetry is used exclusively to compute predictive demand forecasts (using streaming exponential smoothing, velocity trend projection, and Little's Law queueing models), detect capacity bottlenecks, and evaluate proactive scaling recommendations.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[13.5px]">
            <li><strong>Encryption:</strong> Encrypted in transit using TLS 1.2 and TLS 1.3 across all API endpoints, and encrypted at rest using AES-256 on underlying cloud database volumes.</li>
            <li>
              <strong>Shadow Mode Impact:</strong> In Shadow Mode (default), CloudFlip operates strictly out-of-band with 100% read-only access. Should any CloudFlip service disruption occur, <strong>your production services and AWS infrastructure remain 100% unaffected</strong>.
            </li>
            <li>
              <strong>Autonomous Mode Safety:</strong> In Autonomous or Approval remediation modes, scaling actions execute strictly within customer-defined capacity ceilings, maximum scale factors, and minimum cooldown windows. Every action is verified post-execution, and if target metrics fail to improve, automated alerts and remediation safeguards are triggered.
            </li>
          </ul>
        </section>

        {/* Section 6: Sub-Processors & Hosting Regions */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">6. Sub-Processors & Infrastructure Hosting</h2>
          <p>
            CloudFlip partners with vetted infrastructure providers to deliver high-availability services:
          </p>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold font-mono text-[11.5px] uppercase">
                <tr>
                  <th className="p-3">Sub-Processor</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Primary Hosting Region</th>
                  <th className="p-3">Data Safeguards</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Amazon Web Services (AWS)</td>
                  <td className="p-3">Core backend computation, API hosting & telemetry database</td>
                  <td className="p-3 font-mono text-[12px]">ap-south-1 (Mumbai), with multi-region probe connectivity</td>
                  <td className="p-3">AES-256 volume encryption, VPC private subnets</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Cloudflare, Inc.</td>
                  <td className="p-3">Edge DNS, TLS termination, DDoS defense, Turnstile verification</td>
                  <td className="p-3 font-mono text-[12px]">Global Edge Network</td>
                  <td className="p-3">TLS 1.3, ephemeral token hashing</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Skydo Inc. & Razorpay</td>
                  <td className="p-3">Payment processing & invoicing (Skydo for USD wire/ACH; Razorpay for INR cards/UPI)</td>
                  <td className="p-3 font-mono text-[12px]">United States & India</td>
                  <td className="p-3">PCI-DSS Level 1 compliant gateways</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">Supabase / PostgreSQL</td>
                  <td className="p-3">Managed authentication & metadata persistence</td>
                  <td className="p-3 font-mono text-[12px]">AWS ap-south-1 (Mumbai)</td>
                  <td className="p-3">Row-Level Security (RLS), encrypted at rest</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 7: International Transfers & DPDP Act */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">7. International Data Transfers & India DPDP Act Compliance</h2>
          <p>
            CloudFlip is headquartered in India and serves customers across North America, Europe, and Asia-Pacific. Where telemetry metadata or account information is transferred internationally, we apply appropriate technical, organizational, and contractual safeguards:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[13.5px]">
            <li>For transfers of personal data from the European Economic Area (EEA) and the UK, we implement standard contractual clauses (SCCs) as adopted by the European Commission.</li>
            <li>In compliance with India's Digital Personal Data Protection (DPDP) Act 2023, personal data of data principals is processed solely for specified, lawful business purposes with clear audit logging and consent controls.</li>
          </ul>
        </section>

        {/* Section 8: Data Retention & Erasure Upon Disconnection */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">8. Data Retention & Disconnection Erasure</h2>
          <p>
            Telemetry metric series are stored on a rolling 30-day window and automatically purged. When a customer disconnects their cloud environment:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[13.5px]">
            <li>Telemetry ingestion ceases immediately.</li>
            <li>IAM role references and authentication tokens are removed within <strong>24 hours</strong>.</li>
            <li>Historical aggregated telemetry and simulation results are permanently purged within <strong>14 calendar days</strong>.</li>
          </ul>
          <p className="text-[13.5px] pt-1">
            To request expedited manual deletion of all account records, email{" "}
            <a href="mailto:privacy@cloudflip.me" className="text-sky-600 font-semibold underline">
              privacy@cloudflip.me
            </a>.
          </p>
        </section>

        {/* Section 9: Plain Attribution & Contact */}
        <section className="space-y-3 pt-2">
          <h2 className="font-display font-bold text-[18px] text-slate-900">9. Privacy Inquiries & Data Protection Contact</h2>
          <p>
            CloudFlip is founded and operated by Bhavya Sri Boddeti (Visakhapatnam, Andhra Pradesh, India). For any data privacy questions, access requests, or regulatory inquiries, contact:
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[13px]">
            <div><strong>Data Protection Inquiries:</strong> <a href="mailto:privacy@cloudflip.me" className="text-sky-600 underline">privacy@cloudflip.me</a></div>
            <div><strong>Security & Vulnerability Disclosure:</strong> <a href="mailto:security@cloudflip.me" className="text-sky-600 underline">security@cloudflip.me</a></div>
            <div><strong>Legal & Data Processing Agreements:</strong> <a href="mailto:legal@cloudflip.me" className="text-sky-600 underline">legal@cloudflip.me</a></div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 bg-slate-50/70 text-slate-500 text-[12px] mt-12">
        <div className="max-w-[840px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 CloudFlip Platform. Operated by Bhavya Sri Boddeti. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-slate-800">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-slate-800">Cookie Policy</Link>
            <button type="button" onClick={openCookiePreferences} className="hover:text-slate-800 underline">
              Cookie Preferences
            </button>
            <Link to="/security" className="hover:text-slate-800">Security Architecture</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
