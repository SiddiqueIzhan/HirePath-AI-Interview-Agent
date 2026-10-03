"use client";

import Logo from "./logo";
import { motion } from "framer-motion";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How It Works" },
  { href: "#testimonials", label: "Testimonials" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-[80] border-b border-white/[.06] bg-black/[.72] pt-[env(safe-area-inset-top,0px)] font-sans backdrop-blur-[14px]" style={{ fontFamily: "var(--font-hanken), Arial, sans-serif" }}>
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center gap-9 px-7 max-[900px]:gap-3 max-[900px]:px-[18px]">
        <Logo />

        <nav
          aria-label="Primary"
          className="flex gap-[30px] text-base text-[#a3a6aa] max-[900px]:hidden"
        >
          {NAV_LINKS.map((link) => (
            <motion.a
              key={link.href}
              href={`/${link.href}`}
              whileHover={{ color: "#ffffff" }}
              transition={{ duration: 0.2 }}
            >
              {link.label}
            </motion.a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <Show when="signed-out">
            <SignInButton>
              <button className="rounded-full px-4 py-2 text-sm font-medium text-[#c9cbce] transition-colors hover:text-white sm:text-base">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="h-10 cursor-pointer rounded-full border border-[#2be39a]/40 bg-[#2be39a] px-5 text-sm font-semibold text-[#04120c] shadow-[0_0_24px_rgba(43,227,154,.18)] transition-all hover:bg-[#55efb0] sm:h-11 sm:px-6 sm:text-base">
                Sign Up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
