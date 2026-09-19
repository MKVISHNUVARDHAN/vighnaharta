export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    ('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
    window.innerWidth <= 1024
  );
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
}

export function getDeviceTier(): 'low' | 'medium' | 'high' {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'high';
  
  const dpr = window.devicePixelRatio || 1;
  const memory = (navigator as any).deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  
  if (memory <= 2 || cores <= 2) return 'low';
  if (memory <= 4 || cores <= 4 || dpr <= 1.5) return 'medium';
  return 'high';
}

export function supportsVibration(): boolean {
  if (typeof navigator === 'undefined') return false;
  return 'vibrate' in navigator;
}

export function triggerHaptic(type: 'tap' | 'impact' | 'double'): void {
  if (!supportsVibration()) return;
  
  try {
    switch (type) {
      case 'tap':
        navigator.vibrate(10);
        break;
      case 'impact':
        navigator.vibrate([30, 50, 30]);
        break;
      case 'double':
        navigator.vibrate([15, 30, 15]);
        break;
    }
  } catch (e) {
    // Ignore vibration errors
  }
}
