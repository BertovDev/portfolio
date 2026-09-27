# Plan 001: Remove debug leftovers, dead assets, and per-frame no-ops

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 21580f8..HEAD -- src/components/Diploma/DiplomaInstances.tsx src/components/UI/Projects.tsx src/components/UI/CursorTip.tsx src/components/UI/TipBar.tsx src/components/Experience.tsx src/components/Lights.tsx src/components/UI/LoadingScreen.tsx public/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `21580f8`, 2026-09-16

## Why this matters

The 3D scene currently ships several pieces of debug/dev code to production: a
`console.log` inside the render loop that fires 60+ times per second while the
diploma instances are on screen, a `useFrame` callback that calls `lookAt` on a
point light every frame (a point light has no direction, so this is pure CPU
waste plus a dirtied world matrix), and `OrbitControls` left enabled with its
dev-only gate commented out (its damping registers another per-frame update and
lets visitors drag the camera out of the composed shot). Separately, `public/`
holds ~9 MB of files nothing references, including two 4 KB git-LFS pointer
stubs that are not real videos. The loading screen's only image, which is the
LCP element in production, is missing `priority`.

Everything in this plan is a one-line deletion or a one-attribute addition.
Zero architectural decisions.

## Current state

Project: Next.js 15.2 App Router, React 19, TypeScript strict, React Three
Fiber 9. Package manager is **npm** (there is a `package-lock.json`; do not
create a `bun.lockb` or `pnpm-lock.yaml`). No test suite exists. Verification
is typecheck + lint + build.

Files and the exact lines involved:

- `src/components/Diploma/DiplomaInstances.tsx:458-459` — per-frame log:
  ```tsx
  useFrame((state) => {
    console.log(disolveDiplomas);
    if (shaderMaterialRef.current) {
  ```
- `src/components/UI/Projects.tsx:187-188` — log inside a loop in an effect:
  ```tsx
  items.forEach((item, index) => {
    console.log(item);
  ```
- `src/components/UI/CursorTip.tsx:84-86`:
  ```tsx
  if (currentId === currentLoadId.current) {
    console.log("Playing video");
    await video.play();
  ```
- `src/components/UI/TipBar.tsx:59-62`:
  ```tsx
  return () => {
    console.log("Cleaning up animation");
    tl.kill();
  };
  ```
- `src/components/Experience.tsx:107-108` — OrbitControls with its intended gate commented out:
  ```tsx
  <OrbitControls />
  {/* {process.env.NODE_ENV === "development" && <OrbitControls />} */}
  ```
- `src/components/Lights.tsx:8` and `:27-31` — target allocated per render, `lookAt` on a point light per frame:
  ```tsx
  const target = new Vector3(0, 0, 0);
  ...
  useFrame(() => {
    if (light1.current) {
      light1.current.lookAt(target);
    }
  });
  ```
  Imports at `Lights.tsx:3-4`: `import { useFrame } from "@react-three/fiber";` and `import { PointLight, Vector3 } from "three";`
- `src/components/UI/LoadingScreen.tsx:207`:
  ```tsx
  <Image src={"/benjiDor.png"} width={500} height={500} alt="benji" />
  ```
- Dead files in `public/` (verified with grep at planning time — you will re-verify in Step 5):
  - `public/images/tool.jpeg` (220 KB) — only referenced inside a commented-out block at `Experience.tsx:44-47`
  - `public/images/darkside.jpeg` (28 KB) — same commented-out block
  - `public/images/keepit.jpeg` (128 KB)
  - `public/images/tool2.png` (28 KB)
  - `public/images/AboutSection/pokerface.svg`, `pokerface2.svg`, `DumbFace.svg`
  - `public/videos/viniltify.mp4` and `public/videos/cameraShader.mp4` — 4 KB **git-LFS pointer text files**, not videos (`file` reports "ASCII text"; content starts with `version https://git-lfs.github.com/spec/v1`). `.gitattributes` has the LFS rule commented out, so these will never resolve.
  - Do **not** delete `public/videos/holograme.mp4` or `public/videos/blog.mp4` in this plan — plan 007 re-points the project list at them.

