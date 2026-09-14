/**
 * useDevicePerformance.ts
 *
 * Detects whether the current device is "low-end" using two Web APIs:
 *  - navigator.deviceMemory  → RAM in GB (0.25, 0.5, 1, 2, 4, 8)
 *  - navigator.hardwareConcurrency → Number of logical CPU cores
 *
 * Low-end definition used here:
 *  - RAM ≤ 2 GB  (Snapdragon 4xx / Helio G85 class devices)
 *  - OR CPU cores ≤ 2 (very old/cheap chipsets)
 *
 * Usage:
 *   const { isLowEnd } = useDevicePerformance();
 *   <div className={isLowEnd ? "" : "group-hover:scale-105 transition-transform duration-700"}>
 *
 * Note: Both APIs are intentionally not available in all browsers (Firefox,
 * Safari do not expose deviceMemory). We default to 4 GB / 4 cores in those
 * cases, which means animations stay ON — a safe "assume capable" fallback.
 */

import { useMemo } from "react";

interface DevicePerformance {
	/** true on devices with ≤2 GB RAM or ≤2 CPU cores */
	isLowEnd: boolean;
	/** RAM in GB as reported by navigator.deviceMemory, or 4 if unavailable */
	memory: number;
	/** Logical CPU core count, or 4 if unavailable */
	cores: number;
}

// Computed once at module load — device hardware doesn't change during session.
// Avoids re-computing on every render.
const _memory: number = (navigator as any).deviceMemory ?? 4;
const _cores: number = navigator.hardwareConcurrency ?? 4;
const _isLowEnd: boolean = _memory <= 2 || _cores <= 2;

export function useDevicePerformance(): DevicePerformance {
	return useMemo(
		() => ({
			isLowEnd: _isLowEnd,
			memory: _memory,
			cores: _cores,
		}),
		[],
	); // Empty deps — values never change during session
}
