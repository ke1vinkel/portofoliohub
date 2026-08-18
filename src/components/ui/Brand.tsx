"use client";

import { Briefcase } from "lucide-react";
import Link from "next/link";

export function Brand() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight transition-opacity hover:opacity-90"
      aria-label="PortfolioHub home"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
        <Briefcase className="size-4" strokeWidth={2} />
      </span>
      <span>Portfolio<span className="text-primary font-bold">Hub</span></span>
    </Link>
  );
}
