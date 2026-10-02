# Plan 005: Make the diploma dissolve material opaque-with-alphaTest, early-out its noise, and stop mutating shared geometry

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 21580f8..HEAD -- src/components/Diploma/DiplomaInstances.tsx`
> Plans 001 (console.log removed) and 002 (leva constants) are expected to
> have touched this file. Confirm the excerpts below still match otherwise.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (shader change; needs an eyeball check of the dissolve)
- **Depends on**: plans/002-remove-leva-and-r3f-perf-from-production.md
- **Category**: perf
- **Planned at**: commit `21580f8`, 2026-09-16

## Why this matters

When the user clicks the diploma, 100 instanced diploma frames fall into the
scene using a custom dissolve shader. That shader:

1. Is marked `transparent: true`, so all 100 instances go through the
   back-to-front transparent queue with depth writes off. But its alpha is the
   output of `step()` — exactly 0 or 1, never fractional. Rendering it opaque
   with `alphaTest` gives identical pixels while restoring depth writes and
   early-Z, eliminating the overdraw of frames stacked behind each other.
2. Computes 5 octaves of 3D simplex noise per fragment every frame, even in
   the resting state (`uProgress = 1.0`) where `threshold = 0` and
   `step(0.0, noise)` is always `1.0` — the noise result is discarded.
3. Attaches three `InstancedBufferAttribute`s directly onto the GLB's cached
   `BufferGeometry`. That same geometry object is rendered by the standalone
   `<Diploma>` (the clickable one), so a regular `Mesh` ends up carrying
   instanced attributes. On every spawn cycle the attributes are re-created and
   the old GPU buffers are never disposed. The `ShaderMaterial` is likewise
   never disposed on unmount, and the GSAP dissolve timeline is never killed.

## Current state

Project: Next.js 15.2, React 19, R3F 9, `three` 0.174. **npm**. No tests.

File: `src/components/Diploma/DiplomaInstances.tsx` (508 lines at planning
time; after plans 001/002 slightly fewer). Key regions, quoted as they exist
after plan 002 (leva removed, constants added):

Fragment shader `fbm` (inside the `noiseFunction` template string, ~lines 103-115):

```glsl
float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 0.0;

  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}
```

Fragment shader `main()` tail (~lines 267-297):

```glsl
vec3 worldPos = vWorldPosition;
float noise = fbm(worldPos * uNoiseScale + vTime * 0.5);
noise = (noise + 1.0) * 0.5; // Normalize to 0-1

float progress = uProgress;
float threshold = 1.0 - progress;
float alpha = step(threshold, noise);
float border = step(threshold - uThickness, noise) - alpha;
vec3 finalColor = mix(pbrColor, uEdgeColor, border);

if (alpha < 0.01) {
  discard;
}

gl_FragColor = vec4(finalColor, alpha);
```

Material creation (~lines 340-394), ending with:

```tsx
      uCameraPosition: { value: new THREE.Vector3(0, 0, 0) },
    },
    transparent: true,
    side: originalMaterial.side || THREE.FrontSide,
  });
}, [materials]);
```

Instance attribute effect (~lines 397-439):

```tsx
React.useEffect(() => {
  if (!meshRef.current) return;

  const geometry = nodes.pCube1_lambert1_0.geometry;
  ...
  geometry.setAttribute("instanceColor", new THREE.InstancedBufferAttribute(instanceColors, 3));
  geometry.setAttribute("instanceTime", new THREE.InstancedBufferAttribute(instanceTimes, 1));
  geometry.setAttribute("instanceProgress", new THREE.InstancedBufferAttribute(instanceProgress, 1));
}, [nodes, materials]);
```

Dissolve trigger effect (~lines 441-455):

```tsx
useEffect(() => {
  if (disolveDiplomas && shaderMaterialRef.current) {
    const tl = gsap.timeline();

    tl.to(shaderMaterialRef.current.uniforms.uProgress, {
      value: 0,
      duration: 1,
      ease: "power1.inOut",
      onComplete: () => {
        setDisolveDiplomas(false);
        setClearDiplomas(false);
      },
    });
  }
}, [disolveDiplomas, setClearDiplomas, setDisolveDiplomas]);
```

JSX (~lines 483-507):

```tsx
<InstancedRigidBodies scale={[1, 1, 1]} instances={instances} type="dynamic" colliders="cuboid" linearDamping={0.95} angularDamping={0.95}>
  <instancedMesh
    ref={meshRef}
    args={[nodes.pCube1_lambert1_0.geometry, undefined, instances.length]}
    count={instances.length}
    scale={[1, 1, 1]}
  >
    <primitive object={shaderMaterial} ref={shaderMaterialRef} attach="material" />
  </instancedMesh>
