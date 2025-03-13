import React from "react";

export default function Aside() {
  return (
    <div className="absolute top-5 right-5 text-3xl  text-black font-inter font-semibold text-center ">
      <ul className="cursor-pointer">
        <li className="hover:underline">About</li>
        <li className="hover:underline">Experience</li>
        <li className="hover:underline">Projects</li>
        <li className="hover:underline">Contact</li>
      </ul>
    </div>
  );
}
