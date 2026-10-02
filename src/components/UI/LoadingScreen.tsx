"use client";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import Image from "next/image";
import { useLoadingStore } from "@/utils/Utils";

gsap.registerPlugin(SplitText);

const NARROW_QUERY = "(max-width: 899px)";
const subscribeNarrow = (onChange: () => void) => {
  const mq = window.matchMedia(NARROW_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const getNarrow = () => window.matchMedia(NARROW_QUERY).matches;
const getNarrowServer = () => false;

// Assets loaded and the scene's first frame rendered (shaders compiled).
type LoadingSnapshot = { progress: number; sceneReady: boolean };
const isSceneDone = ({ progress, sceneReady }: LoadingSnapshot) =>
  progress === 100 && sceneReady;

export default function LoadingScreen() {
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const ref = useRef<HTMLDivElement | null>(null);
  const loadingTextRef = useRef<HTMLParagraphElement>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);

  const splitWelcomeRef = useRef<SplitText | null>(null);
  const progress = useLoadingStore((s) => s.progress);

  // Lazy init covers client-side navigation back to "/" after the scene loaded.
  const [isLoading, setIsLoading] = useState<boolean>(
    () => !isSceneDone(useLoadingStore.getState())
  );
  // Latches at 100: later loads (e.g. prefetched mail.glb) move drei's global
  // progress again and must not rewind the bar or remount the welcome block.
  const hasFinishedRef = useRef(false);

  const mobileWarning = useSyncExternalStore(
    subscribeNarrow,
    getNarrow,
    getNarrowServer
  );

  const animateText = () => {
    if (!loadingTextRef.current) return;

    // gsap.to(loadingTextRef.current, {
    //   width: "0%",
    //   duration: 2,
    //   // yoyo: true,
    //   // repeat: -1,
    //   ease: "power2",
    // });

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
        // Revealed in the same frame the logo column is hidden, so the welcome
        // block appears in place instead of moving into view (CLS).
        if (welcomeRef.current) welcomeRef.current.style.visibility = "visible";
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
        scaleX: 1,
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
          scaleX: 0,
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
            if (ref.current) ref.current.style.display = "none";
          },
        },
        "-=0.5"
      );
    }
  };

  useEffect(() => {
    if (!loadingTextRef.current || hasFinishedRef.current) return;
    gsap.to(loadingTextRef.current, {
      scaleX: 1 - progress / 100,
      duration: 2,
      ease: "power2",
    });

    if (progress === 0) {
      animateText();
    }
    if (progress === 100) {
      hasFinishedRef.current = true;
    }
  }, [progress]);

  useEffect(
    () =>
      useLoadingStore.subscribe((state) => {
        if (isSceneDone(state)) setIsLoading(false);
      }),
    []
  );

  // Scene loaded and first frame rendered -> show welcome section

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
          <div className="text-[60px] sm:text-[100px] md:text-[150px] lg:text-[200px] 2xl:text-[300px] font-bold loading-text bg-black text-white w-full">
            {/* <p>LOADING</p> */}
            <Image
              src="/benjiDor.webp"
              width={500}
              height={500}
              alt="benji"
              priority
              unoptimized
            />
          </div>
          <div
            ref={loadingTextRef}
            className="bg-white h-125 w-125 absolute"
          ></div>
          <h2 className="mt-5 font-inter font-bold text-3xl">Loading...</h2>
        </div>
      </div>

      {/* Out of flow so hiding the logo column doesn't move it (CLS). The
          p-10 inset matches the root padding: same centering as the in-flow
          column, and the mobile warning's bottom-0 still hits the viewport
          edge. Hidden until animateWelcome hides the logo column. */}
      <div
        ref={welcomeRef}
        className="invisible absolute inset-0 p-10 box-border flex flex-col justify-around items-center"
      >
        <div className="flex flex-col gap-y-1 my-auto justify-center items-center ">
          {!isLoading && (
            <div className="flex flex-col justify-center items-center">
              <div className="">
                <h2 className="welcome text-[60px] sm:text-[100px] md:text-[150px] lg:text-[200px] 2xl:text-[300px] font-inter font-bold uppercase">
                  Welcome
                </h2>
                <div className="underline-bar w-full scale-x-0 origin-left relative bottom-3 2xl:bottom-20 h-1 bg-black"></div>
              </div>
              <button
                className="start-button border cursor-pointer rounded-lg py-1 text-lg font-inter px-10 hover:text-white hover:bg-black hover:border-white transition-all duration-500"
                onClick={() => startExperience()}
                disabled={isButtonDisabled}
              >
                Start
              </button>

              {mobileWarning && (
                <div className="visible text-yellow-500 text-center flex items-center absolute bottom-0">
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
