import { formatFullDateTime } from './formatters';

export interface StampOptions {
  roomName: string;
  condition: string;
  geo?: string;
  customDate?: string;
}

export const stampImageWithMetadata = (
  file: File | string,
  options: StampOptions
): Promise<{ dataUrl: string; timestampIso: string; displayDate: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const timestampIso = options.customDate || new Date().toISOString();
    const displayDate = formatFullDateTime(timestampIso);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create canvas context'));
          return;
        }

        // Limit maximum width for performance while preserving resolution
        const maxDim = 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw original photo
        ctx.drawImage(img, 0, 0, width, height);

        // Watermark overlay banner styling
        const barHeight = Math.max(48, Math.round(height * 0.08));
        const yStart = height - barHeight;

        // Semi-transparent dark navy gradient at bottom
        const gradient = ctx.createLinearGradient(0, yStart - 10, 0, height);
        gradient.addColorStop(0, 'rgba(11, 29, 58, 0)');
        gradient.addColorStop(0.3, 'rgba(11, 29, 58, 0.75)');
        gradient.addColorStop(1, 'rgba(11, 29, 58, 0.95)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, yStart - 10, width, barHeight + 10);

        // Green Shield indicator
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        const iconSize = Math.max(12, Math.round(barHeight * 0.28));
        const iconX = 18;
        const iconY = yStart + Math.round(barHeight * 0.35);
        ctx.arc(iconX, iconY, iconSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Stamped Text
        const fontSizePrimary = Math.max(12, Math.round(barHeight * 0.26));
        const fontSizeSecondary = Math.max(10, Math.round(barHeight * 0.2));

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${fontSizePrimary}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillText(`DEPOSITGUARD EVIDENCE • ${options.roomName.toUpperCase()}`, iconX + iconSize + 6, iconY + 2);

        ctx.fillStyle = '#d9e2ec';
        ctx.font = `${fontSizeSecondary}px monospace`;
        const geoText = options.geo ? ` • ${options.geo}` : '';
        ctx.fillText(`🕒 ${displayDate}${geoText}`, iconX + iconSize + 6, iconY + fontSizeSecondary + 6);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve({ dataUrl, timestampIso, displayDate });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for stamping'));
    };

    if (typeof file === 'string') {
      img.src = file;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }
  });
};
