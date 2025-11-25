import React from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { FaPlusCircle, FaArrowLeft } from 'react-icons/fa'
import '../pages/Dashboard.css'

export default function ListaPacientes() {
  const patients = [
    { name: 'João Silva', cpf: '123.456.789-00', phone: '(11) 99999-9999', email: 'joao@email.com', date: '2024-01-15' },
    { name: 'Maria Santos', cpf: '987.654.321-11', phone: '(11) 88888-8888', email: 'maria@email.com', date: '2024-02-20' },
  ]

  return (
    <DashboardLayout>
        <div className="container mt-4">
            <div id="pacientesSection" className="section-content">
                <div className="patients-container">
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 className="section-title">Cadastro de Pacientes</h2>
                        <button className="btn-add-patient" id="btnAddPatient" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                            <FaPlusCircle />
                            Novo Paciente
                        </button>
                    </div>

                    <div className="table-container">
                        <table className="patients-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '12px' }}>Nome</th>
                                    <th style={{ padding: '12px' }}>CPF</th>
                                    <th style={{ padding: '12px' }}>Telefone</th>
                                    <th style={{ padding: '12px' }}>Email</th>
                                    <th style={{ padding: '12px' }}>Data Cadastro</th>
                                    <th style={{ padding: '12px' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="patientsTableBody">
                                {patients.map((p, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px' }}>{p.name}</td>
                                        <td style={{ padding: '12px' }}>{p.cpf}</td>
                                        <td style={{ padding: '12px' }}>{p.phone}</td>
                                        <td style={{ padding: '12px' }}>{p.email}</td>
                                        <td style={{ padding: '12px' }}>{p.date}</td>
                                        <td style={{ padding: '12px' }}>
                                            <button style={{ marginRight: '8px', border: 'none', background: 'none', color: 'blue', cursor: 'pointer' }}>Editar</button>
                                            <button style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer' }}>Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </DashboardLayout>
  )
}
