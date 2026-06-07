import { CalendarDays, Mail, UserRound, Video } from "lucide-react";

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-black/70 text-cyanGlow">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">{label}</p>
        <p className="mt-1 truncate text-sm font-semibold capitalize text-white">{value}</p>
      </div>
    </div>
  );
}

export default function AccountInfo({ account }) {
  return (
    <section className="rounded-[2rem] border border-white/[0.08] bg-black/65 p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyanGlow">Account Information</p>
      <h2 className="mt-2 text-2xl font-black text-white">Profile details</h2>
      <div className="mt-6 grid gap-3">
        <InfoRow icon={UserRound} label="Name" value={account.name || "User"} />
        <InfoRow icon={Mail} label="Email" value={account.email || "Not available"} />
        <InfoRow icon={CalendarDays} label="Member Since" value={account.memberSince || "Not available"} />
        <InfoRow icon={UserRound} label="Current Plan" value={account.plan || "free"} />
        <InfoRow icon={Video} label="Video Access" value={account.videoEnabled ? "Enabled" : "Disabled"} />
      </div>
    </section>
  );
}
