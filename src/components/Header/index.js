// src/components/Header/index.js
import React from "react";
import "./styles.css"; // Make sure this CSS file is imported
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import userSvg from "../../assets/user.svg";
import { Dropdown, Menu } from "antd";

function Header() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const menu = (
    <Menu>
      <Menu.Item key="logout" onClick={() => {
          auth.signOut();
          navigate("/");
        }}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="navbar">
      <p className="navbar-heading">EXT₹A</p>
      {user && (
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
      )}
    </div>
  );
}

export default Header;