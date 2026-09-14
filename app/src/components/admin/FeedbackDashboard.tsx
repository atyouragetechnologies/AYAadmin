import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../utils/supabase';
import {
  getTopRequestedPersonalities,
  getGlobalSentimentDistribution,
  getGlobalDifficultyStats,
  getFeatureUsageStats,
  getStoryAnalytics,
  getUserAnalytics,
  getAllJourneyIds,
  getStoryInfo,
  getFrameDetails
} from '../../utils/feedbackUtils';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { STORY_METADATA } from '../../data/storyMetadata';
import { STORY_DATABASE } from '../../data/scenarios';
import './FeedbackDashboard.css';



export function FeedbackDashboard() {
  const [activeTab, setActiveTab] = useState<'global' | 'story' | 'user'>('global');
  
  // Global Data
  const [topPersonalities, setTopPersonalities] = useState<any[]>([]);
  const [topSearches, setTopSearches] = useState<any[]>([]);
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [difficultyData, setDifficultyData] = useState<any>(null);
  const [featureData, setFeatureData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Story Data
  const [storyIds, setStoryIds] = useState<string[]>([]);
  const [selectedStory, setSelectedStory] = useState('');
  const [storyAnalytics, setStoryAnalytics] = useState<any>(null);

  // User Data
  const [searchUserId, setSearchUserId] = useState('');
  const [userAnalytics, setUserAnalytics] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(false);

  const selectedStoryInfo = useMemo(() => getStoryInfo(selectedStory), [selectedStory]);

  useEffect(() => {
    loadDashboardData();
    loadStoryList();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [personalities, sentiment, difficulty, features] = await Promise.all([
        getTopRequestedPersonalities(10),
        getGlobalSentimentDistribution(),
        getGlobalDifficultyStats(),
        getFeatureUsageStats()
      ]);

      setTopPersonalities(personalities || []);
      setSentimentData(sentiment);
      setDifficultyData(difficulty);
      setFeatureData(features || []);

      const { data: searches, error: searchError } = await supabase.from('unmatched_searches').select('search_query');
      if (!searchError && searches) {
        const counts = searches.reduce((acc: any, item: any) => {
          acc[item.search_query] = (acc[item.search_query] || 0) + 1;
          return acc;
        }, {});
        
        const sortedSearches = Object.entries(counts)
            .map(([query, count]) => ({ search_query: query, count }))
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 10);
            
        setTopSearches(sortedSearches);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStoryList = async () => {
    const dbIds = await getAllJourneyIds();
    // Include all known stories so admin can inspect any story
    const allKnownIds = Array.from(new Set([
      ...dbIds, 
      ...Object.keys(STORY_DATABASE), 
      ...STORY_METADATA.map(m => m.storyId)
    ]));
    
    // Sort stories: played stories first, then alphabetically by personality
    allKnownIds.sort((a, b) => {
      const aHasData = dbIds.includes(a);
      const bHasData = dbIds.includes(b);
      if (aHasData !== bHasData) return aHasData ? -1 : 1;
      const infoA = getStoryInfo(a);
      const infoB = getStoryInfo(b);
      return infoA.personality.localeCompare(infoB.personality);
    });

    setStoryIds(allKnownIds);
    if (allKnownIds.length > 0) {
      const initial = dbIds.length > 0 ? dbIds[0] : allKnownIds[0];
      setSelectedStory(initial);
      handleStorySelect(initial);
    }
  };

  const handleStorySelect = async (id: string) => {
    setSelectedStory(id);
    const data = await getStoryAnalytics(id);
    setStoryAnalytics(data);
  };

  const handleUserSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUserId.trim()) return;
    setUserLoading(true);
    const data = await getUserAnalytics(searchUserId.trim());
    setUserAnalytics(data);
    setUserLoading(false);
  };

  if (loading) {
    return <div className="dashboard-loading">Loading advanced analytics...</div>;
  }

  return (
    <div className="feedback-dashboard">
      <div className="flex justify-between items-center w-full mb-6 gap-2">
        <h1 className="m-0 text-xl md:text-2xl font-bold truncate">📊 Advanced Analytics</h1>
        <button onClick={() => { loadDashboardData(); loadStoryList(); }} className="refresh-btn m-0 flex-shrink-0">🔄 Refresh</button>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-4 mb-6 border-b border-slate-800 pb-4">
        <button className={`px-3 md:px-4 py-2 text-sm md:text-base rounded-lg font-bold transition-colors ${activeTab === 'global' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`} onClick={() => setActiveTab('global')}>Global</button>
        <button className={`px-3 md:px-4 py-2 text-sm md:text-base rounded-lg font-bold transition-colors ${activeTab === 'story' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`} onClick={() => setActiveTab('story')}>Story Analysis</button>
        <button className={`px-3 md:px-4 py-2 text-sm md:text-base rounded-lg font-bold transition-colors ${activeTab === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`} onClick={() => setActiveTab('user')}>User Analysis</button>
      </div>

      {/* GLOBAL TAB */}
      {activeTab === 'global' && (
        <div className="global-tab">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 w-full">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-4xl mb-2">🎭</span>
              <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider m-0">Total Feedbacks</h3>
              <p className="text-3xl font-black text-white m-0">{sentimentData?.total || 0}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-4xl mb-2">⭐</span>
              <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider m-0">Avg Sentiment</h3>
              <p className="text-3xl font-black text-amber-400 m-0">{sentimentData?.avgSentiment || '0.0'}/4.0</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-4xl mb-2">📈</span>
              <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider m-0">Avg Difficulty</h3>
              <p className="text-3xl font-black text-rose-400 m-0">{difficultyData?.avgDifficulty || '0.0'}/5.0</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-4xl mb-2">🌟</span>
              <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider m-0">Top Personality</h3>
              <p className="text-xl font-bold text-emerald-400 m-0 truncate w-full">{topPersonalities[0]?.personality_name || 'N/A'}</p>
            </div>
          </div>

          <div className="dashboard-grid">
            <section className="dashboard-card" style={{ minHeight: '350px' }}>
              <h2>😍 Global Sentiment Distribution</h2>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={sentimentData?.distribution || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent = 0 }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {(sentimentData?.distribution || []).map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="dashboard-card" style={{ minHeight: '350px' }}>
              <h2>🎢 Story Difficulty Ratings</h2>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer>
                  <BarChart data={difficultyData?.distribution || []} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                    <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="dashboard-card" style={{ minHeight: '350px' }}>
              <h2>🚀 Feature Usage</h2>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer>
                  <BarChart data={featureData.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" stroke="#94a3b8" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                    <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="count" fill="#ec4899" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="dashboard-card">
              <h2>🎯 Top Wishlisted Personalities</h2>
              <table className="data-table">
                <thead>
                  <tr><th>Rank</th><th>Personality</th><th>Votes</th></tr>
                </thead>
                <tbody>
                  {topPersonalities.slice(0, 10).map((item, idx) => (
                    <tr key={idx}><td>{idx + 1}</td><td>{item.personality_name}</td><td className="highlight">{item.vote_count}</td></tr>
                  ))}
                  {topPersonalities.length === 0 && <tr><td colSpan={3} className="text-center text-slate-500 py-4">No data available</td></tr>}
                </tbody>
              </table>
            </section>
            
            <section className="dashboard-card md:col-span-2">
              <h2>🔍 Top Unmatched Searches (Demand Signals)</h2>
              <table className="data-table">
                <thead>
                  <tr><th>Rank</th><th>Search Query</th><th>Count</th></tr>
                </thead>
                <tbody>
                  {topSearches.slice(0, 10).map((item, idx) => (
                    <tr key={idx}><td>{idx + 1}</td><td>{item.search_query}</td><td className="highlight">{item.count}</td></tr>
                  ))}
                  {topSearches.length === 0 && <tr><td colSpan={3} className="text-center text-slate-500 py-4">No data available</td></tr>}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      )}

      {/* STORY TAB */}
      {activeTab === 'story' && (
        <div className="story-tab flex flex-col gap-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-white m-0">Select Story to Inspect</h2>
              <span className="text-xs text-slate-400 font-mono">
                {storyIds.length} Total Stories Available
              </span>
            </div>

            <select 
              className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl outline-none focus:border-indigo-500 text-sm font-medium"
              value={selectedStory} 
              onChange={(e) => handleStorySelect(e.target.value)}
            >
              {storyIds.length === 0 && <option value="">No stories played yet</option>}
              {storyIds.map(id => {
                const info = getStoryInfo(id);
                const ageLabel = info.age ? ` (Age ${info.age})` : '';
                return (
                  <option key={id} value={id}>
                    {info.personality}{ageLabel} — {info.title} [{id}]
                  </option>
                );
              })}
            </select>
          </div>

          {/* Story Details Context Banner */}
          {selectedStoryInfo && (
            <div className="bg-slate-900 border border-indigo-500/30 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-4">
                {selectedStoryInfo.avatar && (
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/10 overflow-hidden shrink-0 shadow-inner">
                    <img 
                      src={selectedStoryInfo.avatar} 
                      alt={selectedStoryInfo.personality} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-white m-0">
                      {selectedStoryInfo.personality}
                    </h3>
                    {selectedStoryInfo.age && (
                      <span className="text-xs bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 px-2 py-0.5 rounded-full font-mono font-bold">
                        Age {selectedStoryInfo.age}
                      </span>
                    )}
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                      {selectedStory}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm mt-1 mb-0 font-medium">
                    {selectedStoryInfo.title}
                  </p>
                </div>
              </div>
            </div>
          )}

          {storyAnalytics ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center">
                  <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">Completions</h3>
                  <p className="text-3xl font-black text-emerald-400 m-0">{storyAnalytics.completions}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center">
                  <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">Abandons (Drops)</h3>
                  <p className="text-3xl font-black text-rose-400 m-0">{storyAnalytics.abandons}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center">
                  <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">Completion Rate</h3>
                  <p className="text-3xl font-black text-amber-400 m-0">{storyAnalytics.completionRate}</p>
                </div>
              </div>

              <div className="dashboard-grid">
                <section className="dashboard-card">
                  <h2>⏱️ Avg Time Taken Per Frame</h2>
                  <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer>
                      <BarChart data={storyAnalytics.avgFrameTimes.slice(0, 10)} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <XAxis dataKey="frame_id" stroke="#94a3b8" fontSize={10} angle={-45} textAnchor="end" />
                        <YAxis stroke="#94a3b8" fontSize={12} unit="s" />
                        <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                        <Bar dataKey="avg_time_s" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Avg Time (s)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="dashboard-card overflow-auto max-h-[420px]">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="m-0 text-base font-bold text-white">📊 Choice Distribution & Decisions</h2>
                    <span className="text-xs text-slate-400 font-mono">
                      {Object.keys(storyAnalytics.choiceDistribution).length} Scenes
                    </span>
                  </div>

                  <table className="data-table w-full text-sm">
                    <thead>
                      <tr>
                        <th className="w-1/3">Scene / Question</th>
                        <th className="w-1/3">Player Decision</th>
                        <th className="w-1/4 text-right">Picks & Share</th>
                        <th className="w-12 text-right">XP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(storyAnalytics.choiceDistribution).map(([frameId, choices]: [string, any]) => {
                        const frameDetails = getFrameDetails(selectedStory, frameId);
                        const totalFrameChoices = Object.values(choices).reduce((a: any, b: any) => a + Number(b), 0) as number;

                        return Object.entries(choices).map(([choice, count]: [string, any], idx) => {
                          const countNum = Number(count);
                          const percent = totalFrameChoices > 0 ? Math.round((countNum / totalFrameChoices) * 100) : 0;
                          const choiceMeta = frameDetails.choicesMap[choice];

                          return (
                            <tr key={`${frameId}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                              <td className="text-slate-300 align-top">
                                <div className="font-mono text-xs text-cyan-400 font-bold">{frameId}</div>
                                {frameDetails.prompt && (
                                  <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 italic">
                                    "{frameDetails.prompt}"
                                  </div>
                                )}
                              </td>
                              <td className="text-white font-medium align-top">
                                <div>{choice}</div>
                                {choiceMeta?.feedbackTitle && (
                                  <div className="text-[10px] text-purple-300/80 mt-0.5">
                                    {choiceMeta.feedbackTitle}
                                  </div>
                                )}
                              </td>
                              <td className="text-right align-top">
                                <div className="text-indigo-300 font-bold text-xs">{countNum} ({percent}%)</div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                                  <div 
                                    className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </td>
                              <td className="text-right align-top">
                                {choiceMeta?.score !== undefined ? (
                                  <span className={`text-[11px] font-bold font-mono px-1.5 py-0.5 rounded ${
                                    choiceMeta.score > 0 
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                      : choiceMeta.score < 0 
                                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                        : 'bg-slate-800 text-slate-400'
                                  }`}>
                                    {choiceMeta.score > 0 ? `+${choiceMeta.score}` : choiceMeta.score}
                                  </span>
                                ) : (
                                  <span className="text-slate-600 text-xs">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      })}
                      {Object.keys(storyAnalytics.choiceDistribution).length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center text-slate-500 py-6">
                            No player choices logged for this story yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </section>
              </div>
            </>
          ) : (
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center text-slate-500">
              Select a story above to view detailed analytics.
            </div>
          )}
        </div>
      )}

      {/* USER TAB */}
      {activeTab === 'user' && (
        <div className="user-tab flex flex-col gap-6">
          <form onSubmit={handleUserSearch} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Search user by Username (e.g. Tanishksuede2), Phone, or UUID..." 
              className="flex-1 bg-slate-950 border border-slate-700 text-white p-3 rounded-xl outline-none focus:border-indigo-500 text-sm"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-colors whitespace-nowrap">
              Search User
            </button>
          </form>

          {userLoading && <div className="text-center p-8 text-indigo-400 font-bold">Loading user analytics...</div>}
          
          {!userLoading && userAnalytics ? (
            <div className="animate-fade-in flex flex-col gap-6">
              {/* User Identity Header */}
              {userAnalytics.userProfile && (
                <div className="bg-slate-900 border border-indigo-500/30 p-5 rounded-2xl flex items-center justify-between gap-4 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-white font-black text-lg">
                      {userAnalytics.userProfile.name?.[0] || userAnalytics.userProfile.username?.[0] || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-white m-0">
                          {userAnalytics.userProfile.name || userAnalytics.userProfile.username}
                        </h3>
                        <span className="text-xs text-indigo-300 font-mono">
                          @{userAnalytics.userProfile.username}
                        </span>
                        {userAnalytics.userProfile.age && (
                          <span className="text-[11px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold">
                            Age {userAnalytics.userProfile.age}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 font-mono flex items-center gap-3">
                        {userAnalytics.userProfile.mobile && (
                          <span>📞 {userAnalytics.userProfile.mobile}</span>
                        )}
                        <span className="text-slate-500">ID: {userAnalytics.userId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Stories Started</p>
                  <p className="text-2xl font-black text-white m-0">{userAnalytics.totalStoriesStarted}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Completed</p>
                  <p className="text-2xl font-black text-emerald-400 m-0">{userAnalytics.totalStoriesCompleted}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Completion Rate</p>
                  <p className="text-2xl font-black text-amber-400 m-0">{userAnalytics.completionRate}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                  <p className="text-slate-400 text-xs font-bold uppercase mb-1">Avg Frame Decision</p>
                  <p className="text-2xl font-black text-sky-400 m-0">{userAnalytics.avgDecisionTimeS}s</p>
                </div>
              </div>
              
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h2 className="text-xl font-bold mb-4 text-white">Recent Activity & Journey History</h2>
                {userAnalytics.recentActivity.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {userAnalytics.recentActivity.map((log: any, idx: number) => {
                      const storyInfo = getStoryInfo(log.journey_id);
                      return (
                        <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between md:items-center gap-3">
                          <div className="flex items-center gap-3">
                            <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold shrink-0 ${
                              log.event_type.includes('complete') 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            }`}>
                              {log.event_type}
                            </span>
                            <div>
                              <div className="text-white text-sm font-bold flex items-center gap-2">
                                <span>{storyInfo.personality}</span>
                                {storyInfo.age && (
                                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">
                                    Age {storyInfo.age}
                                  </span>
                                )}
                                <span className="text-slate-400 text-xs font-normal">— {storyInfo.title}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                {log.journey_id}
                              </div>
                            </div>
                          </div>
                          <div className="text-slate-500 text-xs font-mono shrink-0">
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-500">No journey activity recorded for this user.</p>
                )}
              </div>
            </div>
          ) : !userLoading && searchUserId && (
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center text-slate-500">
              No user found matching "{searchUserId}". You can search by username, 10-digit mobile number, or UUID.
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default FeedbackDashboard;
