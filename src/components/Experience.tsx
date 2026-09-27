import React, { useEffect, useRef } from "react";
import { BakeShadows, OrbitControls, SoftShadows } from "@react-three/drei";
import { OrthographicCamera } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";

import { useCameraStore, useClearDiplomasStore } from "@/utils/Utils";
import * as THREE from "three";
import gsap from "gsap";
import { PorfolioModel } from "../components/Portfolio";
import { AboutModel } from "./AboutModel";
import Lights from "./Lights";

import {
  Vignette,
  EffectComposer,
  Bloom,
  TiltShift2,
} from "@react-three/postprocessing";
import { Diploma } from "./Diploma/Diploma";
import DiplomaInstances from "./Diploma/DiplomaInstances";

type CameraProp = {
  position: THREE.Vector3;
  zoom: number;
};

type CameraPositions = {
  initialPos: CameraProp;
  zoomedPos: CameraProp;
};

const CAMERA_POSITION: [number, number, number] = [-1.1, 3.9, 5];
const CAMERA_ROTATION: [number, number, number] = [0, 0.67, 0];
const CAMERA_ZOOM = 130;
const KEY_LIGHT_POSITION: [number, number, number] = [-1.8, 2.5, 3];

export default function Experience() {
  const { cameraZoomed, setTransitioning } = useCameraStore();
  const { isClearDiplomas } = useClearDiplomasStore();
  const refCamera = useRef<THREE.OrthographicCamera>(null);

  const cameraPositions: CameraPositions = {
    initialPos: { position: new THREE.Vector3(-1.1, 3.9, 5), zoom: 120 },
    zoomedPos: { position: new THREE.Vector3(-3, 5, 5), zoom: 170 },
  };

  useEffect(() => {
    if (cameraZoomed && refCamera.current) {
      gsap.to(refCamera.current.position, {
        x: cameraPositions.zoomedPos.position.x,
        y: cameraPositions.zoomedPos.position.y,
        z: cameraPositions.zoomedPos.position.z,
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
        x: cameraPositions.initialPos.position.x,
        y: cameraPositions.initialPos.position.y,
        z: cameraPositions.initialPos.position.z,
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
      <color attach="background" args={["#f0f0f0"]} />
      <fog attach="fog" args={["#f0f0f0", 0, 20]} />

      <OrthographicCamera
        ref={refCamera}
        makeDefault // Make this the main camera
        position={CAMERA_POSITION} // Adjust as needed
        rotation={CAMERA_ROTATION}
        near={0.1}
        far={20}
        zoom={CAMERA_ZOOM} // Adjust zoom to frame the scene correctly
      />

      <ambientLight intensity={0.1} />

      <Lights />

      {/* <pointLight color={"white"} position={[-1, 6, 0]} intensity={2} /> */}

      <directionalLight
        position={KEY_LIGHT_POSITION}
        intensity={3.8}
        castShadow
        shadow-mapSize={1024}
        shadow-bias={0}
      />
      <directionalLight
        position={[0.3, 2, 3]}
        intensity={1.2}
        castShadow
        shadow-mapSize={1024}
        shadow-bias={0.0001}
        color={"#7195eb"}
      />

      <Physics colliders="cuboid" gravity={[0, -20, 0]} timeStep="vary">
        <RigidBody type="fixed" colliders="cuboid">
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.01, 0]}
            receiveShadow
          >
            <planeGeometry args={[100, 100, 1, 1]} />
            <shadowMaterial opacity={0.65} transparent />
          </mesh>
        </RigidBody>

        {isClearDiplomas && <DiplomaInstances />}
        <PorfolioModel />

        <RigidBody type="fixed" colliders="hull">
          <AboutModel />
        </RigidBody>

        <RigidBody type="fixed" colliders="cuboid">
          <Diploma position={[-0.7, 0.5, 2.75]} scale={100} />
        </RigidBody>
      </Physics>

      <BakeShadows />

      <SoftShadows size={35} samples={20} />
      <EffectComposer stencilBuffer={true}>
        <Bloom
          intensity={0.1}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
        />
        <Vignette darkness={0.7} offset={0.1} />
        <TiltShift2 blur={0.3} />
      </EffectComposer>
    </group>
  );
}
