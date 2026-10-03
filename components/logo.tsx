import { cn } from "cn";
import Image from "next/image";
import logo from "../public/logo.png";

export default function Logo({ className }: { className?: string }) {
  return (
    <a
      href="/"
      className={cn(
        "flex items-center whitespace-nowrap text-[22px] font-bold tracking-[-.03em]",
        className,
      )}
    >
      <Image src={logo} alt="logo" width={200} height={60} />
    </a>
  );
}
