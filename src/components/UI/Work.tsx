"use client";
import React, { useState } from "react";
import LambdaSection from "./workComponents/LambdaSection";
import SchoolarshipSection from "./workComponents/SchoolarShipSection";
import NextSection from "./workComponents/NextSection";

type NextType = {
  role: string;
  company: string;
};

export default function Work() {
  const [next, setNext] = useState<NextType>({
    role: "Be the next ",
    company: "",
  });
  const [workExperience, setWorkExperience] = useState<string>("Lambda");

  return (
    <div className="text-black text-5xl h-full bg-white flex flex-row overflow-auto">
      <div className="ml-2 ">
        <ul className=" flex flex-row items-start  text-custom-red gap-x-0.5">
          <li
            className={`work-title-li ${
              workExperience === "Lambda"
                ? "opacity-100"
                : "opacity-50 hover:opacity-80 hover:transition-opacity duration-300"
            }`}
            onClick={() => {
              setWorkExperience("Lambda");
            }}
          >
            <span className="work-title-text">
              Frontend and Game Developer - LambdaClass
            </span>
            <span className="work-title-vertical-line"></span>
          </li>
          <li
            className={`work-title-li ${
              workExperience === "Scholarship"
                ? "opacity-100 "
                : "opacity-50  hover:opacity-80 hover:transition-opacity duration-300"
            }`}
            onClick={() => {
              setWorkExperience("Scholarship");
            }}
          >
            <span className="work-title-text">
              University Scholarship Frontend Developer - UNLa
            </span>
            <span className="work-title-vertical-line"></span>
          </li>
          <li
            className={`work-title-li ${
              workExperience === "next"
                ? "opacity-100"
                : "opacity-50 hover:opacity-80 hover:transition-opacity duration-300"
            }`}
            onClick={() => {
              setWorkExperience("next");
            }}
          >
            <span className="work-title-text">
              {next.role} - {next.company}
            </span>
            <span className="work-title-vertical-line"></span>
          </li>
        </ul>
      </div>
      <div className="flex-1 flex items-center justify-center h-full ">
        <div className="flex  items-center w-full mx-10 xl:mx-0 xl:w-3/5  h-full ">
          {workExperience === "Lambda" && <LambdaSection />}
          {workExperience === "Scholarship" && <SchoolarshipSection />}

          {workExperience === "next" && (
            <NextSection setNext={setNext} next={next} />
          )}
        </div>
      </div>
    </div>
  );
}
