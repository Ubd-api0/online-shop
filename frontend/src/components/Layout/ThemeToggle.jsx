import React from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = ({ size = 20, className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className={`cursor-pointer text-content hover:text-brand transition ${className}`}
    >
      {theme === "dark" ? <FiSun size={size} /> : <FiMoon size={size} />}
    </button>
  );
};

export default ThemeToggle;
