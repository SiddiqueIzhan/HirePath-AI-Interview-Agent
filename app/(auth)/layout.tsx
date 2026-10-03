import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative isolate flex min-h-[calc(100vh-72px)] flex-1 items-center justify-center overflow-hidden bg-black px-5 py-14 text-[#f4f4f5]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_40%,rgba(16,120,78,.2),transparent_55%)]"
      />
      <div className="w-full max-w-[440px] [&_.cl-rootBox]:mx-auto [&_.cl-card]:w-full">
        {children}
      </div>
    </main>
  );
}
