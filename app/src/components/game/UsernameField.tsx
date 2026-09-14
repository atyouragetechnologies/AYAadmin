/**
 * UsernameField — reusable username input with live status feedback.
 *
 * Designed to match the existing AYA glass-panel / dark / cyan-accent visual system.
 * Used in OnboardingWizard and SettingsPage.
 */

import { type ChangeEvent } from 'react';
import { Check, X, Loader2, AtSign } from 'lucide-react';
import type { UsernameStatus } from '../../hooks/useUsernameAvailability';
import { sanitizeUsername } from '../../domain/username';

interface UsernameFieldProps {
  /** Current raw username value */
  value: string;
  /** Called with the sanitized value whenever the user types */
  onChange: (sanitized: string) => void;
  /** Availability status from useUsernameAvailability */
  status: UsernameStatus;
  /** Validation/availability error message, if any */
  errorMessage?: string | null;
  /** Disables the input (e.g. while the form is submitting) */
  disabled?: boolean;
  /** Label text (defaults to "Username") */
  label?: string;
  /** Supporting help text shown above the input */
  helperText?: string;
  /** Extra className applied to the outer wrapper */
  className?: string;
}

/** Maps a status to its border & glow styling */
function getBorderAccent(status: UsernameStatus): string {
  switch (status) {
    case 'available':
      return 'border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.25)] focus-within:border-emerald-400 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.35)]';
    case 'taken':
    case 'error':
      return 'border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.25)] focus-within:border-red-400';
    case 'checking':
    case 'validating':
      return 'border-[#9333ea]/80 shadow-[0_0_15px_rgba(147,51,234,0.25)] focus-within:border-[#9333ea]';
    default:
      return 'border-[#2b2b38] focus-within:border-[#00f1fe] focus-within:shadow-[0_0_20px_rgba(0,241,254,0.3)]';
  }
}

function StatusIndicator({
  status,
  errorMessage,
}: {
  status: UsernameStatus;
  errorMessage?: string | null;
}) {
  switch (status) {
    case 'checking':
      return (
        <p className="flex items-center gap-1.5 text-xs text-[#acaab5] font-medium" aria-live="polite">
          <Loader2 size={13} className="animate-spin text-[#9333ea]" />
          <span>Checking availability...</span>
        </p>
      );
    case 'validating':
      if (errorMessage) {
        return (
          <p className="flex items-center gap-1.5 text-xs text-red-400 font-medium" aria-live="polite" role="alert">
            <X size={13} strokeWidth={2.5} />
            <span>{errorMessage}</span>
          </p>
        );
      }
      return (
        <p className="flex items-center gap-1.5 text-xs text-[#acaab5] font-medium" aria-live="polite">
          <Loader2 size={13} className="animate-spin text-[#9333ea]" />
          <span>Checking availability...</span>
        </p>
      );
    case 'available':
      return (
        <p className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold tracking-wide" aria-live="polite">
          <Check size={13} strokeWidth={3} />
          <span>Username is available</span>
        </p>
      );
    case 'taken':
      return (
        <p className="flex items-center gap-1.5 text-xs text-red-400 font-bold tracking-wide" aria-live="polite" role="alert">
          <X size={13} strokeWidth={3} />
          <span>Username is already taken</span>
        </p>
      );
    case 'error':
      return (
        <p className="flex items-center gap-1.5 text-xs text-amber-400 font-medium" aria-live="polite" role="alert">
          <X size={13} strokeWidth={2.5} />
          <span>{errorMessage || 'Unable to check username. Please try again.'}</span>
        </p>
      );
    default:
      return null;
  }
}

export function UsernameField({
  value,
  onChange,
  status,
  errorMessage,
  disabled = false,
  label = 'Username',
  helperText,
  className = '',
}: UsernameFieldProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Uses domain sanitizeUsername to remove invalid chars live
    const sanitized = sanitizeUsername(e.target.value);
    onChange(sanitized);
  };

  const borderClasses = getBorderAccent(status);
  const inputId = 'username-field-input';

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-bold text-[#f2effb] uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      {helperText && (
        <p className="text-xs text-[#acaab5] font-medium leading-relaxed mb-2">
          {helperText}
        </p>
      )}

      {/* Input container */}
      <div
        className={`relative flex items-center w-full bg-black/40 border rounded-2xl transition-all duration-300 overflow-hidden ${borderClasses}`}
      >
        {/* Visual @ prefix - separated from editable text */}
        <div className="pl-4 pr-1 text-[#00f1fe] font-bold select-none flex items-center justify-center pointer-events-none" aria-hidden="true">
          <AtSign size={16} strokeWidth={2.5} />
        </div>

        <input
          id={inputId}
          type="text"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="username"
          spellCheck={false}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="your_username"
          aria-label="Choose your username"
          aria-describedby="username-field-status"
          aria-invalid={status === 'taken' || status === 'error' ? true : undefined}
          className="flex-1 bg-transparent py-3.5 pr-4 text-white placeholder-[#76747f] font-medium outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Status Icon */}
        <div className="pr-4 flex items-center justify-center pointer-events-none" aria-hidden="true">
          {status === 'checking' || status === 'validating' ? (
            <Loader2 size={16} className="animate-spin text-[#9333ea]" />
          ) : status === 'available' ? (
            <Check size={18} className="text-emerald-400" strokeWidth={3} />
          ) : status === 'taken' || status === 'error' ? (
            <X size={18} className="text-red-400" strokeWidth={3} />
          ) : null}
        </div>
      </div>

      {/* Footer row: Status message on left, character counter on right */}
      <div id="username-field-status" className="flex items-center justify-between min-h-[20px] px-1 pt-1">
        <div className="flex-1">
          <StatusIndicator status={status} errorMessage={errorMessage} />
        </div>

        <span className="text-[11px] font-mono text-[#76747f] select-none ml-2">
          {value.length} / 20
        </span>
      </div>
    </div>
  );
}
