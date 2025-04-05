"use client";

import React from "react";
import Section from "./Section";
import { useSectionStore } from "@/utils/Utils";
import About from "./About";
import Work from "./Work";
import Projects from "./Projects";
import Contact from "./Contact";

type SectionComponent = Record<string, React.FC>;

const SectionComponents: SectionComponent = {
  About,
  Work,
  Projects,
  Contact,
};

export default function Content() {
  const { isSectionClicked } = useSectionStore();

  if (isSectionClicked.name === null && !isSectionClicked.isClicked) {
    return;
  }

  if (isSectionClicked.name && isSectionClicked.isClicked) {
    const SectionToRender: React.FC =
      SectionComponents[isSectionClicked.name as keyof SectionComponent];

    return (
      <div>
        <Section>{isSectionClicked.isClicked && <SectionToRender />}</Section>
      </div>
    );
  }
}
