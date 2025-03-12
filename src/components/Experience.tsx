import React from "react";
import { OrbitControls } from "@react-three/drei";
import { useControls } from "leva";

export default function Experience() {
  const { position, rotation } = useControls({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  });

  return (
    <group>
      <OrbitControls />
      <mesh position={position} rotation={rotation} scale={1}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </group>
  );
}
