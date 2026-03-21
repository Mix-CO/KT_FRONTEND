import { useState } from "react";
import { Home, Trophy, Users, MessageCircle } from "lucide-react";
import logo from "../assets/test_logo.png";

const menuItems = [
  { name: "Inicio", icon: Home, path: "/" },
  { name: "Torneos", icon: Trophy, path: "/tournaments" },
  { name: "Equipos", icon: Users, path: "/teams" },
  { name: "Mensajes", icon: MessageCircle, path: "/messages" },
  { name: "Perfil", icon: Users, path: "/profile" },
];

function Sidebar({ active = "/tournaments", user, visible }) {
  return (
    <div className={`sidebar ${!visible ? "hidden" : ""}`}>
      <div className="sidebar-top">
        <img src={logo} alt="KickTime Logo" className="logo-img" />
        <div className="logo-texts">
          <h2 className="logo-name">KickTime</h2>
          <p className="subtitle">University Football</p>
        </div>
      </div>

      <div className="menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className={`menu-item ${active === item.path ? "active" : ""}`}
            >
              <Icon size={18} />
              <p>{item.name}</p>
            </div>
          );
        })}
      </div>

      <div className="sidebar-bottom">
        <div className="user-info">
          <div className="avatar"></div>
          <div>
            <p className="name">{user?.name || "Juan Pérez"}</p>
            <p className="role">
              {user?.role || "Jugador"} • {user?.team || "Ingeniería FC"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;