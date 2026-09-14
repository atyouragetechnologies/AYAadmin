// Session persistence utility — dual localStorage/sessionStorage fallback (Safari Private Mode safe)

const KEYS = {
  userId: 'aya_user_id',
  mobile: 'aya_user_mobile',
  name: 'aya_user_name',
  age: 'aya_user_age',
  quizDone: 'aya_quiz_done',
  email: 'aya_user_email',
  username: 'aya_user_username',
  onboardingComplete: 'aya_onboarding_complete',
};

const safeSet = (key: string, value: string) => {
  try { localStorage.setItem(key, value); } catch {}
  try { sessionStorage.setItem(key, value); } catch {}
};

const safeGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  } catch {
    try { return sessionStorage.getItem(key); } catch { return null; }
  }
};

const safeRemove = (key: string) => {
  try { localStorage.removeItem(key); } catch {}
  try { sessionStorage.removeItem(key); } catch {}
};

export const saveSession = (user: { id: string; mobile?: string; name?: string; age?: number; username?: string; email?: string; onboarding_complete?: boolean }) => {
  if (user.id) safeSet(KEYS.userId, user.id);
  if (user.mobile !== undefined) safeSet(KEYS.mobile, user.mobile || '');
  if (user.name !== undefined) safeSet(KEYS.name, user.name || '');
  if (user.age !== undefined) safeSet(KEYS.age, String(user.age));
  if (user.username !== undefined) safeSet(KEYS.username, user.username || '');
  if (user.email !== undefined) safeSet(KEYS.email, user.email || '');
  if (user.onboarding_complete !== undefined) safeSet(KEYS.onboardingComplete, String(user.onboarding_complete));
  console.log('[Session] Saved:', user.id);
};

export const getSession = () => ({
  userId: safeGet(KEYS.userId),
  mobile: safeGet(KEYS.mobile),
  name: safeGet(KEYS.name),
  age: Number(safeGet(KEYS.age) || 0),
  username: safeGet(KEYS.username),
  email: safeGet(KEYS.email),
  onboardingComplete: safeGet(KEYS.onboardingComplete) === 'true',
});

export const clearSession = () => {
  Object.values(KEYS).forEach(safeRemove);
  console.log('[Session] Cleared.');
};

export const clearAllUserData = () => {
  clearSession();
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('aya_') || k === 'user-storage')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    localStorage.clear();
  } catch {}

  try {
    const sessionKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && (k.startsWith('aya_') || k === 'user-storage')) {
        sessionKeys.push(k);
      }
    }
    sessionKeys.forEach((k) => sessionStorage.removeItem(k));
    sessionStorage.clear();
  } catch {}
  console.log('[Session] All user data cleared from local and session storage.');
};

export const markQuizDone = () => {
  safeSet(KEYS.quizDone, 'true');
};

export const isQuizDone = (): boolean => safeGet(KEYS.quizDone) === 'true';

export function getSessionId(): string {
  const key = 'aya_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

