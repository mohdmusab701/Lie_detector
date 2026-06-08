import { motion } from "framer-motion";
import { LogIn, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const loginMessage = location.state?.message;
  const redirectPath = location.state?.from || "/";

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required.");
      return;
    }

    if (!emailPattern.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setSubmitting(true);
      await login(form);
      navigate(redirectPath, { replace: true });
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
        className="glass-card w-full max-w-xl rounded-3xl p-6 sm:p-8"
      >
        <div className="mb-7 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-cyanGlow/25 bg-cyanGlow/10 text-cyanGlow">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyanGlow">Secure access</p>
            <h1 className="mt-1 text-3xl font-black text-white">Login to AI Lie Detector</h1>
          </div>
        </div>

        {loginMessage && <p className="mb-5 rounded-2xl border border-cyanGlow/20 bg-cyanGlow/10 p-3 text-sm text-cyanGlow">{loginMessage}</p>}

        <form className="space-y-5" onSubmit={handleSubmit}>
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

          <label className="block">
            <span className="text-sm font-semibold text-stone-300">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/75 px-4 py-3 text-white outline-none transition focus:border-cyanGlow/45"
              placeholder="Enter your password"
            />
          </label>

          {error && <p className="rounded-2xl border border-roseGlow/20 bg-roseGlow/10 p-3 text-sm text-roseGlow">{error}</p>}

          <button type="submit" className="glow-button w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting}>
            {submitting ? "Logging in..." : "Login"} <LogIn className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-400">
          New to AI Lie Detector?{" "}
          <Link to="/signup" className="font-semibold text-cyanGlow transition hover:text-white">
            Create an account
          </Link>
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/75 px-3 py-2 text-xs text-stone-500">
          <Mail className="h-3.5 w-3.5 text-cyanGlow" />
          Login uses a secure backend token stored in this browser.
        </p>
      </motion.div>
    </section>
  );
}
