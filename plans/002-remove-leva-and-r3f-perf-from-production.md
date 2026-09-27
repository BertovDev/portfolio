# Plan 002: Remove leva and r3f-perf from the production bundle

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 21580f8..HEAD -- src/components/Scene.tsx src/components/Experience.tsx src/components/Lights.tsx src/components/Diploma/DiplomaInstances.tsx package.json`
> Plan 001 is expected to have touched `Experience.tsx`, `Lights.tsx` and
> `DiplomaInstances.tsx` (line numbers below may be shifted by a few lines).
> Any other mismatch with the "Current state" excerpts is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/001-quick-wins-dead-code-and-debug-leftovers.md
- **Category**: perf
- **Planned at**: commit `21580f8`, 2026-09-16

## Why this matters

`leva` is a development tweak-panel library. It pulls in Radix UI, a colour
picker, a CSS-in-JS runtime and a validation library — roughly 100 KB gzipped.
Three components call its `useControls` hook at runtime, so the whole library
ships to every visitor even though the panel is rendered `hidden`. Worse, the
values it returns are load-bearing: they set the production camera position,
the key light position, the bulb light, and the dissolve shader uniforms. In
`DiplomaInstances` the returned object is also a `useMemo` dependency for a
`ShaderMaterial`, so any control change recompiles the 300-line shader.

`r3f-perf` is imported statically in `Scene.tsx`. Its JSX is gated behind
`NODE_ENV === "development"`, but the static import may still land in the
production chunk depending on tree-shaking.

After this plan, the same values live in plain constants, the leva panel is
gone, `r3f-perf` is loaded only in development via a dynamic import, and both
packages are out of `dependencies`.

## Current state

Project: Next.js 15.2 App Router, React 19, TypeScript strict, R3F 9. Package
manager is **npm**. No tests. Verification is typecheck + lint + build.

### `src/components/Scene.tsx` (whole file, 23 lines)

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import React from "react";
import Experience from "./Experience";
import { Perf } from "r3f-perf";

import { Leva } from "leva";

export default function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      className="bg-white"
    >
      {process.env.NODE_ENV === "development" && <Perf position="top-left" />}
      <Leva hidden />
      <Experience />
    </Canvas>
  );
}
```

### `src/components/Experience.tsx:4` and `:34-39`

```tsx
import { useControls } from "leva";
...
const { position, rotation, zoom, lightPos } = useControls({
  position: [-1.1, 3.9, 5],
  rotation: [0, 0.67, 0],
  zoom: 130,
  lightPos: [-1.8, 2.5, 3],
});
```

These are consumed at `Experience.tsx:112-120` (`<OrthographicCamera position={position} rotation={rotation} zoom={zoom} ... />`) and `:128-129` (`<directionalLight position={lightPos} ... />`).

Note: `zoom: 130` from leva is the *initial* camera zoom, but the GSAP camera
tweens at `Experience.tsx:49-52` use `initialPos.zoom = 120`. This mismatch is
pre-existing; **preserve 130 as the initial value** so visual output does not
change. Do not "fix" the mismatch in this plan.

### `src/components/Lights.tsx:2` and `:10-14`

```tsx
import { useControls } from "leva";
...
const bulbLightControls = useControls("Bulb Light", {
  intensity: { value: 10, min: 0, max: 20 },
  position: { value: [0, 2, 0], step: 0.1 },
  color: "#ffddaa",
});
```

Consumed at `Lights.tsx:38-40` as `bulbLightControls.intensity`, `.position`, `.color`. The `intensity` value is immediately overwritten every 100 ms by the flicker interval (lines 16-25), so it only matters for the first frame.

### `src/components/Diploma/DiplomaInstances.tsx:10`, `:308-314`, `:366-373`, `:394`, `:470-479`

```tsx
import { useControls } from "leva";
...
const dissolveControls = useControls("Dissolve Effect", {
  progress: { value: 1.0, min: 0.0, max: 1.0, step: 0.01 },
  thickness: { value: 0.1, min: 0.0, max: 0.5, step: 0.01 },
  noiseScale: { value: 2.0, min: 0.5, max: 5.0, step: 0.1 },
  edgeColor: "#eb5a13",
  edgeIntensity: { value: 20, min: 1, max: 50, step: 1 },
});
```

Used to seed uniforms inside `useMemo(() => new THREE.ShaderMaterial({...}), [materials, dissolveControls])` (lines 340-394: `uProgress`, `uThickness`, `uEdgeColor`, `uNoiseScale`) and re-applied every frame at lines 470-479:

