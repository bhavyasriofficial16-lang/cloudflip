import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CloudFlipLogo from "../components/CloudFlipLogo";

function FlipCard() {
  const [flipped, setFlipped] = useState(false);
  const [cpu, setCpu] = useState(58);
  const [latency, setLatency] = useState(2.1);

  useEffect(() => {
    let tickInterval: number;
    const cycle = () => {
      let step = 0;
      tickInterval = window.setInterval(() => {
        step++;
        const f = Math.min(1, step / 14);
        setCpu(Math.round(58 + (91 - 58) * f));
        setLatency(+(2.1 + (4.2 - 2.1) * f).toFixed(1));
        if (f >= 1) window.clearInterval(tickInterval);
      }, 130);

      setTimeout(() => setFlipped(true), 2500);
      setTimeout(() => setFlipped(false), 6600);
      setTimeout(() => {
        setCpu(58);
        setLatency(2.1);
      }, 7700);
    };
    cycle();
    const loop = window.setInterval(cycle, 9000);
    return () => {
      window.clearInterval(loop);
      window.clearInterval(tickInterval);
    };
  }, []);

  return (
    <div className="[perspective:1400px]">
      <div
        className="relative w-full h-[288px] transition-transform duration-[1050ms]"
        style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "none" }}
      >
        {/* front — problem */}
        <div
          className="absolute inset-0 rounded-xl border p-6 flex flex-col shadow-sm"
          style={{
            backfaceVisibility: "hidden",
            background: "linear-gradient(160deg, rgba(254, 242, 242, 0.9), rgba(254, 243, 199, 0.5))",
            borderColor: "rgba(239, 68, 68, 0.3)",
          }}
        >
          <span className="text-[11.5px] font-semibold text-red-600 flex items-center gap-1.5">▲ Problem detected</span>
          <div className="font-display font-semibold text-[18px] text-slate-900 my-3.5 leading-snug">
            Web tier trending toward capacity limit
          </div>
          <Row label="CPU utilization" value={`${cpu}%`} color="text-red-600" />
          <Row label="Latency (p99)" value={`${latency}s`} color="text-red-600" />
          <Row label="Predicted shortage" value="~18 min" color="text-red-600" />
          <div className="mt-auto pt-3.5 text-[11.5px] text-slate-500 flex justify-between border-t border-slate-200/60">
            <span>orders · web-asg-1</span>
            <span>detecting…</span>
          </div>
        </div>

        {/* back — solution */}
        <div
          className="absolute inset-0 rounded-xl border p-6 flex flex-col shadow-sm"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(160deg, rgba(240, 253, 244, 0.9), rgba(224, 242, 254, 0.6))",
            borderColor: "rgba(34, 197, 94, 0.3)",
          }}
        >
          <span className="text-[11.5px] font-semibold text-emerald-600 flex items-center gap-1.5">✓ Verified solution</span>
          <div className="font-display font-semibold text-[18px] text-slate-900 my-3.5 leading-snug">
            Scaled to 12 instances — improvement confirmed
          </div>
          <Row label="CPU utilization" value="54%" color="text-emerald-600" />
          <Row label="Latency (p99)" value="1.1s" color="text-emerald-600" />
          <Row label="Result" value="SUCCESS" color="text-emerald-600" />
          <div className="mt-auto pt-3.5 text-[11.5px] text-slate-500 flex justify-between border-t border-slate-200/60">
            <span>orders · web-asg-1</span>
            <span>verified in 47s</span>
          </div>
        </div>
      </div>
      <p className="text-center text-[12.5px] text-slate-500 mt-4">
        CloudFlip flips problems into verified solutions — automatically, in seconds.
      </p>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex justify-between items-baseline py-2 border-t border-slate-200/60 first:border-t-0">
      <span className="text-[12.5px] text-slate-600">{label}</span>
      <span className={`font-mono text-[14px] font-semibold ${color}`}>{value}</span>
    </div>
  );
}

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur bg-white/95 border-b border-slate-200/80">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/">
            <CloudFlipLogo size={28} />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[14px] text-slate-600 font-medium">
            <button onClick={() => scrollTo("what-is-cloudflip")} className="hover:text-slate-900 transition-colors">
              What is CloudFlip?
            </button>
            <button onClick={() => scrollTo("pipeline")} className="hover:text-slate-900 transition-colors">
              How it works
            </button>
            <button onClick={() => scrollTo("features")} className="hover:text-slate-900 transition-colors">
              Features
            </button>
            <button onClick={() => scrollTo("roi-calculator")} className="hover:text-slate-900 transition-colors">
              ROI Calculator
            </button>
            <button onClick={() => scrollTo("research")} className="hover:text-slate-900 transition-colors">
              Research
            </button>
            <Link to="/pricing" className="hover:text-slate-900 transition-colors">
              Pricing
            </Link>
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            <Link to="/signup" className="text-[14px] font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5">
              Log in
            </Link>
            <Link to="/app" className="bg-[#4FD1E8] text-[#04141A] font-semibold text-[14px] rounded-md px-4 py-2 hover:bg-[#3ec4db] transition-colors shadow-sm">
              Get started
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <span className="text-[22px] leading-none font-bold">✕</span>
            ) : (
              <span className="text-[22px] leading-none">☰</span>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col space-y-3 text-[15px] font-medium text-slate-700">
              <button onClick={() => scrollTo("what-is-cloudflip")} className="text-left py-1 hover:text-sky-600">
                What is CloudFlip?
              </button>
              <button onClick={() => scrollTo("pipeline")} className="text-left py-1 hover:text-sky-600">
                How it works
              </button>
              <button onClick={() => scrollTo("features")} className="text-left py-1 hover:text-sky-600">
                Features
              </button>
              <button onClick={() => scrollTo("roi-calculator")} className="text-left py-1 hover:text-sky-600">
                ROI & Cost Savings
              </button>
              <button onClick={() => scrollTo("research")} className="text-left py-1 hover:text-sky-600">
                Academic Research (DOI)
              </button>
              <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-sky-600">
                Pricing & Plans
              </Link>
            </nav>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg border border-slate-200 text-slate-800 font-semibold text-[14px]"
              >
                Log in
              </Link>
              <Link
                to="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg bg-[#4FD1E8] text-[#04141A] font-semibold text-[14px] shadow-xs"
              >
                Explore Demo Platform →
              </Link>
            </div>
          </div>
        )}
      </header>


      {/* Hero Section */}
      <section className="max-w-[1180px] mx-auto px-8 pt-16 pb-16 grid grid-cols-1 lg:grid-cols-[1.05fr_.95fr] gap-14 items-center">
        <div>
          <h1 className="font-display font-bold text-[48px] lg:text-[54px] text-slate-900 leading-[1.05] tracking-tight max-w-[560px]">
            Flip from reactive to predictive.
          </h1>
          <p className="text-[17px] text-slate-600 mt-4.5 max-w-[460px] leading-relaxed">
            CloudFlip understands your cloud infrastructure, predicts what's coming next, and helps you act before small problems become major incidents.
          </p>
          <div className="flex gap-3 mt-8">
            <Link to="/app" className="bg-[#4FD1E8] text-[#04141A] font-semibold text-[14.5px] rounded-md px-6 py-3 hover:bg-[#3ec4db] transition-colors shadow-sm">
              Get started
            </Link>
            <Link to="/pricing" className="border border-slate-300 text-slate-800 font-semibold text-[14.5px] rounded-md px-6 py-3 hover:bg-slate-50 transition-colors">
              View packages
            </Link>
          </div>
        </div>

        <FlipCard />
      </section>

      {/* Section 1: Problem vs Solution comparison (Screenshot 5) */}
      <section id="what-is-cloudflip" className="max-w-[1180px] mx-auto px-8 py-16 border-t border-slate-200">
        <h2 className="font-display font-bold text-[32px] lg:text-[36px] text-slate-900 max-w-[560px] mb-3 leading-snug">
          Most teams only find out something is wrong after it already broke.
        </h2>
        <p className="text-slate-600 text-[16px] max-w-[540px] mb-10 leading-relaxed">
          CloudFlip replaces the alert-and-scramble cycle with a continuous loop that understands your infrastructure before it fails, not after.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Traditional cloud operations */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 flex flex-col justify-between">
            <div>
              <div className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-6">
                Traditional cloud operations
              </div>
              <div className="space-y-4 font-mono text-[13px] text-slate-600">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">01</span>
                  <span className="text-slate-900 font-semibold">Problem occurs</span>
                </div>
                <div className="text-slate-400 pl-7">↓</div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">02</span>
                  <span>Alert fires</span>
                </div>
                <div className="text-slate-400 pl-7">↓</div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">03</span>
                  <span>Investigation begins</span>
                </div>
                <div className="text-slate-400 pl-7">↓</div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">04</span>
                  <span className="text-red-600 font-semibold">Reaction, under pressure</span>
                </div>
              </div>
            </div>
          </div>

          {/* CloudFlip Operations */}
          <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-6 flex flex-col justify-between">
            <div>
              <div className="text-[12px] font-semibold text-sky-600 uppercase tracking-wider mb-6">
                CloudFlip
              </div>
              <div className="space-y-4 font-mono text-[13px]">
                <div className="flex items-center gap-3">
                  <span className="text-sky-600 font-semibold">01</span>
                  <span className="text-slate-900 font-semibold">Observe</span>
                </div>
                <div className="text-sky-400 pl-7">↓</div>
                <div className="flex items-center gap-3">
                  <span className="text-sky-600 font-semibold">02</span>
                  <span className="text-sky-700 font-semibold">Understand & predict</span>
                </div>
                <div className="text-sky-400 pl-7">↓</div>
                <div className="flex items-center gap-3">
                  <span className="text-sky-600 font-semibold">03</span>
                  <span className="text-slate-800">Simulate & plan</span>
                </div>
                <div className="text-sky-400 pl-7">↓</div>
                <div className="flex items-center gap-3">
                  <span className="text-sky-600 font-semibold">04</span>
                  <span className="text-emerald-600 font-semibold">Act, then verify</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-8 text-[13.5px] text-slate-600 font-medium pt-2">
          <div className="flex items-center gap-2"><span className="text-sky-500 font-bold">✓</span> Cloud resource discovery</div>
          <div className="flex items-center gap-2"><span className="text-sky-500 font-bold">✓</span> Infrastructure monitoring</div>
          <div className="flex items-center gap-2"><span className="text-sky-500 font-bold">✓</span> Dependency mapping</div>
        </div>
      </section>

      {/* Section 2: Features Grid - Built on real cloud data (Screenshot 1) */}
      <section id="features" className="max-w-[1180px] mx-auto px-8 py-16 border-t border-slate-200">
        <div className="text-sky-600 text-[13px] font-semibold mb-2">What's inside</div>
        <h2 className="font-display font-bold text-[36px] text-slate-900 max-w-[560px] mb-12">
          Built on real cloud data, not vibes.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            icon="🌐"
            title="Cloud resource intelligence"
            desc="Understand what resources exist and how they're actually being used."
          />
          <FeatureCard
            icon="🕸️"
            title="Dependency intelligence"
            desc="Visualize how cloud components actually relate to each other."
          />
          <FeatureCard
            icon="📈"
            title="Predictive operations"
            desc="Forecast traffic and infrastructure pressure ahead of time."
          />
          <FeatureCard
            icon="🎯"
            title="Bottleneck detection"
            desc="Identify resources that may become limiting factors first."
          />
          <FeatureCard
            icon="📊"
            title="What-if simulator"
            desc="Test infrastructure scenarios before ever touching production."
          />
          <FeatureCard
            icon="💰"
            title="Cost intelligence"
            desc="Compare infrastructure strategies against estimated cost."
          />
          <FeatureCard
            icon="⚡"
            title="Controlled automation"
            desc="Execute only approved AWS actions, never unattended."
          />
          <FeatureCard
            icon="⭐"
            title="Verification"
            desc="Every action is measured against real metrics afterward."
          />
        </div>
      </section>

      {/* Section 3: The 7-Stage Pipeline (Screenshot 2) */}
      <section id="pipeline" className="max-w-[1180px] mx-auto px-8 py-16 border-t border-slate-200">
        <div className="text-sky-600 text-[13px] font-semibold mb-2">The CloudFlip pipeline</div>
        <h2 className="font-display font-bold text-[36px] text-slate-900 max-w-[560px] mb-3">
          Seven stages, one continuous loop.
        </h2>
        <p className="text-slate-600 text-[16px] max-w-[540px] mb-12">
          Every recommendation CloudFlip makes can be traced back through this pipeline to real, measured evidence.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          <StageStep num="01" title="Discover" desc="Find supported cloud resources across your account." />
          <StageStep num="02" title="Understand" desc="Map dependencies between resources." />
          <StageStep num="03" title="Monitor" desc="Collect infrastructure and application metrics." />
          <StageStep num="04" title="Predict" desc="Forecast traffic, utilization and bottlenecks." />
          <StageStep num="05" title="Simulate" desc="Test scenarios without touching real resources." />
          <StageStep num="06" title="Act" desc="Recommend, and execute approved actions." />
          <StageStep num="07" title="Verify" desc="Measure whether the action actually helped." />
        </div>
      </section>

      {/* Section 4: Interactive ROI & Cloud Cost Savings Calculator */}
      <section id="roi-calculator" className="max-w-[1180px] mx-auto px-8 py-16 border-t border-slate-200">
        <div className="text-center max-w-[680px] mx-auto mb-12">
          <div className="text-sky-600 text-[13px] font-semibold tracking-wide uppercase mb-2">ROI & Cost Calculator</div>
          <h2 className="font-display font-bold text-[36px] text-slate-900 mb-3">
            Calculate your cloud cost savings.
          </h2>
          <p className="text-slate-600 text-[16px] leading-relaxed">
            See how much your organization saves by eliminating 3–5 minute VM provisioning lag and stopping over-provisioned idle fleet capacity.
          </p>
        </div>

        <RoiCalculator />
      </section>

      {/* Section 5: Academic Research Foundation & DOI Credibility */}
      <section id="research" className="max-w-[1180px] mx-auto px-8 py-16 border-t border-slate-200">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-10 shadow-lg border border-slate-800">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-8 pb-8 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-sky-500/20 text-sky-400 border border-sky-500/40 text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Academic Research Foundation
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-mono px-2.5 py-0.5 rounded-full">
                  DOI: 10.5281/zenodo.23136467
                </span>
              </div>
              <h3 className="font-display font-bold text-[28px] text-white leading-snug">
                CloudFlip: Autonomous Predictive Infrastructure Scaling
              </h3>
              <p className="text-slate-300 text-[14px] mt-2 max-w-[620px]">
                Engineered by Bhavya Sri Boddeti. Formulates accelerated exponential smoothing (EMA) paired with discrete derivative slope forecasting ($S_t$) and closed-loop scale-down policies.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://doi.org/10.5281/zenodo.23136467"
                target="_blank"
                rel="noreferrer"
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-[13px] px-4 py-2.5 rounded-lg shadow-sm transition-colors whitespace-nowrap text-center"
              >
                View Archived DOI Paper ↗
              </a>
              <Link
                to="/simulator"
                className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-[13px] font-medium px-4 py-2.5 rounded-lg transition-colors text-center"
              >
                Launch Interactive Surge Simulator ⚡
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/80">
              <div className="text-red-400 font-semibold text-[13.5px] mb-2 flex items-center gap-1.5">
                ✕ Traditional Reactive Cloud Scaling
              </div>
              <ul className="space-y-2 text-[12.5px] text-slate-300">
                <li>• Scales only <strong>after</strong> CPU exceeds thresholds (e.g., 75% for 5 min).</li>
                <li>• Incurs 3–5 minute VM provisioning delay, causing severe SLA latency degradation.</li>
                <li>• Over-provisions instances post-surge, leading to significant budget waste.</li>
              </ul>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-5 border border-sky-500/30">
              <div className="text-sky-400 font-semibold text-[13.5px] mb-2 flex items-center gap-1.5">
                ✓ CloudFlip Autonomic Acceleration Engine
              </div>
              <ul className="space-y-2 text-[12.5px] text-slate-300">
                <li>• Predicts capacity shortages <strong>15–30 minutes in advance</strong> using acceleration slopes.</li>
                <li>• Pre-warms instances ahead of traffic peaks, maintaining 100% SLA latency bounds.</li>
                <li>• Enforces closed-loop scale-down policy (Eq. 5), dropping instances back to baseline safely.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Interactive Playground CTA (Screenshot 4) */}
      <section className="max-w-[1180px] mx-auto px-8 py-16">
        <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="text-sky-600 text-[13px] font-semibold mb-2">1-Click AWS Onboarding Ready</div>
            <h3 className="font-display font-bold text-[30px] text-slate-900 mb-3">
              Deploy CloudFlip in 60 seconds.
            </h3>
            <p className="text-slate-600 text-[15px] max-w-[540px] leading-relaxed">
              Launch our official AWS CloudFormation Stack with a single click. Zero credentials shared, least-privilege IAM execution, and instant telemetry discovery.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/app/settings"
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-[14.5px] rounded-lg px-6 py-3 transition-colors whitespace-nowrap shadow-xs text-center"
            >
              ⚡ 1-Click AWS Connect
            </Link>
            <Link
              to="/app"
              className="bg-[#4FD1E8] text-[#04141A] font-semibold text-[14.5px] rounded-lg px-6 py-3 hover:bg-[#3ec4db] transition-colors whitespace-nowrap shadow-xs text-center"
            >
              Explore Demo →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-slate-500 text-[12.5px]">
        <div className="max-w-[1180px] mx-auto px-8 flex justify-between items-center">
          <CloudFlipLogo size={22} textSize="text-[15px]" />
          <div>Demo build · Simulated data unless AWS account connected</div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col hover:border-sky-300 transition-colors shadow-sm">
      <div className="text-[20px] mb-3">{icon}</div>
      <h4 className="font-display font-semibold text-[15px] mb-2 text-slate-900">{title}</h4>
      <p className="text-[12.5px] text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function StageStep({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col">
      <div className="w-8 h-8 rounded-full border border-sky-300 text-sky-600 font-mono text-[12px] font-semibold flex items-center justify-center mb-3 bg-white">
        {num}
      </div>
      <h5 className="font-display font-semibold text-[14px] text-slate-900 mb-1">{title}</h5>
      <p className="text-[12px] text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function RoiCalculator() {
  const [monthlySpend, setMonthlySpend] = useState(8000);
  const [fleetSize, setFleetSize] = useState(24);

  const monthlySavings = Math.round(monthlySpend * 0.32);
  const annualSavings = Math.round(monthlySavings * 12);
  const idleHoursSaved = Math.round(fleetSize * 4.2 * 30);
  const slaOutagesSaved = Math.max(2, Math.round(fleetSize * 0.15));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Sliders on Left */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-[14px] font-semibold text-slate-800">
                Monthly AWS Infrastructure Spend
              </label>
              <span className="font-mono text-[18px] font-bold text-sky-600">
                ${monthlySpend.toLocaleString()}/mo
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="500"
              value={monthlySpend}
              onChange={(e) => setMonthlySpend(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>$1,000</span>
              <span>$25,000</span>
              <span>$50,000+</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-[14px] font-semibold text-slate-800">
                Managed Instances & Containers Fleet
              </label>
              <span className="font-mono text-[18px] font-bold text-indigo-600">
                {fleetSize} nodes
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="200"
              step="2"
              value={fleetSize}
              onChange={(e) => setFleetSize(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>4 nodes</span>
              <span>100 nodes</span>
              <span>200+ nodes</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[12.5px] text-slate-600 space-y-1.5">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>⚡ How CloudFlip calculates these savings:</span>
            </div>
            <p>• <strong>Proactive Lookahead (Eq. 1-4):</strong> Pre-provisions capacity only during actual acceleration slopes, reducing peak buffer over-spend by 18%.</p>
            <p>• <strong>Closed-Loop Scale-Down (Eq. 5):</strong> De-provisions idle post-surge instances in 10 minutes rather than leaving them idle for hours.</p>
          </div>
        </div>

        {/* Results Card on Right */}
        <div className="bg-gradient-to-br from-sky-500/10 via-indigo-500/10 to-emerald-500/10 rounded-2xl p-6 border border-sky-100 flex flex-col justify-between">
          <div className="mb-6">
            <span className="text-[12px] font-semibold text-sky-700 uppercase tracking-wider">Estimated Value</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-[44px] font-bold text-slate-900 leading-none">
                ${monthlySavings.toLocaleString()}
              </span>
              <span className="text-[16px] text-slate-600 font-medium">/ month saved</span>
            </div>
            <div className="text-[14px] font-semibold text-emerald-600 mt-1">
              ${annualSavings.toLocaleString()} projected annual cost reduction
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/80 mb-6">
            <div>
              <div className="text-[12px] text-slate-500">Idle Node-Hours Eliminated</div>
              <div className="font-mono text-[18px] font-bold text-slate-800 mt-0.5">
                {idleHoursSaved.toLocaleString()} hrs/mo
              </div>
            </div>
            <div>
              <div className="text-[12px] text-slate-500">Prevented Latency Breaches</div>
              <div className="font-mono text-[18px] font-bold text-slate-800 mt-0.5">
                ~{slaOutagesSaved} incidents/yr
              </div>
            </div>
          </div>

          <Link
            to="/app/settings"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[14px] py-3 rounded-xl text-center transition-colors shadow-sm"
          >
            Start Free Trial with Your AWS Account →
          </Link>
        </div>
      </div>
    </div>
  );
}

