"use client";

import React from "react";
import Section from "./Section";
import About from "./About";
import { useSectionStore } from "@/Utils";
import Work from "./Work";

type SectionComponent = {
  About: React.FC;
  Work: React.FC;
};

const SectionComponents: SectionComponent = {
  About,
  Work,
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
        <Section>
          <SectionToRender />
        </Section>
      </div>
    );
  }
}
