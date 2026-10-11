import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Card } from "../components/ui";

const LAYOUT: Record<string, { x: number; y: number }> = {
  "public-elb": { x: 40, y: 100 },
  "api-ec2-2": { x: 240, y: 40 },
  "web-asg-1": { x: 240, y: 160 },
  "orders-rds": { x: 440, y: 40 },
  "orders-sqs": { x: 440, y: 160 },
  "worker-ecs": { x: 620, y: 160 },
  "assets-s3": { x: 620, y: 40 },
  "checkout-lambda": { x: 440, y: 250 },
};

export default function DependencyMap() {
  const [resources, setResources] = useState<any[]>([]);
  const [deps, setDeps] = useState<any[]>([]);
  const [highlighted, setHighlighted] = useState<string | null>(null);

  useEffect(() => {
    api.resources().then(setResources).catch(() => {});
    api.dependencies().then(setDeps).catch(() => {});
  }, []);

  const byId = Object.fromEntries(resources.map((r) => [r.id, r]));

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-[14.5px]">Dependency map</h3>
        <span className="text-[12px] text-textFaint">click a node to highlight its chain · dashed = inferred</span>
      </div>
      <svg viewBox="0 0 700 300" className="w-full h-auto">
        <g>
          {deps.map((d) => {
            const a = byId[d.source_resource_id];
            const b = byId[d.target_resource_id];
            if (!a || !b) return null;
            const pa = LAYOUT[a.name] || { x: 40, y: 40 };
            const pb = LAYOUT[b.name] || { x: 200, y: 40 };
            const on = highlighted === a.name || highlighted === b.name;
            return (
              <path
                key={d.id}
                d={`M${pa.x + 60},${pa.y + 19} C${(pa.x + pb.x) / 2},${pa.y + 19} ${(pa.x + pb.x) / 2},${pb.y + 19} ${pb.x},${pb.y + 19}`}
                stroke={on ? "#4FD1E8" : "#232E3F"}
                strokeWidth={on ? 2.2 : 1.5}
                fill="none"
                strokeDasharray={d.inferred ? "4 4" : undefined}
              />
            );
          })}
        </g>
        {resources.map((r) => {
          const p = LAYOUT[r.name];
          if (!p) return null;
          const on = highlighted === r.name;
          return (
            <g key={r.id} style={{ cursor: "pointer" }} onClick={() => setHighlighted(r.name)}>
              <rect x={p.x} y={p.y} width={120} height={38} rx={7} fill="#182130" stroke={on ? "#4FD1E8" : "#232E3F"} />
              <text x={p.x + 60} y={p.y + 17} textAnchor="middle" fill="#E9EEF5" fontSize={12}>
                {r.name}
              </text>
              <text x={p.x + 60} y={p.y + 30} textAnchor="middle" fill="#5C6B80" fontSize={10}>
                {r.resource_type}
              </text>
            </g>
          );
        })}
      </svg>
    </Card>
  );
}
