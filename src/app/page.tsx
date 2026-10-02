import { preload } from "react-dom";
import SceneLoader from "@/components/SceneLoader";
import Aside from "@/components/UI/Aside";
import AsideInfo from "@/components/UI/AsideInfo";
import ClearDiplomas from "@/components/UI/ClearDiplomas";
import Content from "@/components/UI/Content";
import TipBar from "@/components/UI/TipBar";

import LoadingScreen from "@/components/UI/LoadingScreen";

// Loaded by the Scene chunk (useGLTF / useTexture). URLs must match the loader
// URLs exactly. crossOrigin "anonymous" matches three's fetch (cors,
// credentials "same-origin") and its <img crossOrigin="anonymous">, so the
// preloaded responses are reused instead of fetched twice.
const SCENE_MODELS = [
  "/portfolio.glb",
  "/bautiModel.glb",
  "/diploma.glb",
  "/mail.glb",
];
const SCENE_TEXTURE = "/images/tool3.webp";

export default function Home() {
  // Low priority: start downloads at HTML parse time without competing with
  // the logo, font and initial JS.
  for (const href of SCENE_MODELS) {
    preload(href, {
      as: "fetch",
      crossOrigin: "anonymous",
      fetchPriority: "low",
    });
  }
  preload(SCENE_TEXTURE, {
    as: "image",
    crossOrigin: "anonymous",
    fetchPriority: "low",
  });

  return (
    <main className="min-h-screen">
      <AsideInfo />
      <SceneLoader />
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
