# Plan 003: Code-split the 3D scene and the overlay sections out of the initial route JS

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 21580f8..HEAD -- src/app/page.tsx src/components/UI/Content.tsx src/components/Scene.tsx next.config.ts`
> Plan 002 is expected to have rewritten `Scene.tsx`. Any other mismatch with
> the "Current state" excerpts is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/002-remove-leva-and-r3f-perf-from-production.md
- **Category**: perf
- **Planned at**: commit `21580f8`, 2026-09-16

## Why this matters

The home route statically imports the whole 3D stack (`three`,
`@react-three/fiber`, `@react-three/drei`, `@react-three/rapier` with its WASM
physics engine, `@react-three/postprocessing`, `gsap`) **and** all four
overlay sections (About, Work, Projects, Contact) — and Contact contains a
second `<Canvas>` with 30 rigid bodies. All of that JS is downloaded, parsed
and hydrated before the user can interact, even though the sections render
`null` until a menu item is clicked and the Canvas cannot render on the server
anyway (the SSR pass produces markup the client discards).

After this plan the `/` route's first-load JS contains the loading screen and
the small UI chrome; the scene chunk loads immediately after hydration via a
client-side dynamic import; each section chunk loads on first click.

## Current state

Project: Next.js 15.2 App Router, React 19, TypeScript strict. Package manager
**npm**. No tests.

### `src/app/page.tsx` (whole file) — a **server component** (no `"use client"`)

```tsx
import Scene from "@/components/Scene";
import Aside from "@/components/UI/Aside";
import AsideInfo from "@/components/UI/AsideInfo";
import ClearDiplomas from "@/components/UI/ClearDiplomas";
import Content from "@/components/UI/Content";
import TipBar from "@/components/UI/TipBar";

import LoadingScreen from "@/components/UI/LoadingScreen";

export default function Home() {
  return (
    <main className="min-h-screen">
      <AsideInfo />
      <Scene />
      <TipBar
        hasAnimation={false}
        hasInteration={true}
        initialText="What's inside the box? Hover it!"
        styleProps=" text-black"
      />
      <Aside />
      <ClearDiplomas />
      <Content />
      {process.env.NODE_ENV === "production" && <LoadingScreen />}
      {/* <LoadingScreen /> */}
    </main>
  );
}
```

Important Next.js 15 constraint: `next/dynamic` with `{ ssr: false }` is **not
allowed inside a server component**. The dynamic import must live in a client
component. That is why Step 1 creates a wrapper.

### `src/components/Scene.tsx` — `"use client"`, default-exports `Scene`, renders `<Canvas>` (see plan 002 for its post-002 content).

### `src/components/UI/Content.tsx:1-25`

```tsx
"use client";

import React, { memo, useMemo } from "react";
import Section from "./Section";
import { useSectionStore } from "@/utils/Utils";
import About from "./About";
import Work from "./Work";
import Projects from "./Projects";
import Contact from "./Contact";

type SectionComponent = Record<string, React.FC>;

// Memoize section components
const MemoizedAbout = memo(About);
const MemoizedWork = memo(Work);
const MemoizedProjects = memo(Projects);
const MemoizedContact = memo(Contact);

// Memoize the components mapping
const SectionComponents: SectionComponent = {
  About: MemoizedAbout,
  Work: MemoizedWork,
  Projects: MemoizedProjects,
  Contact: MemoizedContact,
};
```

Lines 27-47 read `isSectionClicked` from the store and render
`<Section><SectionToRender /></Section>` or `null`.

`About.tsx`, `Work.tsx`, `Projects.tsx`, `Contact.tsx` are all default exports.
`Contact.tsx:2-8` imports `Canvas`, `Physics`, `RigidBody`, drei helpers.

### `src/components/UI/LoadingScreen.tsx:3,16`

```tsx
import { useProgress } from "@react-three/drei";
...
const { progress } = useProgress();
```

`useProgress` reads `THREE.DefaultLoadingManager`. The GLB downloads are kicked
off by `useGLTF.preload(...)` calls at module scope in `Portfolio.tsx:342`,
`Diploma.tsx:67`, `AboutModel.tsx:58`, `Mail.tsx:55`. After this plan those
modules load slightly later (when the scene chunk arrives), so the progress
bar will sit at 0 for a moment longer before moving. That is acceptable. The
"Start" button appears when `progress === 100`, which still works because the
loading manager is shared.

Known limit: `LoadingScreen` itself imports `@react-three/drei`, so a slice of
drei (and the parts of `three` it touches) stays in the initial bundle. Do not
try to fix that in this plan.

### `next.config.ts` (whole file)

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `npm ci`                 | exit 0 |
| Typecheck | `npx tsc --noEmit`       | exit 0 |
| Lint      | `npm run lint`           | exit 0 |
| Build     | `npm run build`          | exit 0, prints route table with "First Load JS" per route |

Record the `/` route's "First Load JS" from `npm run build` **before** making
changes (Step 0) so you can compare after.

## Suggested executor toolkit

- Skill `next-best-practices` (if available): section on `next/dynamic` and client/server boundaries.
- Skill `vercel-react-best-practices` (if available): bundle-size rules.

## Scope

**In scope**:
- `src/components/SceneLoader.tsx` (create)
- `src/app/page.tsx`
- `src/components/UI/Content.tsx`
- `next.config.ts`

**Out of scope**:
- `src/components/Scene.tsx`, `Experience.tsx` and anything under the Canvas (plans 002/004/005).
- `LoadingScreen.tsx` — its drei import is a known, accepted limit.
- The sub-routes `src/app/about|work|projects|contact/page.tsx` — they import their section directly and are already separate route chunks.
- Do not add `<link rel="preload">` for GLBs in `layout.tsx`. `GLTFLoader` fetches with a specific request mode; a mismatched preload triggers a duplicate download. Deferred (see README).

## Git workflow

- One commit: `Lazy-load the 3D scene and overlay sections`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Baseline

`npm ci` (if needed) then `npm run build`. Copy the printed line for route `/`
(e.g. `┌ ○ /    12.3 kB    1.2 MB`) into your final report as the "before".

### Step 1: Create the client-side scene loader

Create `src/components/SceneLoader.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("@/components/Scene"), {
  ssr: false,
  loading: () => null,
});

