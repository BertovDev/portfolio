"use client";

import dynamic from "next/dynamic";

const Perf = dynamic(() => import("r3f-perf").then((m) => m.Perf), {
  ssr: false,
});

export default function DevPerf() {
  if (process.env.NODE_ENV !== "development") return null;
  return <Perf position="top-left" />;
}
