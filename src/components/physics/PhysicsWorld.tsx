// Lazily loaded (see ./loadPhysicsWorld). The only module, together with
// DiplomaInstances, that imports @react-three/rapier for the main scene.

import React from "react";
import { Physics, RigidBody } from "@react-three/rapier";

import { useClearDiplomasStore } from "@/utils/Utils";
import { GroundColliderShape } from "../Ground";
import { PortfolioColliderShapes } from "../Portfolio";
import { AboutModelColliderShape } from "../AboutModel";
import {
  DIPLOMA_POSITION,
  DIPLOMA_SCALE,
  DiplomaColliderShape,
} from "../Diploma/Diploma";
import DiplomaInstances from "../Diploma/DiplomaInstances";
import type { ColliderBodyProps } from "./types";

function FixedCuboidBody({ children }: ColliderBodyProps) {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      {children}
    </RigidBody>
  );
}

/**
 * The physics world, mounted on the first diploma request. Every body except
 * DiplomaInstances is fixed; the collider shapes are invisible copies of the
 * visual models (same geometry, same transform nesting), so the generated
 * auto-colliders match what the models produced when wrapped directly.
 */
export default function PhysicsWorld() {
  const isClearDiplomas = useClearDiplomasStore((s) => s.isClearDiplomas);

  return (
    <Physics colliders="cuboid" gravity={[0, -20, 0]} timeStep="vary">
      <RigidBody type="fixed" colliders="cuboid">
        <GroundColliderShape />
      </RigidBody>

      {isClearDiplomas && <DiplomaInstances />}
      <PortfolioColliderShapes Body={FixedCuboidBody} />

      <RigidBody type="fixed" colliders="hull">
        <AboutModelColliderShape />
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <DiplomaColliderShape position={DIPLOMA_POSITION} scale={DIPLOMA_SCALE} />
      </RigidBody>
    </Physics>
  );
}
