import { Link } from "react-router-dom";
import CloudFlipLogo from "../components/CloudFlipLogo";

export default function Terms() {
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
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">Legal Agreement</span>
          <h1 className="font-display font-extrabold text-[32px] text-slate-900 mt-1">Terms of Service</h1>
          <p className="text-[13px] text-slate-500 mt-1">Last updated: October 16, 2026 · CloudFlip Platform Terms</p>
        </div>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using CloudFlip ("Service", "we", "us"), provided by CloudFlip, you agree to be bound by these Terms of Service. If you are entering into these terms on behalf of a company, organization, or entity, you represent that you have the authority to bind that entity.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">2. Description of Service & Operational Modes</h2>
          <p>
            CloudFlip provides predictive cloud infrastructure telemetry, capacity simulation, and automated remediation recommendations. The service offers three primary operating modes:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Shadow Mode:</strong> Passive observation and log-only forecasting with zero write permissions.</li>
            <li><strong>Approval Mode:</strong> Interactive recommendations requiring explicit human one-click authorization prior to any action execution.</li>
            <li><strong>Autonomous Mode:</strong> Automated execution of pre-defined capacity scaling within strict customer-configured guardrails.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">3. Customer Infrastructure & Authorization</h2>
          <p>
            You authorize CloudFlip to access your connected cloud accounts solely through least-privilege IAM roles or credentials you explicitly provide. You retain full ownership, control, and governance over your cloud infrastructure and may revoke CloudFlip’s IAM permissions at any time via your cloud provider console.
          </p>
        </section>

        <section className="space-y-3 bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-950">
          <h2 className="font-display font-bold text-[18px] text-amber-900">4. Limitation of Liability & Caps</h2>
          <p className="text-[13px] leading-relaxed">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL CLOUDFLIP, ITS AFFILIATES, OFFICERS, OR AGENTS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL DAMAGES, OR DAMAGES FOR LOSS OF PROFITS, DATA, SYSTEM DOWNTIME, OR THIRD-PARTY CLOUD PROVIDER CHARGES (INCLUDING AWS BILLING) ARISING OUT OF THE USE OR INABILITY TO USE THE SERVICE.
          </p>
          <p className="text-[13px] leading-relaxed mt-2">
            IN NO EVENT SHALL CLOUDFLIP'S AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THIS AGREEMENT EXCEED THE TOTAL AMOUNT ACTUALLY PAID BY YOU TO CLOUDFLIP IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">5. Subscription & Payment Terms</h2>
          <p>
            CloudFlip offers subscription plans (Monthly at $99/mo, Annual at $990/yr) and metered Pay-As-You-Go pricing. Subscriptions are billed in advance on a recurring basis and can be canceled at any time prior to the subsequent billing cycle.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display font-bold text-[18px] text-slate-900">6. Contact Information</h2>
          <p>
            For legal inquiries, dispute resolution, or contractual questions, contact our legal team at <a href="mailto:bhavyasriofficial16@gmail.com" className="text-sky-600 underline">bhavyasriofficial16@gmail.com</a>.
          </p>
        </section>
      </main>
    </div>
  );
}
