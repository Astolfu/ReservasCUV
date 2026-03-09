import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarGrid } from '../../components/CalendarGrid';
import API_BASE_URL from '../../api';
import { CheckCircle, XCircle, Clock, MapPin, User, Plus } from 'lucide-react';

const AdminCalendar = () => {
    const [reservations, setReservations] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const navigate = useNavigate();

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

    const indicators = reservations
        .filter(r => r.status !== 'rechazada')
        .map(r => r.date.split('T')[0]); // Asumiendo formato ISO que mapea a YYYY-MM-DD local

    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const dailyReservations = reservations.filter(r => r.date.startsWith(dateStr));

    // Get all pending reservations regardless of date
    const pendingReservations = reservations.filter(r => r.status === 'pendiente').sort((a, b) => new Date(a.date) - new Date(b.date));

    const handleStatus = async (id, status) => {
        try {
            await fetch(`http://localhost:3000/api/reservations/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchReservations();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="page-container animate-enter">
            <div className="flex justify-between align-center mb-6">
                <h1 className="page-title" style={{margin: 0}}>Calendario de Ocupación</h1>
                <button className="btn btn-primary" onClick={() => navigate('/admin/reserve')}>
                    <Plus size={18} /> Nueva Reservación
                </button>
            </div>
            
            <div className="calendar-layout">
                <div className="calendar-section">
                    <CalendarGrid 
                        selectedDate={selectedDate} 
                        onDateSelect={setSelectedDate} 
                        indicators={indicators} 
                    />
                </div>
                
                <div className="daily-section glass-panel">
                    <h3 className="mb-4">
                        Reservaciones para el {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric'})}
                    </h3>
                    
                    <div className="reservations-list">
                        {dailyReservations.length === 0 ? (
                            <div className="empty-state">No hay reservaciones para esta fecha.</div>
                        ) : (
                            dailyReservations.map(r => (
                                <div key={r.id} className={`res-card status-${r.status}`}>
                                    <div className="res-header">
                                        <h4>{r.space_name}</h4>
                                        <span className={`status-badge ${r.status}`}>{r.status.toUpperCase()}</span>
                                    </div>
                                    <div className="res-details">
                                        <p><Clock size={14}/> {r.start_time.slice(0,5)} - {r.end_time.slice(0,5)}</p>
                                        <p><User size={14}/> {r.user_name}</p>
                                    </div>
                                    
                                    {r.status === 'pendiente' && (
                                        <div className="res-actions">
                                            <button onClick={() => handleStatus(r.id, 'aprobada')} className="btn-action approve" title="Aprobar">
                                                <CheckCircle size={18}/> Aprobar
                                            </button>
                                            <button onClick={() => handleStatus(r.id, 'rechazada')} className="btn-action reject" title="Rechazar">
                                                <XCircle size={18}/> Rechazar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            
            {/* Pending Reservations Section */}
            <div className="pending-section glass-panel">
                <h3 className="mb-4">
                    Reservaciones Pendientes ({pendingReservations.length})
                </h3>
                
                <div className="reservations-grid">
                    {pendingReservations.length === 0 ? (
                        <div className="empty-state">No hay reservaciones pendientes por el momento.</div>
                    ) : (
                        pendingReservations.map(r => {
                            const resDate = new Date(r.date);
                            const dateString = resDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                            return (
                                <div key={r.id} className={`res-card status-${r.status}`}>
                                    <div className="res-header">
                                        <h4>{r.space_name}</h4>
                                        <span className="res-date-badge">{dateString}</span>
                                    </div>
                                    <div className="res-details">
                                        <p><Clock size={14}/> {r.start_time.slice(0,5)} - {r.end_time.slice(0,5)}</p>
                                        <p><User size={14}/> {r.user_name}</p>
                                    </div>
                                    
                                    <div className="res-actions">
                                        <button onClick={() => handleStatus(r.id, 'aprobada')} className="btn-action approve" title="Aprobar">
                                            <CheckCircle size={18}/> Aprobar
                                        </button>
                                        <button onClick={() => handleStatus(r.id, 'rechazada')} className="btn-action reject" title="Rechazar">
                                            <XCircle size={18}/> Rechazar
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <style>{`
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .align-center { align-items: center; }
                .mb-6 { margin-bottom: 1.5rem; }
                .mb-4 { margin-bottom: 1rem; color: var(--color-primary); }
                
                .calendar-layout {
                    display: grid;
                    grid-template-columns: 400px 1fr;
                    gap: 1.5rem;
                    align-items: start;
                    margin-bottom: 2rem;
                }
                
                .pending-section {
                    padding: 1.5rem;
                }
                
                .reservations-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1rem;
                }
                
                .res-date-badge {
                    font-size: 0.75rem;
                    background: var(--color-background);
                    padding: 0.2rem 0.5rem;
                    border-radius: var(--border-radius-sm);
                    color: var(--color-text-main);
                    border: 1px solid #e2e8f0;
                }
                
                .daily-section {
                    padding: 1.5rem;
                    min-height: 400px;
                }
                
                .reservations-list { display: flex; flex-direction: column; gap: 1rem; }
                .empty-state { text-align: center; padding: 2rem; color: var(--color-text-muted); background: #f8fafc; border-radius: var(--border-radius-sm); border: 1px dashed #cbd5e1; }
                
                .res-card {
                    padding: 1rem;
                    border-radius: var(--border-radius-sm);
                    background: #ffffff;
                    border-left: 4px solid var(--color-text-muted);
                    box-shadow: var(--shadow-sm);
                }
                .res-card.status-pendiente { border-left-color: var(--color-warning); }
                .res-card.status-aprobada { border-left-color: var(--color-success); }
                .res-card.status-rechazada { border-left-color: var(--color-danger); opacity: 0.7; }
                
                .res-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
                .res-header h4 { margin: 0; font-size: 1rem; color: var(--color-text-main); }
                
                .status-badge { font-size: 0.65rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: 999px; }
                .status-badge.pendiente { background: var(--color-warning-bg); color: #b45309; }
                .status-badge.aprobada { background: var(--color-success-bg); color: #047857; }
                .status-badge.rechazada { background: var(--color-danger-bg); color: #b91c1c; }
                
                .res-details { display: flex; gap: 1.5rem; color: var(--color-text-muted); font-size: 0.875rem; margin-bottom: 0.75rem; }
                .res-details p { display: flex; align-items: center; gap: 0.35rem; margin: 0; }
                
                .res-actions { display: flex; gap: 0.5rem; padding-top: 0.75rem; border-top: 1px solid #e2e8f0; }
                .btn-action { display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; font-weight: 600; padding: 0.35rem 0.75rem; border-radius: var(--border-radius-sm); border: none; cursor: pointer; transition: var(--transition); }
                .btn-action.approve { background: var(--color-success-bg); color: #047857; }
                .btn-action.approve:hover { background: #a7f3d0; }
                .btn-action.reject { background: var(--color-danger-bg); color: #b91c1c; }
                .btn-action.reject:hover { background: #fecaca; }
                
                @media (max-width: 1024px) {
                    .calendar-layout { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default AdminCalendar;
