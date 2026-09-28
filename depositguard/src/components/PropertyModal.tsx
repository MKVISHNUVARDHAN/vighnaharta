import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Building2, MapPin, IndianRupee, Calendar, User, Phone, Mail, CheckCircle2 } from 'lucide-react';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({ isOpen, onClose }) => {
  const { addProperty, setActiveTab } = useApp();

  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560103');
  const [rentAmount, setRentAmount] = useState('32000');
  const [depositAmount, setDepositAmount] = useState('120000');
  const [moveInDate, setMoveInDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [landlordName, setLandlordName] = useState('');
  const [landlordPhone, setLandlordPhone] = useState('+91 98450 12345');
  const [landlordEmail, setLandlordEmail] = useState('');
  const [tenantName, setTenantName] = useState('Rahul Sharma');
  const [tenantPhone, setTenantPhone] = useState('+91 98765 43210');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      alert('Please enter property address');
      return;
    }

    addProperty({
      title: title || `Flat at ${address.split(',')[0]}`,
      address,
      city,
      state,
      pincode,
      rentAmount: Number(rentAmount) || 25000,
      depositAmount: Number(depositAmount) || 100000,
      moveInDate,
      landlordName: landlordName || 'Property Owner',
      landlordPhone,
      landlordEmail: landlordEmail || 'owner@realty.in',
      tenantName: tenantName || 'Tenant User',
      tenantPhone
    });

    onClose();
    setActiveTab('move_in');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">New Property Record</h2>
              <p className="text-xs text-slate-300">Register property for date-stamped deposit protection</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Property Title / Nickname */}
          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">
              Property Name / Nickname
            </label>
            <input
              type="text"
              placeholder="e.g. Flat 302 — Sobha Dream Acres"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Full Address <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="Building, Flat No, Street, Locality / Landmark"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* City & PIN */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
              <input
                type="text"
                placeholder="560103"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>

          {/* Financials: Rent & Deposit */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-slate-600" />
                Monthly Rent (₹)
              </label>
              <input
                type="number"
                required
                placeholder="35000"
                value={rentAmount}
                onChange={(e) => setRentAmount(e.target.value)}
                className="w-full text-sm font-semibold border border-slate-200 rounded-xl px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                Security Deposit (₹)
              </label>
              <input
                type="number"
                required
                placeholder="150000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full text-sm font-bold text-emerald-800 border border-emerald-200 bg-emerald-50/50 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>

          {/* Move-in Date */}
          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Move-in Date
            </label>
            <input
              type="date"
              required
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* Landlord Contact Section */}
          <div className="border-t border-slate-100 pt-3">
            <h3 className="text-xs font-extrabold text-navy-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-navy-700" />
              Landlord / Owner Contact
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Landlord Full Name (e.g. Ramesh Hegde)"
                value={landlordName}
                onChange={(e) => setLandlordName(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="WhatsApp No (+91...)"
                    value={landlordPhone}
                    onChange={(e) => setLandlordPhone(e.target.value)}
                    className="w-full pl-8 text-xs border border-slate-200 rounded-xl px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={landlordEmail}
                    onChange={(e) => setLandlordEmail(e.target.value)}
                    className="w-full pl-8 text-xs border border-slate-200 rounded-xl px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tenant Contact Section */}
          <div className="border-t border-slate-100 pt-3">
            <h3 className="text-xs font-extrabold text-navy-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              Tenant Contact
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Tenant Name"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <input
                type="tel"
                placeholder="Tenant Phone (+91...)"
                value={tenantPhone}
                onChange={(e) => setTenantPhone(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-navy-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Create & Start Inspection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