</InstancedRigidBodies>
```

The same GLB geometry is used by `src/components/Diploma/Diploma.tsx:52`:
`geometry={nodes.pCube1_lambert1_0.geometry}` — do not touch that file.

The component is mounted/unmounted by `Experience.tsx`:
`{isClearDiplomas && <DiplomaInstances />}` — so unmount happens after every
dissolve completes.

Conventions: module-level `UPPER_SNAKE` constants; `useMemo` for expensive
setup; `useEffect` cleanup returns.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `npm ci`                 | exit 0 |
| Typecheck | `npx tsc --noEmit`       | exit 0 |
| Lint      | `npm run lint`           | exit 0 |
| Build     | `npm run build`          | exit 0 |
| Dev       | `npm run dev`            | :3000 |

## Suggested executor toolkit

- Skill `optimizing-webgl-performance` (if available): alphaTest vs transparent, early-Z.
- three.js docs: `Material.alphaTest`, `BufferGeometry.clone`, `Material.dispose`, `InstancedBufferAttribute`.

## Scope

**In scope**:
- `src/components/Diploma/DiplomaInstances.tsx` only.

**Out of scope**:
- `Diploma.tsx`, `Experience.tsx`, `Utils.ts`.
- Changing `RANGE`, gravity, damping, spawn positions, edge colour, thickness or noise scale values.
- Converting the shader to `three-custom-shader-material` (already a dependency, tempting, but a rewrite — out of scope).

## Git workflow

- One commit: `Optimize diploma dissolve material and instanced geometry lifecycle`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Opaque material with alphaTest

In the `new THREE.ShaderMaterial({...})` options, replace `transparent: true,` with:

```tsx
transparent: false,
alphaTest: 0.5,
depthWrite: true,
```

Also update the fragment shader's tail so it relies on `alphaTest` instead of a
manual discard **and** skips the noise entirely at rest. Replace the block from
`vec3 worldPos = vWorldPosition;` through `gl_FragColor = vec4(finalColor, alpha);` with:

```glsl
// Fast path: fully visible, nothing to dissolve — skip the noise entirely.
if (uProgress >= 0.999) {
  gl_FragColor = vec4(pbrColor, 1.0);
  return;
}

vec3 worldPos = vWorldPosition;
float noise = fbm(worldPos * uNoiseScale + vTime * 0.5);
noise = (noise + 1.0) * 0.5; // Normalize to 0-1

float threshold = 1.0 - uProgress;
float alpha = step(threshold, noise);
float border = step(threshold - uThickness, noise) - alpha;
vec3 finalColor = mix(pbrColor, uEdgeColor, border);

// alpha is exactly 0.0 or 1.0; alphaTest (0.5) on the material discards the 0.0 case.
gl_FragColor = vec4(finalColor, alpha);
```

Important: `ShaderMaterial` does **not** automatically add the `alphaTest`
uniform/`#include <alphatest_fragment>` chunk the way built-in materials do.
Setting `alphaTest` on a `ShaderMaterial` only defines `ALPHATEST` for the
shader; the discard has to be in the shader source. So **keep** a discard, but
make it the standard chunk form. Immediately before `gl_FragColor = vec4(finalColor, alpha);` add:

```glsl
if (alpha < 0.5) discard;
```

(The material-level `alphaTest: 0.5` is still set so three's sort/state logic
treats the material as alpha-tested opaque.)

**Verify**: `grep -n "transparent: false\|alphaTest: 0.5\|depthWrite: true" src/components/Diploma/DiplomaInstances.tsx` → three lines. `grep -c "uProgress >= 0.999" src/components/Diploma/DiplomaInstances.tsx` → `1`.

### Step 2: Reduce noise octaves

In `fbm`, change `for (int i = 0; i < 5; i++)` to `for (int i = 0; i < 3; i++)`.
Also delete the unused `float frequency = 0.0;` line.

At `uNoiseScale = 2.0`, three octaves produce a visually equivalent dissolve
edge; the two dropped octaves contribute sub-pixel detail.

**Verify**: `grep -n "i < 3" src/components/Diploma/DiplomaInstances.tsx` → one line inside `fbm`.

### Step 3: Clone the geometry once, dispose on unmount

1. Add a memoised private geometry right after the `useGLTF` line:

