# Plan 007: Shrink GLB payloads (texture resize + WebP + prune) and make project demo videos small and playable

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 21580f8..HEAD -- public/ src/components/UI/Projects.tsx src/components/UI/CursorTip.tsx src/types/model.d.ts`
> Plan 001 deleted some dead files under `public/`; that is expected. Any
> change to the `.glb` files or to `Projects.tsx`'s `demo:` strings since
> planning is a STOP condition.

## Status

- **Priority**: P1 (largest byte savings in the whole audit)
- **Effort**: M
- **Risk**: LOW/MED (visual quality of textures; needs eyeball check)
- **Depends on**: plans/001-quick-wins-dead-code-and-debug-leftovers.md
- **Category**: perf
- **Planned at**: commit `21580f8`, 2026-09-16

## Why this matters

**GLBs.** The user stares at the loading screen until ~6.8 MB of `.glb` files
download. Their geometry is tiny (portfolio 3.5 K triangles, diploma 76,
about-model 4.8 K); about 95 % of the bytes are uncompressed 1024×1024 PNGs
embedded in the files. `portfolio.glb` also carries seven meshes and their
materials/textures that the code never renders. Resizing textures to 512²,
converting to WebP (natively supported by three's `GLTFLoader` via
`EXT_texture_webp`, no loader changes needed) and pruning unused nodes should
cut the total by 4–8×.

**Videos.** The projects list points at seven `/videos/*.mkv` files totalling
~100 MB. Four of them are actually MP4 containers with the wrong extension
(`vinil2`, `camshader`, `holograme`, `blog`); three are real Matroska
(`connect`, `evolution`, `isavet`), which Safari and Firefox cannot play. All
of them are far larger than a hover preview needs — the biggest is 32 MB and
downloads in full on first hover. Two smaller `.mp4` twins already exist but
are unreferenced. This plan transcodes everything to ~1280-px H.264 MP4 with
`faststart`, renames them, deletes the originals, and stops the `<video>` from
preloading.

## Current state

Project: Next.js 15.2, React 19. **npm**. No tests. Assets are plain files in
`public/` committed to git (no LFS — `.gitattributes` has the rule commented out).

### GLB inventory (`public/`)

| File | Size | Loaded from | Notes |
|---|---|---|---|
| `portfolio.glb` | 4.6 MB | `src/components/Portfolio.tsx:48-50` (`useGLTF("/portfolio.glb")`), preload `:342` | 16 primitives, 10 embedded images (four 1024² PNGs 1382/912/672/316 KB + five JPEGs). Only these nodes are rendered: `Object_5`..`Object_12` and `Box_1-b_Boxes_0` (`Portfolio.tsx:107-201`). Node/material names in `src/types/model.d.ts:6-40` include unused `Object_159, Object_160, Object_161, Object_157, Object_46, Object_109, pPlane3_lambert4_0` and materials `label_front, label_back, label_side, vinyl, cover.117, cover.138`. |
| `diploma.glb` | 1.0 MB | `Diploma.tsx:23`, `DiplomaInstances.tsx:301` | 76 triangles; three 1024² PNGs |
| `bautiModel.glb` | 994 KB | `AboutModel.tsx:18-20` | one 842 KB 1024² PNG |
| `mail.glb` | 168 KB | `Mail.tsx:20-22` | small; still worth running through the same pipeline |

No loader uses Draco/meshopt/KTX2 — and none is needed; geometry is negligible.

### Video inventory (`public/videos/`, after plan 001)

| File | Size | Real container (`file`) | Referenced from |
|---|---|---|---|
| `vinil2.mkv` | 32 MB | MP4 | `Projects.tsx:35` |
| `connect.mkv` | 29 MB | Matroska | `Projects.tsx:59` |
| `camshader.mkv` | 20 MB | MP4 | `Projects.tsx:96` |
| `holograme.mkv` | 8.5 MB | MP4 | `Projects.tsx:72` |
| `holograme.mp4` | 8.5 MB | MP4 | — (unreferenced twin) |
| `isavet.mkv` | 5.4 MB | Matroska | `Projects.tsx:108` |
| `evolution.mkv` | 3.2 MB | Matroska | `Projects.tsx:84` |
| `blog.mkv` | 200 KB | MP4 | `Projects.tsx:47` |
| `blog.mp4` | 200 KB | MP4 | — (unreferenced twin) |

`src/components/UI/Projects.tsx:30-110` — `const proejcts: Project[] = [...]` with `demo: "/videos/<name>.mkv"` per entry.

`src/components/UI/CursorTip.tsx:105-118` renders the preview:

```tsx
<video
  width={window.innerWidth < 900 ? 200 : 500}
  height={window.innerWidth < 900 ? 200 : 500}
  // autoPlay
  loop
  playsInline
  muted
  ref={videoRef}
  className="pointer-events-none rounded-md drop-shadow-2xl opacity-0"
>
  <source src={imageContent} type="video/mp4" />
```

and at `:73-74` sets `video.src = imageContent || ""; video.load();` on hover.
Plan 008 also edits `CursorTip.tsx`; this plan touches **only** the `<video>`
element's `preload` attribute there.

### Tooling available on the planning machine

- `ffmpeg` at `/opt/homebrew/bin/ffmpeg`.
- `gltf-transform` is **not** installed globally; use `npx @gltf-transform/cli@latest <cmd>` (downloads on first use, no project dependency added).

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `npm ci`                 | exit 0 |
| Typecheck | `npx tsc --noEmit`       | exit 0 |
| Lint      | `npm run lint`           | exit 0 |
| Build     | `npm run build`          | exit 0 |
| Inspect GLB | `npx @gltf-transform/cli@latest inspect public/portfolio.glb` | prints scenes/meshes/materials/textures tables |
| Check container | `file public/videos/*.mkv public/videos/*.mp4` | prints container type per file |
| Sizes | `du -k public/*.glb public/videos/* \| sort -rn` | sizes in KB |

## Scope

**In scope**:
- `public/portfolio.glb`, `public/diploma.glb`, `public/bautiModel.glb`, `public/mail.glb` (replace in place)
- `public/videos/*` (transcode, rename, delete originals)
- `src/components/UI/Projects.tsx` (only the seven `demo:` strings)
- `src/components/UI/CursorTip.tsx` (only add `preload="none"` to the `<video>`)
- `src/types/model.d.ts` (remove type entries for pruned nodes/materials — optional, Step 3)

**Out of scope**:
- Loader code (`useGLTF` calls) — WebP needs none.
- KTX2/Basis compression — would need a `KTX2Loader` + transcoder wiring; deferred.
- Any other line in `CursorTip.tsx` (plan 008).
- Hosting videos off-repo (CDN/Blob) — reasonable follow-up, out of scope.

## Git workflow

- Two commits: `Compress GLB textures to 512px WebP and prune unused nodes`, `Transcode project demo videos to web MP4 and lazy-load them`.
- Binary diffs are large; that is expected. Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Record baseline sizes

```bash
du -k public/*.glb public/videos/* | sort -rn
```
Copy the output into your report as "before".

### Step 1: Back up originals outside the repo

```bash
mkdir -p /tmp/portfolio-assets-backup && cp public/*.glb public/videos/* /tmp/portfolio-assets-backup/
```

**Verify**: `ls /tmp/portfolio-assets-backup | wc -l` → `13` (4 GLBs + the 9 videos in the table; plan 001 has already removed the two LFS stub files).

### Step 2: Prune and compress `portfolio.glb`

```bash
npx @gltf-transform/cli@latest inspect public/portfolio.glb
```
Confirm the node names in the table above appear. Then:

```bash
npx @gltf-transform/cli@latest prune public/portfolio.glb /tmp/p1.glb
npx @gltf-transform/cli@latest resize --width 512 --height 512 /tmp/p1.glb /tmp/p2.glb
npx @gltf-transform/cli@latest webp --quality 82 /tmp/p2.glb /tmp/p3.glb
npx @gltf-transform/cli@latest dedup /tmp/p3.glb public/portfolio.glb
```

`prune` removes properties that are unreferenced **inside the file**. The
seven meshes the *code* never renders are still referenced by the scene graph,
so they survive `prune`. Remove them explicitly by node name:

```bash
npx @gltf-transform/cli@latest inspect public/portfolio.glb | sed -n '/MESHES/,/MATERIALS/p'
```
Find the mesh names corresponding to `Object_159, Object_160, Object_161, Object_157, Object_46, Object_109, pPlane3_lambert4_0` (gltfjsx names nodes by mesh; the `inspect` "meshes" table lists names and their instance counts). If the CLI exposes a node-removal command in the installed version (`npx @gltf-transform/cli@latest --help | grep -i "remove\|partition"`), use it. If not, **skip the node removal**, keep the resize+webp result, and note in the report that unused-node removal requires a short script with `@gltf-transform/core` (`document.getRoot().listNodes().filter(n => names.includes(n.getName())).forEach(n => n.dispose())`) — do not write that script unless the operator asks.

**Verify**: `du -k public/portfolio.glb` → substantially smaller than 4672 KB (expect < 1200 KB). `npx @gltf-transform/cli@latest inspect public/portfolio.glb | grep -i "image/webp"` → at least one line. `npx @gltf-transform/cli@latest validate public/portfolio.glb` → no errors (warnings OK).

### Step 3: Compress the other three GLBs

```bash
for f in diploma bautiModel mail; do
  npx @gltf-transform/cli@latest resize --width 512 --height 512 public/$f.glb /tmp/$f-1.glb
  npx @gltf-transform/cli@latest webp --quality 82 /tmp/$f-1.glb /tmp/$f-2.glb
  npx @gltf-transform/cli@latest prune /tmp/$f-2.glb public/$f.glb
done
```

If Step 2 removed nodes from `portfolio.glb`, also delete the matching
entries from `src/types/model.d.ts` (`Object_159, Object_160, Object_161,
Object_157, Object_46, Object_109, pPlane3_lambert4_0` in `nodes`;
`label_front, label_back, label_side, vinyl, lambert4, cover.117, cover.138`
in `materials`). If nodes were not removed, leave `model.d.ts` alone.

**Verify**: `du -k public/*.glb` → every file smaller than in Step 0. `npx tsc --noEmit` → exit 0.

### Step 4: Transcode videos

Produce one web-ready MP4 per project, max 1280 px wide, no audio, faststart:

```bash
cd public/videos
for pair in "vinil2.mkv:viniltify" "blog.mkv:blog" "connect.mkv:connect" "holograme.mkv:holograme" "evolution.mkv:evolution" "camshader.mkv:camshader" "isavet.mkv:isavet"; do
  src="${pair%%:*}"; out="${pair##*:}"
  ffmpeg -y -i "$src" -an -vf "scale='min(1280,iw)':-2" -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -movflags +faststart "$out.web.mp4"
done
cd ../..
```

Then replace originals:

```bash
cd public/videos
git rm -q vinil2.mkv blog.mkv connect.mkv holograme.mkv evolution.mkv camshader.mkv isavet.mkv holograme.mp4 blog.mp4
for f in *.web.mp4; do mv "$f" "${f%.web.mp4}.mp4"; done
git add *.mp4
cd ../..
```

**Verify**: `ls public/videos` → exactly `blog.mp4 camshader.mp4 connect.mp4 evolution.mp4 holograme.mp4 isavet.mp4 viniltify.mp4`. `file public/videos/*.mp4` → all "ISO Media". `du -k public/videos/* | sort -rn` → largest file well under 5000 KB (if any file is still > 8000 KB, re-run that one with `-crf 31`).

### Step 5: Update the project list

In `src/components/UI/Projects.tsx` change the seven `demo:` strings:

| Line (≈) | From | To |
|---|---|---|
| 35 | `"/videos/vinil2.mkv"` | `"/videos/viniltify.mp4"` |
| 47 | `"/videos/blog.mkv"` | `"/videos/blog.mp4"` |
| 59 | `"/videos/connect.mkv"` | `"/videos/connect.mp4"` |
| 72 | `"/videos/holograme.mkv"` | `"/videos/holograme.mp4"` |
| 84 | `"/videos/evolution.mkv"` | `"/videos/evolution.mp4"` |
| 96 | `"/videos/camshader.mkv"` | `"/videos/camshader.mp4"` |
| 108 | `"/videos/isavet.mkv"` | `"/videos/isavet.mp4"` |

**Verify**: `grep -rn "\.mkv" src/` → no output. `grep -c '/videos/.*\.mp4' src/components/UI/Projects.tsx` → `7`. For each path: `for p in $(grep -o '/videos/[a-z]*\.mp4' src/components/UI/Projects.tsx); do test -f "public$p" && echo "ok $p" || echo "MISSING $p"; done` → seven `ok`.

### Step 6: Stop preloading the preview video

In `src/components/UI/CursorTip.tsx`, add `preload="none"` to the `<video>` element (next to `playsInline`). Nothing else in the file.

**Verify**: `grep -n 'preload="none"' src/components/UI/CursorTip.tsx` → one line.

### Step 7: Gates and visual check

`npx tsc --noEmit` → 0. `npm run lint` → 0. `npm run build` → 0.

Browser (if available), `npm run dev`:
1. `/` — box, shovel, about model, letter and diploma all show their textures; nothing is missing or magenta. Zoom in with dev OrbitControls: textures are acceptably crisp at 512² (they are viewed small).
2. `/projects` — hovering each row plays its preview within ~1 s; test in Safari too if possible.
3. Network tab on `/projects`: no video bytes load until a row is hovered.

Report `du -k` after vs. before.

## Test plan

No automated tests. Verification = the `file`/`du`/`grep`/`validate` gates + the
visual checklist. Record before/after totals for `public/*.glb` and
`public/videos/*`.

## Done criteria

- [ ] All four `.glb` files use WebP textures (`inspect` shows `image/webp`) and each is smaller than before
- [ ] `public/videos/` contains exactly seven `.mp4` files, all ISO Media, none over ~8 MB
- [ ] `grep -rn "\.mkv" src/` returns nothing; all seven `demo` paths exist on disk
- [ ] `<video>` in `CursorTip.tsx` has `preload="none"`
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` exit 0
- [ ] Before/after sizes recorded in the report
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- `npx @gltf-transform/cli@latest` cannot be downloaded or `ffmpeg` is not on PATH (`which ffmpeg`).
- `validate` reports **errors** (not warnings) on an output GLB.
- Any texture in the scene renders black/magenta after Step 3 — restore that file from `/tmp/portfolio-assets-backup/` and report which one.
- A `demo:` string in `Projects.tsx` has changed since planning.
- Transcoding a file fails (corrupt source) — keep its original, report.

## Maintenance notes

- Future GLB exports should go through the same `resize → webp → prune` pipeline before commit. Consider adding a `scripts/optimize-assets.sh` (not in this plan's scope).
- WebP textures require Safari ≥ 14 / iOS 14. If older-Safari support ever matters, keep a JPEG fallback build.
- Videos are still served from `public/` and count against the deploy artefact; moving them to Vercel Blob or another CDN is the natural next step once they are small.
- Plan 008 further edits `CursorTip.tsx`; the `preload` attribute added here should be kept.
