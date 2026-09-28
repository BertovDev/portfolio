"use client";

import React, { type ComponentType, useEffect, useState } from "react";

// Starts downloading the Scene chunk group as soon as the initial bundle
// evaluates. Unlike next/dynamic (React.lazy + Suspense), the reveal is a
// plain state update, so it isn't held back by Suspense's ~300 ms reveal
// throttle once the chunks are in.
const scenePromise =
  typeof window === "undefined" ? null : import("@/components/Scene");

export default function SceneLoader() {
  const [Scene, setScene] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (!scenePromise) return;
    let mounted = true;
    scenePromise.then((mod) => {
      // Function form: the component itself is a function.
      if (mounted) setScene(() => mod.default);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return Scene ? <Scene /> : null;
}
