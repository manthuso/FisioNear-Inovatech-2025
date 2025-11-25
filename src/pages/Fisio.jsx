import React, { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import '../pages/Dashboard.css'

export default function Fisio() {
  const [currentMonth, setCurrentMonth] = useState('Outubro')
  const [currentYear, setCurrentYear] = useState(2025)

  // Mock appointments
  const appointments = [
    { time: '09:00', patient: 'João Silva', type: 'Fisioterapia Motora', status: 'confirmed' },
    { time: '10:30', patient: 'Maria Santos', type: 'Avaliação Inicial', status: 'pending' },
    { time: '14:00', patient: 'Pedro Oliveira', type: 'Reabilitação', status: 'confirmed' }
  ]

  return (
    <DashboardLayout>
      <div id="consultasSection" className="section-content active">
        <div className="calendar-container">
            <div className="calendar-header">
                <button className="btn-nav" id="prevMonth">
                    <FaChevronLeft />
                </button>
                <div className="month-year">
                    <span id="currentMonth">{currentMonth}</span>
                    <select 
                        id="yearSelect" 
                        className="year-select" 
                        value={currentYear}
                        onChange={(e) => setCurrentYear(e.target.value)}
                    >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>
                <button className="btn-nav" id="nextMonth">
                    <FaChevronRight />
                </button>
            </div>
            
            <div className="calendar">
                <div className="calendar-weekdays">
                    <div>Dom</div>
                    <div>Seg</div>
                    <div>Ter</div>
                    <div>Qua</div>
                    <div>Qui</div>
                    <div>Sex</div>
                    <div>Sáb</div>
                </div>
                <div className="calendar-days" id="calendarDays">
                    {/* Mock days for visual representation */}
                    {Array.from({ length: 31 }, (_, i) => (
                        <div key={i} className={`calendar-day ${i === 14 ? 'today' : ''} ${i === 16 ? 'has-appointment' : ''}`}>
                            {i + 1}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="appointments-panel">
            <h3>Consultas marcadas</h3>
            <div id="appointmentsList">
                {appointments.map((app, index) => (
                    <div key={index} className="appointment-card">
                        <div className="time">{app.time}</div>
                        <div className="info">
                            <h4>{app.patient}</h4>
                            <p>{app.type}</p>
                        </div>
                        <div className={`status ${app.status}`}>
                            {app.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
