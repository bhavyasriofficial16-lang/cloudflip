export default function Topbar({ 
  title, 
  mode, 
  onToggleMobileMenu 
}: { 
  title: string; 
  mode: string;
  onToggleMobileMenu?: () => void;
}) {
  return (
    <div className="h-[60px] shrink-0 flex items-center justify-between px-4 sm:px-7 border-b border-slate-200 bg-white">
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Open navigation sidebar"
          >
            <span className="text-[20px] leading-none">☰</span>
          </button>
        )}
        <span className="font-display font-bold text-[17px] sm:text-[18px] text-slate-900 truncate">{title}</span>
        <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          {mode.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <select className="text-[12px] sm:text-[13px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 sm:px-3 py-1.5 outline-none focus:border-sky-400">
          <option>ap-south-1 (Mumbai)</option>
          <option>us-east-1 (N. Virginia)</option>
          <option>eu-west-1 (Ireland)</option>
        </select>

        <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-[12px] font-bold text-white shadow-sm shrink-0">
          BH
        </div>
      </div>
    </div>
  );
}

