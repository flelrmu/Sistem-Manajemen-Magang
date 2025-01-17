import React from "react";

function Button(props) {
  const {
    children,
    variant = "",
    onClick = () => {},
    type = "Button",
  } = props;
  return (
    <button
      type={type}
      className={`flex px-4 ${variant} py-2 text-white justify-center rounded-md duration-500`}
      onClick={() => onClick()}
    >
      {children}
    </button>
  );
}

export default Button;
