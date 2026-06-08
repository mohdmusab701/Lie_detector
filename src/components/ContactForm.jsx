import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient, useAuth } from "../context/AuthContext.jsx";

export default function ContactForm() {
  const { user } = useAuth();
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: current.name || user?.name || user?.fullName || "",
      email: current.email || user?.email || "",
    }));
  }, [user]);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setToast(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
      authenticatedName: user?.name || user?.fullName || "",
      authenticatedEmail: user?.email || "",
    };

    if (!payload.name || !payload.email || !payload.message) {
      setToast({ type: "error", message: "Unable to send feedback. Please try again." });
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiClient.post("/api/contact", payload);
      if (!response.data?.success) {
        throw new Error(response.data?.message || "Unable to send feedback. Please try again.");
      }
      setForm((current) => ({ ...current, message: "" }));
      setToast({ type: "success", message: "Feedback submitted successfully." });
    } catch {
      setToast({ type: "error", message: "Unable to send feedback. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card self-start rounded-3xl p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amberGlow">Feedback</p>
        <h2 className="mt-2 text-2xl font-black text-white">Send us a note</h2>
        <p className="mt-2 text-sm leading-6 text-stone-400">Your account details are prefilled when available, and you can edit them before sending.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-stone-300">
          Name
          <input value={form.name} onChange={updateField("name")} className="rounded-2xl border border-white/10 bg-black/75 px-4 py-3 text-white outline-none transition focus:border-cyanGlow/45" placeholder="Your name" required />
        </label>
        <label className="grid gap-2 text-sm font-medium text-stone-300">
          Email
          <input value={form.email} onChange={updateField("email")} type="email" className="rounded-2xl border border-white/10 bg-black/75 px-4 py-3 text-white outline-none transition focus:border-cyanGlow/45" placeholder="you@example.com" required />
        </label>
      </div>
      <label className="mt-5 grid gap-2 text-sm font-medium text-stone-300">
        Message
        <textarea value={form.message} onChange={updateField("message")} className="min-h-36 resize-y rounded-2xl border border-white/10 bg-black/75 px-4 py-3 text-white outline-none transition focus:border-cyanGlow/45" placeholder="Tell us what would make AI Lie Detector more useful." required />
      </label>
      <button type="submit" className="glow-button mt-6 disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Feedback"} <Send className="h-4 w-4" />
      </button>
      {toast && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-5 rounded-2xl border p-4 text-sm ${
            toast.type === "success" ? "border-mintGlow/20 bg-mintGlow/10 text-mintGlow" : "border-roseGlow/20 bg-roseGlow/10 text-roseGlow"
          }`}
        >
          {toast.message}
        </motion.p>
      )}
    </form>
  );
}
