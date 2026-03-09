import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Users, Clock } from 'lucide-react';
import API_BASE_URL from '../../api';

const Spaces = () => {
    const [spaces, setSpaces] = useState([]);
    const [managers, setManagers] = useState([]);
    const [formData, setFormData] = useState({ name: '', manager_id: '', capacity: '', available_hours: '', resources: '', photo: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const [spaceRes, mgrRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/spaces`),
                fetch(`${API_BASE_URL}/api/managers`)
            ]);
            setSpaces(await spaceRes.json());
            setManagers(await mgrRes.json());
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, photo: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const payload = { ...formData, manager_id: formData.manager_id || null };
            const res = await fetch(`${API_BASE_URL}/api/spaces`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setFormData({ name: '', manager_id: '', capacity: '', available_hours: '', resources: '', photo: '' });
                fetchData();
            } else setError('Error al crear espacio');
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container animate-enter">
            <h1 className="page-title">Áreas y Espacios</h1>
            
            <div className="content-grid">
                <div className="glass-panel p-6 form-section">
                    <h3>Registrar Nuevo Espacio</h3>
                    {error && <div className="error-message mt-4">{error}</div>}
                    <form onSubmit={handleSubmit} className="mt-4">
                        <div className="input-group">
                            <label className="input-label">Nombre del Espacio</label>
                            <input name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="Ej. Auditorio Principal" required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Encargado Asignado</label>
                            <select name="manager_id" value={formData.manager_id} onChange={handleChange} className="input-field">
                                <option value="">Sin encargado / Múltiples</option>
                                {managers.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid-cols-2" style={{gap: '1rem'}}>
                            <div className="input-group">
                                <label className="input-label">Capacidad (Personas)</label>
                                <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="input-field" required />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Horario Disponible</label>
                                <input type="text" name="available_hours" value={formData.available_hours} onChange={handleChange} className="input-field" placeholder="08:00 - 18:00" required />
                            </div>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Recursos Disponibles</label>
                            <textarea name="resources" value={formData.resources} onChange={handleChange} className="input-field" placeholder="Sillas, mesas, proyector, audio, manteles..." rows="3"></textarea>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Foto del Lugar (Opcional)</label>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="file-input" />
                        </div>
                        <button type="submit" className="btn btn-primary mt-4 w-100" disabled={loading}>
                            {loading ? 'Guardando...' : 'Crear Espacio'}
                        </button>
                    </form>
                </div>

                <div className="list-section" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    {spaces.map(s => (
                        <div key={s.id} className="glass-panel space-card">
                            <div className="space-image">
                                {s.photo ? <img src={s.photo} alt={s.name} /> : <div className="img-placeholder"><Camera size={32} /></div>}
                            </div>
                            <div className="space-content" style={{padding: '1.5rem'}}>
                                <h3>{s.name}</h3>
                                <p className="mgr"><MapPin size={16}/> Encargado: {s.manager_name || 'Ninguno'}</p>
                                
                                <div className="space-meta">
                                    <span><Users size={16} /> {s.capacity} personas</span>
                                    <span><Clock size={16} /> {s.available_hours}</span>
                                </div>
                                <div className="space-resources">
                                    <strong>Recursos:</strong> {s.resources || 'No especificados'}
                                </div>
                            </div>
                        </div>
                    ))}
                    {spaces.length === 0 && <p className="text-center">No hay áreas registradas.</p>}
                </div>
            </div>

            <style>{`
                .space-card { overflow: hidden; display: flex; flex-direction: column; }
                .space-image { width: 100%; height: 200px; background: #e2e8f0; }
                .space-image img { width: 100%; height: 100%; object-fit: cover; }
                .img-placeholder { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #94a3b8; }
                .mgr { display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-muted); font-size: 0.875rem; margin-top: 0.5rem; }
                .space-meta { display: flex; gap: 1rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
                .space-meta span { display: flex; align-items: center; gap: 0.25rem; font-size: 0.875rem; font-weight: 500; color: var(--color-primary); background: var(--color-primary-light); padding: 0.25rem 0.5rem; border-radius: var(--border-radius-sm); }
                .space-resources { margin-top: 1rem; font-size: 0.875rem; color: var(--color-text-main); line-height: 1.5; background: #f8fafc; padding: 0.75rem; border-radius: var(--border-radius-sm); }
            `}</style>
        </div>
    );
};

export default Spaces;
