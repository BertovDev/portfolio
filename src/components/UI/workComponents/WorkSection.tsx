import React, { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";

type Props = {
  children: ReactNode;
};

export default function WorkSection({ children }: Props) {
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
        delay: 0.2,
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
      className="opacity-0 h-full w-full flex flex-col justify-center items-center gap-y-2 2xl:gap-y-8"
    >
      {children}
    </div>
  );
}
