/**
 * useUsernameAvailability
 *
 * React hook that:
 *  1. Debounces username input (400 ms)
 *  2. Runs local validation first — skips the network if invalid
 *  3. Calls the Supabase RPC for available/taken status
 *  4. Prevents stale responses from overwriting newer state
 *     (via an incrementing request-ID mechanism)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { validateUsername } from '../domain/username';
import { checkUsernameAvailable } from '../services/usernameService';

export type UsernameStatus =
  | 'idle'       // No value entered yet
  | 'validating' // Waiting for debounce (user is still typing)
  | 'checking'   // DB request in flight
  | 'available'  // Username is free to claim
  | 'taken'      // Username is already in use
  | 'error';     // Network / RPC error

export interface UseUsernameAvailabilityReturn {
  /** Current availability status */
  status: UsernameStatus;
  /** Human-readable message for the current status (validation error, taken message, etc.) */
  errorMessage: string | null;
  /**
   * Trigger an immediate availability check without waiting for the debounce.
   * Useful for the submit button.
   */
  checkNow: () => void;
}

const DEBOUNCE_MS = 400;

/**
 * @param username      The raw username string from the input.
 * @param excludeUserId Pass the logged-in user's UUID when editing an existing username
 *                      so the check does not report their own current name as taken.
 */
export function useUsernameAvailability(
  username: string,
  excludeUserId?: string | null
): UseUsernameAvailabilityReturn {
  // State to hold asynchronous RPC check results
  const [asyncResult, setAsyncResult] = useState<{
    targetUsername: string;
    status: 'checking' | 'available' | 'taken' | 'error';
    errorMessage: string | null;
  } | null>(null);

  // Counter to prevent stale async responses from overwriting current state
  const requestIdRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pure local validation calculated synchronously during render
  const validation = validateUsername(username);

  // Derive status and errorMessage synchronously based on inputs and async results
  let status: UsernameStatus;
  let errorMessage: string | null;

  if (!username) {
    status = 'idle';
    errorMessage = null;
  } else if (!validation.valid) {
    status = 'validating';
    errorMessage = validation.error;
  } else if (asyncResult && asyncResult.targetUsername === username) {
    status = asyncResult.status;
    errorMessage = asyncResult.errorMessage;
  } else {
    // Valid username awaiting debounced RPC check or response
    status = 'validating';
    errorMessage = null;
  }

  const runCheck = useCallback(
    async (value: string, expectedId: number) => {
      setAsyncResult({
        targetUsername: value,
        status: 'checking',
        errorMessage: null,
      });

      try {
        const available = await checkUsernameAvailable(value, excludeUserId);

        // Guard against stale responses
        if (requestIdRef.current !== expectedId) return;

        if (available) {
          setAsyncResult({
            targetUsername: value,
            status: 'available',
            errorMessage: null,
          });
        } else {
          setAsyncResult({
            targetUsername: value,
            status: 'taken',
            errorMessage: 'Username is already taken.',
          });
        }
      } catch (err: unknown) {
        if (requestIdRef.current !== expectedId) return;

        console.error('[useUsernameAvailability] RPC error:', err);
        setAsyncResult({
          targetUsername: value,
          status: 'error',
          errorMessage: 'Unable to check username. Please try again.',
        });
      }
    },
    [excludeUserId]
  );

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!username || !validation.valid) {
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      requestIdRef.current += 1;
      const id = requestIdRef.current;
      runCheck(username, id);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [username, validation.valid, runCheck]);

  /**
   * Force an immediate check (skipping debounce).
   * The stale-request guard still applies.
   */
  const checkNow = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!username || !validation.valid) {
      return;
    }

    requestIdRef.current += 1;
    const id = requestIdRef.current;
    runCheck(username, id);
  }, [username, validation.valid, runCheck]);

  return { status, errorMessage, checkNow };
}
