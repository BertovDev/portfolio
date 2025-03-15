import React from "react";

type SectionProps = {
  children?: React.ReactNode;
};

const Section: React.FC<SectionProps> = ({ children }) => {
  return <div className="absolute h-screen w-screen bg-white">{children}</div>;
};

export default Section;
