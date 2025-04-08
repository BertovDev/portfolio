"use client";
import { Canvas } from "@react-three/fiber";
import {
  InstancedRigidBodyProps,
  Physics,
  RigidBody,
} from "@react-three/rapier";
import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { MailModel } from "../Mail";
import gsap from "gsap";
import ContactForm from "./ContactForm";
import Image from "next/image";
import Link from "next/link";

const COUNT: number = 30;

export default function Contact() {
  const divSectionRef = useRef<HTMLDivElement>(null);
  const tl = gsap.timeline();

  useEffect(() => {
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

    gsap.to(divSectionRef.current, {
      opacity: 1,
      zIndex: 90, // ending value
      delay: 1.5,
      duration: 0.6, // short duration since it's a discrete change
      ease: "none", // no easing for z-index
    });
  }, []);

  const instances = useMemo(() => {
    const instances: InstancedRigidBodyProps[] = [];

    for (let i = 0; i < COUNT; i++) {
      instances.push({
        key: "instance_" + Math.random(),
        position: [4.5 - Math.random() * 10, 6, 1 - Math.random() * 2],
        rotation: [Math.random(), 1 - Math.random() * 3, Math.random() * 2],
        scale: [0.5, 0.5, 0.5],
      });
    }

    return instances;
  }, []);

  return (
    <>
      <Canvas
        shadows={false}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 80,
        }}
        className="white"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1} />
          <directionalLight position={[1, 2, 3]} intensity={4} />

          <Physics colliders="cuboid">
            {instances.map((instance, index) => (
              <RigidBody
                key={instance.key}
                position={instance.position as [number, number, number]}
                rotation={instance.rotation as [number, number, number]}
                scale={instance.scale as [number, number, number]}
              >
                <MailModel />
              </RigidBody>
            ))}
          </Physics>
        </Suspense>
      </Canvas>

      <div
        id="mainContact"
        className="-z-100 opacity-100 absolute w-full h-full pointer-events-auto"
      >
        <div className="h-full  w-full flex justify-center items-center">
          <div className=" w-1/2 flex flex-col items-center justify-center ">
            {/* <p className="contact-p opacity-100 absolute w-1/2 text-center text-9xl uppercase font-inter font-extrabold">
              I will be really glad of hearing about you!
            </p> */}

            <div className="absolute w-2/3 text-center ">
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
