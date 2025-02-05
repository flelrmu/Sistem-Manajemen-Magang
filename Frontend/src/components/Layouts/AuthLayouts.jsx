import React from "react";
import Logo from "../Elements/Logo/Logo";
import FormLogin from "../Fragment/FormLogin";
import Background from "../Elements/Items/bg";
import Title from "../Elements/Items/Title";

function AuthLayouts() {
  return (
    <div className="h-screen bg-white relative overflow-hidden">
      <Logo />
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        <Title />
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h2 className="text-2xl text-red-500 font-bold  text-center mb-8">
            Selamat datang
          </h2>
          <FormLogin />
        </div>
      </div>
      <Background />
    </div>
  );
}

export default AuthLayouts;
