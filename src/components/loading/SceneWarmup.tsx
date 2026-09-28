import { useEffect, useLayoutEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { WebGLRenderTarget, type WebGLRenderer } from "three";
import { useLoadingStore } from "@/utils/Utils";

const SCENE_READY_MARK = "loading:scene-ready";

// Upper bound for the async compile. If the driver never reports completion
// (e.g. context loss), rendering resumes and compiles synchronously as before.
const COMPILE_TIMEOUT_MS = 5000;

// Renderers whose scene programs are already warm. Keeps a Suspense re-reveal
// of the same Canvas from pausing the frameloop again; a remounted Canvas
// (new context, e.g. client-side navigation back to "/") warms up again.
const warmedRenderers = new WeakSet<WebGLRenderer>();

/**
 * Compiles the scene's programs off the main thread before the first frame
 * draws them, then flags the scene as ready once a frame has rendered.
 *
 * Must render inside the same Suspense scope as the GLB-backed models (so it
 * commits together with them) and after <SoftShadows> / <PostProcessing>:
 * passive effects run in sibling order, so SoftShadows has already patched the
 * shadow chunk and switched the shadow map type when the compile starts.
 */
export default function SceneWarmup() {
  const gl = useThree((s) => s.gl);
  const get = useThree((s) => s.get);
  const setFrameloop = useThree((s) => s.setFrameloop);
  const setSceneReady = useLoadingStore((s) => s.setSceneReady);
  const targetRef = useRef<WebGLRenderTarget | null>(null);

  // Runs in the commit that adds the models, before any rAF could render them
  // and compile every program synchronously on the main thread.
  useLayoutEffect(() => {
    if (warmedRenderers.has(gl)) return;
    setFrameloop("never");

    // The composer renders the scene into a render target, which selects other
    // program variants (linear output) than the canvas does. Keep a target
    // bound until the compile below is issued: SoftShadows' passive effect
    // (which runs first) recompiles every scene material via gl.compile(), and
    // this way it builds the variants the first frame uses instead of ones
    // that are never drawn. Nothing renders meanwhile (frameloop "never").
    const target = new WebGLRenderTarget(1, 1);
    targetRef.current = target;
    gl.setRenderTarget(target);

    return () => {
      if (gl.getRenderTarget() === target) gl.setRenderTarget(null);
      target.dispose();
      targetRef.current = null;
      // Never leave the loop paused (unmount, StrictMode replay, Suspense hide).
      setFrameloop("always");
    };
  }, [gl, setFrameloop]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    let cancelled = false;
    let frame = 0;
    let timeout = 0;

    const { scene, camera } = get();
    let compiled: Promise<unknown>;
    try {
      // Issues every compile at once (reusing the programs SoftShadows just
      // started); resolves when KHR_parallel_shader_compile reports them done,
      // polling without blocking, or after a short wait without the extension.
      compiled = gl.compileAsync(scene, camera);
    } catch (error) {
      compiled = Promise.reject(error);
    } finally {
      if (gl.getRenderTarget() === target) gl.setRenderTarget(null);
    }

    const timedOut = new Promise<void>((resolve) => {
      timeout = window.setTimeout(resolve, COMPILE_TIMEOUT_MS);
    });

    Promise.race([compiled, timedOut])
      .catch((error: unknown) => {
        console.warn("Shader warmup failed; compiling on first frame.", error);
      })
      .then(() => {
        window.clearTimeout(timeout);
        if (cancelled) return;
        setFrameloop("always");
        // The first frame renders in R3F's rAF callback (registered by the
        // store update above, so it runs before ours); the nested rAF fires
        // once that frame has been produced.
        frame = requestAnimationFrame(() => {
          frame = requestAnimationFrame(() => {
            if (cancelled) return;
            warmedRenderers.add(gl);
            performance.mark(SCENE_READY_MARK);
            setSceneReady(true);
          });
        });
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [gl, get, setFrameloop, setSceneReady]);

  return null;
}
