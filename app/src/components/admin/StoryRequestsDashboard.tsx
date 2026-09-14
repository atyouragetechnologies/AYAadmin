import { useEffect, useState, useMemo } from 'react';
import { getStoryRequestsSummary, getLibraryContentGaps, type StoryRequestSummary, type ContentGapItem } from '../../services/storyRequestService';
import { CHECKIN_TAGS } from '../../config/recommendationConfig';
import { BarChart2, Bell, Clock, Calendar, Sparkles, Filter, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export function StoryRequestsDashboard() {
    const [requests, setRequests] = useState<StoryRequestSummary[]>([]);
    const [contentGaps, setContentGaps] = useState<ContentGapItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [selectedAge, setSelectedAge] = useState<number | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'requests' | 'gaps'>('requests');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [reqData, gapsData] = await Promise.all([
                getStoryRequestsSummary(),
                getLibraryContentGaps(selectedAge === 'all' ? undefined : selectedAge)
            ]);
            setRequests(reqData);
            setContentGaps(gapsData);
            setLoading(false);
        };
        fetchData();
    }, [selectedAge]);

    const getLabel = (tag: string) => {
        const found = CHECKIN_TAGS.situation.find(s => s.value === tag);
        if (found) return found.label;
        return tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Filter requests based on selectedAge and searchTerm
    const filteredRequests = useMemo(() => {
        return requests.filter(r => {
            // Age filter
            if (selectedAge !== 'all' && !r.ages.includes(selectedAge)) {
                return false;
            }
            // Search term
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const label = getLabel(r.requested_tag).toLowerCase();
                const tag = r.requested_tag.toLowerCase();
                const prob = (r.requested_problem || '').toLowerCase();
                return label.includes(term) || tag.includes(term) || prob.includes(term);
            }
            return true;
        });
    }, [requests, selectedAge, searchTerm]);

    // Filter content gaps based on searchTerm
    const filteredGaps = useMemo(() => {
        return contentGaps.filter(g => {
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                return g.label.toLowerCase().includes(term) || g.tag.toLowerCase().includes(term);
            }
            return true;
        });
    }, [contentGaps, searchTerm]);

    const totalRequestsCount = useMemo(() => {
        return requests.reduce((acc, r) => acc + r.count, 0);
    }, [requests]);

    const availableAges = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

    if (loading) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 font-mono text-sm animate-pulse shadow-xl">
                Loading story demand signals & age breakdowns...
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl text-white">
            
            {/* Header with Title & Aggregate Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <BarChart2 size={22} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-white">
                            Required Stories Demand
                        </h2>
                    </div>
                    <p className="text-xs text-slate-400">
                        Real-time signals showing <span className="text-cyan-400 font-semibold">what stories</span>, <span className="text-indigo-400 font-semibold">which tags</span>, and <span className="text-rose-400 font-semibold">which target ages</span> users are actively asking for.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs">
                        <span className="text-slate-500 uppercase text-[10px] block font-bold">Total Demand</span>
                        <span className="text-base font-black text-white">{totalRequestsCount}</span> <span className="text-slate-400">Requests</span>
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-indigo-400 font-mono text-xs">
                        <span className="text-slate-500 uppercase text-[10px] block font-bold">Unique Topics</span>
                        <span className="text-base font-black text-white">{requests.length}</span> <span className="text-slate-400">Tags</span>
                    </div>
                </div>
            </div>

            {/* View Mode Tabs & Search Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
                
                {/* Tab Switcher */}
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 self-start">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                            activeTab === 'requests'
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                : "text-slate-400 hover:text-slate-200"
                        )}
                    >
                        <Bell size={14} />
                        User Demand Signals ({requests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('gaps')}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                            activeTab === 'gaps'
                                ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                                : "text-slate-400 hover:text-slate-200"
                        )}
                    >
                        <AlertCircle size={14} />
                        Content Gaps / 0 Stories ({contentGaps.length})
                    </button>
                </div>

                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by topic, tag (#...), or situation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Age Filter Badges */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 shrink-0 mr-1">
                    <Filter size={13} /> Filter by Age:
                </div>
                <button
                    onClick={() => setSelectedAge('all')}
                    className={clsx(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 font-mono",
                        selectedAge === 'all'
                            ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                            : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                    )}
                >
                    All Ages
                </button>
                {availableAges.map(age => (
                    <button
                        key={age}
                        onClick={() => setSelectedAge(age)}
                        className={clsx(
                            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 font-mono flex items-center gap-1",
                            selectedAge === age
                                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400"
                                : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                        )}
                    >
                        Age {age}
                    </button>
                ))}
            </div>

            {/* TAB 1: User Demand Requests */}
            {activeTab === 'requests' && (
                <div>
                    {filteredRequests.length === 0 ? (
                        <div className="p-8 text-center bg-slate-950/60 rounded-3xl border border-slate-800">
                            <CheckCircle2 size={32} className="mx-auto mb-2 text-slate-600" />
                            <p className="text-sm font-bold text-slate-400 mb-1">No pending story requests found</p>
                            <p className="text-xs text-slate-600">
                                {selectedAge !== 'all' ? `No demand requests recorded specifically for Age ${selectedAge}.` : 'No zero-result story requests logged yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3.5">
                            {filteredRequests.map(req => (
                                <div 
                                    key={req.requested_tag}
                                    className="p-5 rounded-2xl bg-slate-950/80 border border-purple-500/20 hover:border-cyan-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg group"
                                >
                                    {/* Left: Required Story Topic & Tag */}
                                    <div className="flex items-start gap-3.5">
                                        <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                                            <Bell size={20} />
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h4 className="text-base font-black text-white tracking-wide">
                                                    {getLabel(req.requested_tag)}
                                                </h4>
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                                                    #{req.requested_tag}
                                                </span>
                                            </div>

                                            {/* Target Ages Badges */}
                                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                                                    <Calendar size={12} className="text-purple-400" /> Target Ages:
                                                </span>
                                                {req.ages.map(age => {
                                                    const count = req.ageCounts[age] || 1;
                                                    return (
                                                        <span 
                                                            key={age}
                                                            className={clsx(
                                                                "px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 border",
                                                                selectedAge === age
                                                                    ? "bg-purple-600 text-white border-purple-400 shadow-sm"
                                                                    : "bg-slate-900 text-purple-200 border-purple-500/30"
                                                            )}
                                                        >
                                                            Age {age}
                                                            <span className="text-[10px] text-cyan-300 font-black opacity-90">({count})</span>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Metrics & Status */}
                                    <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800/80 shrink-0">
                                        <div className="text-left md:text-right">
                                            <div className="flex items-baseline gap-1.5 md:justify-end">
                                                <span className="text-2xl font-black text-cyan-400 font-mono">
                                                    {req.count}
                                                </span>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                    {req.count === 1 ? 'Req' : 'Reqs'}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-purple-300 font-mono block">
                                                {req.count >= 5 ? '🔥 High Demand' : 'Demand Signal'}
                                            </span>
                                        </div>

                                        <div className="text-right hidden sm:block">
                                            <span className="text-xs text-slate-300 font-mono flex items-center justify-end gap-1">
                                                <Clock size={12} className="text-slate-500" />
                                                {new Date(req.most_recent).toLocaleDateString()}
                                            </span>
                                            <span className="text-[10px] text-slate-500 block uppercase tracking-wider">
                                                Most Recent
                                            </span>
                                        </div>

                                        <div className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono shadow-inner">
                                            {req.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: Content Gaps Matrix */}
            {activeTab === 'gaps' && (
                <div>
                    <div className="mb-4 p-4 rounded-2xl bg-pink-950/30 border border-pink-500/20 text-xs text-pink-200 flex items-center gap-3">
                        <Sparkles size={18} className="text-pink-400 shrink-0" />
                        <div>
                            <span className="font-bold">Content Gap Intelligence:</span> Shows situation topics where <span className="font-bold text-white">0 stories are currently authored</span> for the selected age. Authoring stories here fulfills immediate unmet demand.
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {filteredGaps.map(gap => (
                            <div 
                                key={gap.tag}
                                className="p-4 rounded-2xl bg-slate-950/70 border border-pink-500/20 hover:border-pink-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                            >
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                        <h4 className="text-sm font-bold text-white tracking-wide">
                                            {gap.label}
                                        </h4>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-pink-950/80 text-pink-300 border border-pink-500/30 font-bold">
                                            #{gap.tag}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Missing across:
                                        </span>
                                        {gap.missingAges.map(age => (
                                            <span 
                                                key={age} 
                                                className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-900 border border-pink-500/30 text-pink-200"
                                            >
                                                Age {age}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 self-end md:self-center">
                                    <span className="text-xs text-slate-400 font-mono">
                                        {gap.totalStoriesInLibrary} Total in Library
                                    </span>
                                    <div className="px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-rose-950/80 border border-rose-500/40 text-rose-300 font-mono">
                                        Authoring Gap
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

