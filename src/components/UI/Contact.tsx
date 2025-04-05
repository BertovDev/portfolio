"use client";
import { Canvas } from "@react-three/fiber";
import {
  InstancedRigidBodyProps,
  Physics,
  RigidBody,
} from "@react-three/rapier";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { MailModel } from "../Mail";
import * as THREE from "three";
import gsap from "gsap";
import ContactForm from "./ContactForm";
import { Perf } from "r3f-perf";
import Image from "next/image";

type Props = {};

const COUNT: number = 30;

export default function Contact({}: Props) {
  const divSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.to(divSectionRef.current, {
      opacity: 1,
      zIndex: 90, // ending value
      delay: 1.2,
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
        shadows
        dpr={[1, 2]}
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
        <Suspense>
          <ambientLight intensity={1} />
          <directionalLight
            position={[1, 2, 3]}
            intensity={4}
            castShadow
            shadow-mapSize={2048}
          />

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
        ref={divSectionRef}
        className="-z-100 opacity-0 absolute w-full h-full pointer-events-auto"
      >
        <div className="h-full  w-full flex justify-center items-center">
          <div className=" w-1/2 flex flex-col items-center justify-center ">
            <ContactForm />
            <div className="flex flex-row items-center justify-between gap-x-10 mt-10">
              <a href="https://x.com/tongenjs" target="_blank">
                <Image
                  src="/images/Contact/Xlink.svg"
                  alt="X logo"
                  width={60}
                  height={60}
                />
              </a>
              <a
                href="https://www.linkedin.com/in/bautista-berto/"
                target="_blank"
              >
                <Image
                  src="/images/Contact/Linkd.svg"
                  alt="Linkedin logo"
                  width={60}
                  height={60}
                />
              </a>
              <a
                href="https://www.linkedin.com/in/bautista-berto/"
                target="_blank"
              >
                <Image
                  src="/images/Contact/Github.svg"
                  alt="Github logo"
                  width={60}
                  height={60}
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
