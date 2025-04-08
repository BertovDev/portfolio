import React, { ComponentProps, ReactNode } from "react";
import { Html } from "@react-three/drei";

interface AnnotationProps extends ComponentProps<typeof Html> {
  children: ReactNode;
}

export default function Annotation({ children, ...props }: AnnotationProps) {
  return (
    <Html {...props} transform occlude="raycast">
      <div className="font-inter font-bold text-custom-red  text-xs">
        {children}
      </div>
    </Html>
  );
}
