"use client";

import { Canvas } from "@react-three/fiber";
import React from "react";
import Experience from "./Experience";
import DevPerf from "./dev/DevPerf";

export default function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      performance={{ min: 0.5 }}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      className="bg-white"
    >
      <DevPerf />
      <Experience />
    </Canvas>
  );
}
