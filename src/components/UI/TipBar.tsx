"use client";
import React, { useEffect, useRef, useState } from "react";

import { useCameraStore } from "@/utils/Utils";

type Props = {
  initialText: string;
  hasInteration: boolean;
};

export default function TipBar({ initialText, hasInteration }: Props) {
  const { cameraZoomed } = useCameraStore();

  const [tipText, setTipText] = useState<string>(initialText);

  useEffect(() => {
    if (!hasInteration) return;
    setTipText(cameraZoomed ? "Click outside to zoom out" : initialText);
  }, [cameraZoomed]);

  return (
    <div className="absolute z-10 bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black font-inter font-semibold text-start ">
      <span className="text-xl relative">{tipText}</span>
    </div>
  );
}
