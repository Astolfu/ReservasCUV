import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarGrid = ({ onDateSelect, selectedDate, indicators = [] }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

    const prevMonth = () => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));

    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const isSameDate = (d1, d2) => {
        if (!d1 || !d2) return false;
        return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    };

    const hasIndicator = (day) => {
        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return indicators.includes(dateStr);
    };

    return (
        <div className="calendar-wrapper">
            <div className="calendar-header">
                <button type="button" onClick={prevMonth} className="cal-btn"><ChevronLeft size={20}/></button>
                <h3>{months[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
                <button type="button" onClick={nextMonth} className="cal-btn"><ChevronRight size={20}/></button>
            </div>
            
            <div className="calendar-grid">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                    <div key={d} className="cal-day-name">{d}</div>
                ))}
                
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} className="cal-cell empty"></div>
                ))}
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const isSelected = isSameDate(dateObj, selectedDate);
                    
                    return (
                        <div 
                            key={day} 
                            className={`cal-cell ${isSelected ? 'selected' : ''}`}
                            onClick={() => onDateSelect(dateObj)}
                        >
                            <span className="cal-date">{day}</span>
                            {hasIndicator(day) && <span className="cal-indicator"></span>}
                        </div>
                    );
                })}
            </div>

            <style>{`
                .calendar-wrapper { background: var(--color-surface); border-radius: var(--border-radius-lg); padding: 1.5rem; border: 1px solid #e2e8f0; }
                .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .calendar-header h3 { margin: 0; color: var(--color-primary); font-size: 1.25rem; }
                .cal-btn { background: #f1f5f9; border: none; padding: 0.5rem; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--color-text-main); transition: var(--transition); }
                .cal-btn:hover { background: #e2e8f0; }
                
                .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; text-align: center; }
                .cal-day-name { font-size: 0.75rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 0.5rem; }
                
                .cal-cell { position: relative; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: var(--border-radius-sm); transition: var(--transition); border: 1px solid transparent; }
                .cal-cell:not(.empty):hover { border-color: var(--color-primary-light); background: #f8fafc; }
                .cal-cell.selected { background: var(--color-primary); color: white; font-weight: 600; box-shadow: var(--shadow-md); }
                .cal-cell.selected:hover { background: var(--color-primary-hover); }
                
                .cal-indicator { position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background-color: var(--color-secondary); }
                .cal-cell.selected .cal-indicator { background-color: white; }
            `}</style>
        </div>
    );
};

export default CalendarGrid;
