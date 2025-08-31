import React, { useState, useEffect } from "react";
import "./styles.css";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import userSvg from "../../assets/user.svg";
import { Dropdown, Menu } from "antd";
import { FiMoon, FiSun } from "react-icons/fi"; // 🌙☀️ icons

function Header() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  // 🌙 Dark mode state, synced with localStorage
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const menu = (
    <Menu>
      <Menu.Item
        key="logout"
        onClick={() => {
          auth.signOut();
          navigate("/");
        }}
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="navbar">
      <p className="navbar-heading">EXT₹A</p>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          className="btn-secondary"
          style={{
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? (
            <>
              <FiSun size={16} /> Light
            </>
          ) : (
            <>
              <FiMoon size={16} /> Dark
            </>
          )}
        </button>

        {/* User Avatar / Login */}
        {user ? (
          <Dropdown overlay={menu} placement="bottomRight">
            <div className="navbar-avatar">
              <img
                src={user.photoURL ? user.photoURL : userSvg}
                width={36}
                style={{ borderRadius: "50%" }}
                alt="user avatar"
              />
            </div>
          </Dropdown>
        ) : (
          <button className="btn-primary" onClick={() => navigate("/signup")}>
            Login
          </button>
        )}
      </div>
    </div>
  );
}

export default Header;
