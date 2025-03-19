import React, { useRef, useState } from "react";
import CursorTip from "./CursorTip";
import gsap from "gsap";

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

  return (
    <div className="flex items-center h-full cursor-auto">
      <div id="leftSide" className="flex flex-col items-center flex-auto ">
        <img
          className="relative cursor-pointer md:bottom-40 lg:bottom-35 xl:bottom-25 md:left-15 lg:left-25 w-60"
          src="/images/SmilingFace.svg"
          alt=""
        />
        <div
          className="relative cursor-pointer md:w-40 lg:w-40 xl:w-60 xl:right-5 2xl:right-15"
          onMouseOver={(e) => {
            e.stopPropagation();
            gsap.to(turnstileImage.current, {
              opacity: 1,
              duration: 0.5,
            });
            setImageInfoState({
              textContent: "I love hardcore music, specially turnstile",
              isHovering: true,
            });
          }}
          onMouseOut={(e) => {
            e.stopPropagation();
            gsap.to(turnstileImage.current, {
              opacity: 0,
              duration: 0.5,
            });
            setImageInfoState({
              textContent: "<3",
              isHovering: false,
            });
          }}
        >
          <div className="relative">
            <img className="w-full" src="/images/Heart.svg" alt="" />
            <img
              ref={turnstileImage}
              className="opacity-0 absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              src="/images/TLC.svg"
              alt=""
            />
          </div>
        </div>

        <img
          className="relative cursor-pointer left-25 top-20 w-38"
          src="/images/sapporo.svg"
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
      <div className="flex-none w-2/4 mb-20">
        <p className="text-black font-inter font-semibold text-center text-3xl xl:text-4xl  2xl:text-5xl">
          I´m Bautista Berto{" "}
          <span className="line-through decoration-2 decoration-red-500">
            Creative
          </span>{" "}
          Frontend Developer from Buenos Aires, Argentina. With 3+ years of
          expertise I thrive on turning ideas into fully functional, stunning
          applications projects.
        </p>
      </div>

      <div id="rightSide" className="flex flex-col items-center flex-auto ">
        <img
          className="relative cursor-pointer bottom-30"
          src="/images/Flower.svg"
          alt=""
        />

        <img
          className="relative cursor-pointer top-20 xl:left-0 2xl:left-25"
          src="/images/pokerface2.svg"
          alt=""
        />

        <div
          className="relative md:top-30 lg:top-30 xl:top-30 2xl:top-25 md:right-40"
          onMouseOver={(e) => {
            e.stopPropagation();
            setImageInfoState({
              textContent: "I love to buy random vinyls",
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
            src="/images/turntableImage.svg"
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
