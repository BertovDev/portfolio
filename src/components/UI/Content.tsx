"use client";

import React from "react";
import Section from "./Section";
import About from "./About";
import { useSectionStore } from "@/Utils";
import Work from "./Work";

export default function Content() {
  const { isSectionClicked } = useSectionStore();

  return (
    <div>
      {isSectionClicked.name === "About" && isSectionClicked.isClicked && (
        <Section>
          <About />
        </Section>
      )}

      {isSectionClicked.name === "Work" && isSectionClicked.isClicked && (
        <Section>
          <Work />
        </Section>
      )}
    </div>
  );
}
