import Scene from "@/components/Scene";
import Aside from "@/components/UI/Aside";
import Section from "@/components/UI/Section";

export default function Home() {
  return (
    <main className="relative h-full w-full">
      <Scene />
      <Aside />
      <Section>
        <div className="flex items-center h-full ">
          <div id="leftSide" className="| flex flex-col items-center flex-auto">
            <img
              className="relative bottom-20"
              src="/images/SmilingFace.svg"
              alt=""
            />
            <img className="relative left-25" src="/images/Heart.svg" alt="" />
            <img
              className="relative right-5 top-10"
              src="/images/pokerface.svg"
              alt=""
            />
          </div>
          <div className="flex-none w-2/4 mb-20">
            <p className="text-black font-inter font-semibold text-center text-5xl">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique
              alias eum debitis. Fugit voluptate veritatis est illo ratione
              eaque voluptas culpa qui autem voluptates, fugiat dolores harum
              perferendis voluptatibus laudantium. perferendis voluptatibus
              laudantium.um. perferendis voluptatibus laudantium.
            </p>
          </div>
          <div id="rightSide" className="flex flex-col items-center flex-auto">
            <img
              className="relative bottom-25 right-20"
              src="/images/DumbFace.svg"
              alt=""
            />
            <img
              className="relative left-25"
              src="/images/pokerface2.svg"
              alt=""
            />
            <img
              className="relative right-40 top-20"
              src="/images/Flower.svg"
              alt=""
            />
          </div>
        </div>
      </Section>
    </main>
  );
}
