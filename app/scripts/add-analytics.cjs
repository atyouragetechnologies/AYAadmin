const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'AYA-master', 'src', 'pages', 'AdminPanelPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add Lucide imports
content = content.replace(
  "import { ChevronLeft, Send, AlertTriangle, UserPlus, Trash2, Shield } from 'lucide-react';",
  "import { ChevronLeft, Send, AlertTriangle, UserPlus, Trash2, Shield, Search, BarChart2, Activity } from 'lucide-react';"
);

const searchAnalyticsComponent = `

// --- SEARCH ANALYTICS COMPONENT ---
function SearchAnalyticsView() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<number>(7); // 7, 30, 0 (all)

    useEffect(() => {
        loadLogs();
    }, [range]);

    const loadLogs = async () => {
        setLoading(true);
        let query = supabase.from('search_logs').select('*').order('created_at', { ascending: false });
        if (range !== 0) {
            const date = new Date();
            date.setDate(date.getDate() - range);
            query = query.gte('created_at', date.toISOString());
        }
        const { data } = await query;
        setLogs(data || []);
        setLoading(false);
    };

    // 1. Top searched terms
    const topSearches = Object.entries(
        logs.reduce((acc, log) => {
            acc[log.query] = (acc[log.query] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]).slice(0, 10);

    // 2. Personality vs Situation
    const isPersonality = (log: any) => /[A-Z]/.test(log.query_original);
    const personalityCount = logs.filter(isPersonality).length;
    const situationCount = logs.length - personalityCount;

    // 3. Unmatched volume over time
    const unmatchedByDate = Object.entries(
        logs.filter(l => !l.matched).reduce((acc, log) => {
            const date = new Date(log.created_at).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).sort((a, b) => a[0].localeCompare(b[0])).slice(-14);

    // 4. Raw recent searches
    const recentSearches = logs.slice(0, 50);

    // 5. Most requested missing personalities
    const missingPersonalities = Object.entries(
        logs.filter(l => !l.matched && isPersonality(l)).reduce((acc, log) => {
            acc[log.query] = (acc[log.query] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]).slice(0, 10);

    return (
        <div className="glass-panel rounded-3xl p-6 md:p-8 mt-8 border border-[#00f2ff]/20 shadow-[0_0_30px_rgba(0,242,255,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f2ff]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-center mb-8 relative z-10">
                <h2 className="text-xl font-bold text-[#00f2ff] flex items-center gap-2">
                    <Search size={20} /> Search Analytics
                </h2>
                <select 
                    value={range} 
                    onChange={e => setRange(Number(e.target.value))}
                    className="bg-black/40 border border-[#00f2ff]/30 rounded-xl px-3 py-1.5 text-sm text-[#00f2ff] outline-none"
                >
                    <option value={7}>Last 7 Days</option>
                    <option value={30}>Last 30 Days</option>
                    <option value={0}>All Time</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center text-[#00f2ff]/60 py-10 animate-pulse">Loading analytics...</div>
            ) : logs.length === 0 ? (
                <div className="text-center text-[#00f2ff]/60 py-10">No search logs found for this period.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    
                    {/* Top Searches */}
                    <div className="bg-black/30 border border-[#00f2ff]/10 rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <BarChart2 size={16} className="text-[#00f2ff]" /> Top Searches
                        </h3>
                        <div className="space-y-2">
                            {topSearches.map(([q, count], i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <span className="text-slate-300">{q}</span>
                                    <span className="text-[#00f2ff] font-bold bg-[#00f2ff]/10 px-2 rounded-md">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Missing Personalities */}
                    <div className="bg-black/30 border border-fuchsia-500/20 rounded-2xl p-5 shadow-[inset_0_0_20px_rgba(217,70,239,0.05)]">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <Activity size={16} className="text-fuchsia-400" /> Missing Requests
                        </h3>
                        <div className="space-y-2">
                            {missingPersonalities.length === 0 ? (
                                <p className="text-sm text-slate-500">No missing personalities noted.</p>
                            ) : missingPersonalities.map(([q, count], i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <span className="text-fuchsia-200 capitalize">{q}</span>
                                    <span className="text-fuchsia-400 font-bold bg-fuchsia-400/10 px-2 rounded-md">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Split & Volume */}
                    <div className="bg-black/30 border border-[#00f2ff]/10 rounded-2xl p-5 flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-6">
                            <div className="text-center">
                                <div className="text-3xl font-black text-[#00f2ff]">{personalityCount}</div>
                                <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Personalities</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-slate-500">vs</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-emerald-400">{situationCount}</div>
                                <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Situations</div>
                            </div>
                        </div>
                        <div className="border-t border-white/5 pt-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Unmatched Volume (Last 14 days)</h4>
                            <div className="flex items-end gap-1 h-16 w-full opacity-80">
                                {unmatchedByDate.length === 0 && <span className="text-xs text-slate-600">No unmatched data</span>}
                                {unmatchedByDate.map(([date, count], i) => {
                                    const max = Math.max(...unmatchedByDate.map(d => d[1]), 1);
                                    const height = Math.max(10, (count / max) * 100);
                                    return (
                                        <div key={i} className="flex-1 flex flex-col justify-end group relative">
                                            <div className="w-full bg-fuchsia-500/50 hover:bg-fuchsia-400 rounded-t-sm transition-all" style={{ height: \`\${height}%\` }} />
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-xs px-1 rounded hidden group-hover:block z-20">
                                                {count}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Raw Feed */}
                    <div className="bg-black/30 border border-[#00f2ff]/10 rounded-2xl p-5 md:col-span-2">
                        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Live Search Feed</h3>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                            {recentSearches.map(log => (
                                <div key={log.id} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className={clsx(
                                            "w-2 h-2 rounded-full",
                                            log.matched ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500 shadow-[0_0_8px_#ef4444]"
                                        )} />
                                        <span className="text-slate-300 font-medium">"{log.query_original}"</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span>{isPersonality(log) ? 'Person' : 'Situation'}</span>
                                        <span>{new Date(log.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
`;

const insertionPoint = "                    </div>\n                </div>\n            </div>\n        </div>\n    );\n}";
const replacement = "                    </div>\n                </div>\n\n                <SearchAnalyticsView />\n            </div>\n        </div>\n    );\n}\n" + searchAnalyticsComponent;

content = content.replace(insertionPoint, replacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated AdminPanelPage.tsx');
