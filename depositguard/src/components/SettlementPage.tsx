import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DeductionItem, UserRole } from '../types';
import { formatINR, generateWhatsAppLink } from '../utils/formatters';
import { SignaturePad } from './SignaturePad';
import confetti from 'canvas-confetti';
import {
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Send,
  FileCheck,
  PlusCircle,
  Trash2,
  HelpCircle,
  ExternalLink,
  MessageSquareShare
} from 'lucide-react';

export const SettlementPage: React.FC = () => {
  const {
    activeProperty,
    userRole,
    updateDeduction,
    addDeduction,
    deleteDeduction,
    signSettlementAgreement,
    setActiveTab,
    setSelectedPdfType
  } = useApp();

  const settlement = activeProperty.settlement || {
    totalDeposit: activeProperty.depositAmount,
    totalDeductionsClaimed: 0,
    totalDeductionsAgreed: 0,
    finalRefundAmount: activeProperty.depositAmount,
    status: 'pending',
    deductions: [],
    tenantSigned: false,
    landlordSigned: false
  };

  const [isAddingClaim, setIsAddingClaim] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newRoomRef, setNewRoomRef] = useState('Living Room');
  const [newClaimAmount, setNewClaimAmount] = useState('2000');
  const [newReason, setNewReason] = useState('');

  // Counter-offer modal / inline edit
  const [editingDeductionId, setEditingDeductionId] = useState<string | null>(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [tenantDisputeNotes, setTenantDisputeNotes] = useState('');

  // Payment ref
  const [paymentRef, setPaymentRef] = useState(settlement.paymentRef || 'UPI-9876543210@okhdfcbank');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'NEFT/IMPS' | 'Cheque'>(
    settlement.paymentMethod || 'UPI'
  );

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newClaimAmount) return;

    addDeduction(activeProperty.id, {
      title: newTitle,
      roomRef: newRoomRef,
      landlordClaimAmount: Number(newClaimAmount),
      tenantCounterAmount: 0,
      agreedAmount: 0,
      reason: newReason || 'Repair or cleaning deduction claimed by landlord',
      status: 'pending'
    });

    setNewTitle('');
    setNewClaimAmount('2000');
    setNewReason('');
    setIsAddingClaim(false);
  };

  const handleAcceptDeduction = (item: DeductionItem) => {
    updateDeduction(activeProperty.id, {
      ...item,
      status: 'accepted',
      agreedAmount: item.landlordClaimAmount,
      tenantNotes: 'Accepted by tenant.'
    });
  };

  const handleDisputeDeduction = (item: DeductionItem) => {
    setEditingDeductionId(item.id);
    setCounterAmount(String(item.tenantCounterAmount || Math.round(item.landlordClaimAmount * 0.3)));
    setTenantDisputeNotes(
      item.tenantNotes ||
        'Disputed under Indian Model Tenancy Act: Defect was pre-existing at move-in or constitutes fair wear-and-tear.'
    );
  };

  const handleSaveDisputeResponse = (item: DeductionItem) => {
    const counterVal = Number(counterAmount) || 0;
    updateDeduction(activeProperty.id, {
      ...item,
      status: counterVal > 0 ? 'counter_offered' : 'disputed',
      tenantCounterAmount: counterVal,
      agreedAmount: counterVal,
      tenantNotes: tenantDisputeNotes
    });
    setEditingDeductionId(null);
  };

  const handleSignAgreement = (signatureUrl: string) => {
    signSettlementAgreement(activeProperty.id, userRole, signatureUrl, paymentMethod, paymentRef);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleWhatsAppSettlementShare = () => {
    const message = `*DepositGuard Final Settlement Summary*
🏠 *Property:* ${activeProperty.title}
💰 *Total Deposit:* ${formatINR(settlement.totalDeposit)}
📉 *Agreed Deductions:* ${formatINR(settlement.totalDeductionsAgreed)}
✅ *Net Refund to Tenant:* ${formatINR(settlement.finalRefundAmount)}
📝 *Agreement Status:* ${
      settlement.status === 'refunded' ? 'Settled & Refunded' : 'Agreed / Pending Final Sign-off'
    }

Both parties can view and download the official Settlement Release Certificate in DepositGuard.`;

    const phone = userRole === 'tenant' ? activeProperty.landlordPhone : activeProperty.tenantPhone;
    const cleanedPhone = phone.replace(/[^0-9]/g, '');
    const targetPhone = cleanedPhone.startsWith('91') ? cleanedPhone : `91${cleanedPhone}`;
    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const isRefunded = settlement.status === 'refunded' || activeProperty.status === 'settled';
  const hasDisputes = settlement.deductions.some((d) => d.status === 'disputed');

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                DEPOSIT SETTLEMENT SHEET
              </span>
              <span className="text-xs text-slate-500">{activeProperty.title}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-navy-950 mt-1 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
              Security Deposit Refund & Deduction Resolver
            </h1>
            <p className="text-xs text-slate-500">
              Clear itemized deductions with evidence links and fair dispute counter-offers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleWhatsAppSettlementShare}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <MessageSquareShare className="w-4 h-4" />
              WhatsApp Summary
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedPdfType('settlement');
                setActiveTab('pdf');
              }}
              className="px-3 py-2 bg-navy-900 hover:bg-navy-950 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <FileCheck className="w-4 h-4" />
              Settlement PDF
            </button>
          </div>
        </div>

        {/* Financial Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
              Total Deposit Held
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-navy-950">
              {formatINR(settlement.totalDeposit)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Paid at Move-in</span>
          </div>

          <div className="bg-red-50/60 p-3 rounded-xl border border-red-200">
            <span className="text-[11px] text-red-800 font-bold uppercase tracking-wider block">
              Claimed Deductions
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-red-600">
              {formatINR(settlement.totalDeductionsClaimed)}
            </span>
            <span className="text-[10px] text-red-700 block mt-0.5">
              {settlement.deductions.length} item(s) submitted
            </span>
          </div>

          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200">
            <span className="text-[11px] text-amber-800 font-bold uppercase tracking-wider block">
              Agreed Deductions
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-amber-700">
              {formatINR(settlement.totalDeductionsAgreed)}
            </span>
            <span className="text-[10px] text-amber-700 block mt-0.5">Mutually verified</span>
          </div>

          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-300">
            <span className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider block">
              Net Refund to Tenant
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-700">
              {formatINR(settlement.finalRefundAmount)}
            </span>
            <span className="text-[10px] text-emerald-800 font-semibold block mt-0.5">
              {isRefunded ? '✅ Refund Settled' : 'Due to Tenant'}
            </span>
          </div>
        </div>

        {/* Agreement Status Banner */}
        <div className="mt-4 p-3 rounded-xl flex items-center justify-between text-xs bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Agreement Status:</span>
            {isRefunded ? (
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Mutually Agreed & Refund Initiated
              </span>
            ) : hasDisputes ? (
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Dispute Active (Counter-Offers Under Review)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Agreed / Ready for Digital Sign-Off
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-500 hidden sm:block">
            Tenant Sign:{' '}
            <span className="font-bold text-navy-950">
              {settlement.tenantSigned ? 'Signed' : 'Pending'}
            </span>{' '}
            • Landlord Sign:{' '}
            <span className="font-bold text-navy-950">
              {settlement.landlordSigned ? 'Signed' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Itemized Deductions Table / Cards */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
            Claimed Deductions & Evidence Breakdown
          </h2>

          <button
            type="button"
            onClick={() => setIsAddingClaim(!isAddingClaim)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Deduction Claim
          </button>
        </div>

        {/* Add New Claim Form */}
        {isAddingClaim && (
          <form
            onSubmit={handleCreateClaim}
            className="bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-3 animate-in fade-in"
          >
            <h3 className="text-xs font-extrabold text-navy-950 uppercase tracking-wider">
              Submit New Landlord Deduction Claim
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                required
                placeholder="Deduction Title (e.g. Wall patch repair)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg p-2 bg-white"
              />
              <select
                value={newRoomRef}
                onChange={(e) => setNewRoomRef(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg p-2 bg-white"
              >
                <option value="Living Room">Living Room</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Master Bedroom">Master Bedroom</option>
                <option value="Bathroom">Bathroom</option>
                <option value="Balcony">Balcony</option>
                <option value="General Cleaning">General Cleaning</option>
              </select>
              <input
                type="number"
                required
                placeholder="Claim Amount (₹)"
                value={newClaimAmount}
                onChange={(e) => setNewClaimAmount(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg p-2 bg-white font-bold"
              />
            </div>
            <textarea
              rows={2}
              placeholder="Reason and estimate explanation..."
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingClaim(false)}
                className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs px-4 py-1.5 bg-navy-900 text-white font-bold rounded-lg shadow-sm"
              >
                Save Claim
              </button>
            </div>
          </form>
        )}

        {/* Deductions List */}
        <div className="space-y-3">
          {settlement.deductions.map((item) => {
            const isEditing = editingDeductionId === item.id;
            const isDisputed = item.status === 'disputed';
            const isCounter = item.status === 'counter_offered';
            const isAccepted = item.status === 'accepted';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  isDisputed
                    ? 'border-red-300 bg-red-50/30'
                    : isCounter
                    ? 'border-amber-300 bg-amber-50/30'
                    : isAccepted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.roomRef}
                      </span>
                      <h3 className="text-sm font-bold text-navy-950">{item.title}</h3>
                      {isDisputed && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                          Disputed
                        </span>
                      )}
                      {isCounter && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Counter-Offered
                        </span>
                      )}
                      {isAccepted && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Accepted
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.reason}</p>

                    {item.tenantNotes && (
                      <div className="mt-2 bg-white/80 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 space-y-1">
                        <span className="font-bold text-navy-900 block text-[11px]">Tenant Response / Evidence:</span>
                        <p className="italic text-slate-600">{item.tenantNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Amounts column */}
                  <div className="text-right sm:flex-shrink-0 space-y-1">
                    <div className="text-xs text-slate-500">
                      Landlord Claim:{' '}
                      <span className="font-extrabold text-navy-950 text-sm">
                        {formatINR(item.landlordClaimAmount)}
                      </span>
                    </div>

                    {item.tenantCounterAmount > 0 && (
                      <div className="text-xs text-amber-700">
                        Tenant Offer:{' '}
                        <span className="font-extrabold">{formatINR(item.tenantCounterAmount)}</span>
                      </div>
                    )}

                    <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Agreed Deduction: {formatINR(item.agreedAmount)}
                    </div>
                  </div>
                </div>

                {/* Inline Counter Offer Form */}
                {isEditing && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-navy-900">
                        Counter-Offer Amount (₹):
                      </label>
                      <input
                        type="number"
                        value={counterAmount}
                        onChange={(e) => setCounterAmount(e.target.value)}
                        className="text-xs font-bold border border-slate-300 rounded px-2 py-1 w-28"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Explain reason (e.g. citing move-in photo showing preexisting wear or quote from painter)..."
                      value={tenantDisputeNotes}
                      onChange={(e) => setTenantDisputeNotes(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded p-2 bg-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingDeductionId(null)}
                        className="text-xs px-3 py-1 border border-slate-200 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveDisputeResponse(item)}
                        className="text-xs px-3 py-1 bg-amber-600 text-white font-bold rounded"
                      >
                        Submit Counter-Offer
                      </button>
                    </div>
                  </div>
                )}

                {/* Tenant / Landlord Action Buttons */}
                {!isEditing && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAcceptDeduction(item)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Accept Claim
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDisputeDeduction(item)}
                        className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold transition-colors flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        Dispute / Counter-Offer
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteDeduction(activeProperty.id, item.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Remove Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Mutual Sign-Off & Refund Certificate Section */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-extrabold text-navy-950">
              Mutual Sign-Off & Refund Release
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Once signed by both parties, this creates a legally binding settlement release under Indian tenancy law.
          </p>
        </div>

        {/* Payment Transfer Information */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-bold text-navy-950 block mb-1">Refund Payment Method</label>
            <div className="flex items-center gap-2">
              {(['UPI', 'NEFT/IMPS', 'Cheque'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`px-3 py-1 rounded-lg font-bold ${
                    paymentMethod === method
                      ? 'bg-navy-900 text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-navy-950 block mb-1">
              Transaction / UPI ID Reference
            </label>
            <input
              type="text"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              placeholder="e.g. UPI/12345678/HDFC"
              className="w-full border border-slate-200 rounded-lg p-1.5 font-mono text-xs bg-white"
            />
          </div>
        </div>

        {/* Digital Signatures */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-bold text-navy-900 block mb-1">
              Tenant Sign-off: {activeProperty.tenantName}
            </span>
            {settlement.tenantSigned ? (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                <span className="text-xs font-bold text-emerald-900 block">Signed by Tenant</span>
                <span className="text-[10px] text-emerald-700 block font-mono">
                  {settlement.tenantSignDate || '16 Jul 2026, 01:20 PM IST'}
                </span>
              </div>
            ) : (
              <SignaturePad
                title="Tenant Digital Signature"
                signerName={activeProperty.tenantName}
                onSave={handleSignAgreement}
              />
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-navy-900 block mb-1">
              Landlord Sign-off: {activeProperty.landlordName}
            </span>
            {settlement.landlordSigned ? (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                <span className="text-xs font-bold text-emerald-900 block">Signed by Landlord</span>
                <span className="text-[10px] text-emerald-700 block font-mono">
                  {settlement.landlordSignDate || '16 Jul 2026, 02:00 PM IST'}
                </span>
              </div>
            ) : (
              <SignaturePad
                title="Landlord Digital Signature"
                signerName={activeProperty.landlordName}
                onSave={handleSignAgreement}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
