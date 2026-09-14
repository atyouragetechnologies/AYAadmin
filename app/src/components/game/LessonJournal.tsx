import { useUserStore } from '../../store/userStore';
import { X, BookOpen, Clock, User, Quote } from 'lucide-react';
import { audioManager as audioSynth } from "../../utils/audioManager";

interface LessonJournalProps {
    onClose: () => void;
}

export function LessonJournal({ onClose }: LessonJournalProps) {
    const lessons = useUserStore((state) => state.collectedLessons);
    const profile = useUserStore((state) => state.profile);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-orange-50 w-full max-w-4xl h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border-8 border-orange-900/50">
                {/* Book Spine visual */}
                <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-orange-900 to-orange-800 z-10 border-r border-orange-950/30" />

                {/* Header */}
                <div className="bg-orange-100 border-b border-orange-200 p-6 flex items-center justify-between pl-14">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-500 text-white p-3 rounded-xl shadow-md rotate-[-3deg]">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-orange-900 font-serif tracking-tight">Wisdom Journal</h2>
                            <p className="text-orange-700/60 font-medium">
                                Growth collected by {profile?.name || 'You'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            audioSynth.playBack();
                            onClose();
                        }}
                        className="p-2 hover:bg-orange-200 rounded-full transition-colors text-orange-800"
                    >
                        <X size={32} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 pl-12 bg-[url('https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/paper_texture.webp')] bg-repeat">
                    {lessons.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                            <BookOpen size={64} className="mb-4 text-orange-300" />
                            <h3 className="text-2xl font-bold text-orange-900 mb-2">Empty Pages</h3>
                            <p className="text-orange-800/60 max-w-md">
                                Complete scenarios to collect wisdom from legendary figures. Your journey is just beginning!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                            {lessons.map((lesson, idx) => (
                                <div
                                    key={lesson.id}
                                    className="bg-white p-6 rounded-xl shadow-[2px_4px_0_rgba(0,0,0,0.1)] border border-orange-100 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    {/* Decoration */}
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-bl-full -mr-8 -mt-8 z-0 group-hover:bg-orange-100 transition-colors" />

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold tracking-widest text-orange-400 uppercase mb-1">
                                                    LESSON #{idx + 1}
                                                </span>
                                                <h3 className="text-xl font-bold text-slate-800 leading-tight">
                                                    {lesson.title}
                                                </h3>
                                            </div>
                                            {lesson.age && (
                                                <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded text-xs font-bold text-orange-800">
                                                    <Clock size={12} />
                                                    <span>Age {lesson.age}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-orange-400 mb-4 italic text-slate-600">
                                            <Quote size={12} className="text-orange-300 mb-1" />
                                            {lesson.description}
                                        </div>

                                        <div className="flex items-center justify-end border-t border-slate-100 pt-3">
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                                    <User size={14} />
                                                    <span>{lesson.source}</span>
                                                </div>
                                                {/* NEW: Match Score Badge (Candy Style) */}
                                                {lesson.matchResult && (
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                                                            <span>Match</span>
                                                            <div className="bg-white text-pink-600 rounded-full w-5 h-5 flex items-center justify-center font-bold text-[9px]">
                                                                {lesson.matchResult.matchPercentage}%
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                            {lesson.matchResult.idolName}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
