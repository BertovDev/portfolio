import React from "react";
import Contact from "@/components/UI/Contact";

type Props = {};

export default function page({}: Props) {
  return (
    <>
      <Contact />
      <button className="absolute z-100 top-5 right-5 text-3xl text-black font-inter font-semibold text-center  hover:underline hover:cursor-pointer">
        <a href="/">Home</a>
      </button>
    </>
  );
}
