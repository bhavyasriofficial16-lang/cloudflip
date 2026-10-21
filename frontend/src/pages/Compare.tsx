import { Link } from "react-router-dom";
import CloudFlipLogo from "../components/CloudFlipLogo";
import { openCookiePreferences } from "../components/CookieConsent";

export default function Compare() {
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
            <Link to="/backtest" className="text-[13.5px] font-semibold text-slate-600 hover:text-slate-900">
              Trace Backtest
            </Link>
            <Link
              to="/app"
              className="bg-[#4FD1E8] hover:bg-[#3ec4db] text-[#04141A] font-bold text-[13.5px] px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1080px] mx-auto px-4 sm:px-8 py-12 sm:py-16 space-y-12">
        {/* Title */}
        <div className="text-center max-w-[760px] mx-auto">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-800 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
            Engineering Comparison Guide
          </span>
          <h1 className="font-display font-extrabold text-[32px] sm:text-[42px] text-slate-900 leading-tight mt-3">
            CloudFlip vs. AWS Predictive Scaling vs. Datadog
          </h1>
          <p className="text-[15px] text-slate-600 mt-3 leading-relaxed">
            Why modern engineering teams choose CloudFlip over native cloud autoscaling and traditional observability suites for dynamic capacity protection.
          </p>
        </div>

        {/* Detailed Comparison Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[13px] font-mono text-slate-600">
                  <th className="py-4 px-5">Capability / Feature</th>
                  <th className="py-4 px-5 bg-sky-50/60 text-sky-900 font-bold border-x border-sky-100">
                    ⚡ CloudFlip
                  </th>
                  <th className="py-4 px-5">AWS Native Predictive Scaling</th>
                  <th className="py-4 px-5">Datadog Metric Forecasting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px] text-slate-700">
                <tr>
                  <td className="py-4 px-5 font-semibold text-slate-900">Primary Objective</td>
                  <td className="py-4 px-5 bg-sky-50/30 font-bold text-sky-900 border-x border-sky-100">
                    Closed-loop predictive capacity defense & surge simulation
                  </td>
                  <td className="py-4 px-5 text-slate-600">
                    Daily recurring schedule estimation
                  </td>
                  <td className="py-4 px-5 text-slate-600">
                    Threshold alerting & historical dashboard visualization
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-5 font-semibold text-slate-900">Lead Time Horizon</td>
                  <td className="py-4 px-5 bg-sky-50/30 font-bold text-emerald-700 border-x border-sky-100">
                    15 to 30 minutes ahead of sudden surges
                  </td>
                  <td className="py-4 px-5 text-slate-600">
                    24 to 48 hours (re-forecasts only once daily)
                  </td>
                  <td className="py-4 px-5 text-slate-600">
                    Reactive (alerts when threshold already crossed)
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-5 font-semibold text-slate-900">Response to Unscheduled Surges</td>
                  <td className="py-4 px-5 bg-sky-50/30 font-bold text-emerald-700 border-x border-sky-100">
                    ✅ Detects sudden velocity changes in minutes
                  </td>
                  <td className="py-4 px-5 text-red-600">
                    ❌ Completely blind to sudden viral bursts or drops
                  </td>
                  <td className="py-4 px-5 text-amber-600">
                    ⚠️ Alerts on spike, but requires human triage
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-5 font-semibold text-slate-900">What-If Surge Simulator</td>
                  <td className="py-4 px-5 bg-sky-50/30 font-bold text-sky-900 border-x border-sky-100">
                    ✅ Interactive stress sandbox (Ticket drops, Black Friday)
                  </td>
                  <td className="py-4 px-5 text-slate-400">❌ None</td>
                  <td className="py-4 px-5 text-slate-400">❌ None</td>
                </tr>

                <tr>
                  <td className="py-4 px-5 font-semibold text-slate-900">Closed-Loop Verification & Rollback</td>
                  <td className="py-4 px-5 bg-sky-50/30 font-bold text-emerald-700 border-x border-sky-100">
                    ✅ Verifies p99 latency post-scaling + auto-rollback
                  </td>
                  <td className="py-4 px-5 text-slate-600">
                    ❌ No latency verification loop
                  </td>
                  <td className="py-4 px-5 text-slate-600">
                    ❌ Read-only monitoring tool; cannot execute fixes
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-5 font-semibold text-slate-900">Safety Operating Modes</td>
                  <td className="py-4 px-5 bg-sky-50/30 font-bold text-sky-900 border-x border-sky-100">
                    3 Modes: Shadow (Log), Approve (1-Click), Autonomous
                  </td>
                  <td className="py-4 px-5 text-slate-600">
                    Forecast only or Active scaling
                  </td>
                  <td className="py-4 px-5 text-slate-600">
                    Observation only (Alerts via PagerDuty/Slack)
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-5 font-semibold text-slate-900">Multi-Cloud Support</td>
                  <td className="py-4 px-5 bg-sky-50/30 font-bold text-sky-900 border-x border-sky-100">
                    AWS + Microsoft Azure (Multi-cloud unified telemetry)
                  </td>
                  <td className="py-4 px-5 text-slate-400">AWS proprietary only</td>
                  <td className="py-4 px-5 text-emerald-700">Multi-cloud supported</td>
                </tr>

                <tr>
                  <td className="py-4 px-5 font-semibold text-slate-900">Pricing Model</td>
                  <td className="py-4 px-5 bg-sky-50/30 font-bold text-emerald-700 border-x border-sky-100">
                    $99/month flat predictable subscription
                  </td>
                  <td className="py-4 px-5 text-slate-600">
                    Included with AWS, but overprovisions waste
                  </td>
                  <td className="py-4 px-5 text-red-600">
                    $15–$23 per host/mo + metric volume fees ($$$$)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Why CloudFlip Complements Datadog & CloudWatch */}
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-8 space-y-4">
          <h2 className="font-display font-bold text-[20px] text-slate-900">
            "Do we need to replace Datadog or CloudWatch?"
          </h2>
          <p className="text-[14px] text-slate-600 leading-relaxed">
            <strong>No. CloudFlip is not a log aggregator or metric dashboard replacement.</strong> We integrate cleanly with your existing telemetry stream. Datadog and CloudWatch serve as your historic system of record. CloudFlip acts as the <strong>predictive autopilot</strong> layered on top, giving your SRE team a 15–30 minute warning window and automated remediation guardrails before PagerDuty alarms ever fire.
          </p>
        </section>

        {/* CTA Card */}
        <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display font-bold text-[20px] text-white">
              Ready to test CloudFlip on your infrastructure?
            </h3>
            <p className="text-[13px] text-slate-300 mt-1">
              Test with zero credentials in our What-If Simulator, or connect read-only AWS in 3 minutes.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/simulator"
              className="bg-[#4FD1E8] hover:bg-[#3ec4db] text-[#04141A] font-bold text-[13.5px] px-5 py-2.5 rounded-lg transition-colors shadow-xs"
            >
              Launch Simulator ⚡
            </Link>
            <Link
              to="/pricing"
              className="border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold text-[13.5px] px-4 py-2.5 rounded-lg transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-8 bg-slate-50/70 text-slate-500 text-[12px] mt-12">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 CloudFlip Platform · Fail-Open Predictive Cloud Architecture.</div>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-slate-800">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-slate-800">Privacy Policy</Link>
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
