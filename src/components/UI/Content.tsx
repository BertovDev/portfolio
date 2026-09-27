"use client";

import React, { memo, useMemo } from "react";
import Section from "./Section";
import { useSectionStore } from "@/utils/Utils";
import dynamic from "next/dynamic";

type SectionComponent = Record<string, React.ComponentType>;

const SectionComponents: SectionComponent = {
  About: dynamic(() => import("./About")),
  Work: dynamic(() => import("./Work")),
  Projects: dynamic(() => import("./Projects")),
  Contact: dynamic(() => import("./Contact"), { ssr: false }),
};

const Content: React.FC = memo(() => {
  const isSectionClicked = useSectionStore((s) => s.isSectionClicked);

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
