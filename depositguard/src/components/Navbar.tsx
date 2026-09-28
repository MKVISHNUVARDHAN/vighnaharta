import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Smartphone, Monitor, RotateCcw, User, Building, Home } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    userRole,
    setUserRole,
    isMobileFrame,
    setIsMobileFrame,
    properties,
    activePropertyId,
    setActivePropertyId,
    resetDemoData,
    setActiveTab
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-navy-950 text-base sm:text-lg tracking-tight">DepositGuard</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  India
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block -mt-0.5">Rental Condition & Security Deposit Protection</p>
            </div>
          </div>

          {/* Center: Property selector (if not on small mobile) */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Property:</span>
            <select
              value={activePropertyId}
              onChange={(e) => setActivePropertyId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-navy-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 max-w-xs truncate"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Role Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUserRole('tenant')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
                  userRole === 'tenant'
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
                title="View as Tenant"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Tenant</span>
              </button>
              <button
                type="button"
                onClick={() => setUserRole('landlord')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
                  userRole === 'landlord'
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
                title="View as Landlord"
              >
                <Building className="w-3.5 h-3.5 text-navy-600" />
                <span className="hidden sm:inline">Landlord</span>
              </button>
            </div>

            {/* Mobile frame toggle (Desktop only) */}
            <button
              type="button"
              onClick={() => setIsMobileFrame(!isMobileFrame)}
              className="hidden lg:flex items-center gap-1 p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-navy-900 text-xs font-medium"
              title={isMobileFrame ? 'Switch to Full Width View' : 'Preview in Mobile Simulator Frame'}
            >
              {isMobileFrame ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px]">Wide</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-slate-700" />
                  <span className="text-[11px]">Mobile Sim</span>
                </>
              )}
            </button>

            {/* Reset Demo button */}
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset to initial Bengaluru sample data?')) {
                  resetDemoData();
                }
              }}
              className="p-1.5 sm:px-2 sm:py-1 rounded-lg border border-slate-200 text-slate-500 hover:text-navy-900 hover:bg-slate-50 transition-colors text-xs flex items-center gap-1"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
