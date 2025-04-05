import React, { ReactNode } from "react";
import { Html } from "@react-three/drei";
import { HtmlProps } from "next/dist/shared/lib/html-context.shared-runtime";

interface AnnotationProps extends Omit<HtmlProps, "children"> {
  children: ReactNode;
  position?: [number, number, number]; // Add position prop explicitly
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
