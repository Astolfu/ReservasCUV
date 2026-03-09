import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import CalendarGrid from '../../components/CalendarGrid';
import { Calendar, Clock, MapPin, Users, CheckCircle, Search, ArrowLeft, Info } from 'lucide-react';
import API_BASE_URL from '../../api';

const StudentReservationFlow = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [spaces, setSpaces] = useState([]);
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [occupiedTimes, setOccupiedTimes] = useState([]);
    
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchSpaces = async () => {
            const res = await fetch(`${API_BASE_URL}/api/spaces`);
            setSpaces(await res.json());
        };
        fetchSpaces();
    }, []);

    useEffect(() => {
        if (!selectedSpace || !selectedDate) {
            setOccupiedTimes([]);
            return;
        }
        
        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        
        const fetchOccupied = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/reservations/check?space_id=${selectedSpace.id}&date=${dateStr}`);
                if (res.ok) {
                    setOccupiedTimes(await res.json());
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchOccupied();
    }, [selectedSpace, selectedDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        
        if (startTime >= endTime) {
            setError('La hora de inicio debe ser anterior a la hora de fin');
            setLoading(false);
            return;
        }

        // Validar 10 días de anticipación
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const minDate = new Date(today);
        minDate.setDate(minDate.getDate() + 10);
        
        const chosen = new Date(selectedDate);
        chosen.setHours(0, 0, 0, 0);
        
        if (chosen < minDate) {
            setError('La reservación debe hacerse con al menos 10 días de anticipación.');
            setLoading(false);
            return;
        }

        // Validar horario de apertura del espacio
        if (selectedSpace.available_hours) {
            const match = selectedSpace.available_hours.match(/(\d{1,2}:\d{2})\s*[-a]\s*(\d{1,2}:\d{2})/i);
            if (match) {
                const normalize = (t) => {
                    const [h, m] = t.split(':');
                    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
                };
                const spaceOpen = normalize(match[1]);
                const spaceClose = normalize(match[2]);
                
                if (startTime < spaceOpen || endTime > spaceClose) {
                    setError(`El horario debe estar dentro de las horas de operación del espacio: ${selectedSpace.available_hours}`);
                    setLoading(false);
                    return;
                }
            }
        }

        // --- NUEVA VALIDACIÓN: Traslape de horarios (FRONTEND) ---
        const hasOverlap = occupiedTimes.some(ot => {
            const otStart = ot.start_time.slice(0, 5);
            const otEnd = ot.end_time.slice(0, 5);
            return (startTime < otEnd && endTime > otStart);
        });

        if (hasOverlap) {
            setError('Este horario colisiona con otra reservación (ya sea pendiente o aprobada).');
            setLoading(false);
            return;
        }
        // --------------------------------------------------------

        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/reservations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    space_id: selectedSpace.id,
                    user_id: user.id,
                    date: dateStr,
                    start_time: startTime,
                    end_time: endTime
                })
            });
            const data = await res.json();
            
            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || 'Error al reservar el espacio');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="page-container animate-enter" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div className="success-card glass-panel">
                    <div className="success-icon">
                        <CheckCircle size={64} />
                    </div>
                    <h2>¡Solicitud Enviada!</h2>
                    <p>Tu solicitud de reservación fue enviada correctamente y se encuentra <strong>pendiente de aprobación</strong> por parte del administrador.</p>
                    <p className="text-muted">Puedes consultar el calendario para ver los espacios disponibles mientras esperas la respuesta.</p>
                    <button className="btn btn-primary mt-4" onClick={() => navigate('/student/calendar')}>
                        Volver al Calendario
                    </button>
                </div>

                <style>{`
                    .success-card {
                        text-align: center;
                        padding: 3rem;
                        max-width: 500px;
                        width: 100%;
                    }
                    .success-icon {
                        color: var(--color-success);
                        display: flex;
                        justify-content: center;
                        margin-bottom: 1.5rem;
                    }
                    .success-card h2 {
                        color: var(--color-text-main);
                        margin-bottom: 1rem;
                    }
                    .success-card p {
                        color: var(--color-text-muted);
                        margin-bottom: 0.75rem;
                    }
                    .text-muted { color: var(--color-text-muted); }
                    .mt-4 { margin-top: 1rem; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="page-container animate-enter">
            <button className="btn mb-4" onClick={() => navigate(-1)} style={{background: 'transparent', border: '1px solid #cbd5e1'}}>
                <ArrowLeft size={16} /> Volver
            </button>
            <h1 className="page-title">Solicitar Reservación</h1>
            <p className="text-muted mb-6">Selecciona el espacio, fecha y horario que deseas reservar. Tu solicitud quedará pendiente de aprobación por el administrador.</p>
            
            <div className="flow-container">
                {/* Paso 1: Elegir espacio */}
                <div className="flow-step glass-panel">
                    <h3>1. Selecciona el Espacio</h3>
                    <div className="spaces-list mt-4">
                        {spaces.map(s => (
                            <div 
                                key={s.id} 
                                className={`space-select-card ${selectedSpace?.id === s.id ? 'active' : ''}`}
                                onClick={() => setSelectedSpace(s)}
                            >
                                <h4>{s.name}</h4>
                                <p><Clock size={14}/> Disponible: {s.available_hours}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Paso 2: Elegir Fecha */}
                {selectedSpace && (
                    <div className="flow-step glass-panel animate-enter">
                        <h3>2. Selecciona Fecha</h3>
                        <div className="mt-4">
                            <CalendarGrid 
                                selectedDate={selectedDate} 
                                onDateSelect={setSelectedDate} 
                            />
                        </div>
                    </div>
                )}
                
                {/* Paso 3: Horario */}
                {selectedSpace && (
                    <div className="flow-step glass-panel animate-enter" style={{display: 'flex', flexDirection: 'column'}}>
                        <h3>3. Horario y Confirmación</h3>
                        
                        <div className="info-box mt-4">
                            <Info size={16} />
                            <div>
                                <strong>Horarios ya ocupados para el {selectedDate.toLocaleDateString()}:</strong>
                                {occupiedTimes.length === 0 ? (
                                    <p className="mt-2 text-success">Todo el día disponible</p>
                                ) : (
                                    <ul className="mt-2">
                                        {occupiedTimes.map((ot, idx) => (
                                            <li key={idx}>{ot.start_time.slice(0,5)} a {ot.end_time.slice(0,5)} ({ot.status})</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {error && <div className="error-message mt-4">{error}</div>}

                        <form onSubmit={handleSubmit} className="mt-4" style={{flex: 1}}>
                            <div className="grid-cols-2">
                                <div className="input-group">
                                    <label className="input-label">De (Hora Inicio)</label>
                                    <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="input-field" />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">A (Hora Fin)</label>
                                    <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} className="input-field" />
                                </div>
                            </div>
                            
                            <p className="text-muted mt-4" style={{fontSize: '0.875rem'}}>
                                * Las reservaciones deben hacerse con al menos <strong>10 días de anticipación</strong>.
                            </p>
                            
                            <button type="submit" className="btn btn-primary mt-6 w-100" disabled={loading}>
                                {loading ? 'Procesando...' : 'Enviar Solicitud de Reservación'}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <style>{`
                .mb-4 { margin-bottom: 1rem; }
                .mb-6 { margin-bottom: 1.5rem; }
                .mt-2 { margin-top: 0.5rem; }
                .mt-4 { margin-top: 1rem; }
                .mt-6 { margin-top: 1.5rem; }
                .w-100 { width: 100%; }
                .text-muted { color: var(--color-text-muted); }
                .text-success { color: var(--color-success); font-weight: 600; }
                
                .flow-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 1.5rem;
                    align-items: stretch;
                }
                
                .flow-step { padding: 1.5rem; display: flex; flex-direction: column; }
                .flow-step h3 { color: var(--color-primary); margin: 0; }
                
                .spaces-list { display: flex; flex-direction: column; gap: 0.75rem; flex: 1; overflow-y: auto; max-height: 450px; }
                .space-select-card { padding: 1rem; border: 1px solid #e2e8f0; border-radius: var(--border-radius-sm); cursor: pointer; transition: var(--transition); background: white; }
                .space-select-card:hover { border-color: var(--color-primary-light); background: #f8fafc; }
                .space-select-card.active { border-color: var(--color-primary); background: var(--color-primary-light); box-shadow: 0 0 0 1px var(--color-primary); }
                .space-select-card h4 { margin: 0 0 0.5rem 0; color: var(--color-text-main); }
                .space-select-card p { display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; margin: 0; color: var(--color-text-muted); }
                
                .info-box { background: #f1f5f9; border-left: 4px solid var(--color-secondary); padding: 1rem; border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0; display: flex; gap: 0.75rem; font-size: 0.875rem; color: var(--color-text-main); }
                .info-box ul { padding-left: 1.5rem; margin-bottom: 0; color: var(--color-text-muted); }
                .info-box ul li { padding: 0.15rem 0; }
            `}</style>
        </div>
    );
};

export default StudentReservationFlow;
