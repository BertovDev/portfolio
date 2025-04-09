import React, { useCallback, useEffect, useRef } from "react";

type Props = {
  isHovering: boolean;
  textContent: string;
};

export default function CursorTip({ isHovering, textContent }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });

  const updateMousePosition = useCallback((ev: MouseEvent) => {
    if (!ref.current) return;

    requestAnimationFrame(() => {
      if (ref.current) {
        positionRef.current = { x: ev.clientX, y: ev.clientY };
        ref.current.style.transform = `translate(${ev.clientX}px, ${ev.clientY}px)`;
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", updateMousePosition, {
      passive: true,
    });
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, [isHovering, updateMousePosition]);

  return (
    <div
      ref={ref}
      className="text-sm  lg:text-2xl pointer-events-none text-black font-medium fixed top-0 left-0 transform -translate-x-1/2 -translate-y-3/3 transition-opacity duration-1000"
      style={{ opacity: isHovering ? 1 : 0 }}
    >
      {textContent}
    </div>
  );
}
