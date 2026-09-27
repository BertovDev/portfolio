"use client";
import { Canvas } from "@react-three/fiber";
import { Preload, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import {
  InstancedRigidBodyProps,
  Physics,
  RigidBody,
} from "@react-three/rapier";
import React, { Suspense, useState } from "react";
import { MailModel } from "../Mail";

const COUNT: number = 30;

// Random layout is generated once, outside render (React Compiler purity).
const createInstances = (): InstancedRigidBodyProps[] => {
  const instances: InstancedRigidBodyProps[] = [];

  for (let i = 0; i < COUNT; i++) {
    instances.push({
      key: "instance_" + i,
      position: [4.5 - Math.random() * 10, 6, 1 - Math.random() * 2],
      rotation: [Math.random(), 1 - Math.random() * 3, Math.random() * 2],
      scale: [0.5, 0.5, 0.5],
    });
  }

  return instances;
};

export default function ContactScene() {
  const [instances] = useState(createInstances);

  return (
    <Canvas
      shadows={false}
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 80,
      }}
      className="white"
      frameloop="demand"
    >
      <Suspense fallback={null}>
        <ambientLight intensity={1} />
        <directionalLight position={[1, 2, 3]} intensity={4} />

        <Physics colliders="cuboid" gravity={[0, -14, 0]} timeStep="vary">
          {instances.map((instance) => (
            <RigidBody
              key={instance.key}
              position={instance.position as [number, number, number]}
              rotation={instance.rotation as [number, number, number]}
              scale={instance.scale as [number, number, number]}
              linearDamping={0.95}
              angularDamping={0.95}
            >
              <MailModel />
            </RigidBody>
          ))}
        </Physics>
        <Preload all />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Suspense>
    </Canvas>
  );
}
