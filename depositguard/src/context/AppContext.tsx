import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Property,
  ActiveTab,
  UserRole,
  RoomType,
  RoomInspection,
  MediaItem,
  InspectionType,
  DeductionItem,
  SettlementRecord
} from '../types';
import { INITIAL_PROPERTIES, createEmptyInspectionData } from '../data/sampleData';
import { formatFullDateTime } from '../utils/formatters';

interface AppContextType {
  properties: Property[];
  activePropertyId: string;
  activeProperty: Property;
  activeTab: ActiveTab;
  userRole: UserRole;
  isMobileFrame: boolean;
  selectedPdfType: 'move_in' | 'move_out' | 'settlement';
  // State setters
  setActiveTab: (tab: ActiveTab) => void;
  setUserRole: (role: UserRole) => void;
  setIsMobileFrame: (val: boolean) => void;
  setActivePropertyId: (id: string) => void;
  setSelectedPdfType: (type: 'move_in' | 'move_out' | 'settlement') => void;
  // Core business actions
  addProperty: (property: Partial<Property>) => string;
  updateProperty: (property: Property) => void;
  saveRoomInspection: (
    propertyId: string,
    inspectionType: InspectionType,
    roomId: RoomType,
    roomData: Partial<RoomInspection>
  ) => void;
  addMediaToRoom: (
    propertyId: string,
    inspectionType: InspectionType,
    roomId: RoomType,
    mediaItem: MediaItem
  ) => void;
  removeMediaFromRoom: (
    propertyId: string,
    inspectionType: InspectionType,
    roomId: RoomType,
    mediaId: string
  ) => void;
  signReport: (
    propertyId: string,
    inspectionType: InspectionType,
    role: UserRole,
    signatureUrl: string
  ) => void;
  updateDeduction: (propertyId: string, item: DeductionItem) => void;
  addDeduction: (propertyId: string, item: Omit<DeductionItem, 'id'>) => void;
  deleteDeduction: (propertyId: string, deductionId: string) => void;
  signSettlementAgreement: (
    propertyId: string,
    role: UserRole,
    signatureUrl: string,
    paymentMethod?: 'UPI' | 'NEFT/IMPS' | 'Cheque',
    paymentRef?: string
  ) => void;
  startMoveOutFlow: (propertyId: string) => void;
  resetDemoData: () => void;
}

