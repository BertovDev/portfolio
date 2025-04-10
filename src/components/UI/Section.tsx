"use client";

import { useSectionStore } from "@/utils/Utils";
import React, { useEffect, useRef, memo, useMemo, useCallback } from "react";
import gsap from "gsap";

type SectionProps = {
  children?: React.ReactNode;
};

const Section: React.FC<SectionProps> = memo(({ children }: SectionProps) => {
  const { isSectionClicked, setSectionClicked } = useSectionStore();

  const ref = useRef<HTMLDivElement>(null);
  const animRef = useRef<gsap.core.Tween | undefined>(undefined);

  // Memoize animation configuration
  const animConfig = useMemo(
    () => ({
      enter: {
        from: {
          y: -50,
          opacity: 0,
          scale: 0.98,
          filter: "blur(5px)",
        },
        to: {
          y: 0,
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          ease: "expo.out",
          duration: 0.8,
          transformOrigin: "50% 50%",
        },
      },
      exit: {
        to: {
          y: -30,
          opacity: 0,
          scale: 0.95,
          filter: "blur(4px)",
          ease: "power2.inOut",
          duration: 0.6,
          transformOrigin: "50% 50%",
        },
      },
    }),
    []
  );

  // Cleanup function for animations
  const cleanupAnimation = useCallback((): void => {
    if (animRef.current) {
      animRef.current.kill();
      animRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    if (ref.current && isSectionClicked.name !== null) {
      cleanupAnimation();
      const { from, to } = animConfig.enter;

      animRef.current = gsap.fromTo(ref.current, from, to);
    }

    return cleanupAnimation;
  }, [isSectionClicked.isClicked, animConfig, cleanupAnimation]);

  const handleBack = useCallback((): void => {
    if (ref.current) {
      cleanupAnimation();
      const { to } = animConfig.exit;

      animRef.current = gsap.to(ref.current, {
        ...to,
        onComplete: () => {
          if (isSectionClicked.name !== null) {
            setSectionClicked(null, false);
            cleanupAnimation();
          }
        },
      });
    }
  }, [isSectionClicked.name, setSectionClicked, animConfig, cleanupAnimation]);

  return (
    <div
      ref={ref}
      className="z-100 opacity-100 absolute h-screen w-screen bg-white overflow-hidden"
    >
      {children}

      <button
        className="z-100 absolute top-5 right-5 text-3xl text-black font-inter font-semibold text-center hover:underline hover:cursor-pointer"
        onClick={handleBack}
      >
        Back
      </button>
    </div>
  );
});

Section.displayName = "Section";
export default Section;
