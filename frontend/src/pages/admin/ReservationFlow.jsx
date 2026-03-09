import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import CalendarGrid from '../../components/CalendarGrid';
import { ArrowLeft, Clock, Info, CheckCircle } from 'lucide-react';
import API_BASE_URL from '../../api';

const ReservationFlow = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [spaces, setSpaces] = useState([]);
    const [selectedSpace, setSelectedSpace] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    // Status and occupied times for selected space & date
    const [occupiedTimes, setOccupiedTimes] = useState([]);
    
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSpaces = async () => {
            const res = await fetch('http://localhost:3000/api/spaces');
            setSpaces(await res.json());
        };
        fetchSpaces();
    }, []);

    // Cuando cambie espacio o fecha, buscamos qué horas están ocupadas
    useEffect(() => {
        if (!selectedSpace || !selectedDate) {
            setOccupiedTimes([]);
            return;
        }
        
        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        
        const fetchOccupied = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/reservations/check?space_id=${selectedSpace.id}&date=${dateStr}`);
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
        
        // Validación de formato de horas simple
        if (startTime >= endTime) {
            setError('La hora de inicio debe ser anterior a la hora de fin');
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
            const res = await fetch('http://localhost:3000/api/reservations', {
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
                navigate('/admin/calendar'); // Listo, volver al calendario para aprobarla
            } else {
                setError(data.error || 'Error al reservar el espacio');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container animate-enter">
            <button className="btn mb-4" onClick={() => navigate(-1)} style={{background: 'transparent', border: '1px solid #cbd5e1'}}>
                <ArrowLeft size={16} /> Volver
            </button>
            <h1 className="page-title">Reservar Espacio</h1>
            
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

                {/* Paso 2: Elegir Fecha y Hora */}
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
                
                {selectedSpace && (
                    <div className="flow-step glass-panel animate-enter" style={{display: 'flex', flexDirection: 'column'}}>
                        <h3>3. Horario y Confirmación</h3>
                        
                        <div className="info-box mt-4">
                            <Info size={16} />
                            <div>
                                <strong>Horarios ya ocupados o reservados para el {selectedDate.toLocaleDateString()}:</strong>
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
                                * Recuerda que las reservaciones deben hacerse con al menos 10 días de anticipación al evento.
                            </p>
                            
                            <button type="submit" className="btn btn-primary mt-6 w-100" disabled={loading}>
                                {loading ? 'Procesando...' : 'Confirmar Reservación (Quedará Pendiente)'}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <style>{`
                .mb-4 { margin-bottom: 1rem; }
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

export default ReservationFlow;
