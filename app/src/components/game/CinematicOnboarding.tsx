import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../../store/userStore';
import { audioManager as audioSynth } from "../../utils/audioManager";
import { Brain, Gamepad2, Dna, ChevronRight } from 'lucide-react';
import { safeStorage } from '../../utils/storage';
import { bgmManager } from '../../utils/bgmManager';
import { useNavigate, useParams } from 'react-router-dom';

export function CinematicOnboarding({ onComplete }: { onComplete?: () => void }) {
  const profile = useUserStore((state) => state.profile);
  const navigate = useNavigate();
  const { step: stepParam } = useParams<{ step: string }>();
  const slide = parseInt(stepParam || '1') || 1;


  const completeFlow = () => {
      safeStorage.set('onboarding_done', 'true');
      if (onComplete) onComplete();
      else navigate('/game/assessment/1');
  };

  useEffect(() => {
    bgmManager.play('onboarding');
    return () => bgmManager.stop();
  }, []);

  const nextSlide = () => {
    audioSynth.playClick();
    navigate(`/game/onboarding/${slide + 1}`);
  };
  const prevSlide = () => {
    audioSynth.playBack();
    navigate(`/game/onboarding/${Math.max(slide - 1, 1)}`);
  };

  const handleFinish = async () => {
    if (slide === 3) {
      completeFlow();
    } else {
      nextSlide();
    }
  };


  const welcomeWords = "Your journey begins now.".split(" ");

  return (
    <div className="w-full h-[100dvh] bg-[#0d0d16] text-[#f2effb] overflow-y-auto relative font-['Space_Grotesk',sans-serif] perspective-[2000px] [-webkit-overflow-scrolling:touch]" style={{scrollbarWidth:'none', msOverflowStyle:'none'}} >
      <style>{`::-webkit-scrollbar { display: none; }`}</style>
      
      {/* Universal Scene Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         
         {/* Clean Performance Friendly Background */}
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(0,241,254,0.05)_0%,transparent_70%)]" />
      </div>

      {/* Top Navigation — FIXED */}
      {slide > 1 && slide < 3 && (
        <button onClick={prevSlide} className="fixed left-6 z-[200] text-[#acaab5] hover:text-[#99f7ff] transition-colors text-sm uppercase tracking-widest font-bold" style={{ top: 'max(1.5rem, env(safe-area-inset-top, 0px))' }}>
            ← Back
        </button>
      )}
      {slide < 3 && (
        <button onClick={completeFlow} className="fixed right-6 z-[200] text-[#acaab5] hover:text-[#99f7ff] transition-colors text-sm uppercase tracking-widest font-bold" style={{ top: 'max(1.5rem, env(safe-area-inset-top, 0px))' }}>
            Skip
        </button>
      )}

      {/* Main Slide Content — Scrollable inner wrapper with header clearance */}
      <div className="relative z-10 w-full min-h-[100dvh] flex flex-col items-start justify-center px-4 md:px-6 pt-28 sm:pt-32 pb-28">
        <AnimatePresence mode="wait">
          {/* SLIDE 1: The Hook */}
          {slide === 1 && (
            <motion.div
              key="slide1"
              initial={{ opacity: 0, x: 100, rotateY: 15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -100, rotateY: -15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center w-full max-w-md mx-auto px-4 md:px-0"
            >
              {/* Blurred Silhouettes */}
              <div className="absolute inset-0 z-[-1] pointer-events-none flex items-center justify-center">
                 {[1,2,3].map((_, i) => (
                     <motion.div
                       key={`sil-${i}`}
                       className="absolute w-48 h-64 bg-black rounded-[40px] opacity-40 sm:blur-[20px] sm:mix-blend-overlay border border-[#00f1fe]"
                       animate={{ 
                           rotateZ: [0, 360], 
                           x: [Math.sin(i)*100, Math.cos(i)*100, Math.sin(i)*100],
                           y: [Math.cos(i)*100, Math.sin(i)*100, Math.cos(i)*100]
                       }}
                       transition={{ duration: 30 + i*5, repeat: Infinity, ease: 'linear' }}
                     />
                 ))}
              </div>

              <div className="space-y-6 sm:space-y-8 [transform-style:preserve-3d]">
                 <motion.p 
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                   className="text-base sm:text-xl font-light text-white/80"
                 >
                    "At 20, <span className="font-bold text-[#99f7ff] drop-shadow-[0_0_15px_rgba(153,247,255,0.8)]">Kobe Bryant</span> was already training at 4AM."
                 </motion.p>
                 <motion.p 
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                   className="text-sm sm:text-lg font-light text-white/80"
                 >
                    "At 19, <span className="font-bold text-[#d575ff] drop-shadow-[0_0_15px_rgba(213,117,255,0.8)]">Shah Rukh Khan</span> was performing in Delhi theatres."
                 </motion.p>
                 <motion.h1 
                   initial={{ opacity: 0, scale: 0.9, z: 150 }} animate={{ opacity: 1, scale: 1, z: 0 }} transition={{ delay: 1.2, duration: 1 }}
                   className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] via-white to-[#ffaa00] drop-shadow-[0_0_30px_rgba(255,215,0,0.5)] mt-6 mb-3"
                 >
                    What were YOU meant to become?
                 </motion.h1>
                 <motion.p 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
                   className="text-[#acaab5] text-sm sm:text-base font-['Manrope',sans-serif] uppercase tracking-widest mt-3"
                 >
                    Find out by stepping into their shoes.
                 </motion.p>

                 <motion.button
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 }}
                   onClick={nextSlide}
                   className="mt-8 px-8 py-4 bg-transparent border-2 border-[#00f1fe] text-[#99f7ff] rounded-full text-lg font-black uppercase tracking-wider relative overflow-hidden group transition-all"
                 >
                   <motion.div 
                       className="absolute inset-0 bg-[#00f1fe] opacity-20"
                       animate={{ opacity: [0.1, 0.4, 0.1] }}
                       transition={{ duration: 2, repeat: Infinity }}
                   />
                   <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-[0_0_10px_rgba(0,241,254,0.8)]">
                       LET'S FIND OUT <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </span>
                 </motion.button>
              </div>
            </motion.div>
          )}

          {/* SLIDE 2: How It Works */}
          {slide === 2 && (
            <motion.div
              key="slide2"
              initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-md mx-auto px-6 md:px-0"
            >
              <h2 className="text-3xl sm:text-5xl font-black text-center mb-8 sm:mb-12 text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">How AYA Works</h2>
              <div className="space-y-4 sm:space-y-5 [transform-style:preserve-3d]">
                 {[
                   { icon: Brain, title: "Answer 9 quick questions", desc: "We build your psychological personality profile.", color: '#99f7ff', rawColor: '0, 241, 254' },
                   { icon: Gamepad2, title: "Step into a legend's shoes", desc: "Make their real decisions in interactive scenarios.", color: '#d575ff', rawColor: '213, 117, 255' },
                   { icon: Dna, title: "Discover your Personality DNA", desc: "See who you were truly meant to become.", color: '#ffd700', rawColor: '255, 215, 0' }
                 ].map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 100, rotateX: 45, z: -500 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0, z: 0 }}
                      transition={{ delay: 0.3 * idx, type: "spring", damping: 15 }}
                      className="flex items-center gap-4 sm:gap-6 bg-[#1f1f2a]/80 sm:backdrop-blur-2xl p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group"
                    >
                      <div className={`absolute top-0 left-0 w-2 h-full`} style={{ backgroundColor: step.color, boxShadow: `0 0 20px ${step.color}` }} />
                      <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl sm:rounded-2xl flex items-center justify-center border transition-all shadow-md" style={{ backgroundColor: `rgba(${step.rawColor}, 0.1)`, borderColor: `rgba(${step.rawColor}, 0.3)`, boxShadow: `0 0 15px rgba(${step.rawColor}, 0.2)` }}>
                         <step.icon className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: step.color, filter: `drop-shadow(0 0 8px ${step.color})` }} />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-2xl font-bold text-white mb-1">{step.title}</h3>
                        <p className="text-sm sm:text-base text-[#acaab5] font-['Manrope']">{step.desc}</p>
                      </div>
                    </motion.div>
                 ))}
              </div>
              <div className="flex justify-center mt-10 sm:mt-12">
                 <button onClick={nextSlide} className="px-8 py-4 sm:px-12 sm:py-5 bg-[#00f1fe] text-[#004145] rounded-full text-lg sm:text-xl font-black uppercase tracking-wider hover:bg-[#99f7ff] transition-all shadow-[0_0_30px_rgba(0,241,254,0.5)] hover:shadow-[0_0_50px_rgba(0,241,254,0.8)] flex items-center gap-2">
                    SOUNDS GOOD <ChevronRight size={24} />
                 </button>
              </div>
            </motion.div>
          )}

          {/* SLIDE 3: Ready Screen */}
          {slide === 3 && (
            <motion.div
              key="slide3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="w-full max-w-[680px] mx-auto px-4 md:px-0 text-center"
            >
              <div className="relative">
                 {/* Rotating Aurora Core */}
                 <motion.div 
                   className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full sm:blur-[100px] blur-[40px] mix-blend-screen pointer-events-none"
                   style={{ background: 'conic-gradient(from 0deg, rgba(0,241,254,0.3), rgba(213,117,255,0.3), rgba(0,241,254,0.3))' }}
                   animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                   transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                 />
                 
                 <div className="flex justify-center flex-wrap gap-x-4 mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] relative z-10">
                    {welcomeWords.map((word, i) => (
                        <motion.h1
                          key={i}
                          initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          transition={{ delay: 0.5 + (i * 0.2), duration: 0.8 }}
                          className="text-3xl sm:text-5xl md:text-6xl font-black"
                        >
                            {word}
                        </motion.h1>
                    ))}
                 </div>
                 
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2 }}
                   className="space-y-4 mb-16 relative z-10 flex flex-col items-center"
                 >
                    <p className="text-base sm:text-2xl text-[#99f7ff] font-light">Welcome, <span className="font-bold text-white drop-shadow-[0_0_15px_#ffffff]">{profile?.name || 'Traveler'}</span></p>
                 </motion.div>

                 <motion.button
                   initial={{ opacity: 0, scale: 0.5, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 3, type: "spring", damping: 10 }}
                   onClick={handleFinish}
                   className="px-6 py-3 sm:px-12 sm:py-4 bg-[#00f1fe] text-[#004145] rounded-full text-base sm:text-xl font-black uppercase tracking-wider hover:bg-[#99f7ff] hover:scale-110 transition-all shadow-[0_0_60px_rgba(0,241,254,0.8)] relative z-10 flex flex-col items-center mx-auto"
                 >
                   ENTER THE MAP ⚡
                 </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


      </div>
    </div>
  );
}

