import gsap from "gsap";
import React, { useEffect, useRef } from "react";

type Props = {};

export default function LambdaSection({}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state
      gsap.set(".animate-section", { opacity: 0, y: 0 });
      gsap.set(".tech-stack-img", { opacity: 0, scale: 0.5 });
      gsap.set(".section-title", { opacity: 0, y: 20 });

      // Main container animation
      gsap.to(ref.current, {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
      });

      // Staggered animation for name and date
      gsap.to(".animate-name-date", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out",
      });

      // Simultaneous animation for section titles
      gsap.to(".section-title", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.6,
      });

      // Staggered animation for stack and about sections
      gsap.to(".animate-info", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.3,
        ease: "power2.out",
        delay: 0.5,
      });

      // Staggered animation for technology stack images
      gsap.to(".tech-stack-img", {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.15,
        ease: "back.out(1.7)",
        delay: 0.9,
      });

      // Staggered animation for list items
      gsap.to(".animate-list-item", {
        opacity: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        delay: 1,
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      className="opacity-0 h-full w-full flex flex-col justify-center items-center gap-y-8"
    >
      <div id="info" className="flex flex-row gap-x-10 order-2">
        <div className="flex flex-col gap-y-7 animate-section animate-info">
          <h2 className="font-inter font-semibold underline text-3xl section-title">
            Stack
          </h2>
          <div className="flex flex-col h-full justify-between mb-2">
            <img src="/images/work/Ts.svg" alt="" className="tech-stack-img" />
            <img
              src="/images/work/React.svg"
              alt=""
              className="tech-stack-img"
            />
            <img src="/images/work/C.svg" alt="" className="tech-stack-img" />
            <img
              src="/images/work/Unity.svg"
              alt=""
              className="tech-stack-img"
            />
            <img
              src="/images/work/TailwindCss.svg"
              alt=""
              className="tech-stack-img"
            />
          </div>
        </div>
        <div className="flex flex-col gap-y-7 animate-section animate-info">
          <div className="flex flex-col gap-y-4">
            <h2 className="font-inter font-semibold underline text-3xl section-title">
              About
            </h2>
            <p className="font-light font-inter text-2xl">
              Led the frontend development of a multiplayer mobile game and
              multiples websites, collaborating with international teams (US &
              Europe) to build a high-performance, interactive experience.
            </p>
          </div>
          <div className="flex flex-col gap-y-6">
            <h2 className="font-inter font-semibold underline text-3xl">
              Achievements and Responsibilities:
            </h2>
            <ul className="font-light font-inter text-2xl flex flex-col gap-y-8">
              <li className="animate-section animate-list-item">
                <span className="font-semibold">Feature Development:</span>{" "}
                Implemented multiple key features, including character creation,
                lobby creation, and multiplayer synchronization. Additionally,
                worked on client prediction and animation coordination between
                the client and backend, significantly enhancing the user
                experience.
              </li>
              <li className="animate-section animate-list-item">
                <span className="font-semibold">
                  Code Optimization and Refactoring:
                </span>{" "}
                Coordinated refactorings to eliminate redundant code and
                optimize game performance. Conducted performance tests to ensure
                smooth operation on less powerful devices, expanding
                accessibility.
              </li>
              <li className="animate-section animate-list-item">
                <span className="font-semibold">
                  Collaboration with Backend Team:
                </span>{" "}
                Maintained close coordination with the backend team, designing
                and coordinating feature implementation on both sides of the
                project, ensuring seamless integration of frontend and backend
                components.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div
        id="nameAndDate"
        className="font-inter flex flex-row gap-x-4 w-full justify-between order-1"
      >
        <div className="flex flex-col gap-y-5 animate-section animate-name-date">
          <h3 className="text-5xl font-semibold underline underline-offset-4">
            LambdaClass
          </h3>
          <h4 className="text-red-500 text-3xl font-semibold">
            Frontend and Game Developer
          </h4>
        </div>
        <span className="text-3xl animate-section animate-name-date">
          10/2022 - 06/2024
        </span>
      </div>
    </div>
  );
}
