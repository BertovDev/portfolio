"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export default function LoadingScreen() {
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const ref = useRef<HTMLDivElement | null>(null);
  const loadingTextRef = useRef<HTMLParagraphElement>(null);

  const splitWelcomeRef = useRef<SplitText | null>(null);
  const { progress } = useProgress();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [mobileWarning, setMobileWarning] = useState<boolean>(false);

  const detectMobile = () => {
    if (window.innerWidth < 900) {
      setMobileWarning(true);
    }
  };

  const animateText = () => {
    if (!loadingTextRef.current) return;

    gsap.to(loadingTextRef.current, {
      width: "100%",
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "power2",
    });

    // // Kill previous split
    // const split = new SplitText(loadingTextRef.current.children[0], {
    //   type: "words,chars",
    // });
    // splitRef.current = split;

    // // Clear and create new timeline
    // tlRef.current?.clear();
    // tlRef.current = gsap.timeline();

    // tlRef.current.set(split.words, { x: -400 });
    // tlRef.current.to(split.chars, {
    //   x: 400,
    //   duration: 1,
    //   stagger: 0.05,
    //   ease: "power2",
    // });
    // tlRef.current.to(split.words, {
    //   x: 0,
    //   opacity: 1,
    //   duration: 1,
    //   stagger: 0.05,
    //   ease: "power2",
    // });
    // tlRef.current.repeat(-1);
  };

  const animateWelcome = () => {
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
    splitWelcomeRef.current = split;
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
        onComplete: () => {
          setIsButtonDisabled(false);
        },
      },
      "-=0.5"
    );
  };

  const animateWelcomeOut = () => {
    if (ref.current && splitWelcomeRef.current) {
      const tl = gsap.timeline();
      tl.to(splitWelcomeRef.current.chars, {
        yPercent: "random([-100,100])",
        autoAlpha: 0,
        duration: 1,
        ease: "power2",
        stagger: {
          amount: 0.5,
          from: "random",
        },
      });
      tl.to(
        ".underline-bar",
        {
          width: "0%",
          duration: 0.3,
        },
        0
      );
      tl.to(
        ".start-button",
        {
          opacity: 0,
          duration: 0.5,
          ease: "back",
        },
        0
      );

      tl.to(
        ref.current,
        {
          opacity: 0,
          duration: 1,
          ease: "back",
          onComplete: () => {
            if (ref.current) ref.current.style.display = " none";
          },
        },
        "-=0.5"
      );
    }
  };

  useEffect(() => {
    if (progress === 0) {
      animateText();
      detectMobile();
    }
    if (progress === 100) {
      setIsLoading(false);
    }
  }, [progress]);

  // Loading Done -> show welcome section

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        animateWelcome();
      }, 1000);
    }
  }, [isLoading]);

  // Remove welcome section
  const startExperience = useCallback(() => {
    animateWelcomeOut();
  }, []);

  return (
    <div
      ref={ref}
      className="relative min-h-screen z-100 p-10 box-border overflow-hidden h-screen bg-white"
    >
      <div className="flex flex-col justify-around items-center min-h-full">
        <div className="flex flex-col justify-center items-center  min-h-screen">
          <div
            ref={loadingTextRef}
            className="text-[60px] sm:text-[100px] md:text-[150px] lg:text-[200px] 2xl:text-[300px] font-bold loading-text bg-black text-white w-1"
          >
            <p>LOADING</p>
          </div>
        </div>

        <div className="flex flex-col gap-y-1 my-auto justify-center items-center ">
          {progress === 100 && (
            <div className="flex flex-col justify-center items-center">
              <div className="">
                <h2 className="welcome text-[60px] sm:text-[100px] md:text-[150px] lg:text-[200px] 2xl:text-[300px] font-inter font-bold uppercase">
                  Welcome
                </h2>
                <div className="underline-bar w-0 relative bottom-3 2xl:bottom-20 h-1 bg-black"></div>
              </div>
              <button
                className="start-button border cursor-pointer rounded-lg py-1 text-lg font-intter px-10 hover:text-white hover:bg-black hover:border-white transition-all duration-500"
                onClick={() => startExperience()}
                disabled={isButtonDisabled}
              >
                Start
              </button>

              {mobileWarning && (
                <div className="text-yellow-500 text-center flex items-center absolute bottom-0">
                  Warning: This experience is not fully suported on mobile{" "}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
