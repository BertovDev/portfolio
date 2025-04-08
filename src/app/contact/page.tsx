import React from "react";
import Contact from "@/components/UI/Contact";
import Link from "next/link";

export default function page() {
  return (
    <>
      <Contact />
      <button className="absolute z-100 top-5 right-5 text-3xl text-black font-inter font-semibold text-center  hover:underline hover:cursor-pointer">
        <Link href="/">Home</Link>
      </button>
    </>
  );
}
