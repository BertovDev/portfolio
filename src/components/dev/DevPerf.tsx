"use client";

import dynamic from "next/dynamic";

// Gate at module level so the r3f-perf import is dead-code-eliminated from
// production builds (and prod installs without devDependencies still build).
const Perf =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("r3f-perf").then((m) => m.Perf), { ssr: false })
    : null;

export default function DevPerf() {
  if (!Perf) return null;
  return <Perf position="top-left" />;
}
