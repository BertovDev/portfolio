"use client";

import React, { memo, useMemo } from "react";
import Section from "./Section";
import { useSectionStore } from "@/utils/Utils";
import About from "./About";
import Work from "./Work";
import Projects from "./Projects";
import Contact from "./Contact";

type SectionComponent = Record<string, React.FC>;

// Memoize section components
const MemoizedAbout = memo(About);
const MemoizedWork = memo(Work);
const MemoizedProjects = memo(Projects);
const MemoizedContact = memo(Contact);

// Memoize the components mapping
const SectionComponents: SectionComponent = {
  About: MemoizedAbout,
  Work: MemoizedWork,
  Projects: MemoizedProjects,
  Contact: MemoizedContact,
};

const Content: React.FC = memo(() => {
  const { isSectionClicked } = useSectionStore();

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
