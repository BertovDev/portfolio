import React from "react";
import About from "@/components/UI/About";
import Link from "next/link";

export default function page() {
  return (
    <>
      <About />
      <button className="absolute top-5 right-5 text-3xl text-black font-inter font-semibold text-center  hover:underline hover:cursor-pointer">
        <Link href={"/"}>Home</Link>
      </button>
    </>
  );
}
