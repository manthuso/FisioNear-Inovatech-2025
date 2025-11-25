import React from 'react'
import { FaBell, FaFolder, FaUserCircle } from 'react-icons/fa'
import '../pages/Dashboard.css'

export default function DashboardHeader() {
  return (
    <header className="header">
        <div className="logo">FisioNear</div>
        <div className="user-info">
            <FaUserCircle size={32} />
            <span>Bem vindo, (usuario)!</span>
        </div>
        <div className="header-actions">
            <button className="icon-btn" id="notificationBtn">
                <FaBell />
                <span className="notification-badge">3</span>
            </button>
            <button className="icon-btn" id="documentsBtn">
                <FaFolder />
            </button>
        </div>
    </header>
  )
}
