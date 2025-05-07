import React, { useState } from "react";
import CursorTip from "../CursorTip";
import Image from "next/image";
import StackComponent from "./StackComponent";
import WorkSection from "./WorkSection";
import Link from "next/link";

type ImageInfoState = {
  textContent: string;
  isHovering: boolean;
};

export default function LambdaSection() {
  const [imageInfoState, setImageInfoState] = useState<ImageInfoState>({
    textContent: "",
    isHovering: false,
  });

  return (
    <WorkSection>
      <div
        id="nameAndDate"
        className="font-inter flex flex-row gap-x-4 w-full justify-between  "
      >
        <div className="flex flex-col gap-y-2 2xl:gap-y-5 animate-section animate-name-date">
          <Link href="https://lambdaclass.com/" target="_blank">
            <div className="flex flex-row items-center gap-x-2">
              <h3 className="text-3xl 2xl:text-4xl font-semibold underline underline-offset-4">
                LambdaClass
              </h3>
              <Image
                width={100}
                height={100}
                src="/images/link.svg"
                alt=""
                className="fill-current w-7 h-7"
              />
            </div>
          </Link>
          <h4 className="text-custom-red opacity-80 font-inter text-xl 2xl:text-2xl font-semibold">
            Frontend and Game Developer
          </h4>
        </div>
        <span className="text-xl 2xl:text-2xl animate-section animate-name-date mt-2">
          Nov 2022 - Aug 2024
        </span>
      </div>
      <div id="info" className="flex flex-row gap-x-10 ">
        <div className="flex flex-col gap-y-7 animate-section animate-info">
          <h2 className="font-inter font-semibold underline text-xl 2xl:text-2xl section-title">
            Stack
          </h2>
          <StackComponent
            stackArray={["TypeScript", "React", "C", "Unity", "TailwindCss"]}
            setImageInfoState={setImageInfoState}
          />
        </div>
        <div className="flex flex-col gap-y-5 2xl:gap-y-7 animate-section animate-info">
          <div className="flex flex-col gap-y-6">
            <h2 className="font-inter font-semibold underline text-xl 2xl:text-2xl section-title">
              About
            </h2>
            <p className="font-light font-inter text-sm/6 xl:text-lg 2xl:text-xl">
              Led the frontend development of a multiplayer mobile game and
              multiples websites, collaborating with international teams (US &
              Europe) to build a high-performance, interactive experience.
            </p>
          </div>
          <div className="flex flex-col gap-y-4 2xl:gap-y-6">
            <h2 className="font-inter font-semibold underline text-xl 2xl:text-2xl">
              Achievements and Responsibilities:
            </h2>
            <ul className="font-light font-inter text-sm/6  xl:text-base 2xl:text-xl flex flex-col gap-y-2 2xl:gap-y-8">
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

      <CursorTip
        isHovering={imageInfoState.isHovering}
        textContent={imageInfoState.textContent}
      />
    </WorkSection>
  );
}
