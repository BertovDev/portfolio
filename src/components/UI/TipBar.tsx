"use client";
import React, { useEffect, useRef, useState } from "react";

import { useCameraStore } from "@/Utils";

type Props = {};

export default function TipBar({}: Props) {
  const { cameraZoomed } = useCameraStore();

  const [tipText, setTipText] = useState<string>("Hover on box to zoom");

  useEffect(() => {
    setTipText(
      cameraZoomed ? "Click outside to zoom out" : "Hover on box to zoom"
    );
  }, [cameraZoomed]);

  return (
    <div className="absolute z-10 border rounded-2xl bottom-0 py-1 px-2  left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black font-inter font-semibold text-start ">
      <span className="text-xl relative">{tipText}</span>
    </div>
  );
}
