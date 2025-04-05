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

type Props = {};

const COUNT: number = 30;

export default function Contact({}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.to(ref.current, {
      opacity: 1,
      zIndex: 90, // ending value
      delay: 1.9,
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

      <div ref={ref} className="-z-100 opacity-0 absolute w-full h-full">
        <div className="h-full  w-full flex justify-center items-center">
          <div className="bg-white w-1/2 h-2/3 flex items-start justify-center">
            <ContactForm />
          </div>
        </div>
      </div>
    </>
  );
}
