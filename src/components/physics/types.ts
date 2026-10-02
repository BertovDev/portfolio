import type { ComponentType, ReactNode } from "react";

export interface ColliderBodyProps {
  children: ReactNode;
}

/**
 * Wrapper injected around each collider shape. The lazily loaded physics
 * world passes a fixed `RigidBody`; models never import rapier themselves so
 * it stays out of the initial Scene chunk.
 */
export type ColliderBody = ComponentType<ColliderBodyProps>;
