"use client";

import { Canvas } from "@react-three/fiber";
import React from "react";
import Experience from "./Experience";
import { Perf } from "r3f-perf";

import { Leva } from "leva";

export default function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      className="bg-white"
    >
      {/* {process.env.NODE_ENV === "development" && <Perf position="top-left" />} */}
      <Leva hidden />
      <Experience />
    </Canvas>
  );
}
