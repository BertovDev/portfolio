# Plan 004: Cut the main scene's per-frame GPU and reconciliation cost

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 21580f8..HEAD -- src/components/Scene.tsx src/components/Experience.tsx src/components/Annotation.tsx`
> Plans 001 and 002 are expected to have touched `Experience.tsx` and
> `Scene.tsx` (OrbitControls gate, leva constants, DevPerf). Confirm the
> excerpts below still match the live code apart from those changes.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (visual tuning; needs an eyeball check)
- **Depends on**: plans/002-remove-leva-and-r3f-perf-from-production.md
- **Category**: perf
- **Planned at**: commit `21580f8`, 2026-09-16

## Why this matters

Every frame, the main scene currently renders: PCSS soft shadows with 20
samples for **two** shadow-casting lights (up to 40 shadow-map fetches per
fragment on the 100×100 ground plane), then an `EffectComposer` at the default
8× MSAA with an unused stencil buffer, running Bloom + Vignette + TiltShift at
full device pixel ratio (up to 2×). The Canvas also keeps its own antialiased
backbuffer, which is wasted once the composer takes over. There is no
`performance` prop, so R3F never lowers resolution when frames drop — the
loading screen literally warns that mobile is "not fully supported".

On top of that, `Experience` (the root of the R3F tree) re-renders on every
store change, and on each render it allocates new `Vector3`s and hands the
`EffectComposer` fresh child elements, which can make the composer rebuild its
passes and render targets mid-interaction. Finally, every hover label uses
`<Html occlude="raycast">`, which raycasts the entire scene (including the
100-instance mesh) every frame while visible.

Target: same look at a glance, roughly half the GPU work per frame, no
composer churn on hover.

## Current state

Project: Next.js 15.2, React 19, R3F 9, drei 10, `@react-three/postprocessing` 3. **npm**. No tests.

### `src/components/Scene.tsx` (post plan 002)

```tsx
<Canvas
  shadows
  dpr={[1, 2]}
  style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
  className="bg-white"
>
  <DevPerf />
  <Experience />
</Canvas>
```

### `src/components/Experience.tsx` (post plans 001/002; line numbers approximate)

Imports (lines 1-21): `BakeShadows, OrbitControls, SoftShadows, OrthographicCamera` from drei; `Physics, RigidBody` from rapier; `Vignette, EffectComposer, Bloom, TiltShift2` from `@react-three/postprocessing`; `gsap`; `THREE`.

Camera constants object allocated **inside** the component on every render:

```tsx
const cameraPositions: CameraPositions = {
  initialPos: { position: new THREE.Vector3(-1.1, 3.9, 5), zoom: 120 },
  zoomedPos: { position: new THREE.Vector3(-3, 5, 5), zoom: 170 },
};
```

Camera tween effect (`useEffect(..., [cameraZoomed])`, ~lines 54-103): two
branches, each calls `gsap.to(refCamera.current.position, {...})` and
`gsap.to(refCamera.current, { zoom, ... })`. No cleanup return.

Lights:

```tsx
<ambientLight intensity={0.1} />
<Lights />
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
```

Ground plane inside `<Physics>`:

```tsx
<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
  <planeGeometry args={[100, 100, 1, 1]} />
  <shadowMaterial opacity={0.65} transparent />
</mesh>
```

Shadow + post chain (end of the JSX):

```tsx
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
```

Scene camera: `<OrthographicCamera ... near={0.1} far={20} />` and `<fog attach="fog" args={["#f0f0f0", 0, 20]} />` — the authored scene fits in ~20 units. The portfolio box group is at `position={[4, 0, -1.7]}` with `scale={11}` (`Portfolio.tsx:76-78`); the about model at roughly the origin; the diploma at `[-0.7, 0.5, 2.75]`.

`BakeShadows` sets `gl.shadowMap.autoUpdate = false` after the first frame.
Nothing dynamic casts shadows (the instanced diplomas have no `castShadow`), so
freezing is correct today. Keep it.

### `src/components/Annotation.tsx` (whole file)

```tsx
import React, { ComponentProps, ReactNode } from "react";
import { Html } from "@react-three/drei";

interface AnnotationProps extends ComponentProps<typeof Html> {
  children: ReactNode;
}

