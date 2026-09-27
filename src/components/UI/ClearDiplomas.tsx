"use client";

import React from "react";
import { useClearDiplomasStore } from "@/utils/Utils";

export default function ClearDiplomas() {
  const isClearDiplomas = useClearDiplomasStore((s) => s.isClearDiplomas);
  const setDisolveDiplomas = useClearDiplomasStore((s) => s.setDisolveDiplomas);

  return (
    <>
      {isClearDiplomas && (
        <div
          className={`absolute  z-10 bottom-4 right-5  text-xl text-black font-inter  font-semibold text-center `}
        >
          <span
            className="hover:underline hover:cursor-pointer"
            onClick={() => {
              setDisolveDiplomas(true);
            }}
          >
            Clear Diplomas
          </span>
        </div>
      )}
    </>
  );
}
