import { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import { audioManager as audioSynth } from "../../utils/audioManager";
import { ArrowLeft, Edit3, Check, X, Phone, Trophy, Flame } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useUsernameAvailability } from '../../hooks/useUsernameAvailability';
import { supabase } from '../../utils/supabase';
import { UsernameField } from './UsernameField';
import clsx from 'clsx';
import { getFollowerCount, getFollowingCount } from '../../services/followService';
import { calculateLevelInfo } from '../../utils/levelSystem';
import { normalizePhone } from '../../utils/authHelpers';
import { saveSession } from '../../utils/session';

interface ProfileDashboardProps {
    onBack: () => void;
}

const isRealMobile = (m?: string | null) => Boolean(m && !m.startsWith('local_') && m.trim().length > 0);

export function ProfileDashboard({ onBack }: ProfileDashboardProps) {
    const profile = useUserStore((state) => state.profile);
    const setProfile = useUserStore((state) => state.setProfile);
    const { isCandyMode } = useUserStore();

    const [isEditing, setIsEditing] = useState(false);
    
    // Social counts
    const [followerCount, setFollowerCount] = useState<number | null>(null);
    const [followingCount, setFollowingCount] = useState<number | null>(null);

    useEffect(() => {
        if (!profile?.id) return;
        Promise.all([
            getFollowerCount(profile.id),
            getFollowingCount(profile.id),
        ]).then(([fc, fwc]) => {
            setFollowerCount(fc);
            setFollowingCount(fwc);
        }).catch(() => { /* counts fail silently */ });
    }, [profile?.id]);
    
    // Edit state
    const [newAge, setNewAge] = useState(18);
    const [usernameInput, setUsernameInput] = useState('');
    const [mobileInput, setMobileInput] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [usernameSuccess, setUsernameSuccess] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const usernameAvailability = useUsernameAvailability(
        usernameInput,
        profile?.id ?? null
    );

    useEffect(() => {
        if (profile) {
            setNewAge(profile.age || 18);
            setUsernameInput(profile.username || '');
            setMobileInput(isRealMobile(profile.mobile) ? profile.mobile! : '');
        }
    }, [profile, isEditing]);

    const handleSaveProfile = async () => {
        if (!profile?.id) return;
        audioSynth.playClick();
        
        const trimmedUsername = usernameInput.trim();
        const trimmedMobile = mobileInput.trim();
        
        if (!trimmedUsername) {
            setUsernameError('Please enter a username.');
            return;
        }

        if (usernameAvailability.status !== 'available' && trimmedUsername !== profile.username) {
            setUsernameError(
                usernameAvailability.errorMessage ||
                'Please wait for the availability check to finish, or choose a different username.'
            );
            return;
        }

        let finalMobile: string | null = null;
        if (trimmedMobile) {
            const cleanPhone = normalizePhone(trimmedMobile);
            if (cleanPhone.length !== 10) {
                setUsernameError('Please enter a valid 10-digit mobile number.');
                return;
            }
            finalMobile = cleanPhone;

            // Check if phone number is already attached to a DIFFERENT user in Supabase
            if (finalMobile !== profile.mobile) {
                const { data: existingPhoneUser } = await supabase
                    .from('users')
                    .select('id')
                    .eq('mobile', finalMobile)
                    .neq('id', profile.id)
                    .is('deleted_at', null)
                    .maybeSingle();

                if (existingPhoneUser) {
                    setUsernameError('This phone number is already linked to another AYA account.');
                    return;
                }
            }
        }

        setIsSaving(true);
        setUsernameError('');
        setUsernameSuccess('');

        try {
            // Update user details in backend Supabase table
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    name: profile.name || trimmedUsername,
                    age: newAge,
                    mobile: finalMobile,
                    username: trimmedUsername,
                })
                .eq('id', profile.id)
                .select();

            if (updateError) {
                if (updateError.code === '23505') {
                    if (updateError.message?.includes('mobile')) {
                        setUsernameError('This phone number is already taken.');
                    } else {
                        setUsernameError('Username is already taken. Please choose another.');
                    }
                } else {
                    setUsernameError(`Failed to save profile: ${updateError.message}`);
                }
                setIsSaving(false);
                return;
            }

            // Sync session and Zustand state
            saveSession({
                id: profile.id,
                username: trimmedUsername,
                name: profile.name || trimmedUsername,
                age: newAge,
                mobile: finalMobile || '',
            });

            setProfile({ 
                ...profile, 
                username: trimmedUsername, 
                age: newAge,
                mobile: finalMobile || undefined 
            });

            setUsernameSuccess('Profile updated successfully!');
            setTimeout(() => {
                setUsernameSuccess('');
                setIsEditing(false);
            }, 1500);

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unexpected error';
            setUsernameError(`Error: ${message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Whether any field was changed
    const isUsernameChanged = usernameInput.trim() !== (profile?.username ?? '');
    const isAgeChanged = newAge !== (profile?.age ?? 18);
    const currentMobile = isRealMobile(profile?.mobile) ? profile!.mobile! : '';
    const isMobileChanged = currentMobile !== mobileInput.trim();
    const hasChanges = isUsernameChanged || isAgeChanged || isMobileChanged;

    const isUsernameValid = !isUsernameChanged || usernameAvailability.status === 'available';
    const isMobileValid = !mobileInput.trim() || mobileInput.trim().length === 10;
    const canSave = hasChanges && isUsernameValid && isMobileValid && !isSaving;

    return (
        <div className={clsx(
            "min-h-[100dvh] font-sans pb-[calc(env(safe-area-inset-bottom)+6rem)] overflow-x-hidden transition-colors duration-300",
            isCandyMode 
                ? "bg-[#faf9f6] text-slate-800 selection:bg-emerald-200 selection:text-emerald-900" 
                : "bg-slate-900 text-slate-200 selection:bg-[#00f2ff]/30 selection:text-[#00f2ff]"
        )}>
            
            {/* Soft decorative background shapes */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className={clsx("absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px]", isCandyMode ? "bg-emerald-50/50" : "bg-[#00f2ff]/10")} />
                <div className={clsx("absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px]", isCandyMode ? "bg-purple-50/50" : "bg-indigo-500/10")} />
            </div>

            {/* Fixed Floating Back Button - Pushed down to avoid PWA header */}
            <div className="fixed top-24 md:top-28 left-6 z-50">
                <button 
                    onClick={() => { audioSynth.playBack(); onBack(); }}
                    className={clsx(
                        "flex items-center gap-2 px-4 py-3 rounded-full border shadow-md font-bold hover:scale-105 active:scale-95 transition-all backdrop-blur-md",
                        isCandyMode
                            ? "bg-white/80 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700"
                    )}
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>
            </div>

            {/* Main content pushed down to avoid header and give space */}
            <main className="relative z-20 max-w-3xl mx-auto px-6 md:px-12 pt-40 pb-20">
                <div className="flex flex-col gap-6">
                    
                    {/* Profile Card */}
                    <div className={clsx(
                        "rounded-[2.5rem] p-8 shadow-sm border relative overflow-hidden flex flex-col items-center text-center backdrop-blur-md",
                        isCandyMode
                            ? "bg-white/90 border-slate-200"
                            : "bg-slate-800/80 border-[#00f2ff]/30 shadow-[0_0_30px_rgba(0,242,255,0.15)]"
                    )}>
                        {/* Neon background accent */}
                        <div className={clsx(
                            "absolute top-0 left-0 w-full h-40",
                            isCandyMode 
                                ? "bg-gradient-to-b from-pink-100 to-white/0" 
                                : "bg-gradient-to-b from-[#00f2ff]/10 to-transparent"
                        )} />
                        
                        <div className="relative w-32 h-32 mb-6 mt-4">
                            <div className={clsx("absolute inset-0 rounded-full shadow-lg border-4", isCandyMode ? "border-pink-300" : "border-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.5)]")} />
                            <div className={clsx("absolute inset-1 rounded-full overflow-hidden flex items-center justify-center bg-slate-900")}>
                                {profile?.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <DotLottieReact
                                        src={'https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/Macot/waving mascot.lottie'}
                                        loop
                                        autoplay
                                        style={{ width: '150%', height: '150%', marginTop: '10%' }}
                                    />
                                )}
                            </div>
                        </div>

                        {!isEditing ? (
                            <>
                                <h1 className={clsx("text-3xl font-black tracking-tight relative z-10 uppercase", isCandyMode ? "text-slate-800" : "text-white")}>
                                    {profile?.name || 'Explorer'}
                                </h1>
                                <p className={clsx("font-bold text-sm mb-4 relative z-10 tracking-widest uppercase", isCandyMode ? "text-pink-500" : "text-[#00f2ff]")}>
                                    @{profile?.username || `explorer_${Math.floor(Math.random()*1000)}`} • {profile?.age || 18} y/o
                                </p>

                                {/* XP and Level Progress Bar */}
                                {(() => {
                                    const xp = profile?.total_xp || 0;
                                    const levelInfo = calculateLevelInfo(xp);
                                    const xpFloor = levelInfo.xpFloor;
                                    const xpCeiling = levelInfo.xpCeiling + 1;
                                    const xpProgress = Math.min(100, Math.max(0, (xp - xpFloor) / (xpCeiling - xpFloor) * 100));

                                    return (
                                        <div className="w-full max-w-md mx-auto mt-4 mb-8 relative z-10 bg-black/20 p-5 rounded-2xl border border-white/5">
                                            <div className="flex justify-between items-end mb-2">
                                                <div className="text-left">
                                                    <span className={clsx("block text-[10px] font-black uppercase tracking-widest", isCandyMode ? "text-slate-500" : "text-slate-400")}>Level {profile?.level || 1}</span>
                                                    <span className={clsx("block text-sm font-black uppercase tracking-widest", isCandyMode ? "text-pink-600" : "text-[#00f2ff]")}>{levelInfo.title}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className={clsx("block text-xs font-black", isCandyMode ? "text-amber-500" : "text-amber-400")}>{xp} XP</span>
                                                    <span className={clsx("block text-[10px] font-bold uppercase tracking-widest opacity-60", isCandyMode ? "text-slate-500" : "text-slate-400")}>Next: {xpCeiling} XP</span>
                                                </div>
                                            </div>
                                            <div className={clsx("w-full h-3 rounded-full overflow-hidden", isCandyMode ? "bg-slate-200" : "bg-slate-800")}>
                                                <div 
                                                    className={clsx("h-full rounded-full transition-all duration-1000", isCandyMode ? "bg-gradient-to-r from-pink-400 to-amber-400" : "bg-gradient-to-r from-[#00f2ff] to-[#d575ff]")}
                                                    style={{ width: `${xpProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })()}
                                
                                {/* Bio Section */}
                                <div className={clsx("w-full max-w-md mx-auto mb-8 p-4 rounded-2xl border text-sm text-left italic relative z-10", isCandyMode ? "bg-white border-pink-100 text-slate-600" : "bg-slate-800/50 border-slate-700 text-slate-300")}>
                                    "{profile?.bio || "A mysterious explorer navigating the digital realm, forging a path toward self-mastery."}"
                                </div>

                                {/* Activity Stats / Milestones Grid */}
                                <div className="w-full max-w-md mx-auto grid grid-cols-2 gap-3 mb-8 relative z-10">
                                    <div className={clsx("p-4 rounded-2xl flex flex-col items-center justify-center border", isCandyMode ? "bg-orange-50 border-orange-200" : "bg-slate-800/40 border-orange-500/30")}>
                                        <Flame className={clsx("w-6 h-6 mb-2", isCandyMode ? "text-orange-500" : "text-orange-400")} />
                                        <span className="text-2xl font-black">{profile?.current_streak || 0}</span>
                                        <span className={clsx("text-[10px] font-bold uppercase tracking-widest", isCandyMode ? "text-slate-500" : "text-slate-400")}>Current Streak</span>
                                    </div>
                                    <div className={clsx("p-4 rounded-2xl flex flex-col items-center justify-center border", isCandyMode ? "bg-emerald-50 border-emerald-200" : "bg-slate-800/40 border-emerald-500/30")}>
                                        <Trophy className={clsx("w-6 h-6 mb-2", isCandyMode ? "text-emerald-500" : "text-emerald-400")} />
                                        <span className="text-2xl font-black">{profile?.longest_streak || 0}</span>
                                        <span className={clsx("text-[10px] font-bold uppercase tracking-widest", isCandyMode ? "text-slate-500" : "text-slate-400")}>Longest Streak</span>
                                    </div>
                                    <div className={clsx("col-span-2 p-4 rounded-2xl flex flex-col items-center justify-center border", isCandyMode ? "bg-slate-50 border-slate-200" : "bg-slate-800/40 border-slate-700")}>
                                        <span className={clsx("text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5", isCandyMode ? "text-slate-500" : "text-slate-400")}>
                                            <Phone size={12} /> Linked Mobile
                                        </span>
                                        <span className="font-medium text-sm">
                                            {isRealMobile(profile?.mobile) ? profile?.mobile : (
                                                <span className="text-slate-500 text-xs italic">Not linked (tap Edit Profile to add)</span>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {(followerCount !== null || followingCount !== null) && (
                                    <div className={clsx("mt-1 mb-8 flex items-center justify-center gap-6 text-xs font-bold uppercase tracking-widest relative z-10", isCandyMode ? "text-slate-500" : "text-slate-400")}>
                                        <div className="flex flex-col items-center">
                                            <span className={clsx("text-xl", isCandyMode ? "text-emerald-500" : "text-[#00f2ff]")}>{followerCount ?? '–'}</span>
                                            <span>Followers</span>
                                        </div>
                                        <div className={clsx("w-px h-8", isCandyMode ? "bg-slate-300" : "bg-slate-700")} />
                                        <div className="flex flex-col items-center">
                                            <span className={clsx("text-xl", isCandyMode ? "text-purple-500" : "text-[#d575ff]")}>{followingCount ?? '–'}</span>
                                            <span>Following</span>
                                        </div>
                                    </div>
                                )}

                                <div className="w-full max-w-md mx-auto flex flex-col gap-3 relative z-10">
                                    <button 
                                        onClick={() => { audioSynth.playClick(); setIsEditing(true); }}
                                        className={clsx(
                                            "w-full flex items-center justify-center gap-3 py-4 font-bold rounded-2xl transition-colors",
                                            isCandyMode
                                                ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                                : "bg-slate-700/50 hover:bg-slate-700 text-slate-200 border border-slate-600/50"
                                        )}
                                    >
                                        <Edit3 className={clsx("w-5 h-5", isCandyMode ? "text-slate-400" : "text-slate-400")} />
                                        Edit Profile
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="w-full flex flex-col items-start text-left relative z-10 gap-4 mt-2">
                                <h2 className={clsx("text-lg font-black w-full text-center mb-2", isCandyMode ? "text-slate-800" : "text-white")}>Edit Details</h2>
                                
                                <div className="w-full">
                                    <label className={clsx("block text-xs font-bold uppercase tracking-wider mb-2 ml-1", isCandyMode ? "text-slate-500" : "text-slate-400")}>Username</label>
                                    <UsernameField
                                        label=""
                                        value={usernameInput}
                                        onChange={setUsernameInput}
                                        status={isUsernameChanged ? usernameAvailability.status : 'idle'}
                                        errorMessage={isUsernameChanged ? usernameAvailability.errorMessage : null}
                                        disabled={isSaving}
                                    />
                                    {usernameError && (
                                        <p className="text-xs text-rose-500 font-bold mt-2 ml-1">{usernameError}</p>
                                    )}
                                    {usernameSuccess && (
                                        <p className={clsx("text-xs font-bold mt-2 ml-1", isCandyMode ? "text-emerald-500" : "text-[#00f2ff]")}>{usernameSuccess}</p>
                                    )}
                                </div>

                                <div className="w-full">
                                    <label className={clsx("block text-xs font-bold uppercase tracking-wider mb-2 ml-1", isCandyMode ? "text-slate-500" : "text-slate-400")}>Age</label>
                                    <input
                                        type="number"
                                        value={newAge}
                                        onChange={(e) => setNewAge(parseInt(e.target.value))}
                                        disabled={isSaving}
                                        className={clsx(
                                            "w-full font-bold rounded-2xl px-5 py-4 border focus:outline-none transition-all",
                                            isCandyMode
                                                ? "bg-slate-50 text-slate-800 border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
                                                : "bg-slate-900 text-white border-slate-700 focus:border-[#00f2ff] focus:ring-4 focus:ring-[#00f2ff]/20"
                                        )}
                                    />
                                </div>

                                <div className="w-full">
                                    <label className={clsx("block text-xs font-bold uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5", isCandyMode ? "text-slate-500" : "text-slate-400")}>
                                        <Phone size={12} /> Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="e.g. 9876543210 (10 digits)"
                                        value={mobileInput}
                                        onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        disabled={isSaving}
                                        className={clsx(
                                            "w-full font-bold rounded-2xl px-5 py-4 border focus:outline-none transition-all",
                                            isCandyMode
                                                ? "bg-slate-50 text-slate-800 border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
                                                : "bg-slate-900 text-white border-slate-700 focus:border-[#00f2ff] focus:ring-4 focus:ring-[#00f2ff]/20"
                                        )}
                                    />
                                    <p className="text-[11px] text-slate-500 mt-1.5 ml-1">
                                        Optional. Used to sign in to your AYA account via phone.
                                    </p>
                                </div>

                                <div className="w-full flex gap-3 mt-4">
                                    <button 
                                        onClick={() => { audioSynth.playClick(); setIsEditing(false); }}
                                        disabled={isSaving}
                                        className={clsx(
                                            "flex-1 flex items-center justify-center gap-2 py-4 font-bold rounded-2xl transition-colors disabled:opacity-50",
                                            isCandyMode
                                                ? "bg-slate-100 hover:bg-slate-200 text-slate-600"
                                                : "bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600"
                                        )}
                                    >
                                        <X className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    
                                    <button 
                                        onClick={handleSaveProfile}
                                        disabled={!canSave}
                                        className={clsx(
                                            "flex-1 flex items-center justify-center gap-2 py-4 font-bold rounded-2xl transition-colors shadow-md disabled:opacity-50 disabled:text-slate-500",
                                            isCandyMode
                                                ? "bg-emerald-500 hover:bg-emerald-600 text-white disabled:bg-slate-300"
                                                : "bg-[#00f2ff] hover:bg-[#00d2ff] text-slate-900 disabled:bg-slate-700"
                                        )}
                                    >
                                        <Check className="w-5 h-5" />
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
