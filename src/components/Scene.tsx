"use client";

// First import on purpose: evaluating drei's progress store installs the
// DefaultLoadingManager handlers before the model modules below start their
// useGLTF.preload() loads.
import ProgressBridge from "./loading/ProgressBridge";
import { Canvas } from "@react-three/fiber";
import React, { Suspense } from "react";
import Experience from "./Experience";

export default function Scene() {
  return (
    <>
      <ProgressBridge />
      {/* The Canvas re-throws its inner suspension (models loading) to the
          nearest DOM boundary; keep it here so only the canvas is hidden. */}
      <Suspense fallback={null}>
        <Canvas
          shadows
          dpr={[1, 2]}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          className="bg-white"
        >
          <Experience />
        </Canvas>
      </Suspense>
    </>
  );
}
