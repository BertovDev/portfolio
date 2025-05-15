import gsap from "gsap";
import React, { useCallback, useEffect, useRef } from "react";

type Props = {
  isHovering: boolean;
  textContent: string;

  imageContent?: string | null;
};

export default function CursorTip({
  isHovering,
  textContent,
  imageContent,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const currentLoadId = useRef(0);
  const hoverTimeout = useRef<number | null>(null);

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

  const fadeTween = useRef<gsap.core.Tween | null>(null);

  const fadeOut = () => {
    fadeTween.current?.kill(); // cancel any current animation
    fadeTween.current = gsap.to(videoRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
    });
    return fadeTween.current;
  };

  const fadeIn = () => {
    fadeTween.current?.kill();
    fadeTween.current = gsap.to(videoRef.current, {
      opacity: 1,
      duration: 0.3,
      ease: "power2.in",
    });
    return fadeTween.current;
  };

  useEffect(() => {
    hoverTimeout.current = window.setTimeout(() => {
      const video = videoRef.current;
      if (!video) return;

      const currentId = ++currentLoadId.current;

      const loadAndPlayVideo = async () => {
        try {
          await fadeOut().then(async () => {
            video.pause();
            video.src = imageContent || "";
            video.load();

            await new Promise<void>((resolve) => {
              const onCanPlay = () => {
                video.removeEventListener("canplay", onCanPlay);
                resolve();
              };
              video.addEventListener("canplay", onCanPlay);
            });

            if (currentId === currentLoadId.current) {
              console.log("Playing video");
              await video.play();
              fadeIn();
            }
          });
        } catch (error) {
          console.error("Error pausing video:", error);
        }
      };
      loadAndPlayVideo();
    }, 100);
  }, [imageContent]);

  return (
    <div
      ref={ref}
      className="text-sm  lg:text-2xl pointer-events-none text-black font-medium fixed top-0 left-0 transform -translate-x-1/2 -translate-y-3/3 transition-opacity duration-1000"
      style={{ opacity: isHovering ? 1 : 0 }}
    >
      {textContent}
      {imageContent && (
        <video
          width={window.innerWidth < 900 ? 200 : 500}
          height={window.innerWidth < 900 ? 200 : 500}
          // autoPlay
          loop
          playsInline
          muted
          ref={videoRef}
          className="pointer-events-none rounded-md drop-shadow-2xl opacity-0"
        >
          <source src={imageContent} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
