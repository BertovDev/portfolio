import gsap from "gsap";
import React, { useEffect, useRef, useState } from "react";
import CursorTip from "../CursorTip";
import Image from "next/image";
import StackComponent from "./StackComponent";
import WorkSection from "./WorkSection";

type ImageInfoState = {
  textContent: string;
  isHovering: boolean;
};

export default function SchoolarshipSection() {
  const ref = useRef<HTMLDivElement | null>(null);

  const [imageInfoState, setImageInfoState] = useState<ImageInfoState>({
    textContent: "",
    isHovering: false,
  });

  return (
    <WorkSection>
      <div
        id="nameAndDate"
        className="font-inter flex flex-row gap-x-4 w-full justify-between "
      >
        <div className="flex flex-col gap-y-2 2xl:gap-y-5 animate-section animate-name-date ">
          <a
            href="https://github.com/unla-investigacion-desarrollo"
            target="_blank"
          >
            <div className="flex flex-row items-center gap-x-2">
              <h3 className="text-3xl 2xl:text-4xl font-semibold underline underline-offset-4">
                Universidad Nacional de Lanús Research Team
              </h3>
              <Image
                width={100}
                height={100}
                src="/images/link.svg"
                alt=""
                className="fill-current w-7 h-7"
              />
            </div>
          </a>
          <h4 className="text-custom-red opacity-80 font-inter text-xl 2xl:text-2xl font-semibold">
            React Frontend Developer
          </h4>
        </div>
        <span className="text-2xl 2xl:text-2xl animate-section animate-name-date mt-2">
          Nov 2022 - Aug 2024
        </span>
      </div>
      <div id="info" className="flex flex-row gap-x-10 ">
        <div className="flex flex-col gap-y-7 animate-section animate-info">
          <h2 className="font-inter font-semibold underline text-xl 2xl:text-2xl section-title">
            Stack
          </h2>
          <StackComponent
            stackArray={[
              "React",
              "TypeScript",
              "Threejs",
              "Git",
              "TailwindCss",
            ]}
            setImageInfoState={setImageInfoState}
          />
        </div>
        <div className="flex flex-col gap-y-5 2xl:gap-y-7 animate-section animate-info">
          <div className="flex flex-col gap-y-6">
            <h2 className="font-inter font-semibold underline text-xl 2xl:text-2xl section-title">
              About
            </h2>
            <p className="font-light font-inter text-lg 2xl:text-xl">
              I was invited to be part of the development and investigation team
              of my university. Specializing in React.js, developed a monitoring
              and visualization website for climatologist stations in Buenos
              Aires for the public organization ACUMAR.
            </p>
          </div>
          <div className="flex flex-col gap-y-4 2xl:gap-y-6">
            <h2 className="font-inter font-semibold underline text-xl 2xl:text-2xl">
              Achievements and Responsibilities:
            </h2>
            <ul className="font-light font-inter text-lg 2xl:text-xl flex flex-col gap-y-2 2xl:gap-y-8">
              <li className="animate-section animate-list-item">
                <span className="font-semibold">
                  {" "}
                  Creation and Maintenance of React Components:
                </span>{" "}
                Designed and maintained React components, ensuring code
                modularization for better organization and scalability
              </li>
              <li className="animate-section animate-list-item">
                <span className="font-semibold">
                  Development of Interactive Map:
                </span>{" "}
                Created an interactive map for the creation and visualization of
                climatologist stations, allowing users to easily visualize the
                real location of these stations.
              </li>
              <li className="animate-section animate-list-item">
                <span className="font-semibold">Monitoring Panels</span>{" "}
                Developed monitoring panels for climatologist stations, enabling
                users to obtain real-time data such as precipitation, humidity,
                and more.
              </li>
              <li className="animate-section animate-list-item">
                <span className="font-semibold">
                  Collaboration with Backend Team:
                </span>{" "}
                Maintained close coordination with the backend team, working -
                together to ensure the successful completion of tasks and -
                seamless integration of frontend and backend components.
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
