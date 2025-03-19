import useMousePosition from "@/utils/mousePosition";
import gsap from "gsap";
import React, { useEffect, useRef, useState } from "react";

type MousePosition = {
  x: number;
  y: number;
};

type Props = {
  isHovering: boolean;
  textContent: string;
};

export default function CursorTip({ isHovering, textContent }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  //   if (!isHovering) return null;

  return (
    <div
      ref={ref}
      style={{
        left: mousePosition.x,
        top: mousePosition.y,
        opacity: isHovering ? 1 : 0,
        transition: "opacity 1s",
      }}
      className="text-2xl  pointer-events-none text-black  absolute"
    >
      {textContent}
    </div>
  );
}
