"use client";

import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import React, { useState } from "react";
import Experience from "./Experience";
import DevPerf from "./dev/DevPerf";

const MAX_DPR = 1.5;
const LOW_DPR = 1;

export default function Scene() {
  // Upper bound of the dpr range; R3F still clamps to the device's ratio.
  const [maxDpr, setMaxDpr] = useState(MAX_DPR);

  return (
    <Canvas
      shadows
      dpr={[1, maxDpr]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      className="bg-white"
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setMaxDpr(LOW_DPR)}
        onIncline={() => setMaxDpr(MAX_DPR)}
        onFallback={() => setMaxDpr(LOW_DPR)}
      />
      <DevPerf />
      <Experience />
    </Canvas>
  );
}
