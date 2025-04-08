import Work from "@/components/UI/Work";
import Link from "next/link";
import React from "react";

export default function page() {
  return (
    <>
      <Work />
      <button className="absolute top-5 right-5 text-3xl text-black font-inter font-semibold text-center  hover:underline hover:cursor-pointer">
        <Link href="/">Home</Link>
      </button>
    </>
  );
}
