import Scene from "@/components/Scene";
import Aside from "@/components/UI/Aside";
import AsideInfo from "@/components/UI/AsideInfo";
import Content from "@/components/UI/Content";
import TipBar from "@/components/UI/TipBar";

export default function Home() {
  return (
    <main className="absolute h-full w-full">
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
    </main>
  );
}
