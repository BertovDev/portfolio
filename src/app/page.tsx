import Scene from "@/components/Scene";
import Aside from "@/components/UI/Aside";
import Content from "@/components/UI/Content";

export default function Home() {
  return (
    <main className="relative h-full w-full">
      <Scene />
      <Aside />
      <Content />
    </main>
  );
}
