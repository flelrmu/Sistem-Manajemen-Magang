import React from "react";

function WhiteButton(props) {
  const {
    children,
    variant = "",
    onClick = () => {},
    type = "Button",
  } = props;
  return (
    <button
      type={type}
      className={`flex px-4 ${variant} py-2 border duration-500 justify-center border-gray-300 rounded-md text-gray-700 hover:bg-gray-100`}
      onClick={() => onClick()}
    >
      {children}
    </button>
  );
}

export default WhiteButton;
