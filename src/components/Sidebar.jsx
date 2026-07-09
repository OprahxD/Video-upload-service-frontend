import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <ul className="sidebar-links">
                <li>
                    <NavLink to="/" className={({isActive}) => isActive ? "active" : ""}>
                        🏠 Home
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/trending" className={({isActive}) => isActive ? "active" : ""}>
                        🔥 Trending
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/tweets" className={({isActive}) => isActive ? "active" : ""}>
                        💬 Community
                    </NavLink>
                </li>
                <hr className="divider" />
                <li>
                    <NavLink to="/dashboard" className={({isActive}) => isActive ? "active" : ""}>
                        📊 Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/history" className={({isActive}) => isActive ? "active" : ""}>
                        🕰️ History
                    </NavLink>
                </li>
            </ul>
        </aside>
    );
};

export default Sidebar;