export default function Annotation({ children, ...props }: AnnotationProps) {
  return (
    <Html {...props} transform occlude="raycast" castShadow={false}>
      <div className="font-mono font-extrabold   text-black text-sm ">
        {children}
      </div>
    </Html>
  );
}
```

Mounted on hover from `Portfolio.tsx` (3 sites) and `AboutModel.tsx` (1 site).

### Conventions

Module-level `UPPER_SNAKE` constants; typed tuples `[number, number, number]`.
Reference for a well-configured Canvas in this repo: `src/components/UI/Contact.tsx:62-76` uses `performance={{ min: 0.5 }}` and `frameloop="demand"`. (Do **not** use `frameloop="demand"` on the main scene — it has continuous physics, a flickering light and animated shader time.)

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `npm ci`                 | exit 0 |
| Typecheck | `npx tsc --noEmit`       | exit 0 |
| Lint      | `npm run lint`           | exit 0 |
| Build     | `npm run build`          | exit 0 |
| Dev       | `npm run dev`            | serves on :3000; dev perf overlay top-left shows FPS/GPU ms |

## Suggested executor toolkit

- Skill `optimizing-webgl-performance` (if available) for the reasoning behind dpr/MSAA/shadow choices.
- Docs: drei `SoftShadows`, `Html` (`occlude` prop); `@react-three/postprocessing` `EffectComposer` props (`multisampling`, `stencilBuffer`, `resolutionScale`).

## Scope

**In scope**:
- `src/components/Scene.tsx` (Canvas props only)
- `src/components/Experience.tsx`
- `src/components/PostProcessing.tsx` (create)
- `src/components/Annotation.tsx`

**Out of scope**:
- `Lights.tsx`, `Portfolio.tsx`, `AboutModel.tsx`, `Diploma*.tsx` — no changes.
- Zustand selector changes in `Experience.tsx` (plan 006 does that; if plan 006 already landed, keep its selectors).
- Removing `BakeShadows` — see Maintenance notes.
- Removing `TiltShift2` or `Bloom` entirely — art-direction decision for the owner; this plan only makes them cheaper.

## Git workflow

- One or two commits: `Reduce shadow, MSAA and post-processing cost in main scene`, `Stop re-creating post-processing passes on scene re-render`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Canvas — disable redundant backbuffer AA, cap DPR, enable adaptive performance

In `Scene.tsx` change the `<Canvas ...>` opening tag to:

```tsx
<Canvas
  shadows
  dpr={[1, 1.5]}
  gl={{ antialias: false, powerPreference: "high-performance" }}
  performance={{ min: 0.5 }}
  style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
  className="bg-white"
>
```

Rationale: the composer provides MSAA (Step 3), so the default backbuffer AA
is wasted; 1.5× DPR is visually indistinguishable from 2× behind a tilt-shift
blur; `performance.min` lets R3F scale resolution down under load.

**Verify**: `npx tsc --noEmit` → exit 0.

### Step 2: Shadows — fewer PCSS samples, one shadow caster, tight shadow camera

In `Experience.tsx`:

1. `<SoftShadows size={35} samples={20} />` → `<SoftShadows size={35} samples={10} />`.
2. On the **second** directional light (the blue `#7195eb` one), remove `castShadow`, `shadow-mapSize={1024}` and `shadow-bias={0.0001}`. It becomes a fill light only.
3. On the **first** directional light (`KEY_LIGHT_POSITION`), add explicit shadow-camera bounds so the 1024² map covers only the scene:

```tsx
<directionalLight
  position={KEY_LIGHT_POSITION}
  intensity={3.8}
  castShadow
  shadow-mapSize={1024}
  shadow-bias={0}
  shadow-camera-near={0.5}
  shadow-camera-far={25}
  shadow-camera-left={-8}
  shadow-camera-right={8}
  shadow-camera-top={8}
  shadow-camera-bottom={-8}
/>
```

These bounds are a starting point derived from the scene fitting in ~20
units. Visual check in Step 6: every object that cast a shadow before must
still cast one (box, shovel, about model, diploma). If a shadow is clipped,
widen the ±8 values symmetrically (e.g. ±12) and re-check; do not exceed ±20.

**Verify**: `grep -c "castShadow" src/components/Experience.tsx` → `1`. `grep -n "samples=" src/components/Experience.tsx` → `samples={10}`.

### Step 3: Post-processing — extract to a memoized component, drop stencil, 4× MSAA

Create `src/components/PostProcessing.tsx`:

```tsx
import React, { memo } from "react";
import {
  Bloom,
  EffectComposer,
  TiltShift2,
  Vignette,
} from "@react-three/postprocessing";

function PostProcessing() {
  return (
    <EffectComposer multisampling={4} stencilBuffer={false}>
      <Bloom
        intensity={0.1}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette darkness={0.7} offset={0.1} />
      <TiltShift2 blur={0.3} />
    </EffectComposer>
  );
}

export default memo(PostProcessing);
```

`memo` with no props means this subtree never re-renders when `Experience`
does, so the composer's `children` identity is stable and passes are built
once. (This repo has no React Compiler, so `memo` is appropriate here.)

Then in `Experience.tsx`:
- Remove the `Vignette, EffectComposer, Bloom, TiltShift2` import.
- Add `import PostProcessing from "./PostProcessing";`
- Replace the whole `<EffectComposer ...>...</EffectComposer>` block with `<PostProcessing />`.

**Verify**: `grep -n "EffectComposer" src/components/Experience.tsx` → no output. `npx tsc --noEmit` → exit 0. If TypeScript rejects `mipmapBlur` on `Bloom`, remove that single prop and continue (the installed version may predate it).

