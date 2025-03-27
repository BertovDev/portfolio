import Work from "@/components/UI/Work";
import React from "react";

type Props = {};

export default function page({}: Props) {
  return (
    <>
      <Work />
      <button className="absolute top-5 right-5 text-3xl text-black font-inter font-semibold text-center  hover:underline hover:cursor-pointer">
        <a href="/">Home</a>
      </button>
    </>
  );
}
