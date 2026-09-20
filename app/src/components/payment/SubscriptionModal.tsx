import { useState } from 'react';
// @ts-ignore
import { load } from '@cashfreepayments/cashfree-js';
import { useUserStore } from '../../store/userStore';
import { Loader2, X, CheckCircle2, Sparkles, Check, Minus, Crown } from 'lucide-react';
import { getSubscriptionPlanDetails } from '../../services/accessControl';
import { AYA_PLAN_COMPARISON } from '../../config/recommendationConfig';
import { useSubscription } from '../../hooks/useSubscription';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(true);
  const userProfile = useUserStore((state: any) => state.profile);
  const { isPaid, loading } = useSubscription();

  const plans = getSubscriptionPlanDetails();

  if (!isOpen) return null;



  const handleSubscribe = async (planId: string, amount: number) => {
    try {
      setLoadingPlan(planId);
      setError(null);
      
      let formattedPhone = '9999999999';
      if (userProfile?.mobile) {
        const digitsOnly = userProfile.mobile.replace(/\D/g, '');
        if (digitsOnly.length > 10) {
          formattedPhone = digitsOnly.slice(-10);
        } else if (digitsOnly.length === 10) {
          formattedPhone = digitsOnly;
        }
      }

      // 1. Get payment_session_id from our Vercel API
      const response = await fetch('/api/create-cashfree-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan_id: planId,
          amount: amount,
          user_id: userProfile?.id || 'guest',
          customer_phone: formattedPhone,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment session');
      }

      if (!data.payment_session_id) {
        throw new Error('No payment session ID returned');
      }

      // 2. Initialize Cashfree JS SDK
      const cashfree = await load({
        mode: import.meta.env.VITE_CASHFREE_MODE || 'production', 
      });

      // 3. Initiate checkout
      const checkoutOptions = {
        paymentSessionId: data.payment_session_id,
        redirectTarget: '_self',
      };

      await cashfree.checkout(checkoutOptions);

    } catch (err: any) {
      console.error('Subscription Error:', err);
      setError(err.message || 'Something went wrong while initiating payment.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl border border-purple-500/30 p-5 sm:p-8 md:p-10 shadow-2xl overflow-y-auto max-h-[94vh] custom-scrollbar my-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold uppercase tracking-wider mb-3">
            <Crown size={14} className="text-amber-400" />
            <span>AYA Life Navigation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">AYA Journey</span>
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-xs sm:text-sm leading-relaxed">
            Build better self-awareness, make smarter decisions, explore career possibilities, and learn from real-life stories of people who have already been where you are.
          </p>
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>

        {/* 1. Trial section removed as per requirements */}
        {/* 2. Trial concluded section removed */}

        {/* 3. Paid PRO Active Banner */}
        {!loading && isPaid && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-5 rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-purple-950/70 shadow-[0_0_25px_rgba(168,85,247,0.2)] text-left flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">AYA PRO Member</span>
              <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
                You have unlimited access to all stories, DNA evolution traits, and upcoming tools!
              </p>
            </div>
          </div>
        )}

        {/* Pricing Cards Grid - 2 Tiers: 6-Month Journey & 12-Month Journey */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch mb-8">
          
          {/* 1. 6-Month Journey */}
          <div className="flex flex-col bg-slate-800/60 rounded-3xl border border-slate-700/80 p-6 sm:p-7 hover:border-cyan-400/50 transition-all flex-1 relative shadow-xl">
            <div className="mb-4">
              <h3 className="text-xl sm:text-2xl font-black text-cyan-300 flex items-center gap-2">
                <span>🚀</span> 6-Month Journey
              </h3>
              <div className="flex items-baseline gap-2.5 mt-2 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-white">₹1,999</span>
                <span className="line-through text-slate-500 text-base font-semibold">₹14,999</span>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  86.7% OFF
                </span>
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">
                That's just <strong className="text-cyan-300 font-bold">₹333/month</strong>
              </div>
            </div>

            <div className="mt-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              What you get:
            </div>
            
            <ul className="flex-1 space-y-2.5 mb-6 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Full access to AYA's personalized learning journey</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Personality & self-awareness assessment</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Real-life decision-making scenarios</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Stories and experiences from inspiring personalities</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Career & strengths exploration</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Personalized DNA insights</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Progress tracking, scores & streaks</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Regular new learning experiences</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Journal & reflection activities</span>
              </li>
            </ul>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-700/60 text-xs text-slate-300 mb-6 leading-relaxed">
              <strong className="text-cyan-300">Best for:</strong> Students who want to explore AYA and build a stronger understanding of themselves over 6 months.
            </div>

            <button 
              onClick={() => handleSubscribe(plans.sixMonths.id, plans.sixMonths.amount)}
              disabled={loadingPlan !== null}
              className="w-full py-3.5 rounded-xl font-black uppercase text-xs sm:text-sm tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              {loadingPlan === plans.sixMonths.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start 6-Month Journey'}
            </button>
          </div>

          {/* 2. 12-Month Journey — Recommended */}
          <div className="flex flex-col bg-gradient-to-b from-purple-950/50 via-slate-800/90 to-slate-900 rounded-3xl border-2 border-amber-400/80 p-6 sm:p-7 relative shadow-[0_0_40px_rgba(245,158,11,0.2)] hover:shadow-[0_0_50px_rgba(245,158,11,0.3)] transition-all flex-1">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg border border-amber-200/50 flex items-center gap-1">
              <Sparkles size={12} className="text-slate-950 fill-slate-950" /> Recommended · 88% OFF
            </div>

            <div className="mb-4">
              <h3 className="text-xl sm:text-2xl font-black text-amber-300 flex items-center gap-2">
                <span>⭐</span> 12-Month Journey
              </h3>
              <div className="flex items-baseline gap-2.5 mt-2 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-white">₹2,999</span>
                <span className="line-through text-slate-400 text-base font-semibold">₹24,999</span>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  88% OFF
                </span>
              </div>
              <div className="text-xs text-slate-300 font-medium mt-1">
                That's just <strong className="text-amber-300 font-bold">₹250/month</strong>
              </div>
            </div>

            <div className="mt-2 mb-3 text-xs font-bold uppercase tracking-wider text-amber-300/90 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              Everything in the 6-month plan, plus:
            </div>
            
            <ul className="flex-1 space-y-2.5 mb-5 text-xs text-slate-200">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="font-semibold text-white">12 months of continuous access</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>More time to understand your strengths, weaknesses & interests</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Your DNA evolves as your choices and performance change</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Long-term progress tracking</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>More opportunities to explore different career paths</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Build better decision-making habits over time</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Continue your journey through academic and personal milestones</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                  6 extra months for only ₹1,000 more
                </span>
              </li>
            </ul>

            {/* Why choose 12 months? Callout Box */}
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-slate-200 mb-6 leading-relaxed">
              <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1 text-xs">
                <span>💡</span> Why choose 12 months?
              </div>
              <p className="text-[11.5px] text-slate-300 leading-relaxed">
                College and career decisions don't happen in a few weeks.
              </p>
              <p className="text-[11.5px] text-slate-300 leading-relaxed mt-1">
                With 12 months, AYA stays with you through an entire year — helping you understand yourself, reflect on your choices, explore possibilities and keep improving.
              </p>
              <div className="mt-2.5 pt-2 border-t border-amber-500/20 text-[11.5px] font-bold text-amber-200">
                ₹2,999 for an entire year = approximately ₹250/month.
              </div>
            </div>

            <button 
              onClick={() => handleSubscribe(plans.annual.id, plans.annual.amount)}
              disabled={loadingPlan !== null}
              className="w-full py-3.5 rounded-xl font-black uppercase text-xs sm:text-sm tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] cursor-pointer"
            >
              {loadingPlan === plans.annual.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start 12-Month Journey'}
            </button>
          </div>

        </div>

        {/* Free vs AYA PRO Feature Comparison */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                Plan Comparison
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                See everything included with Free vs AYA PRO
              </p>
            </div>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="text-xs text-purple-300 hover:text-white underline font-semibold transition-colors"
            >
              {showComparison ? 'Collapse' : 'Expand Comparison'}
            </button>
          </div>

          {showComparison && (
            <div className="rounded-2xl border border-slate-700/80 bg-slate-800/40 overflow-hidden shadow-inner">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-300 text-left">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/90 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4 font-bold">Feature</th>
                      <th className="py-3 px-4 text-center font-bold text-slate-300 w-1/3">Free Users Get</th>
                      <th className="py-3 px-4 text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 w-1/3">
                        AYA PRO Gets
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {AYA_PLAN_COMPARISON.map((row) => (
                      <tr 
                        key={row.key} 
                        className={`hover:bg-white/[0.02] transition-colors ${row.highlightPro ? 'bg-purple-500/[0.03]' : ''}`}
                      >
                        <td className="py-3 px-4 font-semibold text-white/90">
                          {row.feature}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400">
                          {row.free === '—' ? (
                            <Minus size={14} className="mx-auto text-slate-600" />
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <Check size={13} className="text-slate-400 shrink-0" />
                              <span>{row.free}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-cyan-300 font-medium">
                          <span className="inline-flex items-center gap-1.5 text-white">
                            <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                            <span className={row.highlightPro ? 'text-cyan-200 font-semibold' : 'text-slate-200'}>
                              {row.pro}
                            </span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-purple-950/20 border-t border-purple-500/20 text-center text-[11px] text-purple-200/90 font-medium">
                ✨ <strong className="text-white">AYA PRO</strong> gives you continuous growth with all future updates and premium tools automatically included.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

