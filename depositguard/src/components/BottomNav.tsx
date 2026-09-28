import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, ClipboardCheck, GitCompare, IndianRupee, FileText } from 'lucide-react';
import { ActiveTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, activeProperty, setSelectedPdfType } = useApp();

  const hasDisputes = (activeProperty?.settlement?.deductions || []).some(
    (d) => d.status === 'disputed'
  );

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: boolean; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: <Home className="w-5 h-5" />
    },
    {
      id: 'move_in',
      label: 'Move-In',
      icon: <ClipboardCheck className="w-5 h-5" />
    },
    {
      id: 'compare',
      label: 'Compare',
      icon: <GitCompare className="w-5 h-5" />,
      badge: true,
      badgeColor: 'bg-emerald-500'
    },
    {
      id: 'settlement',
      label: 'Settle',
      icon: <IndianRupee className="w-5 h-5" />,
      badge: hasDisputes,
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'pdf',
      label: 'Report',
      icon: <FileText className="w-5 h-5" />
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-float max-w-lg mx-auto sm:max-w-none">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === 'pdf') {
                  setSelectedPdfType('move_in');
                }
                setActiveTab(item.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-700 font-bold scale-105'
                  : 'text-slate-500 hover:text-navy-900 font-medium'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span
                    className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${item.badgeColor || 'bg-emerald-500'} ring-2 ring-white`}
                  />
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <div className="w-4 h-1 bg-emerald-600 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
