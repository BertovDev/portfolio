"use client";

import React, { useEffect, useRef, useState } from "react";
import CursorTip from "./CursorTip";
import gsap from "gsap";
import TipBar from "./TipBar";
import Image from "next/image";

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
    <div className="flex items-center flex-col lg:flex-row h-full cursor-auto ">
      <div
        id="leftSide"
        className="flex md:flex-row lg:flex-col items-center justify-between flex-auto w-full mt-5 lg:mt-0  px-5 lg:px-0 "
      >
        <Image
          width={100}
          height={100}
          className="lg:relative cursor-pointer bottom-0  lg:bottom-20 xl:bottom-15 2xl:bottom-28 md:left-3 xl:left-10 w-33 md:w-40 lg:w-40  xl:w-50 2xl:w-60"
          src="/images/AboutSection/SmilingFace.svg"
          alt=""
        />
        <div
          className="lg:relative cursor-pointer right-0 w-25 md:w-40 lg:w-40 xl:w-50 2xl:w-60 lg:right-5 xl:right-5 2xl:right-15"
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
            <Image
              width={100}
              height={100}
              className="w-full"
              src="/images/AboutSection/Heart.svg"
              alt=""
            />
            <a
              href="https://www.youtube.com/watch?v=gCR5jwLVf0E&t=1s"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                width={100}
                height={100}
                ref={turnstileImage}
                className="opacity-0 absolute  w-15 lg:w-30 top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                src="/images/AboutSection/TLC.svg"
                alt="TLC"
              />
            </a>
          </div>
        </div>

        <Image
          width={100}
          height={100}
          ref={sapporoRef}
          className="lg:relative cursor-pointer md:left-20 xl:left-25 md:top-30 xl:top-20 w-23 md:w-30 xl:w-33 2xl:w-40"
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
      <div className="flex-none  w-full lg:w-2/4 mb-0 lg:mb-20 px-5 md:px-10 lg:px-0">
        <div className="text-black font-inter font-medium text-center text-lg/5.5 md:text-2xl lg:text-2xl xl:text-4xl 2xl:text-5xl/13">
          I´m Bautista Berto{" "}
          <span className="line-through decoration-3 decoration-custom-blue font-mono">
            Creative
          </span>{" "}
          Frontend Developer from Buenos Aires, Argentina. With 3+ years of
          expertise using React, Typescript and ThreeJs. I combine a creative
          perspective with JavaScript tools, leveraging my experience in
          application and game development to create <br />
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

      <div
        id="rightSide"
        className="flex flex-row lg:flex-col items-center justify-between px-5 lg:px-0 mb-10 lg:mb-0 flex-auto  w-full "
      >
        <div
          className="lg:relative cursor-pointer md:bottom-20 xl:bottom-20 2xl:bottom-30  xl:right-10 w-35 md:w-40 xl:w-50 2xl:w-60"
          onMouseEnter={(e) => {
            e.stopPropagation();
            gsap.to(flowerRef.current, {
              rotation: 0,
              duration: 1,
            });
          }}
        >
          <Image
            width={250}
            height={250}
            ref={flowerRef}
            className=""
            src="/images/AboutSection/Flower.svg"
            alt=""
          />
        </div>

        <a
          className="lg:relative cursor-pointer top-0  xl:left-0 2xl:left-25 w-34 md:w-40 lg:w-45 xl:w-50 2xl:w-60"
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
          <Image
            width={230}
            height={220}
            className=""
            src="/images/AboutSection/Resume.svg"
            alt=""
          />
        </a>

        <div
          className="lg:relative md:top-30 lg:top-30 xl:top-20 2xl:top-25 md:right-20 w-45 md:w-50 lg:w-55 xl:w-60 2xl:w-90 "
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
          <Image
            width={300}
            height={300}
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
