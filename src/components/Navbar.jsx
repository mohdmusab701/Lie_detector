import { motion } from "framer-motion";
import { ChevronDown, CreditCard, LayoutDashboard, Lock, LogOut, Menu, ScanSearch, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { label: "Truth Scanner", to: "/" },
  { label: "Trending", to: "/trending" },
  { label: "Our Mission", to: "/about" },
  { label: "Connect", to: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const mobileAccountRef = useRef(null);
  const navigate = useNavigate();
  const { attempts, isLoggedIn, logout, plan, user } = useAuth();

  const navClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition duration-300 ${
      isActive
        ? "bg-white/[0.055] text-cyanGlow shadow-[0_0_18px_rgba(134,217,232,0.12)]"
        : "text-stone-300 hover:-translate-y-0.5 hover:bg-white/[0.045] hover:text-white"
    }`;

  const closeMenu = () => {
    setOpen(false);
    setAccountOpen(false);
  };
  const closeAccountMenu = () => setAccountOpen(false);
  const handleLogout = async () => {
    await logout();
    setAccountOpen(false);
    closeMenu();
    navigate("/");
  };
  const displayName = user?.name || user?.fullName || user?.email?.split("@")[0] || "User";
  const formattedPlan = `${(plan || "free").charAt(0).toUpperCase()}${(plan || "free").slice(1)} Plan`;
  const renderLinkLabel = (link) => (
    <span className="inline-flex items-center gap-1.5">
      {link.label}
      {link.to === "/trending" && !isLoggedIn && <Lock className="h-3.5 w-3.5" aria-label="Login required" />}
    </span>
  );
  const dropdownLinkClass = "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-stone-200 transition hover:bg-white/[0.055] hover:text-white";

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedDesktopAccount = accountRef.current?.contains(event.target);
      const clickedMobileAccount = mobileAccountRef.current?.contains(event.target);

      if (!clickedDesktopAccount && !clickedMobileAccount) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-black/75 shadow-[0_16px_50px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
      <nav className="container-shell flex h-20 items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyanGlow/25 bg-black/75 shadow-[0_0_16px_rgba(134,217,232,0.10)]">
            <ScanSearch className="h-5 w-5 text-cyanGlow" />
          </span>
          <span className="text-xl font-black tracking-wide text-stone-50 drop-shadow-[0_0_14px_rgba(134,217,232,0.16)]">
            AI Lie Detector
          </span>
        </NavLink>

        <div className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navClass}>
              {renderLinkLabel(link)}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <>
              <span className="rounded-full border border-cyanGlow/20 bg-black/75 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-cyanGlow shadow-[0_0_18px_rgba(134,217,232,0.08)]">
                {formattedPlan}
              </span>
              <div ref={accountRef} className="relative">
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-black/75 px-3 text-sm font-bold text-stone-50 transition hover:-translate-y-0.5 hover:border-cyanGlow/25 hover:text-cyanGlow"
                  onClick={() => setAccountOpen((value) => !value)}
                  aria-label="Open account menu"
                  aria-expanded={accountOpen}
                >
                  <span>User</span>
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-cyanGlow/20 bg-cyanGlow/10 text-xs font-black text-cyanGlow">
                    {user?.initials || <UserRound className="h-3.5 w-3.5" />}
                  </span>
                </button>

                {accountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute right-0 top-12 w-72 rounded-2xl border border-white/[0.08] bg-black/90 p-4 shadow-2xl shadow-black/50 backdrop-blur-2xl"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Logged in as</p>
                    <p className="mt-2 truncate text-base font-bold text-stone-50">{displayName}</p>
                    {user?.email && (
                      <a href={`mailto:${user.email}`} className="mt-1 block truncate text-sm text-cyanGlow transition hover:text-white">
                        {user.email}
                      </a>
                    )}
                    <div className="mt-4 grid gap-2 text-sm font-semibold">
                      <p className="rounded-xl border border-cyanGlow/15 bg-cyanGlow/10 px-3 py-2 text-cyanGlow">Plan: {formattedPlan.replace(" Plan", "")}</p>
                      <p className="rounded-xl border border-amberGlow/20 bg-black/75 px-3 py-2 text-amberGlow">Attempts Left: {attempts}</p>
                    </div>
                    <div className="my-4 h-px bg-white/10" />
                    <Link to="/dashboard" className={dropdownLinkClass} onClick={closeAccountMenu}>
                      <LayoutDashboard className="h-4 w-4 text-cyanGlow" />
                      Dashboard
                    </Link>
                    <Link to="/pricing" className={dropdownLinkClass} onClick={closeAccountMenu}>
                      <CreditCard className="h-4 w-4 text-amberGlow" />
                      Purchase
                    </Link>
                    <button type="button" className={dropdownLinkClass} onClick={handleLogout}>
                      <LogOut className="h-4 w-4 text-roseGlow" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="ghost-button px-4 py-2">
                Login
              </Link>
              <Link to="/signup" className="glow-button px-4 py-2">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-black/75 text-white md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="container-shell pb-5 md:hidden">
          <div className="glass-card grid gap-2 rounded-2xl p-3">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={navClass} onClick={() => setOpen(false)}>
                {renderLinkLabel(link)}
              </NavLink>
            ))}
            <div className="mt-2 grid gap-2 border-t border-white/10 pt-3">
              {isLoggedIn ? (
                <div ref={mobileAccountRef} className="grid gap-3 rounded-2xl border border-white/10 bg-black/75 p-3">
                  <span className="w-fit rounded-full border border-cyanGlow/20 bg-cyanGlow/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-cyanGlow">
                    {formattedPlan}
                  </span>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 text-left"
                    onClick={() => setAccountOpen((value) => !value)}
                    aria-expanded={accountOpen}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="truncate text-sm font-semibold text-stone-200">User</span>
                      <span className="grid h-10 w-10 place-items-center rounded-full border border-cyanGlow/20 bg-cyanGlow/10 text-sm font-black text-cyanGlow">
                        {user?.initials || <UserRound className="h-4 w-4" />}
                      </span>
                    </div>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-stone-400 transition ${accountOpen ? "rotate-180" : ""}`} />
                  </button>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="mt-4 border-t border-white/10 pt-4"
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Logged in as</p>
                      <p className="mt-2 truncate text-base font-bold text-stone-50">{displayName}</p>
                      {user?.email && (
                        <a href={`mailto:${user.email}`} className="mt-1 block truncate text-sm text-cyanGlow transition hover:text-white">
                          {user.email}
                        </a>
                      )}
                      <div className="mt-4 grid gap-2 text-sm font-semibold">
                        <p className="rounded-xl border border-cyanGlow/15 bg-cyanGlow/10 px-3 py-2 text-cyanGlow">Plan: {formattedPlan.replace(" Plan", "")}</p>
                        <p className="rounded-xl border border-amberGlow/20 bg-black/75 px-3 py-2 text-amberGlow">Attempts Left: {attempts}</p>
                      </div>
                      <div className="my-4 h-px bg-white/10" />
                      <Link to="/dashboard" className={dropdownLinkClass} onClick={closeMenu}>
                        <LayoutDashboard className="h-4 w-4 text-cyanGlow" />
                        Dashboard
                      </Link>
                      <Link to="/pricing" className={dropdownLinkClass} onClick={closeMenu}>
                        <CreditCard className="h-4 w-4 text-amberGlow" />
                        Purchase
                      </Link>
                      <button type="button" className={dropdownLinkClass} onClick={handleLogout}>
                        <LogOut className="h-4 w-4 text-roseGlow" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" className="ghost-button" onClick={closeMenu}>
                    Login
                  </Link>
                  <Link to="/signup" className="glow-button" onClick={closeMenu}>
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
