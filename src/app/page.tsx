import Scene from "@/components/Scene";
import Aside from "@/components/UI/Aside";
import AsideInfo from "@/components/UI/AsideInfo";
import Content from "@/components/UI/Content";
import TipBar from "@/components/UI/TipBar";

import LoadingScreen from "@/components/UI/LoadingScreen";

export default function Home() {
  return (
    <main className="absolute min-w-full ">
      <AsideInfo />
      <Scene />
      <TipBar
        hasAnimation={false}
        hasInteration={true}
        initialText="Hover on box to zoom"
        styleProps=" text-black"
      />
      <Aside />
      <Content />
      <LoadingScreen />
    </main>
  );
}
