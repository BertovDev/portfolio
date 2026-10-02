# Plan 008: UI hygiene — cursor-tip listeners, compositor-only animations, apply the Inter font

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 21580f8..HEAD -- src/components/UI/CursorTip.tsx src/components/UI/Section.tsx src/components/UI/LoadingScreen.tsx src/components/UI/Projects.tsx src/app/globals.css src/app/layout.tsx`
> Plans 001 (console.log removals, `priority`) and 007 (`preload="none"`,
> `demo:` paths) are expected to have touched these files. Confirm the
> excerpts below otherwise match.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW (one MED item: Step 5 changes the typeface site-wide)
- **Depends on**: plans/001-quick-wins-dead-code-and-debug-leftovers.md, plans/007-compress-glb-textures-and-fix-project-videos.md
- **Category**: perf
- **Planned at**: commit `21580f8`, 2026-09-16

## Why this matters

Small, contained main-thread wins in the 2D overlay layer:

- **`CursorTip`** re-attaches its `window` `mousemove` listener every time
  `isHovering` flips (the effect lists it as a dependency for no reason),
  schedules an unbounded `requestAnimationFrame` per mouse event, never clears
  its `setTimeout`, and reads `window.innerWidth` during render (not
  resize-reactive, and it blocks static prerendering).
- **`Section`** animates `filter: blur()` on a viewport-sized layer while the
  3D canvas underneath is mid camera-tween — an expensive full-surface GPU
  filter every frame for 800 ms, at the exact moment frames are scarcest.
- **`LoadingScreen`** animates `width` (a layout property, triggers reflow per
  frame) on two elements during the heaviest moment of the page lifecycle.
- **`Projects`** creates a fresh ref object per render, runs seven separate
  tweens where one staggered tween does the same, and has a stale-closure bug
  (effect reads `hoverProject.demo` but only depends on `.state`, so moving
  directly between rows shows the previous row's video).
- **Inter font** is downloaded via `next/font` and its CSS variable is set on
  `<body>`, but Tailwind v4's `@theme` block never declares a `--font-inter`
  key, so the `font-inter` class used on ~30 elements compiles to nothing.
  The font file is fetched on every page and never used.

## Current state

Project: Next.js 15.2, React 19, Tailwind v4 (`@import "tailwindcss"` +
`@theme`), gsap 3.13. **npm**. No tests.

### `src/components/UI/CursorTip.tsx` (relevant lines; no `"use client"` directive — importers provide the boundary)

```tsx
const hoverTimeout = useRef<number | null>(null);

const updateMousePosition = useCallback((ev: MouseEvent) => {
  if (!ref.current) return;

  requestAnimationFrame(() => {
    if (ref.current) {
      positionRef.current = { x: ev.clientX, y: ev.clientY };
      ref.current.style.transform = `translate(${ev.clientX}px, ${ev.clientY}px)`;
    }
  });
}, []);

useEffect(() => {
  window.addEventListener("mousemove", updateMousePosition, {
    passive: true,
  });
  return () => window.removeEventListener("mousemove", updateMousePosition);
}, [isHovering, updateMousePosition]);
```

```tsx
useEffect(() => {
  hoverTimeout.current = window.setTimeout(() => {
    ...
    loadAndPlayVideo();
  }, 100);
}, [imageContent]);
```

```tsx
<video
  width={window.innerWidth < 900 ? 200 : 500}
  height={window.innerWidth < 900 ? 200 : 500}
  // autoPlay
  loop
  playsInline
  muted
  preload="none"            // added by plan 007
  ref={videoRef}
  className="pointer-events-none rounded-md drop-shadow-2xl opacity-0"
