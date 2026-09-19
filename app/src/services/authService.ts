/**
 * app/src/services/authService.ts
 *
 * Firebase Auth replacement for the AYA app.
 * Handles: Google Sign-In, Phone OTP, Username+Password (via email link), Sign Out.
 * Writes user profile to Firestore on successful auth.
 *
 * Replaces: Supabase Auth (signUp, signInWithPassword, signInWithOAuth, signOut)
 */
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User as FirebaseUser,
} from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { auth } from '../lib/firebase';
import {
    userDoc,
    upsertUserProfile,
    claimUsername,
    adminUserDoc,
    db,
} from '../lib/firestore';
import { getDoc, setDoc, serverTimestamp, query, collection, where, limit, getDocs } from 'firebase/firestore';
import { saveSession, clearAllUserData } from '../utils/session';
import { useUserStore } from '../store/userStore';
import { validatePhone } from '../utils/authHelpers';
import { isNativeApp } from '../hooks/useNativeFeatures';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface SignUpParams {
    username: string;
    password?: string;
    confirmPassword?: string;
    mobile?: string;
    age?: number;
}

export interface SignInParams {
    username: string;
    password?: string;
}

export interface SignUpPhoneParams {
    phone: string;
    password?: string;
    confirmPassword?: string;
    age?: number;
}

export interface SignInPhoneParams {
    phone: string;
    password?: string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Derive a synthetic Firebase-compatible email from a phone number. */
function derivePhoneEmail(phone: string): string {
    return `phone.${phone.replace(/\D/g, '')}@aya.app`;
}

/** Derive a synthetic Firebase-compatible email from a username. */
export function deriveUsernameEmail(username: string): string {
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    return `${clean}@aya.app`;
}

/** Map a Firestore user document to the UserProfile shape the Zustand store expects. */
function firestoreDocToProfile(uid: string, data: Record<string, unknown>): any {
    return {
        id: uid,
        auth_user_id: uid,
        username: data.username ?? null,
        name: (data.name as string) ?? (data.username as string) ?? 'Player',
        mobile: data.mobile ?? null,
        email: data.email ?? null,
        age: Number(data.age ?? 18),
        onboarding_complete: Boolean(data.onboardingComplete ?? data.username),
        assessmentCompleted: Boolean(
            data.assessmentCompleted ||
            (data.totalXp && (data.totalXp as number) > 0) ||
            (data.storiesCompleted && (data.storiesCompleted as number) > 0)
        ),
        isAdmin: Boolean(data.isAdmin),
        total_xp: Number(data.totalXp ?? 0),
        level: Number(data.level ?? 1),
        stories_completed: Number(data.storiesCompleted ?? 0),
        story_count: Number(data.storyCount ?? 0),
        current_streak: Number(data.currentStreak ?? 0),
        longest_streak: Number(data.longestStreak ?? 0),
        last_active_date: data.lastActiveDate ?? null,
        daily_challenge_completed: Boolean(data.dailyChallengeCompleted),
        daily_free_stories: Number(data.dailyFreeStories ?? 0),
        last_story_date: data.lastStoryDate ?? null,
        access_type: data.accessType ?? 'free',
        level_scores: data.levelScores ?? {},
        onboarding_scores: data.onboardingScores ?? null,
        gameplay_scores: data.gameplayScores ?? null,
        created_at: data.createdAt ?? null,
        traits: {
            discipline: 50, resilience: 50, risk: 50,
            leadership: 50, creativity: 50, empathy: 50, vision: 50,
        },
    };
}

/** After successful Firebase Auth sign-in, load/create Firestore user doc and hydrate store. */
async function handlePostSignIn(firebaseUser: FirebaseUser, extraData: Record<string, unknown> = {}) {
    const uid = firebaseUser.uid;

    // Load existing profile from Firestore
    const snap = await getDoc(userDoc(uid));
    let data: Record<string, unknown> = {};

    if (snap.exists()) {
        data = snap.data() as Record<string, unknown>;
        // Update last active date
        await upsertUserProfile(uid, {
            lastActiveDate: new Date().toISOString().split('T')[0],
            ...(extraData ?? {}),
        });
    } else {
        // First-ever sign-in: create profile doc
        data = {
            email: firebaseUser.email ?? null,
            name: firebaseUser.displayName ?? extraData.name ?? 'Player',
            onboardingComplete: false,
            totalXp: 0,
            level: 1,
            storiesCompleted: 0,
            storyCount: 0,
            currentStreak: 0,
            longestStreak: 0,
            isAdmin: false,
            accessType: 'free',
            levelScores: {},
            ...extraData,
        };
        await setDoc(userDoc(uid), { ...data, createdAt: serverTimestamp() });
    }

    // Admin check
    let isAdmin = Boolean(data.isAdmin);
    if (data.email) {
        try {
            const adminSnap = await getDoc(adminUserDoc(data.email as string));
            if (adminSnap?.exists()) isAdmin = true;
        } catch {
            // Ignore permission errors on admin_users collection for non-admin users
        }
    }

    const profile = firestoreDocToProfile(uid, { ...data, isAdmin });

    saveSession({
        id: uid,
        username: (data.username as string) ?? '',
        name: profile.name,
        mobile: (data.mobile as string) ?? '',
        email: profile.email ?? '',
        onboarding_complete: profile.onboarding_complete,
        age: profile.age,
    });

    useUserStore.getState().setProfile(profile);

    return { user: profile, onboardingComplete: profile.onboarding_complete };
}

// ─────────────────────────────────────────────
// AUTH SERVICE
// ─────────────────────────────────────────────

export const authService = {
    /**
     * Google Sign-In (web + native Android via @capacitor-firebase/authentication)
     */
    async signInWithGoogle(_redirectTo?: string) {
        if (isNativeApp) {
            // Native: use Capacitor plugin to get Google ID token, then sign in to Firebase
            try {
                await FirebaseAuthentication.signInWithGoogle();
            } catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                throw new Error(
                    /\b(10|12500|developer_error|account reauth)\b/i.test(msg)
                        ? 'Google Sign-In could not verify this app. Please use username/phone login for now.'
                        : msg || 'Google Sign-In could not be completed.'
                );
            }

            // The Capacitor plugin handles Firebase auth internally — just get the current user
            const fbUser = auth.currentUser;
            if (!fbUser) throw new Error('Google Sign-In failed. Please try again.');
            return handlePostSignIn(fbUser, { email: fbUser.email ?? undefined });
        } else {
            // Web: Use Capacitor plugin in browser mode (popup)
            await FirebaseAuthentication.signInWithGoogle();
            const fbUser = auth.currentUser;
            if (!fbUser) throw new Error('Google Sign-In failed. Please try again.');
            return handlePostSignIn(fbUser, { email: fbUser.email ?? undefined });
        }
    },

