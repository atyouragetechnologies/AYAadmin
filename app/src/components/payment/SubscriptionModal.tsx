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
  const [activatingTrial, setActivatingTrial] = useState(false);
  const [trialSuccess, setTrialSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(true);
  const userProfile = useUserStore((state: any) => state.profile);
  const { isPaid, isTrialActive, hasTrialAvailable, formattedEndDate, daysRemaining, loading, activateTrial } = useSubscription();

  const plans = getSubscriptionPlanDetails();

  if (!isOpen) return null;

  const handleStartTrial = async () => {
    try {
      setActivatingTrial(true);
      setError(null);
      const success = await activateTrial();
      if (success) {
        setTrialSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error('Failed to start trial:', err);
      setError(err.message || 'Failed to activate trial.');
    } finally {
      setActivatingTrial(false);
    }
  };

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
            <span>AYA PRO Life Navigation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">
            Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">AYA PRO</span> & Your Full DNA Evolution
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
            Gain unlimited story access, continuous DNA trait evolution, personalized recommendations, deeper career guidance, and all upcoming premium features.
          </p>
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>

        {/* 1. First-Time User: Start 7-Day Free Trial Banner */}
        {!loading && hasTrialAvailable && !isPaid && (
          <div className="mb-6 sm:mb-8 p-5 sm:p-6 rounded-2xl border border-cyan-500/50 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-purple-950/90 shadow-[0_0_30px_rgba(6,182,212,0.25)] text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 shadow-lg">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                    First Time On AYA?
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    100% Free
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-1">
                  Start Your 7-Day Free Trial
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg leading-relaxed">
                  Experience all AYA PRO features — full story library, continuous DNA evolution, and career insights — completely free for 7 days. No credit card required!
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0 relative z-10">
              <button
                onClick={handleStartTrial}
                disabled={activatingTrial}
                className="w-full md:w-auto px-6 py-3.5 rounded-xl font-black uppercase text-xs sm:text-sm tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {activatingTrial ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Activating Trial...</span>
                  </>
                ) : trialSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                    <span>Trial Activated! 🎉</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Start 7-Day Free Trial</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 2. Active Trial or Concluded Notice Banner */}
        {!loading && !hasTrialAvailable && !isPaid && (
          <div className={`mb-6 sm:mb-8 p-4 sm:p-5 rounded-2xl border ${
            isTrialActive 
              ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-emerald-950/70 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
              : 'border-amber-500/30 bg-amber-950/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
          } text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
            <div className="flex items-start sm:items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                isTrialActive ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
              }`}>
                {isTrialActive ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Crown className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isTrialActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isTrialActive ? '7-Day Free Trial Active' : 'Free Trial Concluded'}
                  </span>
                  {isTrialActive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {daysRemaining > 1 ? `${daysRemaining} days left` : daysRemaining === 1 ? '1 day left' : 'Ends today'}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-200 mt-1">
                  {isTrialActive ? (
                    <>You are currently on a <strong className="text-white">7-day free trial</strong> which ends on <strong className="text-emerald-300 underline decoration-emerald-500/50">{formattedEndDate}</strong>.</>
                  ) : (
                    <>Your 7-day free trial ended on <strong className="text-white">{formattedEndDate}</strong>. Choose a plan to retain unlimited access.</>
                  )}
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-[11px] text-slate-400 block font-medium">Upgrade anytime to keep uninterrupted PRO access</span>
            </div>
          </div>
        )}

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

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-stretch mb-8">
          
          {/* 1. Monthly Plan (1 Month) */}
          <div className="flex flex-col bg-slate-800/60 rounded-2xl border border-slate-700/80 p-5 sm:p-6 hover:border-purple-400/50 transition-all flex-1 relative">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-lg font-bold text-white">1 Month Pass</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Save 34%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="line-through text-slate-500 text-sm font-semibold">₹{plans.monthly.originalAmount}</span>
                <span className="text-3xl font-black text-white">{plans.monthly.currency}{plans.monthly.amount}</span>
                <span className="text-slate-400 text-xs">/month</span>
              </div>
            </div>
            
            <ul className="flex-1 space-y-2.5 mb-6 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Unlimited stories & full story library</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>DNA evolution based on ongoing gameplay</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Full/deeper career recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Personalized story recommendations</span>
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe(plans.monthly.id, plans.monthly.amount)}
              disabled={loadingPlan !== null}
              className="w-full py-3 rounded-xl font-bold uppercase text-xs tracking-wider text-white bg-slate-700 hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loadingPlan === plans.monthly.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get 1 Month · ₹99'}
            </button>
          </div>

          {/* 2. 3 Months Plan */}
          <div className="flex flex-col bg-slate-800/60 rounded-2xl border border-slate-700/80 p-5 sm:p-6 hover:border-cyan-400/50 transition-all flex-1 relative">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-lg font-bold text-cyan-300">3 Months Pass</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Save 20%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="line-through text-slate-500 text-sm font-semibold">₹{plans.threeMonths.originalAmount}</span>
                <span className="text-3xl font-black text-white">{plans.threeMonths.currency}{plans.threeMonths.amount}</span>
                <span className="text-slate-400 text-xs">/3 mo ({plans.threeMonths.monthlyEquiv})</span>
              </div>
            </div>
            
            <ul className="flex-1 space-y-2.5 mb-6 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="font-semibold text-white">Full 3-Month uninterrupted access</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Continuous DNA evolution & insights</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Full & deeper career recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Personalized story recommendations</span>
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe(plans.threeMonths.id, plans.threeMonths.amount)}
              disabled={loadingPlan !== null}
              className="w-full py-3 rounded-xl font-bold uppercase text-xs tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loadingPlan === plans.threeMonths.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get 3 Months · ₹199'}
            </button>
          </div>

          {/* 3. 1 Year Plan (Hero / Best Value) */}
          <div className="flex flex-col bg-gradient-to-b from-purple-900/40 via-slate-800/90 to-slate-900 rounded-2xl border-2 border-purple-500 p-5 sm:p-6 relative shadow-[0_0_30px_rgba(168,85,247,0.25)] hover:shadow-[0_0_40px_rgba(168,85,247,0.35)] transition-all flex-1">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-cyan-400 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
              Best Value · Save 20%
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-purple-300 mb-1">1 Year Access</h3>
              <div className="flex items-baseline gap-2">
                <span className="line-through text-slate-400 text-sm font-semibold">₹{plans.annual.originalAmount}</span>
                <span className="text-3xl font-black text-white">{plans.annual.currency}{plans.annual.amount}</span>
                <span className="text-slate-400 text-xs">/yr ({plans.annual.monthlyEquiv})</span>
              </div>
            </div>
            
            <ul className="flex-1 space-y-2.5 mb-6 text-xs text-slate-200">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="font-semibold text-white">Unlimited stories & Full library</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Continuous DNA evolution & refined insights</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Full & deeper career recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Weekly progress & DNA reports</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-amber-300 font-semibold">All future Premium features included</span>
              </li>
            </ul>

            <button 
              onClick={() => handleSubscribe(plans.annual.id, plans.annual.amount)}
              disabled={loadingPlan !== null}
              className="w-full py-3 rounded-xl font-black uppercase text-xs tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
              {loadingPlan === plans.annual.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get 1 Year · ₹799'}
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

