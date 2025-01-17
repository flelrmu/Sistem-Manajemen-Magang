import React from "react";

function SearchButton(props) {
  const { children, variant = "", onClick = () => {}, type = "Button" } = props;
  return (
    <button
      type={type}
      className={`${variant} bg-gray-400 hover:bg-gray-600 text-white px-8 py-2 rounded-lg`}
      onClick={() => onClick()}
    >
      {children}
    </button>
  );
}

export default SearchButton;
