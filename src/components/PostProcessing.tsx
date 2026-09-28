import React, { memo } from "react";
import {
  Bloom,
  EffectComposer,
  TiltShift2,
  Vignette,
} from "@react-three/postprocessing";

function PostProcessing() {
  return (
    <EffectComposer stencilBuffer={false}>
      <Bloom
        intensity={0.1}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
      />
      <Vignette darkness={0.7} offset={0.1} />
      <TiltShift2 blur={0.3} />
    </EffectComposer>
  );
}

export default memo(PostProcessing);
