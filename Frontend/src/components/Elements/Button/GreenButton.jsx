import React from "react";
import { FolderDown } from "lucide-react";

function GreenButton(props) {
  const { children, variant = "", onClick = () => {}, type = "Button" } = props;
  return (
    <button
      type={type}
      className={`${variant} bg-green-600 hover:bg-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2`}
      onClick={() => onClick()}
    >
      <FolderDown size={20} />
      <span>{children}</span>
    </button>
  );
}

export default GreenButton;
