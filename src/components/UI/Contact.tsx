"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import dynamic from "next/dynamic";
import ContactForm from "./ContactForm";
import Image from "next/image";
import Link from "next/link";

// Keep three/rapier out of this route's first-load JS; the falling mail
// canvas streams in after the form is interactive.
const ContactScene = dynamic(() => import("./ContactScene"), { ssr: false });

export default function Contact() {
  const divSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.to(".contact-p", {
      opacity: 0,
      duration: 0.2,
      delay: 0.9,
      zIndex: 0,
      stagger: 0.2,
      y: -100,
    });

    tl.to("#mainContact", {
      zIndex: 100,
    });

    const reveal = gsap.to(divSectionRef.current, {
      opacity: 1,
      zIndex: 90, // ending value
      delay: 1.5,
      duration: 0.6, // short duration since it's a discrete change
      ease: "none", // no easing for z-index
    });

    return () => {
      tl.kill();
      reveal.kill();
    };
  }, []);

  return (
    <>
      <ContactScene />

      <div
        id="mainContact"
        className="-z-100 opacity-100  absolute w-full h-full pointer-events-auto"
      >
        <div className="h-full  w-full flex justify-center items-center">
          <div className=" w-1/2   flex flex-col items-center justify-center ">
            <div className="absolute w-2/3  text-center ">
              <span className="contact-p opacity-100  w-1/2 text-center text-9xl uppercase font-inter font-extrabold">
                I will be {""} <br />
              </span>
              <span className="contact-p opacity-100  w-1/2 text-center text-9xl uppercase font-inter font-extrabold">
                really glad of {""} <br />
              </span>
              <span className="contact-p opacity-100  w-1/2 text-center text-9xl uppercase font-inter font-extrabold">
                hearing about you!
              </span>
            </div>
            <div
              className="w-full flex flex-col  items-center justify-center  h-full -z-100 opacity-0"
              ref={divSectionRef}
            >
              <ContactForm />

              <div className="flex flex-row items-center justify-between gap-x-10 mt-10">
                <Link href="https://x.com/tongenjs" target="_blank">
                  <Image
                    src="/images/Contact/Xlink.svg"
                    alt="X logo"
                    width={60}
                    height={60}
                    className=" hover:-rotate-15 transition-all"
                  />
                </Link>
                <a
                  href="https://www.linkedin.com/in/bautista-berto/"
                  target="_blank"
                >
                  <Image
                    src="/images/Contact/Linkd.svg"
                    alt="Linkedin logo"
                    width={60}
                    height={60}
                    className=" hover:rotate-15 transition-all"
                  />
                </a>
                <Link href="https://github.com/BertovDev" target="_blank">
                  <Image
                    src="/images/Contact/Github.svg"
                    alt="Github logo"
                    width={60}
                    height={60}
                    className=" hover:-rotate-15 transition-all"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
