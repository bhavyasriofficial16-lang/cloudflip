import { NavLink } from "react-router-dom";

const groups: { label: string; links: { to: string; label: string; icon?: string }[] }[] = [
  { label: "Overview", links: [{ to: "/app", label: "Dashboard", icon: "📊" }] },
  {
    label: "Infrastructure",
    links: [
      { to: "/app/resources", label: "Resources", icon: "🌐" },
      { to: "/app/dependency", label: "Dependency map", icon: "🕸️" },
    ],
  },
  {
    label: "Intelligence",
    links: [
      { to: "/app/metrics", label: "Live metrics", icon: "📈" },
      { to: "/app/predictions", label: "Predictions", icon: "🔮" },
      { to: "/app/anomalies", label: "Anomalies", icon: "⚠️" },
      { to: "/app/bottlenecks", label: "Bottlenecks", icon: "📍" },
    ],
  },
  {
    label: "Operations",
    links: [
      { to: "/app/simulator", label: "Simulator", icon: "⚡" },
      { to: "/app/recommendations", label: "Recommendations", icon: "⭐" },
      { to: "/app/actions", label: "Actions", icon: "📝" },
    ],
  },
  { label: "Cost", links: [{ to: "/app/cost", label: "Cost intelligence", icon: "💰" }] },
  {
    label: "System",
    links: [
      { to: "/app/activity", label: "Activity", icon: "📡" },
      { to: "/app/settings", label: "Settings", icon: "⚙️" },
    ],
  },
];

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const content = (
    <div className="flex flex-col h-full p-4 overflow-y-auto font-sans">
      <div className="flex items-center justify-between px-2 pb-6 pt-1">
        <div className="flex items-center gap-2 font-display font-bold text-[18px] text-slate-900">
          <span className="text-cyan-500">☁</span> CloudFlip
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        )}
      </div>

      {groups.map((g) => (
        <div key={g.label} className="mb-3">
          <div className="text-[11px] text-slate-400 font-medium px-2.5 pb-1.5">
            {g.label}
          </div>
          {g.links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/app"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${
                  isActive
                    ? "bg-sky-50 text-sky-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                }`
              }
            >
              <span className="text-[14px]">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </div>
      ))}

      <div className="mt-auto pt-4 border-t border-slate-200">
        <NavLink
          to="/"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13.5px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          ← Back to site
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-[240px] shrink-0 bg-white border-r border-slate-200 flex-col">
        {content}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          {/* Drawer content */}
          <aside className="relative w-[280px] max-w-[80vw] bg-white h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-200">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

