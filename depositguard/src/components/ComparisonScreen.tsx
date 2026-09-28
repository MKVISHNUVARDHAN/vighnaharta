import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RoomType, MediaItem } from '../types';
import { ROOM_METADATA } from '../data/sampleData';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  PlusCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  IndianRupee,
  Layers
} from 'lucide-react';

const ROOM_KEYS: RoomType[] = [
  'living',
  'kitchen',
  'master_bedroom',
  'guest_bedroom',
  'bathroom',
  'balcony',
  'other'
];

export const ComparisonScreen: React.FC = () => {
  const { activeProperty, setActiveTab, addDeduction } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'flagged' | 'safe'>('all');
  const [selectedRoom, setSelectedRoom] = useState<RoomType>('living');
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);

  const moveIn = activeProperty.moveInReport;
  const moveOut = activeProperty.moveOutReport;

  // Comparison evaluation helper
  const evaluateRoomChange = (roomKey: RoomType) => {
    const inRoom = moveIn?.rooms?.[roomKey];
    const outRoom = moveOut?.rooms?.[roomKey];

    const inCond = inRoom?.overallCondition || 'pristine';
    const outCond = outRoom?.overallCondition || 'pristine';

    const hasNewDamage = outCond === 'damaged' && inCond !== 'damaged';
    const hasExistingWear = inCond === 'minor_wear';
    const isPristine = inCond === 'pristine' && outCond === 'pristine';

    return {
      hasNewDamage,
      hasExistingWear,
      isPristine,
      status: hasNewDamage ? 'new_damage' : hasExistingWear ? 'fair_wear' : 'safe'
    };
  };

  const handleQuickAddClaim = (roomName: string, defaultAmount: number, reason: string) => {
    addDeduction(activeProperty.id, {
      title: `${roomName} Repair Claim`,
      roomRef: roomName,
      landlordClaimAmount: defaultAmount,
      tenantCounterAmount: 0,
      agreedAmount: defaultAmount,
      reason,
      status: 'pending'
    });
    setClaimSuccessMsg(`Added "${roomName} Repair Claim" to Settlement sheet`);
    setTimeout(() => setClaimSuccessMsg(null), 3000);
  };

  // Filtered rooms
  const filteredRooms = ROOM_KEYS.filter((key) => {
    const evaluation = evaluateRoomChange(key);
    if (selectedFilter === 'flagged') return evaluation.hasNewDamage;
    if (selectedFilter === 'safe') return !evaluation.hasNewDamage;
    return true;
  });

  const activeInRoom = moveIn?.rooms?.[selectedRoom];
  const activeOutRoom = moveOut?.rooms?.[selectedRoom];
  const evaluation = evaluateRoomChange(selectedRoom);
  const meta = ROOM_METADATA[selectedRoom];

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-navy-100 text-navy-800">
                EVIDENCE COMPARISON ENGINE
              </span>
              <span className="text-xs text-slate-500">{activeProperty.title}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-navy-950 mt-1 flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-emerald-600" />
              Move-In vs. Move-Out Side-by-Side Audit
            </h1>
            <p className="text-xs text-slate-500">
              Verify pre-existing wear against move-out condition to eliminate unfair deduction claims
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('settlement')}
            className="self-start sm:self-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <IndianRupee className="w-4 h-4" />
            Go to Settlement Sheet
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 text-center">
            <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
              Normal / Safe
            </span>
            <span className="text-base sm:text-lg font-extrabold text-emerald-700">5 Rooms</span>
          </div>
          <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-center">
            <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
              Fair Wear (Pre-existing)
            </span>
            <span className="text-base sm:text-lg font-extrabold text-amber-700">3 Items</span>
          </div>
          <div className="bg-red-50/70 p-2.5 rounded-xl border border-red-200 text-center">
            <span className="text-[10px] text-red-800 font-bold uppercase tracking-wider block">
              New Damage Flagged
            </span>
            <span className="text-base sm:text-lg font-extrabold text-red-600">2 Items</span>
          </div>
        </div>

        {/* Room Navigation Pill Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 pb-1 no-scrollbar">
          {ROOM_KEYS.map((key) => {
            const m = ROOM_METADATA[key];
            const evalObj = evaluateRoomChange(key);
            const isSelected = selectedRoom === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedRoom(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  isSelected
                    ? 'bg-navy-900 text-white shadow-sm ring-2 ring-navy-900/20'
                    : evalObj.hasNewDamage
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : evalObj.hasExistingWear
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                {evalObj.hasNewDamage ? (
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                ) : evalObj.hasExistingWear ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
                {m.name}
              </button>
            );
          })}
        </div>
      </div>

      {claimSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center justify-between animate-in fade-in">
          <span>{claimSuccessMsg}</span>
          <button
            type="button"
            onClick={() => setActiveTab('settlement')}
            className="underline font-bold text-emerald-700"
          >
            View Settlement
          </button>
        </div>
      )}

      {/* Comparison Detail Stage */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        {/* Room Header and Change Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-navy-950">{meta.name} Comparison</h2>
            <p className="text-xs text-slate-500">Timeline: 15 Jul 2025 (Move-in) vs 14 Jul 2026 (Move-out)</p>
          </div>

          <div>
            {evaluation.hasNewDamage ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                <XCircle className="w-3.5 h-3.5 text-red-600" />
                New Damage Detected (Deduction Eligible)
              </span>
            ) : evaluation.hasExistingWear ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Pre-Existing Wear (Protected by Move-in Record)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                No Change / Pristine Condition
              </span>
            )}
          </div>
        </div>

        {/* Side by Side Split Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Move-in Column */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-extrabold text-navy-900 uppercase tracking-wider">
                  Move-In Condition
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                15 Jul 2025
              </span>
            </div>

            {/* Photos */}
            {activeInRoom?.media && activeInRoom.media.length > 0 ? (
              <div className="space-y-2">
                {activeInRoom.media.map((m) => (
                  <div key={m.id} className="relative rounded-lg overflow-hidden border border-slate-200 bg-black">
                    <img src={m.url} alt="Move-in" className="w-full aspect-video object-cover" />
                    <div className="absolute bottom-2 left-2 bg-navy-950/80 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1 border border-white/20">
                      <Clock className="w-2.5 h-2.5 text-emerald-400" />
                      {m.displayDate}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="aspect-video bg-white rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
                No move-in photo logged
              </div>
            )}

            {/* Notes & Condition */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Logged Condition:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                    activeInRoom?.overallCondition === 'damaged'
                      ? 'bg-red-100 text-red-800'
                      : activeInRoom?.overallCondition === 'minor_wear'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {activeInRoom?.overallCondition?.toUpperCase() || 'PRISTINE'}
                </span>
              </div>
              <p className="text-xs text-navy-950 font-medium leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                {activeInRoom?.generalNotes || 'No defect notes recorded at move-in.'}
              </p>
            </div>
          </div>

          {/* Right: Move-out Column */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    evaluation.hasNewDamage ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                />
                <h3 className="text-xs font-extrabold text-navy-900 uppercase tracking-wider">
                  Move-Out Condition
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                14 Jul 2026
              </span>
            </div>

            {/* Photos */}
            {activeOutRoom?.media && activeOutRoom.media.length > 0 ? (
              <div className="space-y-2">
                {activeOutRoom.media.map((m) => (
                  <div key={m.id} className="relative rounded-lg overflow-hidden border border-slate-200 bg-black">
                    <img src={m.url} alt="Move-out" className="w-full aspect-video object-cover" />
                    <div className="absolute bottom-2 left-2 bg-navy-950/80 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1 border border-white/20">
                      <Clock className="w-2.5 h-2.5 text-emerald-400" />
                      {m.displayDate}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="aspect-video bg-white rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
                No move-out photo logged yet
              </div>
            )}

            {/* Notes & Condition */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Logged Condition:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                    activeOutRoom?.overallCondition === 'damaged'
                      ? 'bg-red-100 text-red-800'
                      : activeOutRoom?.overallCondition === 'minor_wear'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {activeOutRoom?.overallCondition?.toUpperCase() || 'PRISTINE'}
                </span>
              </div>
              <p className="text-xs text-navy-950 font-medium leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                {activeOutRoom?.generalNotes || 'No new damage logged at move-out.'}
              </p>
            </div>
          </div>
        </div>

        {/* Legal & Action Callout */}
        <div className="bg-navy-50/70 border border-navy-200/60 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-navy-950">DepositGuard Tenancy Protection Rule</p>
              <p className="text-slate-600 leading-relaxed">
                Under the Model Tenancy Act, ordinary wear-and-tear cannot be deducted from the security deposit.
                Pre-existing defects documented at move-in protect the tenant from arbitrary claims.
              </p>
            </div>
          </div>

          {evaluation.hasNewDamage && (
            <button
              type="button"
              onClick={() =>
                handleQuickAddClaim(
                  meta.name,
                  2500,
                  `Damage noted in ${meta.name} during move-out inspection: ${activeOutRoom?.generalNotes}`
                )
              }
              className="whitespace-nowrap px-3.5 py-2 bg-navy-900 hover:bg-navy-950 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              Add Repair to Settlement
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
