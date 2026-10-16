import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ 
  title, 
  mode, 
  onToggleMobileMenu 
}: { 
  title: string; 
  mode: string;
  onToggleMobileMenu?: () => void;
}) {
  const { user } = useAuth();

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
        <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          {user ? mode.toUpperCase() : "INTERACTIVE DEMO"}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <select 
          defaultValue="us-east-1"
          className="text-[12px] sm:text-[13px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 sm:px-3 py-1.5 outline-none focus:border-sky-400"
        >
          <option value="us-east-1">us-east-1 (N. Virginia)</option>
          <option value="us-west-2">us-west-2 (Oregon)</option>
          <option value="eu-west-1">eu-west-1 (Ireland)</option>
          <option value="ap-south-1">ap-south-1 (Mumbai)</option>
        </select>

        {user ? (
          <div 
            title={user.email || "User Account"} 
            className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-[12px] font-bold text-white shadow-sm shrink-0"
          >
            {(user.email ? user.email.slice(0, 2).toUpperCase() : "US")}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/app/settings"
              className="hidden lg:inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#04141A] bg-[#4FD1E8] hover:bg-[#3ec4db] px-3 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <span>⚡</span> Connect AWS (Read-Only)
            </Link>
            <Link
              to="/login"
              className="text-[12.5px] font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors"
            >
              Log in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

