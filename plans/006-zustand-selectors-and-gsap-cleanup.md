# Plan 006: Subscribe to zustand stores with selectors and clean up GSAP timelines

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 21580f8..HEAD -- src/components/Experience.tsx src/components/Portfolio.tsx src/components/AboutModel.tsx src/components/Diploma/Diploma.tsx src/components/Diploma/DiplomaInstances.tsx src/components/UI/Content.tsx src/components/UI/Section.tsx src/components/UI/TipBar.tsx src/components/UI/Aside.tsx src/components/UI/ClearDiplomas.tsx src/components/UI/Contact.tsx`
> Plans 001–005 touch several of these files. That is expected. What must
> still match is the shape of each `useXStore()` call quoted below.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (but land after 001–005 to avoid merge noise)
- **Category**: perf
- **Planned at**: commit `21580f8`, 2026-09-16

## Why this matters

Every component reads zustand state as `const { a, b } = useStore();` — no
selector. In zustand v5 that subscribes to the **whole store object**, so any
field change re-renders every subscriber. `Experience` is the root of the R3F
tree: when hovering the box triggers `setCameraZoomed`, then the GSAP tween's
`onStart`/`onComplete` fire `setTransitioning(true/false)`, `Experience`,
`PorfolioModel`, `TipBar` and others each re-render three times, reconciling
lights, physics and models during the exact moment the camera is animating.

Separately, `Contact.tsx` creates a `gsap.timeline()` in the component body on
every render, uses it as a `useEffect` dependency (so the effect re-runs and
appends new tweens each render) and never kills it.

After this plan each component subscribes only to the fields it reads, setters
are pulled individually (they are stable references), and the Contact timeline
is created inside its effect and killed on cleanup.

## Current state

Project: Next.js 15.2, React 19, zustand 5.0.3 (`package.json`). **npm**. No tests.

### Store definitions — `src/utils/Utils.ts` (whole file, 47 lines)

Three stores: `useCameraStore` (`cameraZoomed`, `isTransitioning`,
`setCameraZoomed`, `setTransitioning`), `useSectionStore`
(`isSectionClicked: { isClicked, name }`, `setSectionClicked(name, state)`),
`useClearDiplomasStore` (`isClearDiplomas`, `setClearDiplomas`,
`disolveDiplomas`, `setDisolveDiplomas`). Do not change this file.

### Call sites (verified with `grep -rn "Store()" src`)

| File:line | Current |
|---|---|
| `src/components/Experience.tsx:40` | `const { cameraZoomed, setTransitioning } = useCameraStore();` |
| `src/components/Experience.tsx:41` | `const { isClearDiplomas } = useClearDiplomasStore();` |
| `src/components/Portfolio.tsx:27` | `const { cameraZoomed, setCameraZoomed, isTransitioning } = useCameraStore();` |
| `src/components/Portfolio.tsx:28` | `const { setSectionClicked } = useSectionStore();` |
| `src/components/AboutModel.tsx:16` | `const { setSectionClicked } = useSectionStore();` |
| `src/components/Diploma/Diploma.tsx:24` | `const { setClearDiplomas } = useClearDiplomasStore();` |
| `src/components/Diploma/DiplomaInstances.tsx:304-305` | `const { disolveDiplomas, setClearDiplomas, setDisolveDiplomas } = useClearDiplomasStore();` |
| `src/components/UI/Content.tsx:28` | `const { isSectionClicked } = useSectionStore();` |
| `src/components/UI/Section.tsx:12` | `const { isSectionClicked, setSectionClicked } = useSectionStore();` |
| `src/components/UI/TipBar.tsx:19` | `const { cameraZoomed } = useCameraStore();` |
| `src/components/UI/Aside.tsx:7` | `const { isSectionClicked, setSectionClicked } = useSectionStore();` |
| `src/components/UI/ClearDiplomas.tsx:7` | `const { isClearDiplomas, setDisolveDiplomas  } = useClearDiplomasStore();` |

Line numbers may shift by a few lines after plans 001–005; the statement shapes will not.

### `src/components/UI/Contact.tsx:18-43`

```tsx
export default function Contact() {
  const divSectionRef = useRef<HTMLDivElement>(null);
  const tl = gsap.timeline();

  useEffect(() => {
    tl.to(".contact-p", {
      opacity: 0,
      duration: 0.2,
      delay: 0.9,
      zIndex: 0,
      stagger: 0.2,
      y: -100,
    });

    tl.to("#mainContact", {
      zIndex: 100,
    });

    gsap.to(divSectionRef.current, {
      opacity: 1,
      zIndex: 90, // ending value
      delay: 1.5,
      duration: 0.6, // short duration since it's a discrete change
      ease: "none", // no easing for z-index
    });
  }, [tl]);
```

### Convention to follow

The selector form. One hook call per field:

```tsx
const cameraZoomed = useCameraStore((s) => s.cameraZoomed);
const setTransitioning = useCameraStore((s) => s.setTransitioning);
```

Reference for correct GSAP cleanup already in this repo: `src/components/UI/TipBar.tsx:~55-63` returns `() => { tl.kill(); }` from its effect, and `src/components/UI/workComponents/WorkSection.tsx:12-76` uses `gsap.context()` + `ctx.revert()`.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `npm ci`                 | exit 0 |
| Typecheck | `npx tsc --noEmit`       | exit 0 |
| Lint      | `npm run lint`           | exit 0 |
| Build     | `npm run build`          | exit 0 |

## Scope

**In scope**: the eleven files in the call-site table plus `src/components/UI/Contact.tsx`.

**Out of scope**:
- `src/utils/Utils.ts` — do not restructure the stores or add `useShallow`.
- Any logic change: only the *form* of the subscription changes. Every variable name stays the same so no other line in each file needs editing.
- `Section.tsx`'s `useEffect` dependency arrays reference `isSectionClicked.name` / `.isClicked` — leave them.

## Git workflow

- Two commits: `Use zustand selectors instead of whole-store subscriptions`, `Create and kill the Contact GSAP timeline inside its effect`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Convert every call site to selectors

For each row of the table, replace the destructuring line with one selector
call per field, keeping identical variable names. Complete replacements:

`Experience.tsx`:
```tsx
const cameraZoomed = useCameraStore((s) => s.cameraZoomed);
const setTransitioning = useCameraStore((s) => s.setTransitioning);
const isClearDiplomas = useClearDiplomasStore((s) => s.isClearDiplomas);
```

`Portfolio.tsx`:
```tsx
const cameraZoomed = useCameraStore((s) => s.cameraZoomed);
const setCameraZoomed = useCameraStore((s) => s.setCameraZoomed);
const isTransitioning = useCameraStore((s) => s.isTransitioning);
const setSectionClicked = useSectionStore((s) => s.setSectionClicked);
```

`AboutModel.tsx`:
```tsx
const setSectionClicked = useSectionStore((s) => s.setSectionClicked);
```

`Diploma.tsx`:
```tsx
const setClearDiplomas = useClearDiplomasStore((s) => s.setClearDiplomas);
```

`DiplomaInstances.tsx`:
```tsx
const disolveDiplomas = useClearDiplomasStore((s) => s.disolveDiplomas);
const setClearDiplomas = useClearDiplomasStore((s) => s.setClearDiplomas);
const setDisolveDiplomas = useClearDiplomasStore((s) => s.setDisolveDiplomas);
```

`Content.tsx`:
```tsx
const isSectionClicked = useSectionStore((s) => s.isSectionClicked);
```

`Section.tsx` and `Aside.tsx`:
```tsx
const isSectionClicked = useSectionStore((s) => s.isSectionClicked);
const setSectionClicked = useSectionStore((s) => s.setSectionClicked);
```

`TipBar.tsx`:
```tsx
const cameraZoomed = useCameraStore((s) => s.cameraZoomed);
```

`ClearDiplomas.tsx`:
```tsx
const isClearDiplomas = useClearDiplomasStore((s) => s.isClearDiplomas);
const setDisolveDiplomas = useClearDiplomasStore((s) => s.setDisolveDiplomas);
```

Note: `isSectionClicked` is an object that `setSectionClicked` replaces
wholesale, so selecting it as a unit is correct — subscribers to it *should*
re-render when it changes.

**Verify**: `grep -rn "Store();" src/` → no output. `grep -rn "Store((s) =>" src/ | wc -l` → `19`. `npx tsc --noEmit` → exit 0.

### Step 2: Fix the Contact timeline

In `src/components/UI/Contact.tsx` delete `const tl = gsap.timeline();` from the
component body and rewrite the effect:

```tsx
useEffect(() => {
  const tl = gsap.timeline();

  tl.to(".contact-p", {
    opacity: 0,
    duration: 0.2,
    delay: 0.9,
    zIndex: 0,
    stagger: 0.2,
    y: -100,
  });

  tl.to("#mainContact", {
    zIndex: 100,
  });

  const reveal = gsap.to(divSectionRef.current, {
    opacity: 1,
    zIndex: 90, // ending value
    delay: 1.5,
    duration: 0.6, // short duration since it's a discrete change
    ease: "none", // no easing for z-index
  });

  return () => {
    tl.kill();
    reveal.kill();
  };
}, []);
```

Tween values are unchanged.

**Verify**: `grep -n "gsap.timeline()" src/components/UI/Contact.tsx` → exactly one hit, inside the `useEffect`. `grep -c "\.kill()" src/components/UI/Contact.tsx` → `2`.

### Step 3: Gates

`npx tsc --noEmit` → 0. `npm run lint` → 0 (the `react-hooks/exhaustive-deps` rule may warn about `[]` in Step 2; that is acceptable because the effect intentionally runs once — if it *errors* rather than warns, report). `npm run build` → 0.

Manual smoke if a browser is available: hover the box (camera zooms, tip text
changes), click each desk object (sections open), open Contact from the menu
(intro text fades out, form fades in, letters fall), go back and reopen Contact
(animation plays once, cleanly).

## Test plan

No automated tests. Gates + greps + smoke above.

## Done criteria

- [ ] `grep -rn "Store();" src/` returns nothing
- [ ] 19 selector calls across the 11 files
- [ ] `Utils.ts` unchanged (`git diff --stat -- src/utils/Utils.ts` empty)
- [ ] Contact timeline created inside the effect and killed on cleanup
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` exit 0
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- A call site destructures a field that does not exist in the corresponding store type (the stores changed since planning).
- After Step 1, `npx tsc --noEmit` reports an implicit-`any` on `s` — the store's `create<T>()` generic was removed; report.
- Any component reads a store field inside a `useFrame` or render-phase loop that the selector form would change the behaviour of (none were found at planning time; if you find one, report).

## Maintenance notes

- New store consumers must use the selector form. A one-line lint rule is not available for this; reviewers should grep for `Store()`.
- If a component ever needs several fields and re-render coalescing matters, use `useShallow` from `zustand/react/shallow` — not a bare destructure.
- The `Experience.tsx` camera effect's `setTransitioning` is now a stable selector result and can safely sit in dependency arrays (relevant to plan 004 Step 4).
