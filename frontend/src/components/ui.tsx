import { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-surface border border-border rounded-[10px] ${className}`}>
      {children}
    </div>
  );
}

export function Panel({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <Card className="p-5 mb-3.5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-[14.5px]">{title}</h3>
        {sub && <span className="text-[12px] text-textFaint">{sub}</span>}
      </div>
      {children}
    </Card>
  );
}

export function Kpi({ label, value, delta, tone = "default" }: { label: string; value: string | number; delta?: string; tone?: "default" | "up" | "down" | "warn" }) {
  const toneClass = { default: "text-textFaint", up: "text-green", down: "text-red", warn: "text-amber" }[tone];
  return (
    <Card className="p-4.5 px-5">
      <div className="text-[12.5px] text-textDim mb-2.5">{label}</div>
      <div className="font-mono text-[26px] font-semibold">{value}</div>
      {delta && <div className={`text-[12px] mt-1.5 ${toneClass}`}>{delta}</div>}
    </Card>
  );
}

export function Badge({ children, tone = "info" }: { children: ReactNode; tone?: "healthy" | "warn" | "crit" | "info" }) {
  const map = {
    healthy: "bg-green/15 text-green",
    warn: "bg-amber/15 text-amber",
    crit: "bg-red/15 text-red",
    info: "bg-cyan/15 text-cyan",
  };
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${map[tone]}`}>{children}</span>;
}

export function Alert({ title, body, tone = "red" }: { title: string; body: string; tone?: "red" | "amber" }) {
  const border = tone === "red" ? "border-red/30 bg-red/10" : "border-amber/30 bg-amber/10";
  const textColor = tone === "red" ? "text-red" : "text-amber";
  return (
    <div className={`flex gap-3 p-3.5 rounded-lg border mb-4 ${border}`}>
      <span className={textColor}>▲</span>
      <div>
        <h4 className="text-[13.5px] font-semibold mb-0.5">{title}</h4>
        <p className="text-[12.5px] text-textDim leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
