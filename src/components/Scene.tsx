"use client";

import { Canvas } from "@react-three/fiber";
import React, { Suspense, useContext } from "react";
import Experience from "./Experience";
import { Perf } from "r3f-perf";

import { useControls } from "leva";

export default function Scene() {
  const { pos, rot } = useControls({
    pos: [-0.8, 4.5, 4.0],
    rot: [0, 0, 0],
  });

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      className="bg-white"
    >
      <Perf position="top-left" />
      <Suspense fallback={null}>
        <Experience />
      </Suspense>
    </Canvas>
  );
}