Repo conventions: components are default-exported function components; no
semicolon/quote rule is enforced beyond `eslint-config-next`. Commit messages
in `git log` are short imperative sentences (e.g. "Improve loading screen").

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `npm ci`                 | exit 0 (first run only; `node_modules/` is absent in a fresh checkout) |
| Typecheck | `npx tsc --noEmit`       | exit 0, no output |
| Lint      | `npm run lint`           | exit 0 |
| Build     | `npm run build`          | exit 0, route table printed |

## Scope

**In scope** (the only files you should modify or delete):
- `src/components/Diploma/DiplomaInstances.tsx` (delete one line)
- `src/components/UI/Projects.tsx` (delete one line)
- `src/components/UI/CursorTip.tsx` (delete one line)
- `src/components/UI/TipBar.tsx` (delete one line)
- `src/components/Experience.tsx` (lines 107-108 only)
- `src/components/Lights.tsx`
- `src/components/UI/LoadingScreen.tsx` (line 207 only)
- The dead `public/` files listed above (delete)

**Out of scope** (do NOT touch, even though they look related):
- `console.error` calls — those are legitimate error reporting.
- Any other line in `Experience.tsx` (lighting, shadows, postprocessing are plan 004).
- Any other line in `DiplomaInstances.tsx` (plan 005) or `CursorTip.tsx` (plan 008).
- `public/videos/*.mkv`, `public/videos/holograme.mp4`, `public/videos/blog.mp4` (plan 007).
- `public/*.glb` (plan 007).
- `.gitattributes` — leave the commented LFS rule as is.

## Git workflow

- Branch: work on the current branch unless the operator says otherwise.
- One commit for this whole plan is fine. Message style matches `git log`: `Remove debug logs, dead assets and per-frame no-ops`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Install and baseline

Run `npm ci`, then `npx tsc --noEmit` and `npm run lint`. Record whether they
pass **before** any change. If either fails on a clean checkout, note the
errors; you are only responsible for not adding new ones.

**Verify**: `npx tsc --noEmit; echo "tsc exit $?"` → note exit code.

### Step 1: Delete the four `console.log` lines

Remove exactly these lines (not the surrounding code):
- `DiplomaInstances.tsx:459` — `console.log(disolveDiplomas);`
- `Projects.tsx:188` — `console.log(item);`
- `CursorTip.tsx:85` — `console.log("Playing video");`
- `TipBar.tsx:60` — `console.log("Cleaning up animation");`

**Verify**: `grep -rn "console.log" src/ --include=*.tsx --include=*.ts` → only the two hits in `src/app/api/send/route.ts` remain (lines 26 and 32; those are server-side error logging and stay).

### Step 2: Gate OrbitControls to development

In `src/components/Experience.tsx` replace lines 107-108:

```tsx
<OrbitControls />
{/* {process.env.NODE_ENV === "development" && <OrbitControls />} */}
```

with:

```tsx
{process.env.NODE_ENV === "development" && <OrbitControls />}
```

Keep the `OrbitControls` import at line 2 — it is still used in development.

**Verify**: `grep -n "OrbitControls" src/components/Experience.tsx` → exactly two hits: the import on line 2 and the gated JSX line.

### Step 3: Remove the point-light `lookAt` loop

In `src/components/Lights.tsx`:
1. Delete line 8: `const target = new Vector3(0, 0, 0);`
2. Delete the whole `useFrame(() => { ... });` block at lines 27-31.
3. Change line 3-4 imports so unused symbols are gone: remove `import { useFrame } from "@react-three/fiber";` entirely and change `import { PointLight, Vector3 } from "three";` to `import { PointLight } from "three";`.

Leave the `setInterval` flicker effect (lines 16-25) and the `useControls` call untouched — plan 002 handles leva.

