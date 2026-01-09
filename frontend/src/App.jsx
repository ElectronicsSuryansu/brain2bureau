import React, { useState, useEffect } from "react";
import Homepage from "./components/Homepage";
import "./App.css";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      const mode = JSON.parse(savedMode);
      setIsDarkMode(mode);
      if (mode) {
        document.documentElement.classList.add("dark-mode");
      }
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="app-wrapper">
      <Homepage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
    </div>
  );
}
