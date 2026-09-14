/**
 * storyRequestService.ts
 *
 * Manages user demand signals when no story matches a selected situation.
 * Saves notification requests and provides aggregate demand data for Admins.
 */

import { supabase } from '../utils/supabase';
import { CHECKIN_TAGS } from '../config/recommendationConfig';
import { STORY_METADATA, type StoryMetadata } from '../data/storyMetadata';

export interface StoryRequestEntry {
    id?: string;
    user_id?: string | null;
    requested_tag: string;
    requested_problem?: string;
    requested_age?: number | null;
    status?: 'active' | 'notified' | 'dismissed';
    created_at?: string;
    notified_at?: string;
}

export interface StoryRequestSummary {
    requested_tag: string;
    requested_problem?: string;
    count: number;
    most_recent: string;
    status: string;
    ages: number[];
    ageCounts: Record<number, number>;
}

export interface ContentGapItem {
    tag: string;
    label: string;
    category: 'situation' | 'problem' | 'intent';
    missingAges: number[];
    totalStoriesInLibrary: number;
    requestCount: number;
}

/**
 * Log a user's request to be notified when content for a situation becomes available.
 */
export async function logStoryRequest(
    userId: string | undefined,
    requestedTag: string,
    requestedProblem?: string,
    requestedAge?: number
): Promise<{ success: boolean; id?: string }> {
    const age = Number(requestedAge) || 18;

    // 1. Save to LocalStorage immediately (Always succeeds & offline-first)
    try {
        const stored: any[] = JSON.parse(localStorage.getItem('aya_user_story_requests') || '[]');
        if (!stored.some((r: any) => r.tag === requestedTag && r.age === age)) {
            stored.push({
                tag: requestedTag,
                problem: requestedProblem || requestedTag,
                age,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('aya_user_story_requests', JSON.stringify(stored));
        }
    } catch {}

    try {
        const cleanUserId = userId && !userId.startsWith('offline-') ? userId : null;
        
        let { data, error } = await supabase
            .from('story_requests')
            .insert({
                user_id: cleanUserId,
                requested_tag: requestedTag,
                requested_problem: requestedProblem || requestedTag,
                requested_age: age,
                status: 'active',
            })
            .select('id')
            .maybeSingle();

        // If requested_age column doesn't exist yet or foreign key fails, fallback gracefully
        if (error) {
            const retryPayload: any = {
                user_id: null,
                requested_tag: requestedTag,
                requested_problem: requestedProblem || requestedTag,
                status: 'active',
            };
            const retry = await supabase
                .from('story_requests')
                .insert(retryPayload)
                .select('id')
                .maybeSingle();
            data = retry.data;
            error = retry.error;
        }

        if (error) {
            console.warn('[storyRequestService] Supabase insert note (stored locally):', error.message);
            return { success: true };
        }

        return { success: true, id: data?.id };
    } catch (err) {
        console.warn('[storyRequestService] Stored locally:', err);
        return { success: true };
    }
}

/**
 * Fetch aggregated story request demand for the Admin dashboard.
 */
export async function getStoryRequestsSummary(): Promise<StoryRequestSummary[]> {
    try {
        const { data, error } = await supabase
            .from('story_requests')
            .select('*')
            .order('created_at', { ascending: false });

        const rows: any[] = (error || !data) ? [] : [...data];

        // Also merge any offline/local requests if available
        try {
            const localStored = JSON.parse(localStorage.getItem('aya_user_story_requests') || '[]');
            localStored.forEach((lr: any) => {
                if (!rows.some(r => r.requested_tag === lr.tag && (r.requested_age === lr.age || !r.requested_age))) {
                    rows.push({
                        requested_tag: lr.tag,
                        requested_problem: lr.problem,
                        requested_age: lr.age || 18,
                        created_at: lr.timestamp || new Date().toISOString(),
                        status: 'active'
                    });
                }
            });
        } catch {}

        if (rows.length === 0) return [];

        // Aggregate by tag
        const summaryMap: Record<string, {
            requested_problem?: string;
            count: number;
            most_recent: string;
            status: string;
            ageCounts: Record<number, number>;
        }> = {};

        rows.forEach((row) => {
            const tag = row.requested_tag;
            const age = row.requested_age || 18;

            if (!summaryMap[tag]) {
                summaryMap[tag] = {
                    requested_problem: row.requested_problem || tag,
                    count: 0,
                    most_recent: row.created_at || new Date().toISOString(),
                    status: row.status || 'active',
                    ageCounts: {}
                };
            }
            summaryMap[tag].count += 1;
            summaryMap[tag].ageCounts[age] = (summaryMap[tag].ageCounts[age] || 0) + 1;

            if (row.created_at && new Date(row.created_at) > new Date(summaryMap[tag].most_recent)) {
                summaryMap[tag].most_recent = row.created_at;
            }
        });

        return Object.entries(summaryMap).map(([requested_tag, info]) => ({
            requested_tag,
            requested_problem: info.requested_problem,
            count: info.count,
            most_recent: info.most_recent,
            status: info.status,
            ages: Object.keys(info.ageCounts).map(Number).sort((a, b) => a - b),
            ageCounts: info.ageCounts,
        })).sort((a, b) => b.count - a.count);

    } catch (err) {
        console.error('[storyRequestService] Error fetching request summary:', err);
        return [];
    }
}

/**
 * Analyze content gaps: Find situation/problem tags with 0 stories across specific ages.
 */
export function getLibraryContentGaps(selectedAge?: number): ContentGapItem[] {
    const targetAges = selectedAge ? [selectedAge] : [16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
    const gaps: ContentGapItem[] = [];

    // Check all situation tags
    CHECKIN_TAGS.situation.forEach(sit => {
        let totalStories = 0;
        const missingAges: number[] = [];

        targetAges.forEach(age => {
            const matches = STORY_METADATA.filter((m: StoryMetadata) => 
                ((m.ageMin ?? 0) <= age && (m.ageMax ?? 99) >= age) &&
                (m.situationTags.includes(sit.value) || m.problemTags.includes(sit.value) || m.intentTags.includes(sit.value))
            );
            if (matches.length === 0) {
                missingAges.push(age);
            } else {
                totalStories += matches.length;
            }
        });

        if (missingAges.length > 0) {
            gaps.push({
                tag: sit.value,
                label: sit.label,
                category: 'situation',
                missingAges,
                totalStoriesInLibrary: totalStories,
                requestCount: 0
            });
        }
    });

    return gaps;
}
