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

import PostProcessing from "./PostProcessing";
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

const CAMERA_POSITIONS: CameraPositions = {
  initialPos: { position: new THREE.Vector3(-1.1, 3.9, 5), zoom: 120 },
  zoomedPos: { position: new THREE.Vector3(-3, 5, 5), zoom: 170 },
};

export default function Experience() {
  const cameraZoomed = useCameraStore((s) => s.cameraZoomed);
  const setTransitioning = useCameraStore((s) => s.setTransitioning);
  const isClearDiplomas = useClearDiplomasStore((s) => s.isClearDiplomas);
  const refCamera = useRef<THREE.OrthographicCamera>(null);

  useEffect(() => {
    if (cameraZoomed && refCamera.current) {
      gsap.to(refCamera.current.position, {
        x: CAMERA_POSITIONS.zoomedPos.position.x,
        y: CAMERA_POSITIONS.zoomedPos.position.y,
        z: CAMERA_POSITIONS.zoomedPos.position.z,
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
        zoom: CAMERA_POSITIONS.zoomedPos.zoom,
        duration: 1,
        ease: "power3.inOut",
      });
    } else if (!cameraZoomed && refCamera.current) {
      //Zoomout anim
      gsap.to(refCamera.current.position, {
        x: CAMERA_POSITIONS.initialPos.position.x,
        y: CAMERA_POSITIONS.initialPos.position.y,
        z: CAMERA_POSITIONS.initialPos.position.z,
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
        zoom: CAMERA_POSITIONS.initialPos.zoom,
        duration: 1,
        ease: "power3.inOut",
      });
    }

    const camera = refCamera.current;
    return () => {
      if (camera) {
        // Killing an in-flight tween skips its onComplete; reset the flag so
        // hover interactions don't stay locked. The next tween's onStart sets
        // it back to true.
        setTransitioning(false);
        gsap.killTweensOf(camera.position);
        gsap.killTweensOf(camera);
      }
    };
  }, [cameraZoomed, setTransitioning]);

  return (
    <group>
      {/* Required in prod: its per-frame update aims the camera at the origin,
          including during the zoom tweens. */}
      <OrbitControls />
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
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight
        position={[0.3, 2, 3]}
        intensity={1.2}
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

      <SoftShadows size={35} samples={10} />
      <PostProcessing />
    </group>
  );
}
