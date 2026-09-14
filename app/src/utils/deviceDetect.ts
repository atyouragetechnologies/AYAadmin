/**
 * Device detection utilities
 * Used to serve simplified experience on iOS Safari
 * to prevent memory crashes
 */

/**
 * Detects iOS devices (iPhone, iPad, iPod)
 * Also catches iOS Chrome which uses Safari's WebKit engine
 */
export function isIOS() {
  if (typeof window === 'undefined') return false;
  
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPad on iOS 13+ reports as MacIntel
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Detects Safari specifically (not Chrome on iOS)
 */
export function isSafari() {
  if (typeof window === 'undefined') return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

/**
 * iOS Safari specifically
 */
export function isIOSSafari() {
  return isIOS() && isSafari();
}

/**
 * Checks if device has limited GPU/memory
 */
export function isLowMemoryDevice() {
  if (isIOS()) return true; // Always treat iOS as low memory for safety
  
  // Chrome on Android also has memory limits
  if (/Android/.test(navigator.userAgent)) return true;
  
  // Devices with <= 4GB RAM
  const nav = navigator as unknown as { deviceMemory?: number };
  if (nav?.deviceMemory && nav.deviceMemory <= 4) return true;
  
  return false;
}

// Export as object for convenience
export const device = {
  isIOS: isIOS(),
  isSafari: isSafari(),
  isIOSSafari: isIOSSafari(),
  isLowMemory: isLowMemoryDevice(),
};

export default device;
