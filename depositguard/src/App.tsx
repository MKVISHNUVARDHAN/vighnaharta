import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { InspectionFlow } from './components/InspectionFlow';
import { ComparisonScreen } from './components/ComparisonScreen';
import { SettlementPage } from './components/SettlementPage';
import { PDFReportPreview } from './components/PDFReportPreview';

const MainContent: React.FC = () => {
  const { activeTab, isMobileFrame } = useApp();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'move_in':
        return <InspectionFlow type="move_in" />;
      case 'move_out':
        return <InspectionFlow type="move_out" />;
      case 'compare':
        return <ComparisonScreen />;
      case 'settlement':
        return <SettlementPage />;
      case 'pdf':
        return <PDFReportPreview />;
      default:
        return <Dashboard />;
    }
  };

  // If user enabled the phone frame simulator on desktop
  if (isMobileFrame) {
    return (
      <div className="min-h-screen bg-slate-900 py-6 sm:py-10 flex flex-col items-center justify-center px-4">
        {/* Phone Frame Mockup */}
        <div className="relative w-full max-w-[420px] h-[880px] bg-slate-50 rounded-[48px] border-[10px] border-slate-800 shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10">
          {/* Dynamic Island / Speaker Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-50 pointer-events-none" />

          {/* Screen Content inside Mobile Frame */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
              {renderActiveScreen()}
            </main>
            <BottomNav />
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-4 text-center">
          📱 Mobile Simulator Mode Active • Tap wide monitor icon in header to view full responsive layout
        </p>
      </div>
    );
  }

  // Full-width Responsive Web View (Default)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {renderActiveScreen()}
      </main>
      <BottomNav />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;
