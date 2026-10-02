"use client";

import React, { memo, useEffect, useMemo, useRef } from "react";
import Section from "./Section";
import { useLoadingStore, useSectionStore } from "@/utils/Utils";
import dynamic from "next/dynamic";

type SectionComponent = Record<string, React.ComponentType>;

const SectionComponents: SectionComponent = {
  About: dynamic(() => import("./About")),
  Work: dynamic(() => import("./Work")),
  Projects: dynamic(() => import("./Projects")),
  Contact: dynamic(() => import("./Contact"), { ssr: false }),
};

// Warm section chunks (and mail.glb, preloaded by ContactScene's module) so
// the first section open doesn't show an empty panel while its code loads.
const prefetchSections = () => {
  void import("./About");
  void import("./Work");
  void import("./Projects");
  void import("./Contact");
  void import("./ContactScene");
};

const Content: React.FC = memo(() => {
  const isSectionClicked = useSectionStore((s) => s.isSectionClicked);
  const sceneReady = useLoadingStore((s) => s.sceneReady);
  const hasPrefetched = useRef(false);

  // Wait until the main scene has loaded, compiled and rendered its first
  // frame so prefetching doesn't compete with it.
  useEffect(() => {
    if (!sceneReady || hasPrefetched.current) return;
    const run = () => {
      hasPrefetched.current = true;
      prefetchSections();
    };

    // Safari has no requestIdleCallback.
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(run, 1000);
    return () => clearTimeout(id);
  }, [sceneReady]);

  // Memoize the section component to render
  const SectionToRender = useMemo(
    () => SectionComponents[isSectionClicked.name as keyof SectionComponent],
    [isSectionClicked.name]
  );

 if (!isSectionClicked.isClicked || !isSectionClicked.name) {
    return null;
  }

  return (
    <div>
      <Section>
        <SectionToRender />
      </Section>
    </div>
  );
});

Content.displayName = 'Content';
export default Content;
