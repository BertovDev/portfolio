"use client";

import { useSectionStore } from "@/utils/Utils";
import React from "react";

export default function Aside() {
  const { isSectionClicked, setSectionClicked } = useSectionStore();

  return (
    <div className="z-100 absolute top-5 right-5 text-3xl text-black font-inter font-semibold text-center">
      {!isSectionClicked.isClicked && (
        <ul className="cursor-pointer">
          <li
            className="hover:underline"
            onClick={() => {
              setSectionClicked("About", true);
            }}
          >
            About me
          </li>
          <li
            className="hover:underline"
            onClick={() => {
              setSectionClicked("Work", true);
            }}
          >
            Work
          </li>
          <li
            className="hover:underline"
            onClick={() => {
              setSectionClicked("Projects", true);
            }}
          >
            Projects
          </li>
          <li className="hover:underline">Contact</li>
        </ul>
      )}
    </div>
  );
}
