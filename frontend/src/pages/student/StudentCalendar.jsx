import React, { useState, useEffect } from 'react';
import CalendarGrid from '../../components/CalendarGrid';
import API_BASE_URL from '../../api';
import { Clock, MapPin, Search } from 'lucide-react';

const StudentCalendar = () => {
    const [reservations, setReservations] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');

    const fetchReservations = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/reservations`);
            const data = await res.json();
            setReservations(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    // Se muestran tanto las aprobadas como las pendientes para que el alumno sepa qué no puede elegir
    const activeReservations = reservations.filter(r => r.status !== 'rechazada');
    
    const indicators = activeReservations.map(r => r.date.split('T')[0]);

    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const dailyOccupied = activeReservations
        .filter(r => r.date.startsWith(dateStr))
        .filter(r => r.space_name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="page-container animate-enter">
            <h1 className="page-title">Disponibilidad de Espacios</h1>
            <p className="text-muted mb-6">Consulta los espacios y áreas escolares ocupadas por fecha. Los horarios marcados como "Ocupado" o "En Proceso" no están disponibles para nuevas solicitudes.</p>
            
            <div className="calendar-layout">
                <div className="calendar-section">
                    <CalendarGrid 
                        selectedDate={selectedDate} 
                        onDateSelect={setSelectedDate} 
                        indicators={indicators} 
                    />
                </div>
                
                <div className="daily-section glass-panel">
                    <div className="flex justify-between align-center mb-4 pb-4" style={{borderBottom: '1px solid #e2e8f0'}}>
                        <h3 style={{color: 'var(--color-primary)', margin: 0}}>
                            Ocupación: {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long'})}
                        </h3>
                        <div className="search-box">
                            <Search size={16} className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Buscar espacio..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="reservations-list">
                        {dailyOccupied.length === 0 ? (
                            <div className="empty-state">
                                <h4>¡Todo Disponible!</h4>
                                <p>No hay eventos registrados para este día en los espacios que buscas.</p>
                            </div>
                        ) : (
                            dailyOccupied.map(r => (
                                <div key={r.id} className="occupied-card">
                                    <div className={`occ-time ${r.status === 'pendiente' ? 'pending' : ''}`}>
                                        <Clock size={16} />
                                        <span>{r.start_time.slice(0,5)} - {r.end_time.slice(0,5)}</span>
                                    </div>
                                    <div className="occ-details">
                                        <h4>{r.space_name}</h4>
                                        <span className={`occ-badge ${r.status}`}>
                                            {r.status === 'aprobada' ? 'Ocupado' : 'En Proceso'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .text-muted { color: var(--color-text-muted); }
                .mb-6 { margin-bottom: 1.5rem; }
                .pb-4 { padding-bottom: 1rem; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .align-center { align-items: center; }
                
                .calendar-layout { display: grid; grid-template-columns: 400px 1fr; gap: 1.5rem; align-items: start; }
                .daily-section { padding: 1.5rem; min-height: 400px; }
                
                .search-box { position: relative; }
                .search-box input { padding: 0.5rem 1rem 0.5rem 2.25rem; border: 1px solid #cbd5e1; border-radius: 999px; font-size: 0.875rem; outline: none; transition: var(--transition); }
                .search-box input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 2px var(--color-primary-light); }
                .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
                
                .reservations-list { display: flex; flex-direction: column; gap: 1rem; }
                .empty-state { text-align: center; padding: 3rem 1rem; color: var(--color-text-muted); background: #f8fafc; border-radius: var(--border-radius-lg); border: 2px dashed #e2e8f0; }
                .empty-state h4 { color: var(--color-success); margin-bottom: 0.5rem; font-size: 1.125rem; }
                
                .occupied-card { display: flex; align-items: stretch; background: white; border: 1px solid #e2e8f0; border-radius: var(--border-radius-sm); overflow: hidden; box-shadow: var(--shadow-sm); transition: var(--transition); }
                .occupied-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
                
                .occ-time { background: var(--color-primary); color: white; padding: 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.25rem; font-weight: 600; font-size: 0.875rem; min-width: 100px; text-align: center; }
                .occ-time.pending { background: #f59e0b; }
                
                .occ-details { padding: 1rem; flex: 1; display: flex; justify-content: space-between; align-items: center; }
                .occ-details h4 { margin: 0; font-size: 1.125rem; color: var(--color-text-main); }
                
                .occ-badge { font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: var(--border-radius-sm); text-transform: uppercase; }
                .occ-badge.aprobada { background: var(--color-danger-bg); color: var(--color-danger); }
                .occ-badge.pendiente { background: #fef3c7; color: #b45309; }
                
                @media (max-width: 1024px) {
                    .calendar-layout { grid-template-columns: 1fr; }
                    .flex.justify-between { flex-direction: column; align-items: flex-start; gap: 1rem; }
                    .search-box { width: 100%; }
                    .search-box input { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default StudentCalendar;
