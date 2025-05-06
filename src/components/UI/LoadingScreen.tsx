"use client";
import React, { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export default function LoadingScreen() {
  const [start, setStart] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const loadingTextRef = useRef<HTMLParagraphElement>(null);

  const splitRef = useRef<SplitText | null>(null);
  const { progress } = useProgress();

  const [text, setText] = useState<string>("LOADING");
  const textListRef = useRef<HTMLUListElement | null>(null);
  const tl = gsap.timeline();
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // const [current, setCurrent] = useState(0);
  const progressRef = useRef<number>(0);

  // STEP 1 — Split text into characters once

  const animateText = () => {
    if (!loadingTextRef.current) return;

    // Kill previous split
    const split = new SplitText(loadingTextRef.current, {
      type: "words,chars",
    });
    splitRef.current = split;

    // Clear and create new timeline
    tlRef.current?.clear();
    tlRef.current = gsap.timeline();

    tlRef.current.set(split.words, { y: -400 });
    tlRef.current.to(split.chars, {
      y: 400,
      duration: 1,
      stagger: 0.05,
      ease: "power2",
    });
    tlRef.current.to(split.words, {
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.05,
      ease: "power2",
    });
    tlRef.current.repeat(-1);
  };

  useEffect(() => {
    animateText();
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const tl = gsap.timeline();

      tl.to(loadingTextRef.current, {
        background: "white",
        duration: 0.1,
        onComplete: () => {
          // tlRef.current?.kill();
          if (loadingTextRef.current && loadingTextRef.current.parentElement)
            loadingTextRef.current.parentElement.style.display = "none";
        },
      });
      const split = new SplitText(".welcome", {
        type: "chars",
      });
      tl.fromTo(
        split.chars,
        {
          yPercent: "random([-100,100])",
          duration: 0.8,
          autoAlpha: 0,
          ease: "power2",
          stagger: {
            amount: 0.5,
            from: "random",
          },
        },
        {
          yPercent: 0,
          duration: 0.8,
          autoAlpha: 1,
          ease: "power2",
          stagger: {
            amount: 0.5,
            from: "random",
          },
        }
      );

      tl.to(
        ".underline-bar",
        {
          width: "100%",
          duration: 1,
        },
        "-=0.5"
      );
    }
  }, [progress]);

  // STEP 3 — Fade out the loading screen when done
  useEffect(() => {
    if (ref.current && start) {
      const tl = gsap.timeline();

      const split = new SplitText(".welcome", {
        type: "chars",
      });

      tl.to(split.chars, {
        yPercent: "random([-100,100])",
        autoAlpha: 0,
        duration: 1,
        ease: "power2",
        stagger: {
          amount: 0.5,
          from: "random",
        },
      });

      tl.to(ref.current, {
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        onComplete: () => {
          if (ref.current) ref.current.style.display = "none";
        },
      });
    }
  }, [start]);

  return (
    <div
      ref={ref}
      className="relative min-h-screen z-100 p-10 box-border overflow-hidden h-screen bg-white"
    >
      <div className="flex flex-col justify-around items-center min-h-full">
        <div className="flex flex-col justify-center items-center min-h-screen">
          <p
            ref={loadingTextRef}
            className="text-[300px] font-bold loading-text bg-black text-white"
          >
            {text}
          </p>
        </div>
        <div className="flex flex-col gap-y-1 my-auto justify-center items-center ">
          {progress === 100 && (
            <div className="flex flex-col justify-center items-center">
              <div className="">
                <h2 className="welcome text-[300px] font-inter font-bold uppercase">
                  Welcome
                </h2>
                <div className="underline-bar w-0 relative bottom-20 h-1 bg-black"></div>
              </div>
              <button
                className="border cursor-pointer rounded-lg py-1 text-lg font-intter px-10 hover:text-white hover:bg-black hover:border-white transition-all duration-500"
                onClick={() => setStart(true)}
              >
                Start
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
