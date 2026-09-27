import React from "react";

const GROUND_ROTATION: [number, number, number] = [-Math.PI / 2, 0, 0];
const GROUND_POSITION: [number, number, number] = [0, -0.01, 0];
const GROUND_ARGS: [number, number, number, number] = [100, 100, 1, 1];

export function Ground() {
  return (
    <mesh rotation={GROUND_ROTATION} position={GROUND_POSITION} receiveShadow>
      <planeGeometry args={GROUND_ARGS} />
      <shadowMaterial opacity={0.65} transparent />
    </mesh>
  );
}

/**
 * Invisible copy of the ground for auto-collider generation. Rapier uses
 * `traverseVisible`, so the Object3D stays visible and only the material is
 * hidden (the renderer skips it).
 */
export function GroundColliderShape() {
  return (
    <mesh rotation={GROUND_ROTATION} position={GROUND_POSITION}>
      <planeGeometry args={GROUND_ARGS} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
}