```tsx
const instancedGeometry = useMemo(
  () => nodes.pCube1_lambert1_0.geometry.clone(),
  [nodes]
);
```

2. In the instance-attribute effect, replace
   `const geometry = nodes.pCube1_lambert1_0.geometry;` with
   `const geometry = instancedGeometry;` and change its dependency array to
   `[instancedGeometry, materials]`. Also remove the early
   `if (!meshRef.current) return;` — the effect no longer needs the mesh ref
   because it writes to the memoised geometry, not to the mesh.

3. In the `<instancedMesh>` JSX, change `args={[nodes.pCube1_lambert1_0.geometry, undefined, instances.length]}` to
   `args={[instancedGeometry, undefined, instances.length]}`.

4. Add a disposal effect (after the material `useMemo` and geometry `useMemo`):

```tsx
useEffect(() => {
  return () => {
    instancedGeometry.dispose();
    shaderMaterial.dispose();
  };
}, [instancedGeometry, shaderMaterial]);
```

**Verify**: `grep -c "nodes.pCube1_lambert1_0.geometry" src/components/Diploma/DiplomaInstances.tsx` → `1` (only inside the `clone()` memo). `grep -c "\.dispose()" src/components/Diploma/DiplomaInstances.tsx` → `2`.

### Step 4: Kill the dissolve timeline on cleanup

Change the dissolve effect to:

```tsx
useEffect(() => {
  if (!disolveDiplomas || !shaderMaterialRef.current) return;

  const tl = gsap.timeline();
  tl.to(shaderMaterialRef.current.uniforms.uProgress, {
    value: 0,
    duration: 1,
    ease: "power1.inOut",
    onComplete: () => {
      setDisolveDiplomas(false);
      setClearDiplomas(false);
    },
  });

  return () => {
    tl.kill();
  };
}, [disolveDiplomas, setClearDiplomas, setDisolveDiplomas]);
```

**Verify**: `grep -c "tl.kill()" src/components/Diploma/DiplomaInstances.tsx` → `1`.

### Step 5: Gates and visual check

`npx tsc --noEmit` → 0. `npm run lint` → 0. `npm run build` → 0.

If a browser is available (`npm run dev`, open `/`):
1. Click the framed diploma on the desk → 100 diplomas fall and pile up. They must be **fully opaque** and occlude each other correctly (no see-through stacking artefacts — this should look *better* than before).
2. The standalone diploma on the desk still renders normally.
3. Click "Clear Diplomas" (bottom-right) → over ~1 s the frames dissolve with an orange glowing edge, then vanish and the button disappears.
4. Click the diploma again → the cycle repeats; check the browser console has no WebGL warnings about buffer/attribute mismatches.
5. Dev perf overlay: GPU ms while 100 diplomas are resting should be lower than before this plan.

## Test plan

No automated tests. Verification is the grep gates + typecheck/lint/build + the
five-point visual checklist above.

## Done criteria

- [ ] Material is `transparent: false`, `alphaTest: 0.5`, `depthWrite: true`
- [ ] Fragment shader has the `uProgress >= 0.999` early return and a `< 0.5` discard
- [ ] `fbm` loops 3 times
- [ ] Geometry is cloned once via `useMemo` and disposed on unmount; material disposed on unmount
- [ ] The dissolve timeline is killed in the effect cleanup
- [ ] `Diploma.tsx` untouched (`git diff --stat -- src/components/Diploma/Diploma.tsx` empty)
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` exit 0
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- The live shader `main()` tail or the material options differ from the excerpts (someone changed the dissolve since planning).
- After Step 1 the diplomas render as solid blocks with no dissolve when clearing — the early-return threshold or the discard is wrong; report the shader as it stands rather than iterating blindly.
- After Step 3 the console shows WebGL errors mentioning `instanceColor`/`instanceTime` attributes — the clone/dispose order interacts badly with `InstancedRigidBodies`; report.
- `npx tsc --noEmit` complains about `alphaTest` not existing on `ShaderMaterialParameters` — report the installed `three` version (`npm ls three`).

## Maintenance notes

- If anyone re-adds a leva-style live control for `uProgress`, the early-return threshold (`0.999`) means values between 0.999 and 1.0 render as fully visible; that is intended.
- If the frames ever need true partial transparency (e.g. a fade), `transparent: true` must come back and the alphaTest path removed — do both together.
- Adding `castShadow` to the `instancedMesh` interacts with `BakeShadows` in `Experience.tsx` (see plan 004's maintenance notes).
