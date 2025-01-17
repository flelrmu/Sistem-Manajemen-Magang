import React from "react";

function Logo() {
  return (
    <div className="justify-start gap-[14px] items-center flex px-5 py-5">
      <img
        className="w-[75px] h-full relative"
        src="images/sig.svg"
      />
      <img
        className="w-[44px] h-full relative"
        src="images/semenPadangLogo.svg"
      />
    </div>
  );
}

export default Logo;
