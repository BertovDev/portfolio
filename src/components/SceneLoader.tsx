"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("@/components/Scene"), {
  ssr: false,
  loading: () => null,
});

export default function SceneLoader() {
  return <Scene />;
}
