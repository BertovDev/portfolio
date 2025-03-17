import React from "react";

export default function About() {
  return (
    <div className="flex items-center h-full ">
      <div id="leftSide" className="flex flex-col items-center flex-auto ">
        <img
          className="relative bottom-20"
          src="/images/SmilingFace.svg"
          alt=""
        />
        <img className="relative left-25" src="/images/Heart.svg" alt="" />
        <img
          className="relative right-5 top-10"
          src="/images/pokerface.svg"
          alt=""
        />
      </div>
      <div className="flex-none w-2/4 mb-20">
        <p className="text-black font-inter font-semibold text-center text-3xl xl:text-5xl">
          I´m Bautista Berto{" "}
          <span className="line-through decoration-red-500">Creative</span>{" "}
          Frontend Developer from Buenos Aires, Argentina. I thrive on turning
          ideas into fully functional, stunning applications. As a Frontend
          developer with 3+ years of expertise and a proven track record of
          building projects from the ground up for companies and personal
          projects.
        </p>
      </div>

      <div id="rightSide" className="flex flex-col items-center flex-auto ">
        <img
          className="relative bottom-25 right-20"
          src="/images/DumbFace.svg"
          alt=""
        />
        <img className="relative left-25" src="/images/pokerface2.svg" alt="" />
        <img
          className="relative right-30 top-25"
          src="/images/Flower.svg"
          alt=""
        />
      </div>
    </div>
  );
}
