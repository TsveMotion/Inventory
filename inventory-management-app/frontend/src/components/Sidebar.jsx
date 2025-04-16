import React from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiBox, FiSearch, FiBarChart2, FiShoppingCart, FiLogOut } from "react-icons/fi";
import logo from "../assets/logo.png";

const navItems = [
  { name: "Dashboard", path: "/", icon: <FiHome /> },
  { name: "Inventory", path: "/inventory", icon: <FiBox /> },
  { name: "Find Item", path: "/find-item", icon: <FiSearch /> },
  { name: "Scan In // Scan Out", path: "/scan", icon: <FiShoppingCart /> },
];

export default function Sidebar({ onLogout }) {
  return (
    <aside className="h-screen w-56 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col py-6 px-4 shadow-2xl fixed top-0 left-0 z-50">
      <div className="flex flex-col items-center mb-10">
        <img src={logo} alt="Logo" className="w-16 h-16 mb-1 object-contain" style={{background: 'none', boxShadow: 'none', border: 'none'}} />
        <div className="text-xl font-bold text-center mt-1 tracking-wide" style={{color: '#2dd4bf', letterSpacing: '2px'}}>FlinTor</div>
      </div>
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-lg ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-green-500 shadow-lg text-white scale-105"
                  : "hover:bg-gray-700 hover:scale-105 text-gray-100 opacity-90"
              }`
            }
            end={item.path === "/"}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <button
        className="flex items-center gap-2 justify-center w-full mt-6 py-2 bg-gradient-to-r from-red-500 to-orange-400 hover:from-red-600 hover:to-orange-500 text-white rounded-lg font-semibold text-lg shadow-lg transition"
        onClick={onLogout}
      >
        <FiLogOut className="text-xl" /> Logout
      </button>
      <div className="mt-8 text-xs text-gray-400 text-center opacity-60">
        &copy; {new Date().getFullYear()} Reselling Inventory<br />All rights reserved.
      </div>
    </aside>
  );
}
