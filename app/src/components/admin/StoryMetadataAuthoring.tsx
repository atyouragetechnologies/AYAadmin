import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { Save, Check, BookOpen } from 'lucide-react';
import { CHECKIN_TAGS } from '../../config/recommendationConfig';
import type { DnaTrait, ResolutionArchetype } from '../../types/ayaTypes';

export function StoryMetadataAuthoring() {
    const [storyList, setStoryList] = useState<any[]>([]);
    const [selectedStoryId, setSelectedStoryId] = useState<string>('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    // 13 Dimensions state
    const [dominantTrait, setDominantTrait] = useState<DnaTrait>('risk');
    const [resolutionArchetype, setResolutionArchetype] = useState<ResolutionArchetype>('persist');
    const [difficulty, setDifficulty] = useState<number>(3);
    const [isPremium, setIsPremium] = useState(false);
    const [whyTemplate, setWhyTemplate] = useState('');
    const [selectedSituations, setSelectedSituations] = useState<string[]>([]);
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
    const [semanticDesc, setSemanticDesc] = useState('');
    const [traitAffinity, setTraitAffinity] = useState<Record<DnaTrait, number>>({
        risk: 0.5,
        creativity: 0.5,
        vision: 0.5,
        empathy: 0.5,
        leadership: 0.5
    });

    useEffect(() => {
        fetchLevels();
    }, []);

    const fetchLevels = async () => {
        try {
            // Use offline generator instead of empty DB table
            const { generateLevels } = await import('../../utils/levelGenerator');
            const levels = generateLevels(18).map(l => ({
                id: l.id,
                title: l.title,
                scenario_id: l.scenarioId || l.id,
                age: l.age,
                theme: l.theme
            }));
            
            if (levels && levels.length > 0) {
                setStoryList(levels);
                setSelectedStoryId(levels[0].scenario_id);
                loadMetadataForStory(levels[0].scenario_id);
            }
        } catch (err) {
            console.error('Failed to load stories:', err);
        }
    };

    const loadMetadataForStory = async (storyId: string) => {
        try {
            const { data } = await supabase.from('story_metadata').select('*').eq('scenario_id', storyId).maybeSingle();
            if (data) {
                // Using existing states but mapping to new schema columns
                setResolutionArchetype(data.dilemma_type || 'persist');
                setDifficulty(data.difficulty === 'hard' ? 5 : data.difficulty === 'easy' ? 1 : 3);
                setIsPremium(data.is_premium || false);
                setSelectedSituations(data.situational_tags || []);
                // Fallbacks for fields not in new schema to avoid breaking UI state
                setDominantTrait('risk');
                setWhyTemplate(data.reflection_prompt || '');
                setSelectedEmotions([]);
                setSemanticDesc(data.historical_context || '');
                if (data.target_traits) {
                    setTraitAffinity({ ...traitAffinity, ...data.target_traits });
                }
            } else {
                // Reset to defaults
                setSelectedSituations([]);
                setSelectedEmotions([]);
                setWhyTemplate('');
                setSemanticDesc('');
            }
        } catch (err) {
            console.error('Failed to load metadata:', err);
        }
    };

    const handleStoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedStoryId(id);
        loadMetadataForStory(id);
    };

    const handleSave = async () => {
        if (!selectedStoryId) return;
        setSaveStatus('saving');

        const difficultyStr = difficulty > 3 ? 'hard' : difficulty < 3 ? 'easy' : 'moderate';

        const payload = {
            scenario_id: selectedStoryId,
            situational_tags: selectedSituations,
            dilemma_type: resolutionArchetype,
            target_traits: traitAffinity,
            difficulty: difficultyStr,
            is_premium: isPremium,
            reflection_prompt: whyTemplate.trim() || null,
            historical_context: semanticDesc.trim() || null,
            life_theme: 'growth', // fallback
            protagonist_lens: 'first_person' // fallback
        };

        try {
            const { error } = await supabase
                .from('story_metadata')
                .upsert(payload, { onConflict: 'scenario_id' });
            if (error) throw error;
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2500);
        } catch (err) {
            console.error('Failed to save story metadata:', err);
            setSaveStatus('error');
        }
    };

    const toggleTag = (tag: string, list: string[], setList: (arr: string[]) => void) => {
        if (list.includes(tag)) {
            setList(list.filter(t => t !== tag));
        } else {
            setList([...list, tag]);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl text-white">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-sm">
                        <BookOpen size={22} className="text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Story Metadata & 13-D Fingerprinting</h2>
                        <p className="text-xs text-slate-400">Author explainable recommendation parameters for the story catalog</p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                    {saveStatus === 'saved' ? <Check size={16} /> : <Save size={16} />}
                    <span>{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Fingerprint'}</span>
                </button>
            </div>

            {/* Select Story */}
            <div className="mb-6">
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
                    Select Target Story
                </label>
                <select
                    value={selectedStoryId}
                    onChange={handleStoryChange}
                    className="w-full bg-black/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-400"
                >
                    {storyList.map(s => (
                        <option key={s.scenario_id || s.id} value={s.scenario_id || s.id}>
                            Age {s.age || '?'} — {s.title} ({s.theme || 'General'})
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Dominant Trait */}
                <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Dominant Trait Tension
                    </label>
                    <select
                        value={dominantTrait}
                        onChange={e => setDominantTrait(e.target.value as DnaTrait)}
                        className="w-full bg-black/40 border border-slate-700 rounded-xl p-3 text-xs text-white"
                    >
                        <option value="risk">Risk</option>
                        <option value="creativity">Creativity</option>
                        <option value="vision">Vision</option>
                        <option value="empathy">Empathy</option>
                        <option value="leadership">Leadership</option>
                    </select>
                </div>

                {/* Resolution Archetype */}
                <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Resolution Archetype
                    </label>
                    <select
                        value={resolutionArchetype}
                        onChange={e => setResolutionArchetype(e.target.value as ResolutionArchetype)}
                        className="w-full bg-black/40 border border-slate-700 rounded-xl p-3 text-xs text-white"
                    >
                        <option value="overcome">Overcome</option>
                        <option value="persist">Persist</option>
                        <option value="adapt">Adapt</option>
                        <option value="pivot">Pivot</option>
                        <option value="accept">Accept</option>
                        <option value="create">Create</option>
                        <option value="lead">Lead</option>
                    </select>
                </div>
            </div>

            {/* Situation & Problem Tags */}
            <div className="mb-6">
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
                    Situation & Problem Relevance
                </label>
                <div className="flex flex-wrap gap-1.5">
                    {CHECKIN_TAGS.situation.map(s => (
                        <button
                            key={s.value}
                            onClick={() => toggleTag(s.value, selectedSituations, setSelectedSituations)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                selectedSituations.includes(s.value)
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
                            }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Emotional Tags */}
            <div className="mb-6">
                <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                    Emotional State Addressed
                </label>
                <div className="flex flex-wrap gap-1.5">
                    {CHECKIN_TAGS.emotional.map(e => (
                        <button
                            key={e.value}
                            onClick={() => toggleTag(e.value, selectedEmotions, setSelectedEmotions)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                selectedEmotions.includes(e.value)
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
                            }`}
                        >
                            {e.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Why This Story Template */}
            <div className="mb-6">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    "Why This Story?" Explainability Template (Interpolates {'{user_problem}'}, {'{trait}'})
                </label>
                <textarea
                    value={whyTemplate}
                    onChange={e => setWhyTemplate(e.target.value)}
                    placeholder="e.g. You're dealing with {user_problem}. This story explores how someone navigated a similar moment using {trait}."
                    className="w-full p-3 rounded-xl bg-black/40 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-400 resize-none h-20"
                />
            </div>

            {/* Premium toggle */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <input
                    type="checkbox"
                    id="premiumCheck"
                    checked={isPremium}
                    onChange={e => setIsPremium(e.target.checked)}
                    className="w-4 h-4 accent-purple-500 rounded"
                />
                <label htmlFor="premiumCheck" className="text-xs font-bold uppercase tracking-wider text-slate-200 cursor-pointer">
                    Mark as AYA+ Premium Story (Requires subscription)
                </label>
            </div>
        </div>
    );
}
