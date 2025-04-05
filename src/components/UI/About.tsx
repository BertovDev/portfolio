"use client";

import React, { useEffect, useRef, useState } from "react";
import CursorTip from "./CursorTip";
import gsap from "gsap";
import TipBar from "./TipBar";

type ImageInfoState = {
  textContent: string;
  isHovering: boolean;
};

export default function About() {
  const [imageInfoState, setImageInfoState] = useState<ImageInfoState>({
    textContent: "",
    isHovering: false,
  });

  const turnstileImage: React.RefObject<HTMLImageElement | null> =
    useRef<HTMLImageElement>(null);

  const flowerRef: React.RefObject<HTMLImageElement | null> =
    useRef<HTMLImageElement>(null);

  const sapporoRef: React.RefObject<HTMLImageElement | null> =
    useRef<HTMLImageElement>(null);

  useEffect(() => {
    gsap.to(sapporoRef.current, {
      scale: 1.1,
      duration: 0.9,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut",
    });

    gsap.to(flowerRef.current, {
      rotation: 360,
      duration: 1.2,
      ease: "power1.inOut",
    });
  }, []);

  return (
    <div className="flex items-center h-full cursor-auto">
      <div id="leftSide" className="flex flex-col items-center flex-auto ">
        <img
          className="relative cursor-pointer md:bottom-40 lg:bottom-35 xl:bottom-25 md:left-15 lg:left-25 w-60"
          src="/images/AboutSection/SmilingFace.svg"
          alt=""
        />
        <div
          className="relative cursor-pointer md:w-40 lg:w-40 xl:w-60 xl:right-5 2xl:right-15"
          onMouseOver={(e) => {
            e.stopPropagation();
            const anim = gsap.to(turnstileImage.current, {
              opacity: 1,
              duration: 0.5,
              onComplete: () => {
                anim.kill();
              },
            });
            setImageInfoState({
              textContent: "I love hardcore music, specially turnstile",
              isHovering: true,
            });
          }}
          onMouseOut={(e) => {
            e.stopPropagation();
            const anim = gsap.to(turnstileImage.current, {
              opacity: 0,
              duration: 0.5,
              onComplete: () => {
                anim.kill();
              },
            });
            setImageInfoState({
              textContent: "<3",
              isHovering: false,
            });
          }}
        >
          <div className="relative">
            <img
              className="w-full"
              src="/images/AboutSection/Heart.svg"
              alt=""
            />
            <a
              href="https://www.youtube.com/watch?v=gCR5jwLVf0E&t=1s"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                ref={turnstileImage}
                className="opacity-0 absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                src="/images/AboutSection/TLC.svg"
                alt="TLC"
              />
            </a>
          </div>
        </div>

        <img
          ref={sapporoRef}
          className="relative cursor-pointer left-25 top-20 w-38"
          src="/images/AboutSection/sapporo.svg"
          alt=""
          onMouseOver={(e) => {
            e.stopPropagation();
            setImageInfoState({
              textContent: "I would die for a pint rn (sapporo)",
              isHovering: true,
            });
          }}
          onMouseOut={(e) => {
            e.stopPropagation();
            setImageInfoState({
              textContent: "cheers",
              isHovering: false,
            });
          }}
        />
      </div>
      <div className="flex-none w-2/4 mb-20 ">
        <div className="text-black font-inter font-medium text-center text-3xl xl:text-4xl  2xl:text-5xl/13">
          I´m Bautista Berto{" "}
          <span className="line-through decoration-3 decoration-custom-blue font-mono">
            Creative
          </span>{" "}
          Frontend Developer from Buenos Aires, Argentina. With 3+ years of
          expertise I thrive on turning ideas into fully functional, stunning
          applications using React, Typescript, ThreeJs, NextJs. I combine a
          creative perspective with JavaScript tools, leveraging my experience
          in application and video game development to create <br />
          <span className=" underline decoration-3 decoration-custom-red">
            Unique Web Experiences.
          </span>
        </div>

        <TipBar
          hasAnimation={true}
          hasInteration={false}
          initialText="Finishing my Bachelor of Information Systems studies."
          styleProps="text-[#006be4]"
        />
      </div>

      <div id="rightSide" className="flex flex-col items-center flex-auto ">
        <div
          className="relative cursor-pointer bottom-30"
          onMouseEnter={(e) => {
            e.stopPropagation();
            gsap.to(flowerRef.current, {
              rotation: 0,
              duration: 1,
            });
          }}
        >
          <img
            ref={flowerRef}
            className=""
            src="/images/AboutSection/Flower.svg"
            alt=""
          />
        </div>

        <a
          className="relative cursor-pointer top-0 xl:left-0 2xl:left-25"
          href="/BautistaBertoResume.pdf"
          target="_blank"
          onMouseOver={(e) => {
            e.stopPropagation();
            setImageInfoState({
              textContent: "Click to open :D",
              isHovering: true,
            });
          }}
          onMouseOut={(e) => {
            e.stopPropagation();
            setImageInfoState({
              textContent: "D:",
              isHovering: false,
            });
          }}
        >
          <img className="" src="/images/AboutSection/Resume.svg" alt="" />
        </a>

        <div
          className="relative md:top-30 lg:top-30 xl:top-30 2xl:top-25 md:right-40"
          onMouseOver={(e) => {
            e.stopPropagation();
            setImageInfoState({
              textContent: "I like to buy vinyls",
              isHovering: true,
            });
          }}
          onMouseOut={(e) => {
            e.stopPropagation();
            setImageInfoState({
              textContent: "bye",
              isHovering: false,
            });
          }}
        >
          <img
            className=" cursor-pointer "
            src="/images/AboutSection/turntableImage.svg"
            alt=""
          />
        </div>
      </div>

      <CursorTip
        isHovering={imageInfoState.isHovering}
        textContent={imageInfoState.textContent}
      />
    </div>
  );
}
