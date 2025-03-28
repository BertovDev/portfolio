import React from "react";
import Image from "next/image";

type ImageInfoState = {
  textContent: string;
  isHovering: boolean;
};

type Props = {
  stackArray: string[];
  setImageInfoState: React.Dispatch<React.SetStateAction<ImageInfoState>>;
};

export default function StackComponent({
  stackArray,
  setImageInfoState,
}: Props) {
  return (
    <div className="flex flex-col h-full justify-between mb-2">
      {stackArray.map((tech, index) => (
        <Image
          key={index}
          width={100}
          height={100}
          src={`/images/work/${tech}.svg`}
          alt={`${tech} logo`}
          className="tech-stack-img"
          onPointerEnter={() => {
            setImageInfoState({
              textContent: tech === "C" ? "C#" : tech,
              isHovering: true,
            });
          }}
          onPointerLeave={() => {
            setImageInfoState({
              textContent: tech === "C" ? "C#" : tech,
              isHovering: false,
            });
          }}
        />
      ))}
    </div>
  );
}
