import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Property } from '../types';
import { formatINR, generateWhatsAppLink } from '../utils/formatters';
import { PropertyModal } from './PropertyModal';
import {
  ShieldCheck,
  Building,
  PlusCircle,
  IndianRupee,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  GitCompare,
  ArrowRight,
  MessageSquareShare,
  HelpCircle,
  Eye,
  UserCheck,
  Sparkles
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    properties,
    activePropertyId,
    setActivePropertyId,
    setActiveTab,
    setSelectedPdfType,
    setUserRole,
    userRole
  } = useApp();

  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);

  // Total protected deposits
  const totalProtectedDeposit = properties.reduce((acc, p) => acc + (p.depositAmount || 0), 0);

  const handleSelectPropertyAndTab = (
    propId: string,
    tab: 'move_in' | 'move_out' | 'compare' | 'settlement' | 'pdf'
  ) => {
    setActivePropertyId(propId);
    if (tab === 'pdf') {
      setSelectedPdfType('move_in');
    }
    setActiveTab(tab);
  };

  const handleQuickWhatsAppShare = (prop: Property) => {
    const summary = `• Monthly Rent: ${formatINR(prop.rentAmount)}\n• Security Deposit: ${formatINR(prop.depositAmount)}\n• Move-in Date: ${prop.moveInDate}\n• Inspection: Date-stamped evidence recorded`;
    const targetPhone = userRole === 'tenant' ? prop.landlordPhone : prop.tenantPhone;
    const recipient = userRole === 'tenant' ? prop.landlordName : prop.tenantName;
    const link = generateWhatsAppLink(targetPhone, prop.title, 'Move-in', summary, recipient);
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Zero Login "Continue as Tenant" Hero Banner */}
      <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-float relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Demo • No Login Required</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight">
            Never Lose Your Rental Security Deposit to False Damage Claims.
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            DepositGuard creates tamper-proof, date-stamped photo & video evidence at move-in and
            move-out. Compare condition side-by-side, generate signed PDF reports, and settle deposits fairly.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setUserRole('tenant');
                setActivePropertyId('prop-1');
                setActiveTab('move_in');
              }}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-navy-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Continue as Tenant (Prestige Apt 402)
            </button>

            <button
              type="button"
              onClick={() => {
                setUserRole('landlord');
                setActivePropertyId('prop-1');
                setActiveTab('settlement');
              }}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <Building className="w-4 h-4 text-emerald-300" />
              View Landlord Perspective
            </button>
          </div>
        </div>
      </div>

      {/* High Level Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
            Protected Deposits
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg sm:text-xl font-extrabold text-emerald-700">
              {formatINR(totalProtectedDeposit)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Across {properties.length} Active Rentals</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
            Inspected Rooms
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg sm:text-xl font-extrabold text-navy-950">7 Rooms</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">100% Date-Stamped</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
            Disputed Claims Saved
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg sm:text-xl font-extrabold text-emerald-700">₹9,500</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Saved by Move-in Proof</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
            Signed PDF Reports
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg sm:text-xl font-extrabold text-navy-950">2 Reports</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">WhatsApp Verified</span>
        </div>
      </div>

      {/* Property Cards Section Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-navy-950">
            Registered Properties ({properties.length})
          </h2>
          <p className="text-xs text-slate-500">Select a property to view or record condition evidence</p>
        </div>

        <button
          type="button"
          onClick={() => setIsPropertyModalOpen(true)}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          Add Property
        </button>
      </div>

      {/* Properties List */}
      <div className="space-y-3">
        {properties.map((prop) => {
          const isSelected = prop.id === activePropertyId;
          const hasDisputes = (prop.settlement?.deductions || []).some(
            (d) => d.status === 'disputed'
          );
          const isSettled = prop.status === 'settled';

          return (
            <div
              key={prop.id}
              className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all ${
                isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-md'
                  : 'border-slate-200 shadow-sm hover:border-slate-300'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-bold text-navy-950">{prop.title}</span>
                    {isSelected && (
                      <span className="text-[10px] font-bold bg-navy-900 text-white px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{prop.address}</p>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  {isSettled ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Settled & Refunded
                    </span>
                  ) : hasDisputes ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Dispute Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Move-In Verified & Signed
                    </span>
                  )}
                </div>
              </div>

              {/* Financial & Tenancy Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-medium">Monthly Rent</span>
                  <span className="font-bold text-navy-950 text-sm">
                    {formatINR(prop.rentAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-medium">Security Deposit</span>
                  <span className="font-extrabold text-emerald-700 text-sm">
                    {formatINR(prop.depositAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-medium">Move-In Date</span>
                  <span className="font-semibold text-slate-700">{prop.moveInDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-medium">Landlord Contact</span>
                  <span className="font-semibold text-slate-700 truncate block">
                    {prop.landlordName} ({prop.landlordPhone})
                  </span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectPropertyAndTab(prop.id, 'move_in')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-navy-950 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Move-In Inspection
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPropertyAndTab(prop.id, 'compare')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-navy-950 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <GitCompare className="w-3.5 h-3.5 text-emerald-600" />
                    Compare Evidence
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPropertyAndTab(prop.id, 'settlement')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-navy-950 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                    Deposit Settlement
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPropertyAndTab(prop.id, 'pdf')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-navy-950 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-navy-700" />
                    Condition Report PDF
                  </button>
                </div>

                {/* WhatsApp Share Button */}
                <button
                  type="button"
                  onClick={() => handleQuickWhatsAppShare(prop)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <MessageSquareShare className="w-3.5 h-3.5" />
                  Share via WhatsApp
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legal & Educational Footer Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-navy-950">How DepositGuard Protects Tenants & Landlords</h3>
            <p className="text-slate-600 leading-relaxed">
              In India, rental security deposit disputes account for over 65% of tenancy conflicts.
              DepositGuard secures both parties: tenants prove pre-existing cracks, dampness, and normal
              wear, while landlords obtain verified timestamped documentation of property condition at move-in.
            </p>
          </div>
        </div>
      </div>

      {/* New Property Modal */}
      <PropertyModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
      />
    </div>
  );
};
