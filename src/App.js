import React, { useState, useEffect } from "react";
import { ConfigProvider, theme } from "antd";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Signup from "./components/Signup";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#6366f1", // Premium indigo
          borderRadius: 8,
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
  );
}

export default App;
