import React, { ComponentProps, ReactNode } from "react";
import { Html } from "@react-three/drei";

interface AnnotationProps extends ComponentProps<typeof Html> {
  children: ReactNode;
}

export default function Annotation({ children, ...props }: AnnotationProps) {
  return (
    <Html {...props} transform occlude="raycast" castShadow={false}>
      <div className="font-mono text-shadow-lg font-bold text-white  text-xs">
        {children}
      </div>
    </Html>
  );
}
