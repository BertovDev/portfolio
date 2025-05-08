import React, { useRef, useEffect } from "react";
import { useControls } from "leva";
import { useFrame } from "@react-three/fiber";
import { PointLight, Vector3 } from "three";

export default function Lights() {
  const light1 = useRef<PointLight>(null);
  const target = new Vector3(0, 0, 0);

  const bulbLightControls = useControls("Bulb Light", {
    intensity: { value: 10, min: 0, max: 20 },
    position: { value: [0, 2, 0], step: 0.1 },
    color: "#ffddaa",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (light1.current) {
        const flickerIntensity = Math.random() * 2 + 8; // Random intensity between 8 and 10
        light1.current.intensity = flickerIntensity;
      }
    }, 100); // Flicker every 100ms

    return () => clearInterval(interval);
  }, []);

  useFrame(() => {
    if (light1.current) {
      light1.current.lookAt(target);
    }
  });

  return (
    <>
      {/* Bulb Light */}
      <pointLight
        ref={light1}
        intensity={bulbLightControls.intensity}
        position={bulbLightControls.position}
        color={bulbLightControls.color}
        decay={2}
        distance={10}
      />
    </>
  );
}
