import React, { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { OrthographicCamera } from "@react-three/drei";
import { useControls } from "leva";

import { BoxModel } from "../components/BoxModel";
import useCameraStore from "@/Utils";
import * as THREE from "three";
import gsap from "gsap";

type CameraProp = {
  position: [number, number, number];
  zoom: number;
};

type CameraPositions = {
  initialPos: CameraProp;
  zoomedPos: CameraProp;
};

export default function Experience() {
  const { position, rotation, zoom } = useControls({
    position: [-1.1, 3.9, 5],
    rotation: [0, 0.67, 0],
    zoom: 130,
  });
  const { cameraZoomed } = useCameraStore();
  const refCamera = useRef<THREE.OrthographicCamera>(null);

  const cameraPositions: CameraPositions = {
    initialPos: { position: [-1.1, 3.9, 5], zoom: 130 },
    zoomedPos: { position: [-3, 4, 5], zoom: 200 },
  };

  useEffect(() => {
    if (cameraZoomed && refCamera.current) {
      gsap.to(refCamera.current.position, {
        x: cameraPositions.zoomedPos.position[0],
        y: cameraPositions.zoomedPos.position[1],
        z: cameraPositions.zoomedPos.position[2],
        duration: 1,
        ease: "power3.inOut",
        onUpdate: () => {
          refCamera.current?.updateProjectionMatrix();
        },
      });

      gsap.to(refCamera.current, {
        zoom: cameraPositions.zoomedPos.zoom,
        duration: 1,
        ease: "power3.inOut",
      });
    } else if (!cameraZoomed && refCamera.current) {
      gsap.to(refCamera.current.position, {
        x: cameraPositions.initialPos.position[0],
        y: cameraPositions.initialPos.position[1],
        z: cameraPositions.initialPos.position[2],
        duration: 1,
        ease: "power3.inOut",
        onUpdate: () => {
          refCamera.current?.updateProjectionMatrix();
        },
      });

      gsap.to(refCamera.current, {
        zoom: cameraPositions.initialPos.zoom,
        duration: 1,
        ease: "power3.inOut",
      });
    }
  }, [cameraZoomed]);

  return (
    <group>
      <OrbitControls />
      <OrthographicCamera
        ref={refCamera}
        makeDefault // Make this the main camera
        position={position} // Adjust as needed
        rotation={rotation}
        near={0.1}
        far={20}
        zoom={zoom} // Adjust zoom to frame the scene correctly
      />
      <ambientLight intensity={1} />
      <directionalLight
        position={[1, 2, 3]}
        intensity={4}
        castShadow
        shadow-mapSize={2048}
        // shadow-bias={-0.001}
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, 10]} />

        <shadowMaterial opacity={0.4} />
      </mesh>
      <BoxModel />
    </group>
  );
}