```tsx
shaderMaterialRef.current.uniforms.uThickness.value = dissolveControls.thickness;
shaderMaterialRef.current.uniforms.uNoiseScale.value = dissolveControls.noiseScale;
shaderMaterialRef.current.uniforms.uEdgeColor.value
  .set(dissolveControls.edgeColor)
  .multiplyScalar(dissolveControls.edgeIntensity);
```

### `package.json` dependencies (relevant lines)

```json
"leva": "^0.10.0",
"r3f-perf": "^7.2.3",
```

### Conventions

- Module-level constants use `const UPPER_SNAKE` in this repo (`const RANGE = 100;` at `DiplomaInstances.tsx:22`, `const COUNT: number = 30;` at `Contact.tsx:16`). Match that.
- Tuple positions are typed `[number, number, number]` (see `Portfolio.tsx:69`).

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `npm ci`                 | exit 0 |
| Typecheck | `npx tsc --noEmit`       | exit 0 |
| Lint      | `npm run lint`           | exit 0 |
| Build     | `npm run build`          | exit 0 |
| Uninstall | `npm uninstall leva`     | exit 0, `package.json` and lockfile updated |
| Move dep  | `npm uninstall r3f-perf && npm install --save-dev r3f-perf@^7.2.3` | exit 0 |

## Scope

**In scope**:
- `src/components/Scene.tsx`
- `src/components/Experience.tsx` (only the `useControls` import/call and its consumers)
- `src/components/Lights.tsx`
- `src/components/Diploma/DiplomaInstances.tsx` (only the `useControls` import/call, the `useMemo` dep array, and the per-frame uniform writes)
- `src/components/dev/DevPerf.tsx` (create)
- `package.json`, `package-lock.json`

**Out of scope**:
- Camera/light/shadow/postprocessing tuning in `Experience.tsx` (plan 004).
- Shader source, `transparent`, geometry handling in `DiplomaInstances.tsx` (plan 005).
- Zustand call sites (plan 006).
- Do not change any numeric value — only its source.

## Git workflow

- One commit. Message: `Replace leva controls with constants and make r3f-perf dev-only`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create a dev-only perf overlay

Create `src/components/dev/DevPerf.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";

const Perf = dynamic(() => import("r3f-perf").then((m) => m.Perf), {
  ssr: false,
});

export default function DevPerf() {
  if (process.env.NODE_ENV !== "development") return null;
  return <Perf position="top-left" />;
}
```

Because the `NODE_ENV` check is a compile-time constant in Next.js production
builds, the dynamic chunk is never requested in production.

**Verify**: `npx tsc --noEmit` → exit 0.

### Step 2: Rewrite `Scene.tsx`

Replace the whole file with:

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import React from "react";
import Experience from "./Experience";
import DevPerf from "./dev/DevPerf";

