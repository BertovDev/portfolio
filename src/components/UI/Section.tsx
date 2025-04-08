"use client";

import { useSectionStore } from "@/utils/Utils";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";

type SectionProps = {
  children?: React.ReactNode;
};

const Section: React.FC<SectionProps> = ({ children }) => {
  const { isSectionClicked, setSectionClicked } = useSectionStore();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && isSectionClicked.name !== null) {
      gsap.fromTo(
        ref.current,
        {
          y: -100,
          opacity: 0,
          duration: 0.7,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
        }
      );
    }
  }, [isSectionClicked.isClicked]);

  return (
    <div
      ref={ref}
      className="z-100 opacity-0 absolute h-screen w-screen bg-white overflow-hidden"
    >
      {children}

      <button
        className="z-100 absolute top-5 right-5 text-3xl text-black font-inter font-semibold text-center  hover:underline hover:cursor-pointer"
        onClick={() => {
          if (ref.current) {
            gsap.to(ref.current, {
              y: -100,
              opacity: 0,
              duration: 0.5,
              onComplete: () => {
                if (isSectionClicked.name !== null) {
                  setSectionClicked(null, false);
                }
              },
            });
          }
        }}
      >
        Back
      </button>
    </div>
  );
};

export default Section;
