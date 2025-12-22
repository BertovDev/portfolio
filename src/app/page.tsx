import Scene from "@/components/Scene";
import Aside from "@/components/UI/Aside";
import AsideInfo from "@/components/UI/AsideInfo";
import ClearDiplomas from "@/components/UI/ClearDiplomas";
import Content from "@/components/UI/Content";
import TipBar from "@/components/UI/TipBar";

// import LoadingScreen from "@/components/UI/LoadingScreen";

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
      {/* {process.env.NODE_ENV === "production" && <LoadingScreen />} */}
      {/* <LoadingScreen /> */}
    </main>
  );
}
