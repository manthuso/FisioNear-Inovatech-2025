import React from 'react'
import DashboardHeader from './DashboardHeader'
import Sidebar from './Sidebar'
import '../pages/Dashboard.css'

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-wrapper" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      <DashboardHeader />
      <div className="main-container">
        <Sidebar />
        <main className="content" style={{ width: '100%' }}>
            {children}
        </main>
      </div>
    </div>
  )
}
