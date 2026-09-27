import React, { useRef, useEffect } from "react";
import { PointLight } from "three";

const BULB_INTENSITY = 10;
const BULB_POSITION: [number, number, number] = [0, 2, 0];
const BULB_COLOR = "#ffddaa";

export default function Lights() {
  const light1 = useRef<PointLight>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (light1.current) {
        const flickerIntensity = Math.random() * 2 + 8; // Random intensity between 8 and 10
        light1.current.intensity = flickerIntensity;
      }
    }, 100); // Flicker every 100ms

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Bulb Light */}
      <pointLight
        ref={light1}
        intensity={BULB_INTENSITY}
        position={BULB_POSITION}
        color={BULB_COLOR}
        decay={2}
        distance={10}
      />
    </>
  );
}
