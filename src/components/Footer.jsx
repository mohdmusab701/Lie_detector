import { Github, Instagram, Linkedin, Mail, Phone, ScanSearch, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const quickLinks = [
  { label: "Truth Scanner", to: "/" },
  { label: "Viral Fakes", to: "/trending" },
  { label: "Our Mission", to: "/about" },
  { label: "Connect", to: "/contact" },
];

const contacts = [
  { label: "ayushsrivastavaup62@gmail.com", icon: Mail, href: "mailto:ayushsrivastavaup62@gmail.com" },
  { label: "+91 7275794027", icon: Phone, href: "tel:+917275794027" },
  { label: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/in/ayush-srivastava-3465753b2", external: true },
  { label: "Instagram", icon: Instagram, href: "https://www.instagram.com/ayushsrivastavaup62", external: true },
  { label: "Github", icon: Github, href: "https://github.com/ayushsrivastavaup62", external: true },
  { label: "X", icon: Twitter, href: "https://x.com/I_am_AyushX", external: true },
];

export default function Footer() {
  return (
    <footer className="relative mt-10 overflow-hidden border-t border-white/10 bg-black/75 shadow-[0_-18px_70px_rgba(134,217,232,0.06)] before:absolute before:left-0 before:top-0 before:h-10 before:w-44 before:bg-amberGlow/18 before:[clip-path:polygon(0_0,100%_0,78%_100%,0_100%)]">
      <div className="container-shell grid gap-8 py-8 md:grid-cols-[1.15fr_0.7fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyanGlow/30 bg-cyanGlow/10 shadow-glow">
              <ScanSearch className="h-5 w-5 text-cyanGlow" />
            </span>
            <span className="text-xl font-black tracking-wide text-stone-50">
              Lie_detector
            </span>
          </div>
          <p className="mt-4 max-w-md leading-7 text-stone-500">
            AI-powered media authenticity scanner helping users detect fake images, deepfake videos, and misinformation.
          </p>
          <p className="mt-5 text-sm font-semibold text-stone-300">
            Made by <a href="ayush-portfolio-ten-omega.vercel.app" >Ayush Srivastava</a> in collaboration with Artificial Intelligence
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-cyanGlow">Quick links</h3>
          <div className="mt-5 grid gap-3">
            {quickLinks.map((link) => (
              <Link key={link.to} to={link.to} className="text-sm font-medium text-slate-400 transition hover:translate-x-1 hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-violetGlow">Contact</h3>
          <div className="mt-5 grid gap-3">
            {contacts.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="inline-flex items-center gap-3 text-sm text-slate-400 transition hover:text-white"
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                >
                  <Icon className="h-4 w-4 text-cyanGlow" />
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-sm text-stone-600">
        © 2026 Lie_detector. All rights reserved.
      </div>
    </footer>
  );
}
