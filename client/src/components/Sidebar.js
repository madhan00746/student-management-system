import React from "react";

function Sidebar({ page, setPage, logout }) {

    const menus = [
        { name: "Dashboard", icon: "▦" },
        { name: "Students", icon: "♙" },
        { name: "Attendance", icon: "▣" },
        { name: "Academic Records", icon: "▤" },
        { name: "Departments", icon: "▥" }
    ];

    return (
        <aside className="sidebar">

            <h2>Student MS</h2>

            <p className="menu-label">MAIN MENU</p>

            {menus.map(item => (
                <button
                    key={item.name}
                    className={`nav-item ${page === item.name ? "active" : ""}`}
                    onClick={() => setPage(item.name)}
                >
                    <span>{item.icon}</span>
                    {item.name}
                </button>
            ))}

            <div className="sidebar-footer">
                <p>Administrator</p>
                <button className="logout-btn" onClick={logout}>
                    ↪ Logout
                </button>
            </div>

        </aside>
    );
}

export default Sidebar;