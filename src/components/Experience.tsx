import React, { useEffect, useRef } from "react";
import { BakeShadows, OrbitControls, SoftShadows } from "@react-three/drei";
import { OrthographicCamera } from "@react-three/drei";
import { useControls } from "leva";

import { useCameraStore } from "@/utils/Utils";
import * as THREE from "three";
import gsap from "gsap";
import { PorfolioModel } from "../components/Portfolio";
import { AboutModel } from "./AboutModel";

type CameraProp = {
  position: [number, number, number];
  zoom: number;
};

type CameraPositions = {
  initialPos: CameraProp;
  zoomedPos: CameraProp;
};

export default function Experience() {
  const { position, rotation, zoom, lightPos } = useControls({
    position: [-1.1, 3.9, 5],
    rotation: [0, 0.67, 0],
    zoom: 130,
    lightPos: [0.3, 2.5, 3],
  });
  const { cameraZoomed, setTransitioning } = useCameraStore();
  const refCamera = useRef<THREE.OrthographicCamera>(null);

  const cameraPositions: CameraPositions = {
    initialPos: { position: [-1.1, 3.9, 5], zoom: 120 },
    zoomedPos: { position: [-3, 5, 5], zoom: 180 },
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
        onComplete: () => {
          setTransitioning(false);
        },
        onStart: () => {
          setTransitioning(true);
        },
      });

      gsap.to(refCamera.current, {
        zoom: cameraPositions.zoomedPos.zoom,
        duration: 1,
        ease: "power3.inOut",
      });
    } else if (!cameraZoomed && refCamera.current) {
      //Zoomout anim
      gsap.to(refCamera.current.position, {
        x: cameraPositions.initialPos.position[0],
        y: cameraPositions.initialPos.position[1],
        z: cameraPositions.initialPos.position[2],
        duration: 1,
        ease: "power3.inOut",
        onUpdate: () => {
          refCamera.current?.updateProjectionMatrix();
        },
        onComplete: () => {
          setTransitioning(false);
        },
        onStart: () => {
          setTransitioning(true);
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
      {process.env.NODE_ENV === "development" && <OrbitControls />}

      <OrthographicCamera
        ref={refCamera}
        makeDefault // Make this the main camera
        position={position} // Adjust as needed
        rotation={rotation}
        near={0.1}
        far={20}
        zoom={zoom} // Adjust zoom to frame the scene correctly
      />

      <ambientLight intensity={0.7} />
      <directionalLight
        position={lightPos}
        intensity={4.7}
        castShadow
        shadow-mapSize={1024}
        shadow-bias={0}
      />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, 10]} />

        <shadowMaterial opacity={0.45} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} scale={10}>
        <planeGeometry args={[10, 10]} />

        <meshBasicMaterial color={"white"} />
      </mesh>

      <PorfolioModel />
      <AboutModel />
      <BakeShadows />
      <SoftShadows size={25} samples={25} focus={0} />
    </group>
  );
}