### Step 4: Hoist camera constants and kill in-flight camera tweens

In `Experience.tsx`:

1. Move `cameraPositions` out of the component to module scope, renamed:

```tsx
const CAMERA_POSITIONS: CameraPositions = {
  initialPos: { position: new THREE.Vector3(-1.1, 3.9, 5), zoom: 120 },
  zoomedPos: { position: new THREE.Vector3(-3, 5, 5), zoom: 170 },
};
```

   and update the six references inside the effect (`cameraPositions.` → `CAMERA_POSITIONS.`).

2. Give the camera effect a cleanup so a fast hover in/out does not stack tweens. At the end of the `useEffect` body (after the `if/else if`), add:

```tsx
return () => {
  if (refCamera.current) {
    gsap.killTweensOf(refCamera.current.position);
    gsap.killTweensOf(refCamera.current);
  }
};
```

   Note: killing an in-flight tween skips its `onComplete`, which would leave
   `isTransitioning` stuck `true`. To keep the store consistent, also call
   `setTransitioning(false)` inside that cleanup **before** the kills. (The new
   tween's `onStart` sets it back to `true` immediately.) Add `setTransitioning`
   to the effect's dependency array; it is a stable zustand setter so this does
   not retrigger the effect.

**Verify**: `grep -n "new THREE.Vector3" src/components/Experience.tsx` → both hits are at module scope (line numbers below the `Experience` function's opening line). `grep -c "killTweensOf" src/components/Experience.tsx` → `2`.

### Step 5: Annotation — stop per-frame whole-scene raycasts

In `Annotation.tsx` remove `occlude="raycast"`:

```tsx
<Html {...props} transform castShadow={false}>
```

Labels will no longer hide behind geometry. In this scene they are placed
above/in front of their objects and only show on hover, so the difference is
negligible; the saving is a full-scene raycast per frame per visible label.

**Verify**: `grep -n "occlude" src/components/Annotation.tsx` → no output.

### Step 6: Gates and visual check

`npx tsc --noEmit` → 0. `npm run lint` → 0. `npm run build` → 0.

If a browser is available: `npm run dev`, open `/`. Check with the dev perf
overlay (top-left): GPU ms per frame should drop noticeably vs. `git stash`-free
comparison (compare against `main` in a second worktree if needed). Visually:
shadows still present under box, shovel, about model, diploma; edges still
smooth; tilt-shift and vignette still visible; hovering the box zooms the camera
smoothly and rapid hover in/out never leaves the camera stuck mid-way.

## Test plan

No automated tests. The verification is the greps, the gates, and the visual
checklist in Step 6. Record the before/after GPU ms from the dev overlay in the
report if measured.

## Done criteria

- [ ] `Scene.tsx` Canvas has `gl={{ antialias: false, ... }}`, `performance={{ min: 0.5 }}`, `dpr={[1, 1.5]}`
- [ ] Exactly one `castShadow` light in `Experience.tsx`, with explicit `shadow-camera-*` bounds
- [ ] `SoftShadows samples={10}`
- [ ] `src/components/PostProcessing.tsx` exists, memoized, `multisampling={4}`, `stencilBuffer={false}`
- [ ] `Experience.tsx` no longer imports from `@react-three/postprocessing`
- [ ] Camera constants at module scope; camera effect has a cleanup that kills tweens
- [ ] `Annotation.tsx` has no `occlude` prop
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` exit 0
- [ ] `git status --short` shows only in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- The live `Experience.tsx` has diverged from the excerpts beyond what plans 001/002 describe (e.g. lights or post chain already changed).
- `multisampling` or `stencilBuffer` props are rejected by TypeScript — the installed `@react-three/postprocessing` may differ from v3; report the installed version (`npm ls @react-three/postprocessing`).
- After Step 2 a shadow is missing even at ±20 shadow-camera bounds — something else is wrong; report rather than keep widening.
- After Step 4, hovering the box leaves the camera stuck or `isTransitioning` never returns to `false` (visible as hover no longer working). Revert Step 4.2 and report.

## Maintenance notes

- `BakeShadows` freezes shadow maps after the first frame. If anyone adds `castShadow` to the instanced diplomas, they must either remove `BakeShadows` (which reintroduces two shadow passes per frame — with PCSS, this is the single most expensive thing you can do to this scene) or set `gl.shadowMap.needsUpdate = true` only while the physics bodies are awake.
- If the second light's shadow is missed visually, prefer raising the first light's intensity slightly over re-enabling a second shadow caster.
- `mipmapBlur` on Bloom is cheaper and softer than the legacy kernel; if the owner dislikes the look, remove the prop rather than raising `multisampling`.
- Deferred, not done here: gating `TiltShift2` off on low-end devices (needs a device-tier heuristic), and replacing `colliders="hull"` on `AboutModel` with cuboid colliders (one-time load cost; measure before changing).