    /**
     * Sign Up with Phone Number + Password
     * Uses a synthetic email derived from the phone number for Firebase Auth.
     */
    async signUpWithPhonePassword({ phone, password, confirmPassword, age }: SignUpPhoneParams) {
        const cleanPhone = validatePhone(phone);
        const numericAge = Number(age);

        if (!age || isNaN(numericAge) || numericAge < 13 || numericAge > 30) {
            throw new Error('Please select your age.');
        }
        if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');
        if (confirmPassword && password !== confirmPassword) throw new Error('Passwords do not match.');

        const email = derivePhoneEmail(cleanPhone);
        const defaultName = `User_${cleanPhone.slice(-4)}`;

        let fbUser: FirebaseUser;
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            fbUser = cred.user;
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                // Account already exists with this phone number
                try {
                    const cred = await signInWithEmailAndPassword(auth, email, password);
                    fbUser = cred.user;
                } catch {
                    throw new Error('An account with this phone number already exists. Please sign in instead.');
                }
            } else if (err.code === 'auth/weak-password') {
                throw new Error('Password should be at least 6 characters.');
            } else {
                throw new Error(err.message || 'Could not create account. Please try again.');
            }
        }

        const extraData = {
            mobile: cleanPhone,
            name: defaultName,
            age: numericAge,
            onboardingComplete: false,
        };

        return handlePostSignIn(fbUser, extraData);
    },

    /**
     * Sign In with Phone Number + Password
     */
    async signInWithPhonePassword({ phone, password }: SignInPhoneParams) {
        const cleanPhone = validatePhone(phone);
        if (!password) throw new Error('Please enter your password.');

        const email = derivePhoneEmail(cleanPhone);

        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            return handlePostSignIn(cred.user);
        } catch (err: any) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                throw new Error('Invalid phone number or password.');
            }
            throw new Error(err.message || 'Sign-in failed. Please try again.');
        }
    },

    /**
     * Sign Up with Username + Password
     */
    async signUpWithUsernamePassword({ username, password, confirmPassword, mobile, age }: SignUpParams) {
        const cleanUsername = username.trim();
        const cleanMobile = mobile ? mobile.trim().replace(/\s+/g, '') : null;

        if (cleanUsername.length < 3) throw new Error('Username must be at least 3 characters.');
        if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');
        if (confirmPassword && password !== confirmPassword) throw new Error('Passwords do not match.');

        const email = deriveUsernameEmail(cleanUsername);

        let fbUser: FirebaseUser;
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            fbUser = cred.user;
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                try {
                    const cred = await signInWithEmailAndPassword(auth, email, password);
                    fbUser = cred.user;
                } catch {
                    throw new Error('This username is already taken. Please choose another.');
                }
            } else if (err.code === 'auth/weak-password') {
                throw new Error('Password should be at least 6 characters.');
            } else {
                throw new Error(err.message || 'Could not create account.');
            }
        }

        const extraData = {
            username: cleanUsername,
            usernameLower: cleanUsername.toLowerCase(),
            name: cleanUsername,
            mobile: cleanMobile,
            age: Number(age ?? 18),
            onboardingComplete: true,
        };

        return handlePostSignIn(fbUser, extraData);
    },

    /**
     * Sign In with Username + Password
     */
    async signInWithUsernamePassword({ username, password }: SignInParams) {
        const cleanUsername = username.trim();
        if (!cleanUsername || !password) throw new Error('Please provide both username and password.');

        const email = deriveUsernameEmail(cleanUsername);

        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            return handlePostSignIn(cred.user);
        } catch (err: any) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                // Try to find by username in Firestore — user may have a different email
                try {
                    const q = query(
                        collection(db, 'users'),
                        where('usernameLower', '==', cleanUsername.toLowerCase()),
                        limit(1)
                    );
                    const snap = await getDocs(q);
                    if (!snap.empty) {
                        const doc = snap.docs[0];
                        const storedEmail = doc.data().email as string | undefined;
                        if (storedEmail && storedEmail !== email) {
                            const cred = await signInWithEmailAndPassword(auth, storedEmail, password);
                            return handlePostSignIn(cred.user);
                        }
                    }
                } catch {
                    // Ignore unauthenticated query failure
                }
                throw new Error('Invalid username or password.');
            }
            throw new Error(err.message || 'Sign-in failed.');
        }
    },

    /**
     * Complete profile setup — sets username after phone/Google signup.
     * Called from the /signup/complete route.
     */
    async completeProfileSetup({ username, mobile, age }: SignUpParams) {
        const cleanUsername = username.trim();
        const cleanMobile = mobile ? mobile.trim().replace(/\s+/g, '') : undefined;
        const numericAge = Number(age ?? useUserStore.getState().profile?.age ?? 18);

        if (cleanUsername.length < 3) throw new Error('Username must be at least 3 characters.');

        const fbUser = auth.currentUser;
        if (!fbUser) throw new Error('You must be signed in to set a username. Please sign in again.');

        await claimUsername(fbUser.uid, cleanUsername, numericAge, cleanMobile);

        const profile = useUserStore.getState().profile;
        useUserStore.getState().setProfile({
            ...profile,
            username: cleanUsername,
            name: cleanUsername,
            mobile: cleanMobile ?? profile?.mobile,
            age: numericAge,
            onboarding_complete: true,
        } as any);

        saveSession({
            id: fbUser.uid,
            username: cleanUsername,
            name: cleanUsername,
            mobile: cleanMobile ?? '',
            email: fbUser.email ?? '',
            onboarding_complete: true,
            age: numericAge,
        });

        return true;
    },

    /**
     * Sign out completely
     */
    async signOut() {
        try {
            await firebaseSignOut(auth);
            if (isNativeApp) {
                await FirebaseAuthentication.signOut().catch(() => {});
            }
        } catch (e) {
            console.warn('[AuthService] signOut error:', e);
        }
        clearAllUserData();
        useUserStore.getState().clearUserData();
    },

    /**
     * Listen to Firebase Auth state changes.
     * Call this once at app startup (in App.tsx or similar).
     */
    onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
        return onAuthStateChanged(auth, callback);
    },

    /** Get the current signed-in Firebase user. */
    getCurrentUser(): FirebaseUser | null {
        return auth.currentUser;
    },

    /** Reload the current user's Firestore profile and re-hydrate the store. */
    async reloadProfile() {
        const fbUser = auth.currentUser;
        if (!fbUser) return null;
        return handlePostSignIn(fbUser);
    },
};
