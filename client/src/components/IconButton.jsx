// IconButton.jsx
import React from "react";

const IconButton = ({
  icon,
  iconColor,
  buttonColor = "bg-blue-600",
  onClick,
  label = "",
}) => {
  return (
    <div className="relative group inline-block">
      <button
        onClick={onClick}
        className={`p-3 rounded-lg ${buttonColor} hover:opacity-90 transition`}
      >
        <span className={`${iconColor}`}>
          <img src={icon} className="w-6 h-6" />
        </span>
      </button>

      {label && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-sm px-2 py-1 rounded shadow z-10 whitespace-nowrap">
          {label}
        </div>
      )}
    </div>
  );
};

export default IconButton;
