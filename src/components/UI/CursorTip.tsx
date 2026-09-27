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
  const rafId = useRef<number | null>(null);

  const updateMousePosition = useCallback((ev: MouseEvent) => {
    positionRef.current = { x: ev.clientX, y: ev.clientY };
    if (rafId.current !== null) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      if (ref.current) {
        const { x, y } = positionRef.current;
        ref.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", updateMousePosition, {
      passive: true,
    });
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [updateMousePosition]);

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
            // preload="none" on mount avoids fetching before hover; switch
            // to auto here or load() suspends and canplay never fires.
            video.preload = "auto";
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

    return () => {
      if (hoverTimeout.current !== null) {
        window.clearTimeout(hoverTimeout.current);
        hoverTimeout.current = null;
      }
    };
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
          // autoPlay
          loop
          playsInline
          preload="none"
          muted
          ref={videoRef}
          className="pointer-events-none rounded-md drop-shadow-2xl opacity-0 w-[200px] h-[200px] min-[900px]:w-[500px] min-[900px]:h-[500px]"
        >
          <source src={imageContent} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