**Verify**: `grep -n "useFrame\|Vector3\|lookAt" src/components/Lights.tsx` → no output.

### Step 4: Mark the loading-screen image as priority

In `src/components/UI/LoadingScreen.tsx:207` change:

```tsx
<Image src={"/benjiDor.png"} width={500} height={500} alt="benji" />
```
to:
```tsx
<Image src={"/benjiDor.png"} width={500} height={500} alt="benji" priority />
```

**Verify**: `grep -n 'benjiDor.png' src/components/UI/LoadingScreen.tsx` → one line containing `priority`.

### Step 5: Re-verify and delete dead public assets

For each candidate, confirm zero references from source before deleting:

```bash
for f in tool.jpeg darkside.jpeg keepit.jpeg tool2.png pokerface.svg pokerface2.svg DumbFace.svg viniltify.mp4 cameraShader.mp4; do
  printf '%-20s ' "$f"; grep -rln "$f" src/ | grep -v '^$' | wc -l | tr -d ' '
done
```

Expected: every line ends in `0` **except** `tool.jpeg` and `darkside.jpeg`,
which each show `1` — that single hit must be inside the commented block at
`src/components/Experience.tsx:44-47` (confirm with
`grep -n "tool.jpeg\|darkside.jpeg" src/components/Experience.tsx` → lines
45-46, both starting with `//`). If any other file shows a non-zero count, do
NOT delete that file; leave it and mention it in your report.

Then:

```bash
git rm public/images/tool.jpeg public/images/darkside.jpeg public/images/keepit.jpeg public/images/tool2.png \
       public/images/AboutSection/pokerface.svg public/images/AboutSection/pokerface2.svg public/images/AboutSection/DumbFace.svg \
       public/videos/viniltify.mp4 public/videos/cameraShader.mp4
```

Also delete the now-dead commented block at `Experience.tsx:44-47` (the four
lines beginning `// const [schisimTexture, darkSide] = useTexture([` through
`// ]);`) so the removed images are not referenced even in comments.

**Verify**: `git status --short public/ | wc -l` → `9`; `grep -rn "tool.jpeg\|darkside.jpeg" src/` → no output.

### Step 6: Typecheck, lint, build

**Verify**: `npx tsc --noEmit` → exit 0. `npm run lint` → exit 0. `npm run build` → exit 0.

## Test plan

No test suite exists in this repo and none is introduced here. Verification is
the typecheck/lint/build gates plus the grep assertions above. Manual smoke
(optional, if a browser is available): `npm run dev`, open `/`, confirm the
scene renders, the mouse cannot orbit the camera, and the browser console is
silent while hovering the diploma and clicking it.

## Done criteria

- [ ] `npx tsc --noEmit` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm run build` exits 0
- [ ] `grep -rn "console.log" src/ --include=*.tsx` returns no matches
- [ ] `grep -c "OrbitControls" src/components/Experience.tsx` prints `2`
- [ ] `grep -n "useFrame" src/components/Lights.tsx` returns nothing
- [ ] `ls public/videos/viniltify.mp4 public/videos/cameraShader.mp4 public/images/tool.jpeg` all report "No such file"
- [ ] `git status --short` shows only in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `npm ci` fails (network/registry problem) — report the error; nothing else in this plan can be verified without it.
- Any excerpt in "Current state" does not match the live file at the stated line (drift).
- Step 5's grep shows a reference to a "dead" file from anywhere other than the commented block in `Experience.tsx`.
- `npx tsc --noEmit` or `npm run lint` fails with an error that did not exist at Step 0 and is not obviously caused by your edit.

## Maintenance notes

- If someone wants to orbit the camera in production later, that is a product decision; re-enable via the gate, not by deleting it.
- `public/videos/holograme.mp4` and `blog.mp4` are intentionally kept; plan 007 uses them.
- Plan 002 (leva removal) edits `Lights.tsx`, `Experience.tsx`, `DiplomaInstances.tsx` after this plan; it expects this plan's edits to be in place.
