import gsap from "gsap";
import React, { useEffect, useRef, useState } from "react";
import CursorTip from "../CursorTip";
import Image from "next/image";
import StackComponent from "./StackComponent";
import WorkSection from "./WorkSection";

type Props = {};

type ImageInfoState = {
  textContent: string;
  isHovering: boolean;
};

export default function SchoolarshipSection({}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  const [imageInfoState, setImageInfoState] = useState<ImageInfoState>({
    textContent: "",
    isHovering: false,
  });

  return (
    <WorkSection>
      <div id="info" className="flex flex-row gap-x-10 order-2">
        <div className="flex flex-col gap-y-7 animate-section animate-info">
          <h2 className="font-inter font-semibold underline text-3xl section-title">
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
        <div className="flex flex-col gap-y-7 animate-section animate-info">
          <div className="flex flex-col gap-y-4">
            <h2 className="font-inter font-semibold underline text-3xl section-title">
              About
            </h2>
            <p className="font-light font-inter text-2xl">
              I was invited to be part of the development and investigation team
              of my university. Specializing in React.js, developed a monitoring
              and visualization website for climatologist stations in Buenos
              Aires for the public organization ACUMAR.
            </p>
          </div>
          <div className="flex flex-col gap-y-6">
            <h2 className="font-inter font-semibold underline text-3xl">
              Achievements and Responsibilities:
            </h2>
            <ul className="font-light font-inter text-2xl flex flex-col gap-y-8">
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
                <span className="font-semibold">Monitoring Panels:</span>{" "}
                Developed monitoring panels for climatologist stations, enabling
                users to obtain real-time data such as precipitation, humidity,
                and more.
              </li>
              <li className="animate-section animate-list-item">
                <span className="font-semibold">
                  Collaboration with Backend Team:
                </span>{" "}
                Maintained close coordination with the backend team, working
                together to ensure the successful completion of tasks and
                seamless integration of frontend and backend components.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div
        id="nameAndDate"
        className="font-inter flex flex-row gap-x-4 w-full justify-between order-1  "
      >
        <div className="flex flex-col gap-y-5 animate-section animate-name-date">
          <a
            href="https://github.com/unla-investigacion-desarrollo"
            target="_blank"
          >
            <div className="flex flex-row items-center justify-center gap-x-2">
              <h3 className="text-5xl font-semibold underline underline-offset-4">
                Universidad Nacional de Lanús
              </h3>
              <img
                src="/images/link.svg"
                alt=""
                className="fill-current w-7 h-7"
              />
            </div>
          </a>

          <h4 className="text-red-500 text-3xl font-semibold">
            React Frontend Developer
          </h4>
        </div>
        <span className="text-3xl animate-section animate-name-date">
          Jul 2022 - Mar 2024
        </span>
      </div>

      <CursorTip
        isHovering={imageInfoState.isHovering}
        textContent={imageInfoState.textContent}
      />
    </WorkSection>
  );
}
