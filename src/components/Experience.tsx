import React, { Suspense, lazy, useEffect, useRef } from "react";
import { BakeShadows, OrbitControls, SoftShadows } from "@react-three/drei";
import { OrthographicCamera } from "@react-three/drei";

import {
  useCameraStore,
  useClearDiplomasStore,
  useLoadingStore,
} from "@/utils/Utils";
import * as THREE from "three";
import gsap from "gsap";
import { PorfolioModel } from "../components/Portfolio";
import { AboutModel } from "./AboutModel";
import Lights from "./Lights";

import PostProcessing from "./PostProcessing";
import { DIPLOMA_POSITION, DIPLOMA_SCALE, Diploma } from "./Diploma/Diploma";
import { Ground } from "./Ground";
import {
  loadPhysicsWorld,
  prefetchPhysicsWorld,
} from "./physics/loadPhysicsWorld";
import SceneWarmup from "./loading/SceneWarmup";

// Rapier stays out of the initial Scene chunk graph; it loads on the first
// diploma request (prefetched on idle / diploma hover).
const PhysicsWorld = lazy(loadPhysicsWorld);

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
  initialPos: { position: new THREE.Vector3(-1.1, 3.9, 5), zoom: CAMERA_ZOOM },
  zoomedPos: { position: new THREE.Vector3(-3, 5, 5), zoom: 170 },
};

export default function Experience() {
  const cameraZoomed = useCameraStore((s) => s.cameraZoomed);
  const setTransitioning = useCameraStore((s) => s.setTransitioning);
  const physicsRequested = useClearDiplomasStore((s) => s.physicsRequested);
  const sceneReady = useLoadingStore((s) => s.sceneReady);
  const refCamera = useRef<THREE.OrthographicCamera>(null);

  // Warm the physics chunk when idle, once shaders are compiled and the first
  // frame is out, so rapier's ~2 MB evaluation doesn't compete with them.
  // Kept inside the Scene graph so the lazy chunk only adds rapier on top of
  // modules the Scene already loaded.
  useEffect(() => {
    if (!sceneReady) return;
    // Safari has no requestIdleCallback.
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => prefetchPhysicsWorld(), {
        timeout: 3000,
      });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(prefetchPhysicsWorld, 1000);
    return () => clearTimeout(id);
  }, [sceneReady]);

  useEffect(() => {
    // Hold the intro zoom-out until the first frame is on screen; otherwise
    // it plays while the shader warmup pauses rendering and is never seen.
    if (!sceneReady) return;
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
  }, [cameraZoomed, setTransitioning, sceneReady]);

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
      />
      <directionalLight
        position={[0.3, 2, 3]}
        intensity={1.2}
        castShadow
        shadow-mapSize={1024}
        shadow-bias={0.0001}
        color={"#7195eb"}
      />

      <Ground />
      <PorfolioModel />
      <AboutModel />
      <Diploma position={DIPLOMA_POSITION} scale={DIPLOMA_SCALE} />

      {/* Fixed colliders + falling diplomas; own boundary so loading it never
          suspends the rest of the scene. */}
      {physicsRequested && (
        <Suspense fallback={null}>
          <PhysicsWorld />
        </Suspense>
      )}

      <BakeShadows />

      <SoftShadows size={35} samples={20} />
      <PostProcessing />

      {/* Last on purpose: its effects must run after SoftShadows' (see file). */}
      <SceneWarmup />
    </group>
  );
}
