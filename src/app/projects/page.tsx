import Projects from "@/components/UI/Projects";
import Link from "next/link";
import React from "react";

export default function page() {
  return (
    <>
      <Projects />
      <button className="absolute z-100 top-5 right-5 text-3xl text-black font-inter font-semibold text-center  hover:underline hover:cursor-pointer">
        <Link href="/">Home</Link>
      </button>
    </>
  );
}
