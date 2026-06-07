import { Crown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function SubscriptionPanel({ plan }) {
  const normalizedPlan = String(plan || "free").toLowerCase();
  const isFree = normalizedPlan === "free";
  const isStarter = normalizedPlan === "starter";
  const isPro = normalizedPlan === "pro";

  return (
    <section className="rounded-[2rem] border border-white/[0.08] bg-black/65 p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-amberGlow/20 bg-amberGlow/10 text-amberGlow">
          <Crown className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amberGlow">Subscription</p>
          <h2 className="mt-2 text-2xl font-black capitalize text-white">{normalizedPlan} plan</h2>
        </div>
      </div>
      <p className="mt-5 leading-7 text-stone-300">
        Keep enough verification capacity ready for high-volume image and video authenticity checks.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {isFree && (
          <>
            <Link to="/pricing" className="glow-button">Upgrade to Starter <Sparkles className="h-4 w-4" /></Link>
            <Link to="/pricing" className="ghost-button">Upgrade to Pro</Link>
          </>
        )}
        {isStarter && <Link to="/pricing" className="glow-button">Upgrade to Pro <Sparkles className="h-4 w-4" /></Link>}
        {isPro && <p className="rounded-2xl border border-mintGlow/20 bg-mintGlow/10 px-4 py-3 text-sm font-semibold text-mintGlow">You are on the highest plan</p>}
      </div>
    </section>
  );
}
