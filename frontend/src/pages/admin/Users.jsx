import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, UserPlus, Mail, Shield, Trash2, Search } from 'lucide-react';
import API_BASE_URL from '../../api';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ username: '', password: '', email: '', role: 'student' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users`);
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setFormData({ username: '', password: '', email: '', role: 'student' });
                fetchUsers();
            } else {
                setError(data.error || 'Error al crear usuario');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container animate-enter">
            <h1 className="page-title">Gestión de Usuarios</h1>
            
            <div className="content-grid">
                {/* Formulario */}
                <div className="glass-panel p-6 form-section">
                    <h3>Registrar Nuevo Usuario</h3>
                    {error && <div className="error-message mt-4">{error}</div>}
                    <form onSubmit={handleSubmit} className="mt-4">
                        <div className="input-group">
                            <label className="input-label">Usuario</label>
                            <input name="username" value={formData.username} onChange={handleChange} className="input-field" required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Correo Electrónico</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Contraseña</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field" required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Rol</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="input-field">
                                <option value="student">Alumno</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creando...' : 'Crear Usuario'}
                        </button>
                    </form>
                </div>

                {/* Lista */}
                <div className="glass-panel p-6 list-section">
                    <h3>Usuarios Registrados</h3>
                    <div className="table-wrapper mt-4">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Usuario</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>#{u.id}</td>
                                        <td>{u.username}</td>
                                        <td>{u.email}</td>
                                        <td><span className={`badge ${u.role}`}>{u.role === 'admin' ? 'Admin' : 'Alumno'}</span></td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr><td colSpan="4" className="text-center py-4">No hay usuarios</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                .page-container { width: 100%; }
                .page-title { margin-bottom: 2rem; color: var(--color-primary); }
                .content-grid {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 1.5rem;
                }
                .p-6 { padding: 1.5rem; }
                .mt-4 { margin-top: 1rem; }
                .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
                .text-center { text-align: center; }
                
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .data-table th, .data-table td {
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid #e2e8f0;
                    text-align: left;
                }
                .data-table th { background-color: #f8fafc; font-weight: 600; color: var(--color-text-main); }
                
                .badge {
                    padding: 0.25rem 0.5rem;
                    border-radius: var(--border-radius-sm);
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .badge.admin { background-color: var(--color-primary-light); color: var(--color-primary); }
                .badge.student { background-color: var(--color-secondary); color: white; }
                
                @media (max-width: 1024px) {
                    .content-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default Users;
