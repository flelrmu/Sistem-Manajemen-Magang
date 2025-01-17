import React from "react";

function Input(props) {
    const { type, placeholder, name } = props;
  return (
    <input
      type={type}
      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
      placeholder={placeholder}
      name={name}
      id={name}
    />
  );
}

export default Input;