export default function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      className="bg-white"
    >
      <DevPerf />
      <Experience />
    </Canvas>
  );
}
```

(Keep `shadows`, `dpr`, `style`, `className` exactly as they are — plan 004 changes them.)

**Verify**: `grep -n "leva\|r3f-perf" src/components/Scene.tsx` → no output.

### Step 3: Replace `useControls` in `Experience.tsx`

1. Delete `import { useControls } from "leva";`.
2. Add module-level constants **above** the `Experience` function (after the type declarations):

```tsx
const CAMERA_POSITION: [number, number, number] = [-1.1, 3.9, 5];
const CAMERA_ROTATION: [number, number, number] = [0, 0.67, 0];
const CAMERA_ZOOM = 130;
const KEY_LIGHT_POSITION: [number, number, number] = [-1.8, 2.5, 3];
```

3. Delete the `const { position, rotation, zoom, lightPos } = useControls({...});` block.
4. In the JSX, replace `position={position}` → `position={CAMERA_POSITION}`, `rotation={rotation}` → `rotation={CAMERA_ROTATION}`, `zoom={zoom}` → `zoom={CAMERA_ZOOM}` on the `<OrthographicCamera>`, and `position={lightPos}` → `position={KEY_LIGHT_POSITION}` on the first `<directionalLight>`.

**Verify**: `grep -n "useControls\|lightPos\|{zoom}\|{rotation}\|{position}" src/components/Experience.tsx` → no output. `npx tsc --noEmit` → exit 0.

### Step 4: Replace `useControls` in `Lights.tsx`

1. Delete `import { useControls } from "leva";`.
2. Add above the component:

```tsx
const BULB_INTENSITY = 10;
const BULB_POSITION: [number, number, number] = [0, 2, 0];
const BULB_COLOR = "#ffddaa";
```

3. Delete the `bulbLightControls` block.
4. In the `<pointLight>`: `intensity={BULB_INTENSITY}`, `position={BULB_POSITION}`, `color={BULB_COLOR}`.

**Verify**: `grep -n "useControls\|bulbLightControls" src/components/Lights.tsx` → no output.

### Step 5: Replace `useControls` in `DiplomaInstances.tsx`

1. Delete `import { useControls } from "leva";`.
2. Add module-level constants next to `const RANGE = 100;`:

```tsx
const DISSOLVE_THICKNESS = 0.1;
const DISSOLVE_NOISE_SCALE = 2.0;
const DISSOLVE_EDGE_COLOR = "#eb5a13";
const DISSOLVE_EDGE_INTENSITY = 20;
```

3. Delete the `const dissolveControls = useControls("Dissolve Effect", {...});` block.
4. In the `useMemo` that builds the `ShaderMaterial`:
   - `uProgress: { value: 1.0 }` (was `dissolveControls.progress`; the value is 1.0 = fully visible)
   - `uThickness: { value: DISSOLVE_THICKNESS }`
   - `uEdgeColor: { value: new THREE.Color(DISSOLVE_EDGE_COLOR).multiplyScalar(DISSOLVE_EDGE_INTENSITY) }`
   - `uNoiseScale: { value: DISSOLVE_NOISE_SCALE }`
   - Change the dependency array from `[materials, dissolveControls]` to `[materials]`.
5. In the `useFrame` callback, delete the block that starts with the comment `// Update uniforms from Leva controls` through the `.multiplyScalar(dissolveControls.edgeIntensity);` line (this includes the commented-out `uProgress` lines). The uniforms are now fixed at creation, so per-frame re-assignment is unnecessary. Keep the `uTime` and `uCameraPosition` updates.

**Verify**: `grep -n "dissolveControls\|useControls" src/components/Diploma/DiplomaInstances.tsx` → no output. `npx tsc --noEmit` → exit 0.

### Step 6: Update dependencies

```bash
npm uninstall leva
npm uninstall r3f-perf
npm install --save-dev r3f-perf@^7.2.3
```

**Verify**: `grep -n '"leva"' package.json` → no output. `node -e 'const p=require("./package.json"); console.log(!!p.devDependencies["r3f-perf"], !!(p.dependencies||{})["r3f-perf"])'` → `true false`.

### Step 7: Full gates

**Verify**: `grep -rn "from \"leva\"" src/` → no output. `npx tsc --noEmit` → exit 0. `npm run lint` → exit 0. `npm run build` → exit 0.

Optional bundle check if `@next/bundle-analyzer` is not installed: after `npm run build`, run `grep -rl "leva" .next/static/chunks/ | wc -l` → `0`.

## Test plan

No test suite exists. Verification = grep gates + typecheck + lint + build +
the `.next/static/chunks` grep. Manual smoke if a browser is available:
`npm run dev`, open `/`; the camera framing, key light direction and the bulb
flicker must look identical to before; hovering the box zooms the camera;
clicking the diploma spawns 100 falling diplomas; "Clear Diplomas" dissolves
them with an orange edge glow. A perf overlay appears top-left in dev only.

## Done criteria

- [ ] `grep -rn "leva" src/ package.json` returns no matches
- [ ] `r3f-perf` is in `devDependencies` and not in `dependencies`
- [ ] `src/components/dev/DevPerf.tsx` exists and is the only importer of `r3f-perf` (`grep -rln "r3f-perf" src/` → that one file)
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` all exit 0
- [ ] No numeric value changed: the constants match the excerpts above exactly
- [ ] `git status --short` shows only in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- Any of the `useControls` blocks contains values different from the excerpts above (someone retuned them since planning). Report the live values instead of guessing which is right.
- `npm uninstall`/`npm install` fails (registry/network), or produces a lockfile diff touching unrelated packages beyond `leva`/`r3f-perf` and their transitive deps.
- `npm run build` fails with an error mentioning `r3f-perf` or `next/dynamic` — the dynamic-import shape may need adjustment; report rather than guess.

## Maintenance notes

- To retune values in development, temporarily reinstall `leva` as a dev dependency and wrap a `useControls` call in a `NODE_ENV` check; do not reintroduce it to `dependencies`.
- Plan 005 assumes `dissolveControls` is gone and the `useMemo` dep array is `[materials]`.
- The pre-existing 130 vs 120 initial-zoom mismatch (see Current state) is deliberately preserved; it can be reconciled in plan 004 where the camera constants are hoisted anyway.
