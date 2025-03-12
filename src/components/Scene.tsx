"use client";

import { Canvas } from "@react-three/fiber";
import React, { Suspense, useContext } from "react";
import Experience from "./Experience";
import { useControls } from "leva";
import { Vector3 } from "three";

export default function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5], fov: 70 }}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      className="bg-white"
    >
      <Suspense fallback={null}>
        <Experience />
      </Suspense>
    </Canvas>
  );
}
