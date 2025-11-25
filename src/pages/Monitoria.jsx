import React from 'react'
import DashboardLayout from '../components/DashboardLayout'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import '../pages/Dashboard.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function Monitoria() {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Evolução do Paciente',
      },
    },
  }

  const labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4']

  const data = {
    labels,
    datasets: [
      {
        label: 'Exercícios Concluídos',
        data: [65, 59, 80, 81],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Meta Semanal',
        data: [60, 60, 70, 80],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  }

  return (
    <DashboardLayout>
        <div className="container-fluid mt-4">
            <div className="row justify-content-center">
                <div className="col-10" style={{ maxWidth: '100%' }}>

                    {/* LINHA DE INFORMAÇÕES DO PACIENTE */}
                    <div className="row g-3 mb-3" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                        <div className="col-md-6" style={{ flex: 1 }}>
                            <div className="info-box p-3" style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <p><strong>Nome do paciente:</strong> João Silva</p>
                                <p><strong>ID:</strong> 00010</p>
                            </div>
                        </div>

                        <div className="col-md-6" style={{ flex: 1 }}>
                            <div className="info-box p-3" style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <p><strong>CPF do paciente:</strong> 000.000.000-00</p>
                                <p><strong>Estado:</strong> SP</p>
                            </div>
                        </div>
                    </div>

                    {/* ÁREA PRINCIPAL */}
                    <div className="row g-4">
                        {/* GRÁFICO */}
                        <div className="col-md-8">
                            <div className="grafico-box p-4" style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <h5 className="mb-3 text-success fw-bold" style={{ color: 'var(--primary-color)', marginBottom: '15px' }}>Evolução do paciente</h5>
                                <Line options={options} data={data} />
                                <p className="mt-3 small text-secondary" style={{ marginTop: '15px', fontSize: '0.9rem', color: '#64748b' }}>
                                    <strong>Eixo X:</strong> Semanas (1–4)<br/>
                                    <strong>Eixo Y:</strong> % de conclusão<br/>
                                    <strong>Legenda:</strong> Exercícios concluídos / Meta semanal
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </DashboardLayout>
  )
}
