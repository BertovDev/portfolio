"use client";

import React from "react";
import Section from "./Section";
import About from "./About";
import { useSectionStore } from "@/Utils";

export default function Content() {
  const { isSectionClicked } = useSectionStore();

  return (
    <div>
      {isSectionClicked && (
        <Section>
          <About />
        </Section>
      )}
    </div>
  );
}
