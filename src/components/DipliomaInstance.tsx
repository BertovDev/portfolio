import { Instance } from "@react-three/drei";
import React, { ComponentProps } from "react";


export default function DipliomaInstance(props: ComponentProps<"group">) {
  return (
    <group {...props}>
      <Instance/>
    </group>
  );
}
