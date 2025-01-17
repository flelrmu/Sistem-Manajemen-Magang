import React from "react";

function BlueButton(props) {
  const { children, variant = "", onClick = () => {}, type = "Button" } = props;
  return (
    <button
      type={type}
      className={`${variant} bg-blue-500 text-white hover:bg-blue-800 px-4 py-2 rounded-lg flex items-center space-x-2`}
      onClick={() => onClick()}
    >
      <span>+</span>
      <span>{children}</span>
    </button>
  );
}

export default BlueButton;
