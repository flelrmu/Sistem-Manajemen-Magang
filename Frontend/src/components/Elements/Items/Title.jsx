import React from "react";
import { ReactTyped } from "react-typed";

function Title() {
  return (
    <ReactTyped
      className="hover:animate-pulse text-5xl font-bold text-red-500 mb-8"
      strings={[
        "SISTEM ABSENSI MAGANG",
        "SEMEN PADANG",
      ]}
      typeSpeed={100}
      backSpeed={100}
      loop
    />
  );
}

export default Title;
