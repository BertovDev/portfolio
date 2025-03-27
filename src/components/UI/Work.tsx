"use client";
import { useSectionStore } from "@/utils/Utils";
import React, { useState } from "react";
import LambdaSection from "./workComponents/LambdaSection";

export default function Work() {
  const [workExperience, setWorkExperience] = useState<string>("Lambda");

  return (
    <div className="text-black text-5xl  h-full bg-white flex flex-row">
      <div className="ml-2">
        <ul className=" flex flex-row items-start  text-red-500 gap-x-0.5">
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
            <span className="work-title-text">Frontend and Game Developer</span>
            <span className="work-title-vertical-line"></span>
          </li>
          <li
            className={`work-title-li ${
              workExperience === "Scholarship"
                ? "opacity-100"
                : "opacity-50 hover:opacity-80 hover:transition-opacity duration-300"
            }`}
            onClick={() => {
              setWorkExperience("Scholarship");
            }}
          >
            <span className="work-title-text">
              University Scholarship Frontend Developer
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
            <span className="work-title-text">???? Be the next in here :D</span>
            <span className="work-title-vertical-line"></span>
          </li>
        </ul>
      </div>
      <div className="flex-1 flex items-center justify-center h-full ">
        <div className="flex  items-center w-3/5 h-full ">
          {workExperience === "Lambda" && <LambdaSection />}
          {workExperience === "Scholarship" && (
            <div className="bg-emerald-200"></div>
          )}

          {workExperience === "next" && <div>NEEEXT</div>}
        </div>
      </div>
    </div>
  );
}
