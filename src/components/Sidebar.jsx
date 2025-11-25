import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaCalendarCheck, FaDumbbell, FaUserFriends, FaIdBadge, FaChartLine, FaCog } from 'react-icons/fa'
import '../pages/Dashboard.css'

export default function Sidebar() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path ? 'nav-item active' : 'nav-item'

  return (
    <aside className="sidebar">
        <nav>
            <Link to="/fisio" className={isActive('/fisio')}>
                <FaCalendarCheck />
                <span>Consultas</span>
            </Link>
            <Link to="/lista-pacientes" className={isActive('/lista-pacientes')}>
                <FaUserFriends />
                <span>Pacientes</span>
            </Link>
            <Link to="/teste" className={isActive('/teste')}>
                <FaDumbbell />
                <span>Exercícios</span>
            </Link>
            
            <Link to="/admin" className={isActive('/admin')}>
                 <FaIdBadge />
                 <span>Fisioterapeutas</span>
            </Link>
            <Link to="/monitoria" className={isActive('/monitoria')}>
                <FaChartLine />
                <span>Monitoria</span>
            </Link>
            <Link to="#" className="nav-item">
                <FaCog />
                <span>Configurações</span>
            </Link>
        </nav>
    </aside>
  )
}