const STORAGE_KEY = 'depositguard_properties_v1';
const ROLE_KEY = 'depositguard_role_v1';
const VIEW_MODE_KEY = 'depositguard_mobile_frame_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load properties from localStorage', e);
    }
    return INITIAL_PROPERTIES;
  });

  const [activePropertyId, setActivePropertyId] = useState<string>(() => {
    return properties[0]?.id || 'prop-1';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedPdfType, setSelectedPdfType] = useState<'move_in' | 'move_out' | 'settlement'>('move_in');

  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(ROLE_KEY);
      if (saved === 'landlord' || saved === 'tenant') return saved;
    } catch {
      // fallback
    }
    return 'tenant';
  });

  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(VIEW_MODE_KEY);
      if (saved !== null) return saved === 'true';
    } catch {
      // fallback
    }
    return false; // Full responsive by default on desktop, mobile-framed when toggled
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
    } catch (e) {
      console.warn('LocalStorage save failed (possible quota limit)', e);
    }
  }, [properties]);

  useEffect(() => {
    localStorage.setItem(ROLE_KEY, userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, String(isMobileFrame));
  }, [isMobileFrame]);

  const activeProperty = properties.find((p) => p.id === activePropertyId) || properties[0] || INITIAL_PROPERTIES[0];

  const updateProperty = (updated: Property) => {
    setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const addProperty = (newPropData: Partial<Property>): string => {
    const id = `prop-${Date.now()}`;
    const newProperty: Property = {
      id,
      title: newPropData.title || `Flat in ${newPropData.city || 'Bengaluru'}`,
      address: newPropData.address || '',
      city: newPropData.city || 'Bengaluru',
      state: newPropData.state || 'Karnataka',
      pincode: newPropData.pincode || '560001',
      rentAmount: newPropData.rentAmount || 25000,
      depositAmount: newPropData.depositAmount || 100000,
      moveInDate: newPropData.moveInDate || new Date().toISOString().split('T')[0],
      moveOutDate: newPropData.moveOutDate,
      tenantName: newPropData.tenantName || 'Tenant User',
      tenantPhone: newPropData.tenantPhone || '+91 98000 00000',
      tenantEmail: newPropData.tenantEmail || 'tenant@example.com',
      landlordName: newPropData.landlordName || 'Landlord Owner',
      landlordPhone: newPropData.landlordPhone || '+91 99000 00000',
      landlordEmail: newPropData.landlordEmail || 'owner@example.com',
      status: 'move_in_pending',
      createdAt: new Date().toISOString(),
      moveInReport: createEmptyInspectionData(),
      settlement: {
        totalDeposit: newPropData.depositAmount || 100000,
        totalDeductionsClaimed: 0,
        totalDeductionsAgreed: 0,
        finalRefundAmount: newPropData.depositAmount || 100000,
        status: 'pending',
        deductions: [],
        tenantSigned: false,
        landlordSigned: false
      }
    };

    setProperties((prev) => [newProperty, ...prev]);
    setActivePropertyId(id);
    return id;
  };

  const saveRoomInspection = (
    propertyId: string,
    inspectionType: InspectionType,
    roomId: RoomType,
    roomData: Partial<RoomInspection>
  ) => {
    setProperties((prev) =>
      prev.map((prop) => {
        if (prop.id !== propertyId) return prop;

        const reportKey = inspectionType === 'move_in' ? 'moveInReport' : 'moveOutReport';
        let currentReport = prop[reportKey];
        if (!currentReport) {
          currentReport = createEmptyInspectionData();
        }

        const updatedRoom = {
          ...currentReport.rooms[roomId],
          ...roomData
        };

        const updatedRooms = {
          ...currentReport.rooms,
          [roomId]: updatedRoom
        };

        return {
          ...prop,
          [reportKey]: {
            ...currentReport,
            rooms: updatedRooms
          }
        };
      })
    );
  };

  const addMediaToRoom = (
    propertyId: string,
    inspectionType: InspectionType,
    roomId: RoomType,
    mediaItem: MediaItem
  ) => {
    setProperties((prev) =>
      prev.map((prop) => {
        if (prop.id !== propertyId) return prop;

        const reportKey = inspectionType === 'move_in' ? 'moveInReport' : 'moveOutReport';
        let currentReport = prop[reportKey] || createEmptyInspectionData();
        const room = currentReport.rooms[roomId];

        const updatedMedia = [...room.media, mediaItem];
        const updatedRoom = {
          ...room,
          media: updatedMedia,
          isCompleted: true
        };

        return {
          ...prop,
          [reportKey]: {
            ...currentReport,
            rooms: {
              ...currentReport.rooms,
              [roomId]: updatedRoom
            }
          }
        };
      })
    );
  };

  const removeMediaFromRoom = (
    propertyId: string,
    inspectionType: InspectionType,
    roomId: RoomType,
    mediaId: string
  ) => {
    setProperties((prev) =>
      prev.map((prop) => {
        if (prop.id !== propertyId) return prop;

        const reportKey = inspectionType === 'move_in' ? 'moveInReport' : 'moveOutReport';
        const currentReport = prop[reportKey];
        if (!currentReport) return prop;

        const room = currentReport.rooms[roomId];
        const updatedMedia = room.media.filter((m) => m.id !== mediaId);

        return {
          ...prop,
          [reportKey]: {
            ...currentReport,
            rooms: {
              ...currentReport.rooms,
              [roomId]: {
                ...room,
                media: updatedMedia
              }
            }
          }
        };
      })
    );
  };

  const signReport = (
    propertyId: string,
    inspectionType: InspectionType,
    role: UserRole,
    signatureUrl: string
  ) => {
    const nowIso = new Date().toISOString();
    const formattedSignDate = formatFullDateTime(nowIso);

    setProperties((prev) =>
      prev.map((prop) => {
        if (prop.id !== propertyId) return prop;

        const reportKey = inspectionType === 'move_in' ? 'moveInReport' : 'moveOutReport';
        const currentReport = prop[reportKey] || createEmptyInspectionData();

        const updatedReport = {
          ...currentReport,
          completedAt: currentReport.completedAt || nowIso,
          ...(role === 'tenant'
            ? {
                signedByTenant: true,
                tenantSignature: signatureUrl,
                tenantSignDate: formattedSignDate
              }
            : {
                signedByLandlord: true,
                landlordSignature: signatureUrl,
                landlordSignDate: formattedSignDate
              })
        };

        let newStatus = prop.status;
        if (inspectionType === 'move_in') {
          if (updatedReport.signedByTenant) {
            newStatus = 'move_in_completed';
          }
        }

        return {
          ...prop,
          status: newStatus,
          [reportKey]: updatedReport
        };
      })
    );
  };

  const recalculateSettlement = (deductions: DeductionItem[], totalDeposit: number): {
    totalClaimed: number;
    totalAgreed: number;
    finalRefund: number;
    status: 'pending' | 'disputed' | 'agreed' | 'refunded';
  } => {
    let totalClaimed = 0;
    let totalAgreed = 0;
    let hasDisputes = false;

    deductions.forEach((d) => {
      totalClaimed += d.landlordClaimAmount;
      if (d.status === 'accepted' || d.status === 'counter_offered') {
        totalAgreed += d.agreedAmount;
      }
      if (d.status === 'disputed') {
        hasDisputes = true;
      }
    });

    const finalRefund = Math.max(0, totalDeposit - totalAgreed);
    const status = deductions.length === 0 ? 'pending' : hasDisputes ? 'disputed' : 'agreed';

    return { totalClaimed, totalAgreed, finalRefund, status };
  };

  const updateDeduction = (propertyId: string, updatedItem: DeductionItem) => {
    setProperties((prev) =>
      prev.map((prop) => {
        if (prop.id !== propertyId) return prop;

        const currentDeductions = prop.settlement?.deductions || [];
        const nextDeductions = currentDeductions.map((d) => (d.id === updatedItem.id ? updatedItem : d));

        const { totalClaimed, totalAgreed, finalRefund, status } = recalculateSettlement(
          nextDeductions,
          prop.depositAmount
        );

        return {
          ...prop,
          settlement: {
            ...prop.settlement,
            deductions: nextDeductions,
            totalDeductionsClaimed: totalClaimed,
            totalDeductionsAgreed: totalAgreed,
            finalRefundAmount: finalRefund,
            status: prop.settlement.status === 'refunded' ? 'refunded' : status
          }
        };
      })
    );
  };

  const addDeduction = (propertyId: string, item: Omit<DeductionItem, 'id'>) => {
    const newItem: DeductionItem = {
      ...item,
      id: `ded-${Date.now()}`
    };

    setProperties((prev) =>
      prev.map((prop) => {
        if (prop.id !== propertyId) return prop;

        const currentDeductions = prop.settlement?.deductions || [];
        const nextDeductions = [...currentDeductions, newItem];

        const { totalClaimed, totalAgreed, finalRefund, status } = recalculateSettlement(
          nextDeductions,
          prop.depositAmount
        );

        return {
          ...prop,
          settlement: {
            ...prop.settlement,
            deductions: nextDeductions,
            totalDeductionsClaimed: totalClaimed,
            totalDeductionsAgreed: totalAgreed,
            finalRefundAmount: finalRefund,
            status
          }
        };
      })
    );
  };

  const deleteDeduction = (propertyId: string, deductionId: string) => {
    setProperties((prev) =>
      prev.map((prop) => {
        if (prop.id !== propertyId) return prop;

        const nextDeductions = (prop.settlement?.deductions || []).filter((d) => d.id !== deductionId);
        const { totalClaimed, totalAgreed, finalRefund, status } = recalculateSettlement(
          nextDeductions,
          prop.depositAmount
        );

        return {
          ...prop,
          settlement: {
            ...prop.settlement,
            deductions: nextDeductions,
            totalDeductionsClaimed: totalClaimed,
            totalDeductionsAgreed: totalAgreed,
            finalRefundAmount: finalRefund,
            status
          }
        };
      })
    );
  };

  const signSettlementAgreement = (
    propertyId: string,
    role: UserRole,
    signatureUrl: string,
    paymentMethod: 'UPI' | 'NEFT/IMPS' | 'Cheque' = 'UPI',
    paymentRef: string = `UPI-${Date.now().toString().slice(-8)}`
  ) => {
    const nowIso = new Date().toISOString();
    const formattedSignDate = formatFullDateTime(nowIso);

    setProperties((prev) =>
      prev.map((prop) => {
        if (prop.id !== propertyId) return prop;

        const prevSettlement = prop.settlement;
        const isTenant = role === 'tenant';

        const updatedSettlement: SettlementRecord = {
          ...prevSettlement,
          settlementDate: nowIso,
          paymentMethod,
          paymentRef,
          ...(isTenant
            ? {
                tenantSigned: true,
                tenantSignature: signatureUrl,
                tenantSignDate: formattedSignDate
              }
            : {
                landlordSigned: true,
                landlordSignature: signatureUrl,
                landlordSignDate: formattedSignDate
              })
        };

        const bothSigned =
          (isTenant ? true : updatedSettlement.tenantSigned) &&
          (!isTenant ? true : updatedSettlement.landlordSigned);

        return {
          ...prop,
          status: bothSigned ? 'settled' : 'settlement_in_progress',
          settlement: {
            ...updatedSettlement,
            status: bothSigned ? 'refunded' : 'agreed'
          }
        };
      })
    );
  };

  const startMoveOutFlow = (propertyId: string) => {
    setProperties((prev) =>
      prev.map((prop) => {
        if (prop.id !== propertyId) return prop;
        if (!prop.moveOutReport) {
          return {
            ...prop,
            status: 'move_out_active',
            moveOutReport: createEmptyInspectionData()
          };
        }
        return {
          ...prop,
          status: 'move_out_active'
        };
      })
    );
    setActiveTab('move_out');
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProperties(INITIAL_PROPERTIES);
    setActivePropertyId(INITIAL_PROPERTIES[0].id);
    setActiveTab('dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        properties,
        activePropertyId,
        activeProperty,
        activeTab,
        userRole,
        isMobileFrame,
        selectedPdfType,
        setActiveTab,
        setUserRole,
        setIsMobileFrame,
        setActivePropertyId,
        setSelectedPdfType,
        addProperty,
        updateProperty,
        saveRoomInspection,
        addMediaToRoom,
        removeMediaFromRoom,
        signReport,
        updateDeduction,
        addDeduction,
        deleteDeduction,
        signSettlementAgreement,
        startMoveOutFlow,
        resetDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
