import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { jsPDF } from 'jspdf';
import { formatINR, formatFullDateTime, generateWhatsAppLink } from '../utils/formatters';
import { ROOM_METADATA } from '../data/sampleData';
import { RoomType } from '../types';
import { SignaturePad } from './SignaturePad';
import {
  Download,
  Share2,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  IndianRupee,
  Calendar,
  User,
  Copy,
  Check,
  MessageSquareShare
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

export const PDFReportPreview: React.FC = () => {
  const {
    activeProperty,
    selectedPdfType,
    setSelectedPdfType,
    signReport,
    userRole
  } = useApp();

  const printRef = useRef<HTMLDivElement | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const report =
    selectedPdfType === 'move_in'
      ? activeProperty.moveInReport
      : selectedPdfType === 'move_out'
      ? activeProperty.moveOutReport
      : null;

  const isSettlement = selectedPdfType === 'settlement';
  const settlement = activeProperty.settlement;

  const reportTitle =
    selectedPdfType === 'move_in'
      ? 'Move-In Condition & Pre-Existing Evidence Report'
      : selectedPdfType === 'move_out'
      ? 'Move-Out Property Handover Audit Report'
      : 'Deposit Settlement & Refund Release Certificate';

  const reportId = `DG-${activeProperty.city.slice(0, 3).toUpperCase()}-${activeProperty.id.replace('prop-', '')}-${selectedPdfType.toUpperCase()}`;

  // WhatsApp Share Trigger
  const handleWhatsAppShare = () => {
    const summary =
      selectedPdfType === 'move_in'
        ? `• 6 Rooms Inspected\n• Move-in Date: ${activeProperty.moveInDate}\n• Status: Signed & Verified`
        : selectedPdfType === 'move_out'
        ? `• Move-out Handover Audit\n• Status: Evidence Recorded`
        : `• Total Deposit: ${formatINR(settlement.totalDeposit)}\n• Agreed Deductions: ${formatINR(settlement.totalDeductionsAgreed)}\n• Net Refund: ${formatINR(settlement.finalRefundAmount)}`;

    const targetPhone =
      userRole === 'tenant' ? activeProperty.landlordPhone : activeProperty.tenantPhone;

    const link = generateWhatsAppLink(
      targetPhone,
      activeProperty.title,
      selectedPdfType === 'move_in' ? 'Move-in' : selectedPdfType === 'move_out' ? 'Move-out' : 'Settlement',
      summary,
      userRole === 'tenant' ? activeProperty.landlordName : activeProperty.tenantName
    );

    window.open(link, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Generate crisp client-side PDF
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      let y = 16;

      // Header Banner
      doc.setFillColor(11, 29, 58); // Navy 900
      doc.rect(margin, y, pageWidth - margin * 2, 22, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('DEPOSITGUARD VERIFIED REPORT', margin + 6, y + 9);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(209, 250, 229);
      doc.text(`ID: ${reportId}  |  Generated: ${formatFullDateTime(new Date().toISOString())}`, margin + 6, y + 16);

      y += 28;

      // Document Title
      doc.setTextColor(11, 29, 58);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(reportTitle.toUpperCase(), margin, y);
      y += 7;

      // Property Details Box
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 26, 2, 2, 'FD');

      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'bold');
      doc.text(`Property: ${activeProperty.title}`, margin + 4, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Address: ${activeProperty.address}, ${activeProperty.city} - ${activeProperty.pincode}`, margin + 4, y + 11);
      doc.text(`Monthly Rent: ${formatINR(activeProperty.rentAmount)}  |  Security Deposit: ${formatINR(activeProperty.depositAmount)}`, margin + 4, y + 16);
      doc.text(`Tenant: ${activeProperty.tenantName} (${activeProperty.tenantPhone})  |  Landlord: ${activeProperty.landlordName} (${activeProperty.landlordPhone})`, margin + 4, y + 21);

      y += 32;

      if (isSettlement) {
        // Settlement Table
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(11, 29, 58);
        doc.text('FINANCIAL SETTLEMENT SUMMARY', margin, y);
        y += 6;

        doc.setFillColor(236, 253, 245);
        doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2, 2, 'FD');

        doc.setFontSize(9);
        doc.setTextColor(4, 120, 87);
        doc.text(`Total Deposit Held: ${formatINR(settlement.totalDeposit)}`, margin + 4, y + 7);
        doc.setTextColor(185, 28, 28);
        doc.text(`Agreed Deductions: -${formatINR(settlement.totalDeductionsAgreed)}`, margin + 4, y + 12);
        doc.setFontSize(10);
        doc.setTextColor(4, 120, 87);
        doc.text(`Net Refund Paid to Tenant: ${formatINR(settlement.finalRefundAmount)}`, margin + 4, y + 18);

        y += 28;

        // Deductions List
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(11, 29, 58);
        doc.text('ITEMIZED DEDUCTIONS & EVIDENCE', margin, y);
        y += 5;

        settlement.deductions.forEach((d) => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(15, 23, 42);
          doc.text(`• ${d.title} (${d.roomRef}) — Agreed: ${formatINR(d.agreedAmount)} [Claimed: ${formatINR(d.landlordClaimAmount)}]`, margin + 4, y);
          y += 4;
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(100, 116, 139);
          doc.text(`  Note: ${d.reason.slice(0, 100)}`, margin + 4, y);
          y += 6;
        });

      } else if (report) {
        // Rooms Table
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(11, 29, 58);
        doc.text('ROOM-BY-ROOM AUDIT & EVIDENCE LOG', margin, y);
        y += 6;

        ROOM_KEYS.forEach((key) => {
          const room = report.rooms[key];
          if (!room) return;
          const meta = ROOM_METADATA[key];

          if (y > 250) {
            doc.addPage();
            y = 16;
          }

          doc.setDrawColor(226, 232, 240);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(margin, y, pageWidth - margin * 2, 18, 1, 1, 'FD');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(11, 29, 58);
          doc.text(meta.name.toUpperCase(), margin + 4, y + 6);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(71, 85, 105);
          const condText = `Condition: ${room.overallCondition.toUpperCase()}  |  Evidence Photos: ${room.media.length}`;
          doc.text(condText, margin + 4, y + 11);

          const notes = room.generalNotes || 'No pre-existing defect observed.';
          doc.text(`Notes: ${notes.slice(0, 90)}`, margin + 4, y + 15);

          y += 21;
        });
      }

      // Legal disclaimer
      if (y > 240) {
        doc.addPage();
        y = 16;
      }

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(
        'LEGAL ATTESTATION: This document constitutes valid date-stamped condition evidence under the Indian Model Tenancy Act.',
        margin,
        y + 6
      );
      doc.text(
        'Both parties hereby acknowledge and verify the condition records, timestamps, and signatures herein.',
        margin,
        y + 10
      );

      // Signatures
      y += 18;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(11, 29, 58);
      doc.text(`Tenant Signature: ${activeProperty.tenantName}`, margin, y);
      doc.text(`Landlord Signature: ${activeProperty.landlordName}`, margin + 95, y);

      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(5, 150, 105);
      doc.text('Status: Digitally Signed & Timestamped', margin, y);
      doc.text('Status: Digitally Signed & Timestamped', margin + 95, y);

      doc.save(`DepositGuard-${reportId}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error', err);
      alert('Unable to generate PDF. You can also print directly.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Action Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                OFFICIAL REPORT
              </span>
              <span className="text-xs font-mono text-slate-500">{reportId}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-navy-950 mt-1">
              {reportTitle}
            </h1>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <MessageSquareShare className="w-4 h-4" />
              Share on WhatsApp
            </button>

            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdf}
              className="px-3.5 py-2 bg-navy-900 hover:bg-navy-950 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              {isGeneratingPdf ? 'Exporting...' : 'Download PDF'}
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
              title="Copy Report Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Report Type Selector Pills */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-semibold">Select Report:</span>
          {(['move_in', 'move_out', 'settlement'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedPdfType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedPdfType === type
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'move_in'
                ? 'Move-In Report'
                : type === 'move_out'
                ? 'Move-Out Report'
                : 'Settlement Release'}
            </button>
          ))}
        </div>
      </div>

      {/* Official Printable Report Canvas */}
      <div
        ref={printRef}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 max-w-4xl mx-auto"
      >
        {/* Document Header */}
        <div className="border-b-2 border-navy-900 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-navy-900 text-emerald-400 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-navy-950 tracking-tight">DepositGuard</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">
                  Verified Proof
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Digital Evidence & Condition Certificate • Indian Model Tenancy Act
              </p>
            </div>
          </div>

          <div className="text-right sm:self-auto font-mono text-xs text-slate-600">
            <div className="font-bold text-navy-950">REF: {reportId}</div>
            <div>Generated: {formatFullDateTime(new Date().toISOString())}</div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-200">
          <h2 className="text-base sm:text-lg font-extrabold text-navy-950 uppercase tracking-wide">
            {reportTitle}
          </h2>
        </div>

        {/* Property & Tenancy Metadata Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-xs">
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-navy-950 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Property Particulars
            </h3>
            <p className="font-bold text-navy-950 text-sm">{activeProperty.title}</p>
            <p className="text-slate-600">{activeProperty.address}</p>
            <p className="text-slate-600">
              {activeProperty.city}, {activeProperty.state} - {activeProperty.pincode}
            </p>
            <div className="pt-1 flex items-center gap-3 font-semibold text-slate-700">
              <span>Rent: {formatINR(activeProperty.rentAmount)}/mo</span>
              <span>Deposit: {formatINR(activeProperty.depositAmount)}</span>
            </div>
          </div>

          <div className="space-y-2 border-t sm:border-t-0 sm:border-l sm:pl-4 border-slate-200">
            <h3 className="font-extrabold text-navy-950 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-navy-700" />
              Parties to Tenancy
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Tenant:</span>
                <span className="font-bold text-navy-950">{activeProperty.tenantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tenant WhatsApp:</span>
                <span className="font-mono text-slate-700">{activeProperty.tenantPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Landlord / Owner:</span>
                <span className="font-bold text-navy-950">{activeProperty.landlordName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Landlord WhatsApp:</span>
                <span className="font-mono text-slate-700">{activeProperty.landlordPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Move-in Date:</span>
                <span className="font-semibold text-emerald-700">{activeProperty.moveInDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Body: Settlement vs Room Inspection */}
        {isSettlement ? (
          <div className="space-y-4">
            <h3 className="font-extrabold text-navy-950 uppercase tracking-wider text-xs">
              Deposit Settlement Breakdown
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Total Deposit</span>
                <span className="text-base font-extrabold text-navy-950">
                  {formatINR(settlement.totalDeposit)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-red-700 font-bold block">Agreed Deductions</span>
                <span className="text-base font-extrabold text-red-600">
                  -{formatINR(settlement.totalDeductionsAgreed)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-800 font-bold block">Refund Released</span>
                <span className="text-lg font-extrabold text-emerald-700">
                  {formatINR(settlement.finalRefundAmount)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {settlement.deductions.map((d) => (
                <div key={d.id} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-bold text-navy-950">
                    <span>
                      {d.title} ({d.roomRef})
                    </span>
                    <span className="text-emerald-700">Agreed: {formatINR(d.agreedAmount)}</span>
                  </div>
                  <p className="text-slate-600">{d.reason}</p>
                  {d.tenantNotes && <p className="italic text-slate-500 text-[11px]">Tenant: {d.tenantNotes}</p>}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-extrabold text-navy-950 uppercase tracking-wider text-xs flex items-center justify-between">
              <span>Room-by-Room Evidence Log</span>
              <span className="text-[11px] text-slate-400 font-normal">All photos date & time stamped</span>
            </h3>

            <div className="space-y-3">
              {ROOM_KEYS.map((key) => {
                const room = report?.rooms?.[key];
                if (!room) return null;
                const meta = ROOM_METADATA[key];

                return (
                  <div
                    key={key}
                    className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-200 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-950">{meta.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            room.overallCondition === 'damaged'
                              ? 'bg-red-100 text-red-800'
                              : room.overallCondition === 'minor_wear'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {room.overallCondition.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {room.media.length} photo(s) captured
                      </span>
                    </div>

                    <p className="text-slate-700 font-medium">
                      {room.generalNotes || 'Inspected and verified.'}
                    </p>

                    {/* Photo Thumbnails */}
                    {room.media.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {room.media.map((m) => (
                          <div
                            key={m.id}
                            className="relative rounded-lg overflow-hidden border border-slate-200 bg-black aspect-video"
                          >
                            <img src={m.url} alt="Evidence" className="w-full h-full object-cover" />
                            <div className="absolute bottom-1 left-1 bg-navy-950/80 text-white text-[8px] font-mono px-1 rounded">
                              {m.displayDate}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Legal Clause */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
          <p className="font-bold text-navy-950 mb-0.5">Model Tenancy Protection Clause</p>
          <p>
            This condition report constitutes formal written evidence of the premises condition at handover.
            Under prevailing Indian Tenancy provisions, the tenant shall not be held liable for defects, wear,
            or deterioration documented prior to tenancy commencement.
          </p>
        </div>

        {/* Signatures Section */}
        <div className="border-t border-slate-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tenant Signature */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-navy-950 block">Tenant Signature:</span>
            {report?.signedByTenant || isSettlement ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Digitally Signed by {activeProperty.tenantName}</span>
                </div>
                <p className="text-[10px] text-emerald-700 font-mono">
                  Verified: {report?.tenantSignDate || '15 Jul 2025, 12:48 PM IST'}
                </p>
              </div>
            ) : (
              <SignaturePad
                title="Sign as Tenant"
                signerName={activeProperty.tenantName}
                onSave={(sig) => signReport(activeProperty.id, selectedPdfType as any, 'tenant', sig)}
              />
            )}
          </div>

          {/* Landlord Signature */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-navy-950 block">Landlord Signature:</span>
            {report?.signedByLandlord || isSettlement ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Digitally Signed by {activeProperty.landlordName}</span>
                </div>
                <p className="text-[10px] text-emerald-700 font-mono">
                  Verified: {report?.landlordSignDate || '15 Jul 2025, 01:15 PM IST'}
                </p>
              </div>
            ) : (
              <SignaturePad
                title="Sign as Landlord"
                signerName={activeProperty.landlordName}
                onSave={(sig) => signReport(activeProperty.id, selectedPdfType as any, 'landlord', sig)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
