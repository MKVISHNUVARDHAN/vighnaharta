export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatShortDate = (isoString?: string): string => {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return isoString;
  }
};

export const formatFullDateTime = (isoString?: string): string => {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    const dateStr = d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timeStr = d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr}, ${timeStr} IST`;
  } catch {
    return isoString;
  }
};

export const generateWhatsAppLink = (
  phone: string,
  propertyAddress: string,
  reportType: 'Move-in' | 'Move-out' | 'Settlement',
  summary: string,
  recipientName: string = 'Landlord'
): string => {
  // Strip non-digits except leading +
  const cleanedPhone = phone.replace(/[^0-9]/g, '');
  const targetPhone = cleanedPhone.startsWith('91') ? cleanedPhone : `91${cleanedPhone}`;

  const message = `*DepositGuard Verification Report: ${reportType} Condition*

Dear ${recipientName},

Here is the digital inspection report for:
🏠 *${propertyAddress}*

📊 *Summary:*
${summary}

🛡️ *Evidence Stamped:* Date, Time & Geo-verified evidence recorded via DepositGuard.
Please review and sign off the condition record.

Shared via DepositGuard — India's Rental Security Deposit Protection Platform.`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
};
