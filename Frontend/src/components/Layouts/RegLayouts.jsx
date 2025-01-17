import React from "react";
import Logo from "../Elements/Logo/Logo";
import Background from "../Elements/Items/bg";
import "../../index.css";
import FormRegister from "../Fragment/FormRegister";
import Title from "../Elements/Items/Title";

const RegLayouts = () => {
  return (
    <div className="h-screen bg-white relative overflow-hidden">
      <Logo />
      <div className="relative z-20 flex flex-col items-center justify-center px-4 h-[550px] ">
        <Title />
        <div className="max-w-4xl w-full mx-auto bg-white mb-10 rounded-lg shadow-xl p-8 pb-10 overflow-y-auto scrollbar-hide">
          <h2 className="text-2xl font-bold text-red-500 mb-6">Pendaftaran</h2>
          <FormRegister />
        </div>
      </div>
      <Background />
    </div>
  );
};

export default RegLayouts;
