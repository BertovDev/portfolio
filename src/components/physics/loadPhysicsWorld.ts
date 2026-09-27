// Entry point to the lazily loaded physics world. This module must stay free
// of `@react-three/rapier` imports: it is reachable from the initial Scene
// chunk graph (Experience, Diploma), and rapier (~812 KB gzip with
// inlined WASM) would otherwise block the GLB preloads again.

export const loadPhysicsWorld = () => import("./PhysicsWorld");

let prefetchStarted = false;

/**
 * Downloads and evaluates the physics chunk so a later diploma click mounts
 * the world without waiting on the network. Idempotent; a failed download can
 * be retried by calling it again.
 */
export function prefetchPhysicsWorld(): void {
  if (prefetchStarted) return;
  prefetchStarted = true;

  loadPhysicsWorld().catch(() => {
    prefetchStarted = false;
  });
}