export default function SceneLoader() {
  return <Scene />;
}
```

`loading: () => null` is deliberate: in production the `LoadingScreen` covers
the viewport; in development there is nothing to cover, and a blank canvas for
a moment is fine.

**Verify**: `npx tsc --noEmit` → exit 0.

### Step 2: Use it from the page

In `src/app/page.tsx`:
- Replace `import Scene from "@/components/Scene";` with `import SceneLoader from "@/components/SceneLoader";`
- Replace `<Scene />` with `<SceneLoader />`.

Nothing else in the file changes.

**Verify**: `grep -n "Scene" src/app/page.tsx` → exactly two lines, both mentioning `SceneLoader`. `grep -rn 'from "@/components/Scene"' src/` → only `src/components/SceneLoader.tsx`.

### Step 3: Lazy-load the four sections in `Content.tsx`

Replace lines 6-25 (the four static imports, the four `memo(...)` wrappers and
the `SectionComponents` map) with:

```tsx
import dynamic from "next/dynamic";

type SectionComponent = Record<string, React.ComponentType>;

const SectionComponents: SectionComponent = {
  About: dynamic(() => import("./About")),
  Work: dynamic(() => import("./Work")),
  Projects: dynamic(() => import("./Projects")),
  Contact: dynamic(() => import("./Contact"), { ssr: false }),
};
```

- `Contact` gets `ssr: false` because it renders a `<Canvas>`.
- Remove `memo` from the React import if it is now unused (`useMemo` is still used at line 31). Components returned by `dynamic()` are already stable references; the previous `memo()` wrappers added nothing once the module is lazy.
- Keep the rest of the file (`Content` component, `displayName`, export) unchanged.

**Verify**: `grep -n 'import About\|import Work\|import Projects\|import Contact' src/components/UI/Content.tsx` → no output. `npx tsc --noEmit` → exit 0. `npm run lint` → exit 0 (an unused `memo` import would fail lint).

### Step 4: Enable import optimisation for the barrel-heavy packages

Replace `next.config.ts` with:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@react-three/drei", "@react-three/postprocessing"],
  },
};

export default nextConfig;
```

`@react-three/drei` is a large barrel; this makes named imports resolve to
individual modules at build time.

**Verify**: `npm run build` → exit 0. If the build errors mentioning `optimizePackageImports`, remove that block, rebuild, and report the error (do not try other config keys).

### Step 5: Compare bundle sizes

Run `npm run build` and copy the `/` route line. The "First Load JS" for `/`
must be **smaller** than the Step 0 baseline. Report both numbers.

**Verify**: `/` First Load JS after < before.

## Test plan

No automated tests exist. Manual smoke if a browser is available (`npm run dev`):
1. Open `/`. The scene appears (after a brief blank in dev). No hydration warnings in the console.
2. Click "About me" in the top-right menu → About section slides in. Click back → returns. Repeat for the other three items. Contact shows the falling letters canvas and the form.
3. `npm run build && npm run start`, open `/`: the loading screen shows, progress reaches 100, "Start" appears and reveals the scene.
4. Open the Network tab: the section chunks (`About`, `Work`, …) are requested only when clicked.

## Done criteria

- [ ] `src/components/SceneLoader.tsx` exists with `ssr: false`
- [ ] `src/app/page.tsx` does not import `@/components/Scene` directly
- [ ] `src/components/UI/Content.tsx` has no static imports of `./About`, `./Work`, `./Projects`, `./Contact`
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` all exit 0
- [ ] `/` route First Load JS is smaller than the Step 0 baseline (both numbers in the report)
- [ ] `git status --short` shows only in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- `page.tsx` has acquired a `"use client"` directive since planning — the wrapper is then unnecessary and the plan should be reconsidered.
- The build fails with "`ssr: false` is not allowed with `next/dynamic` in Server Components" after Step 2 — that means the import ended up in a server component; check `SceneLoader.tsx` starts with `"use client"` and report if it does.
- After Step 3, the build reports a type error about `SectionComponents[...]` being possibly `undefined` — report; do not add non-null assertions.
- `/` First Load JS did **not** shrink after Step 5.

## Maintenance notes

- Any new component that renders a `<Canvas>` must be loaded with `dynamic(..., { ssr: false })` from a client component, or the SSR pass will throw.
- If the loading screen ever needs to start before the scene chunk is requested, `SceneLoader` is where a `useEffect`-triggered import or `<link rel="modulepreload">` would go.
- The `Contact` route (`/contact`) still statically imports `Contact.tsx`; that is fine because it is its own route chunk.