>
```

### `src/components/UI/Section.tsx:18-47` — `animConfig` memo

```tsx
enter: {
  from: { y: -50, opacity: 0, scale: 0.98, filter: "blur(5px)" },
  to:   { y: 0, opacity: 1, scale: 1, filter: "blur(0px)", ease: "expo.out", duration: 0.8, transformOrigin: "50% 50%" },
},
exit: {
  to:   { y: -30, opacity: 0, scale: 0.95, filter: "blur(4px)", ease: "power2.inOut", duration: 0.6, transformOrigin: "50% 50%" },
},
```

(Formatted here on single lines for brevity; the file has them multi-line.) The animated element (`:91`) is `className="z-100 opacity-100 absolute h-screen w-screen bg-white overflow-hidden"`.

### `src/components/UI/LoadingScreen.tsx`

`:104-114` (inside `animateText`):
```tsx
tl.to(
  ".underline-bar",
  {
    width: "100%",
    duration: 1,
    onComplete: () => {
      setIsButtonDisabled(false);
    },
  },
  "-=0.5"
);
```

`:163-172`:
```tsx
useEffect(() => {
  if (!loadingTextRef.current) return;
  const current: number = 500 - (progress * 500) / 100;
  gsap.to(loadingTextRef.current, {
    width: `${current}`,
    duration: 2,
    // yoyo: true,
    // repeat: -1,
    ease: "power2",
  });
```

`:209-212` — the element the second tween targets:
```tsx
<div
  ref={loadingTextRef}
  className="bg-white h-125 w-125 absolute"
></div>
```
It is a white cover sitting over the 500×500 logo image; shrinking its width reveals the logo left-to-right as progress grows.

`:222` — `<div className="underline-bar w-0 relative bottom-3 2xl:bottom-20 h-1 bg-black"></div>`

### `src/components/UI/Projects.tsx`

`:118-122`:
```tsx
function ProjectItem({ ...props }: ProjectProps) {
  const ref: React.RefObject<HTMLLIElement | null> = React.createRef();

  return (
    <li className="flex flex-col lg:flex-row gap-2 item" ref={ref}>
```

`:176-180`:
```tsx
useEffect(() => {
  if (hoverProject.demo !== null) {
    setCurrentDemo(hoverProject.demo);
  }
}, [hoverProject.state]);
```

`:182-205` (after plan 001 removed the `console.log`):
```tsx
useEffect(() => {
  if (listRef.current) {
    const items: HTMLLIElement[] = gsap.utils.toArray(
      listRef.current.children
    );
    items.forEach((item, index) => {
      gsap.set(item, {
        opacity: 0,
        x: index > 2 ? 50 : -50,
        y: -20,
      });

      gsap.to(item, {
        opacity: 1,
        x: 0,
        y: 0,
        stagger: 0.2,
        duration: 0.5,
        delay: index * 0.1,
      });
    });
  }
}, []);
```

### Font wiring

`src/app/layout.tsx:5-8, 22`:
```tsx
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
...
<body className={`${inter.variable} antialiased`}>{children}</body>
```

`src/app/globals.css:1-6`:
```css
@import "tailwindcss";

@theme {
  --color-custom-red: #db0000;
  --color-custom-blue: #006be4;
}
```

`font-inter` is used in e.g. `src/components/UI/AsideInfo.tsx:5`, `About.tsx:156`, `Aside.tsx:10`, `Projects.tsx:~207`. Tailwind v4 generates `font-<name>` utilities only from `--font-<name>` keys in `@theme`. There is none, so the class is a no-op today.

Conventions: Tailwind classes for static styling; `gsap` for animation; existing exemplar of a properly-cleaned-up effect: `src/components/UI/TipBar.tsx` (returns `tl.kill()`).

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `npm ci`                 | exit 0 |
| Typecheck | `npx tsc --noEmit`       | exit 0 |
| Lint      | `npm run lint`           | exit 0 |
| Build     | `npm run build`          | exit 0 |

## Suggested executor toolkit

- Skill `animation-performance` (if available): compositor-only properties.
- Skill `gsap-react` (if available): cleanup patterns.

## Scope

**In scope**:
- `src/components/UI/CursorTip.tsx`
- `src/components/UI/Section.tsx` (only the `animConfig` values)
- `src/components/UI/LoadingScreen.tsx` (only the two `width` tweens and the two target elements' classes)
- `src/components/UI/Projects.tsx` (only the three excerpts above)
- `src/app/globals.css` (only the `@theme` block)
- `src/app/layout.tsx` (only the `variable:` string on line 6)

**Out of scope**:
- Anything else in `layout.tsx` — metadata, body classes, font subsets stay.
- Any other animation in `About.tsx`, `Work*.tsx`, `TipBar.tsx`.
- Renaming or restyling any `font-inter` usage.

## Git workflow

- Commits: `Fix CursorTip listener churn and unbounded rAF`, `Animate compositor-only properties in Section and LoadingScreen`, `Wire Inter into Tailwind theme`, `Tidy Projects list animation and hover effect`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: CursorTip — stable listener, one rAF in flight, cleared timeout, CSS sizing

Apply all of these in `CursorTip.tsx`:

1. Add a ref for the pending animation frame near the other refs:
   ```tsx
   const rafId = useRef<number | null>(null);
   ```
2. Rewrite `updateMousePosition` so only one frame is ever queued:
   ```tsx
   const updateMousePosition = useCallback((ev: MouseEvent) => {
     positionRef.current = { x: ev.clientX, y: ev.clientY };
     if (rafId.current !== null) return;
     rafId.current = requestAnimationFrame(() => {
       rafId.current = null;
       if (ref.current) {
         const { x, y } = positionRef.current;
         ref.current.style.transform = `translate(${x}px, ${y}px)`;
       }
     });
   }, []);
   ```
3. Fix the listener effect's dependency array and cancel any pending frame on cleanup:
   ```tsx
   useEffect(() => {
     window.addEventListener("mousemove", updateMousePosition, { passive: true });
     return () => {
       window.removeEventListener("mousemove", updateMousePosition);
       if (rafId.current !== null) {
         cancelAnimationFrame(rafId.current);
         rafId.current = null;
       }
     };
   }, [updateMousePosition]);
   ```
4. In the `[imageContent]` effect, add a cleanup that clears the timeout:
   ```tsx
   return () => {
     if (hoverTimeout.current !== null) {
       window.clearTimeout(hoverTimeout.current);
       hoverTimeout.current = null;
     }
   };
   ```
   (Place it as the last statement inside the effect callback, after the `hoverTimeout.current = window.setTimeout(...)` assignment.)
5. Replace the two `window.innerWidth` props on `<video>` with Tailwind classes. Remove the `width={...}` and `height={...}` attributes and change the `className` to:
   ```
   className="pointer-events-none rounded-md drop-shadow-2xl opacity-0 w-[200px] h-[200px] lg:w-[500px] lg:h-[500px]"
   ```
   (`lg` = 1024 px in Tailwind; the previous breakpoint was 900 px. Accept the small shift, or use `min-[900px]:w-[500px] min-[900px]:h-[500px]` if exact parity is required.)

**Verify**: `grep -n "window.innerWidth" src/components/UI/CursorTip.tsx` → no output. `grep -c "cancelAnimationFrame\|clearTimeout" src/components/UI/CursorTip.tsx` → `2`. `grep -n "}, \[updateMousePosition\]);" src/components/UI/CursorTip.tsx` → one line. `npx tsc --noEmit` → 0.

### Step 2: Section — drop the blur

In `animConfig` remove the three `filter: ...` entries (`"blur(5px)"`, `"blur(0px)"`, `"blur(4px)"`). Keep `y`, `opacity`, `scale`, easing and durations exactly as they are.

**Verify**: `grep -n "blur" src/components/UI/Section.tsx` → no output.

### Step 3: LoadingScreen — scaleX instead of width

1. Underline bar: change the tween `{ width: "100%", duration: 1, ... }` to `{ scaleX: 1, duration: 1, ... }` and change the element's class from `underline-bar w-0 relative ...` to `underline-bar w-full scale-x-0 origin-left relative ...`.
2. Progress cover: change the tween to
   ```tsx
   gsap.to(loadingTextRef.current, {
     scaleX: 1 - progress / 100,
     duration: 2,
     ease: "power2",
   });
   ```
   delete the `const current: number = ...` line and the two commented `yoyo`/`repeat` lines, and change the element class from `bg-white h-125 w-125 absolute` to `bg-white h-125 w-125 absolute origin-right`.

   `origin-right` keeps the cover anchored on the right so the logo is revealed left-to-right, which matches the previous behaviour of shrinking `width` while the element stays left-aligned only if it was right-anchored — check Step 6 visually; if the reveal direction is wrong, switch to `origin-left`.

**Verify**: `grep -n "width:" src/components/UI/LoadingScreen.tsx` → no output. `grep -c "scaleX" src/components/UI/LoadingScreen.tsx` → `2`.

### Step 4: Projects — drop the dead ref, fix the stale closure, one staggered tween

1. In `ProjectItem`, delete the `const ref ... React.createRef();` line and the `ref={ref}` prop on the `<li>`.
2. Change the hover effect's dependency array from `[hoverProject.state]` to `[hoverProject.state, hoverProject.demo]`.
3. Replace the `items.forEach(...)` block with a single staggered tween:
   ```tsx
   const items: HTMLLIElement[] = gsap.utils.toArray(listRef.current.children);
   const tween = gsap.fromTo(
     items,
     { opacity: 0, x: (i: number) => (i > 2 ? 50 : -50), y: -20 },
     { opacity: 1, x: 0, y: 0, duration: 0.5, stagger: 0.1 }
   );
   return () => {
     tween.kill();
   };
   ```
   (Inside the `if (listRef.current)` guard; the effect's `[]` deps stay.)

**Verify**: `grep -n "createRef" src/components/UI/Projects.tsx` → no output. `grep -c "gsap.fromTo" src/components/UI/Projects.tsx` → `1`. `grep -n "hoverProject.state, hoverProject.demo" src/components/UI/Projects.tsx` → one line. `npx tsc --noEmit` → 0.

### Step 5: Apply the Inter font through Tailwind

Two edits, because Tailwind's `@theme` defines `--font-inter` on `:root` and a
value of `var(--font-inter)` would reference itself (a CSS cycle, which
computes to invalid). Give the `next/font` variable a distinct name and map it.

1. `src/app/layout.tsx:6` — change `variable: "--font-inter",` to `variable: "--font-inter-src",`. Nothing else in the file changes (`inter.variable` on `<body>` keeps working).

2. `src/app/globals.css` — change the `@theme` block to:

```css
@theme {
  --color-custom-red: #db0000;
  --color-custom-blue: #006be4;
  --font-inter: var(--font-inter-src), ui-sans-serif, system-ui, sans-serif;
}
```

Tailwind v4 now emits `.font-inter { font-family: var(--font-inter), ... }`, which resolves through `--font-inter-src` to the self-hosted Inter that `next/font` puts on `<body>`.

**Verify**: `grep -n "font-inter-src" src/app/layout.tsx src/app/globals.css` → one hit in each file. `npm run build` → 0. Then `grep -rho "font-inter" .next/static/css/*.css | head -1` → `font-inter` (the utility now exists in the emitted CSS).

### Step 6: Gates and visual check

`npx tsc --noEmit` → 0. `npm run lint` → 0. `npm run build` → 0.

Browser (`npm run dev`) if available:
- `/about` and `/projects`: text is visibly Inter (geometric sans, distinctive lowercase `a`/`t`), not the system default. Layout of the About page still fits; nothing overflows.
- `/projects`: rows animate in with a stagger; hovering row A then row B directly shows B's video, not A's; moving the mouse quickly leaves the tip glued to the cursor with no lag build-up.
- `/`, click "About me": the panel slides/fades in with no blur; back button works.
- Production build (`npm run build && npm run start`): loading screen bar and logo reveal animate smoothly; "Start" appears at 100 %.

## Test plan

No automated tests. Gates + greps + the visual checklist.

## Done criteria

- [ ] `CursorTip.tsx`: no `window.innerWidth`, listener effect depends only on `[updateMousePosition]`, rAF and timeout are cancelled in cleanups
- [ ] `Section.tsx`: no `blur`
- [ ] `LoadingScreen.tsx`: no `width:` tweens, two `scaleX` tweens
- [ ] `Projects.tsx`: no `createRef`, one `gsap.fromTo` with `stagger`, hover effect depends on `.demo`
- [ ] `globals.css` `@theme` has `--font-inter`; emitted CSS contains `.font-inter`
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` exit 0
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- Any excerpt does not match the live file beyond the changes plans 001/007 describe.
- After Step 5 the whole site's text changes to a *serif* or monospace face — the variable resolution is wrong; revert the `@theme` line and report.
- After Step 3 the loading-screen reveal runs in the wrong direction even after trying both `origin-left` and `origin-right` — report with a screenshot description.
- Lint fails on `react-hooks/exhaustive-deps` as an **error** (not a warning) for the Projects stagger effect — report rather than adding deps that would re-run the entrance animation.

## Maintenance notes

- Fixing `font-inter` changes line wrapping everywhere it is used; the About and Work layouts are tightly positioned. A reviewer should look at `/about` and `/work` at 1280 px and 1920 px.
- Any new global `mousemove`/`scroll` listener in this repo should follow the CursorTip pattern: stable callback, single rAF in flight, cleanup.
- If a blur is wanted on section entry later, apply it to a small child element rather than the full-screen container, or use a short-lived `backdrop-filter` on a fixed-size overlay.
