"use client";

import { useEffect } from "react";
import { useProgress } from "@react-three/drei";
import { useLoadingStore } from "@/utils/Utils";

const PROGRESS_DONE_MARK = "loading:progress-100";
let progressDoneMarked = false;

function mirrorProgress(progress: number) {
  useLoadingStore.getState().setProgress(progress);
  if (progress === 100 && !progressDoneMarked) {
    progressDoneMarked = true;
    // User Timing entry for DevTools / field measurement.
    performance.mark(PROGRESS_DONE_MARK);
  }
}

/**
 * Feeds drei's loading progress into `useLoadingStore`. Lives in the Scene
 * chunk so the initial bundle (LoadingScreen, Content) never imports drei or
 * three. Rendered outside the Canvas' Suspense scope so it runs while the
 * models are still loading.
 */
export default function ProgressBridge() {
  useEffect(() => {
    const unsubscribe = useProgress.subscribe((state, prev) => {
      if (state.progress !== prev.progress) mirrorProgress(state.progress);
    });
    // Loads started at Scene chunk evaluation, before this effect ran.
    mirrorProgress(useProgress.getState().progress);
    return unsubscribe;
  }, []);

  return null;
}
