import React, { useContext, useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Users, UserSquare2, Map, Calendar, LogOut, Menu, Plus } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const [showHeart, setShowHeart] = useState(false);

    // Corazón en binario
    const heartLines = [
        "  0101  0101  ",
        "01010101010101",
        "01010101010101",
        "  0101010101  ",
        "    010101    ",
        "      01      "
    ];

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>ReservasCUV</h2>
                    <span className="user-badge">{user?.role === 'admin' ? 'Admin' : 'Alumno'}</span>
                </div>
                
                <nav className="sidebar-nav">
                    {user?.role === 'admin' ? (
                        <>
                            <NavLink to="/admin/calendar" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                                <Calendar size={20} /> Calendario Reservas
                            </NavLink>
                            <NavLink to="/admin/spaces" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                                <Map size={20} /> Espacios Escolares
                            </NavLink>
                            <NavLink to="/admin/managers" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                                <UserSquare2 size={20} /> Encargados de Áreas
                            </NavLink>
                            <NavLink to="/admin/users" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                                <Users size={20} /> Usuarios
                            </NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink to="/student/calendar" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                                <Calendar size={20} /> Disponibilidad
                            </NavLink>
                            <NavLink to="/student/reserve" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                                <Plus size={20} /> Nueva Reservación
                            </NavLink>
                        </>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <p className="user-name">{user?.username}</p>
                    <button onClick={logout} className="logout-btn">
                        <LogOut size={18} /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>

            {/* Easter Egg Trigger */}
            <div 
                className="easter-egg-trigger" 
                onClick={() => setShowHeart(!showHeart)}
                title="Secret"
            ></div>

            {/* Binary Heart Overlay */}
            {showHeart && (
                <div className="heart-overlay" onClick={() => setShowHeart(false)}>
                    <div className="binary-heart">
                        {heartLines.map((line, i) => (
                            <div key={i} className="heart-row">
                                {line.split('').map((char, j) => (
                                    <span key={j} className={char !== ' ' ? 'digit' : 'space'} style={{animationDelay: `${(i+j)*0.1}s`}}>
                                        {char === ' ' ? '\u00A0' : char}
                                    </span>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                .app-layout {
                    display: flex;
                    min-height: 100vh;
                    background-color: var(--color-background);
                }
                .sidebar {
                    width: 280px;
                    background-color: var(--color-surface);
                    border-right: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    position: sticky;
                    top: 0;
                    height: 100vh;
                }
                .sidebar-header {
                    padding: 2rem 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                }
                .sidebar-header h2 {
                    color: var(--color-primary);
                    font-size: 1.5rem;
                    margin-bottom: 0.25rem;
                }
                .user-badge {
                    display: inline-block;
                    padding: 0.25rem 0.5rem;
                    background: var(--color-primary-light);
                    color: var(--color-primary);
                    border-radius: var(--border-radius-sm);
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .sidebar-nav {
                    flex: 1;
                    padding: 1.5rem 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    color: var(--color-text-muted);
                    text-decoration: none;
                    border-radius: var(--border-radius-sm);
                    font-weight: 500;
                    transition: var(--transition);
                }
                .nav-item:hover {
                    background-color: #f1f5f9;
                    color: var(--color-text-main);
                }
                .nav-item.active {
                    background-color: var(--color-primary-light);
                    color: var(--color-primary);
                }
                .sidebar-footer {
                    padding: 1.5rem;
                    border-top: 1px solid #e2e8f0;
                }
                .user-name {
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                    color: var(--color-text-main);
                }
                .logout-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    width: 100%;
                    padding: 0.75rem;
                    background: transparent;
                    border: 1px solid var(--color-danger);
                    color: var(--color-danger);
                    border-radius: var(--border-radius-sm);
                    cursor: pointer;
                    font-weight: 500;
                    transition: var(--transition);
                }
                .logout-btn:hover {
                    background: var(--color-danger-bg);
                }
                .main-content {
                    flex: 1;
                    padding: 2.5rem;
                    overflow-y: auto;
                }
                
                /* Easter Egg Styles */
                .easter-egg-trigger {
                    position: fixed;
                    bottom: 4px;
                    left: 4px;
                    width: 4px;
                    height: 4px;
                    background: #ff4d4d;
                    border-radius: 50%;
                    cursor: pointer;
                    z-index: 9999;
                    opacity: 0.3;
                    transition: opacity 0.3s;
                }
                .easter-egg-trigger:hover {
                    opacity: 1;
                }

                .heart-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0,0,0,0.85);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    backdrop-filter: blur(5px);
                    cursor: pointer;
                }

                .binary-heart {
                    font-family: 'Courier New', Courier, monospace;
                    font-weight: bold;
                    line-height: 1.2;
                    text-align: center;
                    font-size: 2.5rem;
                    user-select: none;
                }

                .heart-row {
                    display: flex;
                    justify-content: center;
                }

                .digit {
                    color: #ff4d4d;
                    text-shadow: 0 0 10px #ff0000;
                    animation: binaryPulse 1.5s infinite ease-in-out;
                    display: inline-block;
                }

                @keyframes binaryPulse {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.2); opacity: 1; text-shadow: 0 0 20px #ff0000; }
                }

                @media (max-width: 768px) {
                    .app-layout { flex-direction: column; }
                    .sidebar { width: 100%; height: auto; position: static; }
                    .binary-heart { font-size: 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default Layout;
