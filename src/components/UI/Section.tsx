"use client";

import { useSectionStore } from "@/Utils";
import React, { useEffect, useReducer, useRef } from "react";
import gsap from "gsap";

type SectionProps = {
  children?: React.ReactNode;
};

const Section: React.FC<SectionProps> = ({ children }) => {
  const { isSectionClicked, setSectionClicked } = useSectionStore();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        {
          y: -100,
          opacity: 0,
          duration: 1,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
        }
      );
    }
  }, [isSectionClicked]);

  return (
    <div ref={ref} className="opacity-0 absolute h-screen w-screen bg-white">
      {children}

      <button
        className="absolute top-5 right-5 text-3xl text-black font-inter font-semibold text-center  hover:underline hover:cursor-pointer"
        onClick={() => {
          if (ref.current) {
            gsap.to(ref.current, {
              y: -100,
              opacity: 0,
              duration: 0.5,
              onComplete: () => {
                setSectionClicked(false);
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
