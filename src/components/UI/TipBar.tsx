"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useCameraStore } from "@/utils/Utils";

type Props = {
  initialText: string;
  hasInteration: boolean;
  hasAnimation: boolean;
  styleProps: string;
};

export default function TipBar({
  initialText,
  hasInteration,
  hasAnimation,
  styleProps,
}: Props) {
  const { cameraZoomed } = useCameraStore();

  const [tipText, setTipText] = useState<string>(initialText);

  const tipRef: React.RefObject<HTMLSpanElement | null> =
    useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!hasInteration) return;
    setTipText(cameraZoomed ? "Click outside to zoom out" : initialText);
  }, [cameraZoomed]);

  useEffect(() => {
    if (hasAnimation && tipRef.current) {
      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1,
        defaults: { duration: 1, ease: "power1.inOut" },
      });

      tl.to(tipRef.current, {
        y: 100,
        opacity: 0,
        ease: "back.in",
        onComplete: () => {
          setTipText((current) => {
            const newText =
              current === initialText
                ? "Already got my Systems Analyst title"
                : initialText;
            return newText;
          });
        },
      }).to(tipRef.current, {
        y: 0,
        opacity: 1,
        ease: "back.out",
        delay: 1,
      });

      return () => {
        console.log("Cleaning up animation");
        tl.kill();
      };
    }
  }, [hasAnimation, initialText]);

  return (
    <div
      className={`absolute z-10 bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-inter  font-semibold text-center  ${styleProps}`}
    >
      <span
        ref={tipRef}
        className="block text-xl relative min-w-[200px]"
        data-text={tipText}
      >
        {tipText}
      </span>
    </div>
  );
}
