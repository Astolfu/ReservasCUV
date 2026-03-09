import React, { useState, useEffect } from 'react';
import { UserSquare2, Phone, UserPlus, Camera, Trash2, Search } from 'lucide-react';
import API_BASE_URL from '../../api';

const Managers = () => {
    const [managers, setManagers] = useState([]);
    const [formData, setFormData] = useState({ name: '', phone: '', aux_name: '', aux_phone: '', manager_photo: '', aux_photo: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchManagers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/managers`);
            const data = await res.json();
            setManagers(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchManagers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, targetField) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [targetField]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/managers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setFormData({ name: '', phone: '', aux_name: '', aux_phone: '', manager_photo: '', aux_photo: '' });
                fetchManagers();
            } else {
                setError('Error al crear el encargado');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container animate-enter">
            <h1 className="page-title">Directorio de Encargados</h1>
            
            <div className="content-grid">
                <div className="glass-panel p-6 form-section">
                    <h3>Registrar Encargado y Auxiliar</h3>
                    {error && <div className="error-message mt-4">{error}</div>}
                    <form onSubmit={handleSubmit} className="mt-4">
                        <h4 className="section-subtitle mt-4">Datos del Encargado</h4>
                        <div className="input-group">
                            <label className="input-label">Nombre Completo</label>
                            <input name="name" value={formData.name} onChange={handleChange} className="input-field" required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Teléfono/Celular</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Foto del Encargado (Opcional)</label>
                            <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'manager_photo')} className="file-input" />
                        </div>

                        <h4 className="section-subtitle mt-6">Datos del Auxiliar (Opcional)</h4>
                        <div className="input-group">
                            <label className="input-label">Nombre Completo del Auxiliar</label>
                            <input name="aux_name" value={formData.aux_name} onChange={handleChange} className="input-field" />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Teléfono del Auxiliar</label>
                            <input type="tel" name="aux_phone" value={formData.aux_phone} onChange={handleChange} className="input-field" />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Foto del Auxiliar (Opcional)</label>
                            <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'aux_photo')} className="file-input" />
                        </div>

                        <button type="submit" className="btn btn-primary mt-4 w-100" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Información'}
                        </button>
                    </form>
                </div>

                <div className="glass-panel p-6 list-section">
                    <h3>Directorio Actual</h3>
                    <div className="managers-grid mt-4">
                        {managers.map(m => (
                            <div key={m.id} className="manager-card">
                                <div className="manager-profile">
                                    {m.manager_photo ? (
                                        <img src={m.manager_photo} alt={m.name} className="profile-img" />
                                    ) : (
                                        <div className="profile-placeholder"><Camera size={24} /></div>
                                    )}
                                    <div className="profile-info">
                                        <h4>{m.name}</h4>
                                        <p className="role">Encargado Titular</p>
                                        <p className="phone">{m.phone}</p>
                                    </div>
                                </div>
                                
                                {m.aux_name && (
                                    <div className="manager-profile aux-profile">
                                         {m.aux_photo ? (
                                            <img src={m.aux_photo} alt={m.aux_name} className="profile-img small" />
                                        ) : (
                                            <div className="profile-placeholder small"><Camera size={16} /></div>
                                        )}
                                        <div className="profile-info">
                                            <h4>{m.aux_name}</h4>
                                            <p className="role">Auxiliar</p>
                                            <p className="phone">{m.aux_phone}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {managers.length === 0 && <p className="text-center text-muted">No hay encargados registrados.</p>}
                    </div>
                </div>
            </div>

            <style>{`
                .section-subtitle { color: var(--color-primary); margin-bottom: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
                .mt-6 { margin-top: 1.5rem; }
                .w-100 { width: 100%; }
                .file-input { padding: 0.5rem; border: 1px dashed #cbd5e1; border-radius: var(--border-radius-sm); width: 100%; }
                
                .managers-grid { display: grid; gap: 1rem; }
                .manager-card {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: var(--border-radius-sm);
                    padding: 1.25rem;
                }
                .manager-profile { display: flex; align-items: center; gap: 1rem; }
                .aux-profile { margin-top: 1rem; padding-top: 1rem; border-top: 1px dotted #cbd5e1; }
                
                .profile-img { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; }
                .profile-placeholder { width: 60px; height: 60px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
                .profile-img.small, .profile-placeholder.small { width: 40px; height: 40px; }
                
                .profile-info h4 { margin: 0; font-size: 1rem; color: var(--color-text-main); }
                .profile-info .role { font-size: 0.75rem; color: var(--color-primary); font-weight: 600; text-transform: uppercase; margin-bottom: 0.25rem; }
                .profile-info .phone { font-size: 0.875rem; color: var(--color-text-muted); margin: 0; }
                .text-muted { color: var(--color-text-muted); }
            `}</style>
        </div>
    );
};

export default Managers;
