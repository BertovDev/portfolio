import { Canvas, useThree } from "@react-three/fiber";
import {
  InstancedRigidBodyProps,
  Physics,
  RigidBody,
} from "@react-three/rapier";
import React, { useMemo } from "react";
import { MailModel } from "./Mail";

type Props = {};

export default function MailCollectionScene({}: Props) {
  const instances = useMemo(() => {
    const instances: InstancedRigidBodyProps[] = [];

    for (let i = 0; i < 30; i++) {
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
      <ambientLight intensity={1} />
      <directionalLight position={[1, 2, 3]} intensity={4} />

      <Physics colliders="cuboid" gravity={[0, -10, 0]}>
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
    </>
  );
}
