// src/App.js
import React, { useState, useEffect } from "react";
import { ConfigProvider, theme } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";  // ✅ NEW
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Signup from "./components/Signup";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  return (
    <StyleProvider hashPriority="high">   {/* ✅ ensures overrides apply */}
      <ConfigProvider
        theme={{
          algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: "#6366f1",
            borderRadius: 8,
            fontFamily: "Montserrat, sans-serif",

            // ✅ Force background + text for AntD components
            colorBgBase: darkMode ? "#000000" : "#ffffff",
            colorBgContainer: darkMode ? "#000000" : "#ffffff",
            colorTextBase: darkMode ? "#f3f4f6" : "#111827",
            colorBorder: darkMode ? "#2d2d2d" : "#e5e7eb",
          },
        }}
      >
        <Router>
          <Routes>
            <Route path="/" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />
              }
            />
          </Routes>
        </Router>
      </ConfigProvider>
    </StyleProvider>
  );
}

export default App;
