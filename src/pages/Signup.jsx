import { motion } from "framer-motion";
import { ShieldPlus, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim() || !form.confirmPassword.trim()) {
      setError("All fields are required.");
      return;
    }

    if (!emailPattern.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }

    try {
      setSubmitting(true);
      await signup(form);
      navigate("/");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container-shell grid min-h-[calc(100vh-5rem)] place-items-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-2xl rounded-3xl p-6 sm:p-8"
      >
        <div className="mb-7 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-amberGlow/25 bg-amberGlow/10 text-amberGlow">
            <ShieldPlus className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amberGlow">Free trial access</p>
            <h1 className="mt-1 text-3xl font-black text-white">Create your account</h1>
          </div>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-stone-300">Full Name</span>
            <input
              type="text"
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/75 px-4 py-3 text-white outline-none transition focus:border-cyanGlow/45"
              placeholder="Your name"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-stone-300">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/75 px-4 py-3 text-white outline-none transition focus:border-cyanGlow/45"
              placeholder="you@example.com"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-stone-300">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/75 px-4 py-3 text-white outline-none transition focus:border-cyanGlow/45"
                placeholder="Create password"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-stone-300">Confirm Password</span>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(event) => updateField("confirmPassword", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/75 px-4 py-3 text-white outline-none transition focus:border-cyanGlow/45"
                placeholder="Repeat password"
              />
            </label>
          </div>

          {error && <p className="rounded-2xl border border-roseGlow/20 bg-roseGlow/10 p-3 text-sm text-roseGlow">{error}</p>}

          <button type="submit" className="glow-button w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting}>
            {submitting ? "Creating account..." : "Create Account"} <Sparkles className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-cyanGlow/15 bg-black/75 p-4 text-sm leading-6 text-stone-300">
          Your free plan starts with 5 image-only scans. Video detection unlocks on paid demo plans.
        </div>

        <p className="mt-6 text-center text-sm text-stone-400">
          Already have access?{" "}
          <Link to="/login" className="font-semibold text-cyanGlow transition hover:text-white">
            Login
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
