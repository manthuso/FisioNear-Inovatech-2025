import React from 'react';
import { Link } from 'react-router-dom';
import { FaTools } from 'react-icons/fa';

export default function EmProducao() {
  return (
    <section className="hero-section" style={{ minHeight: '100vh', justifyContent: 'center' }}>
      <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <FaTools size={80} color="#8ea598" />
        <h1>Página em <span className="highlight">Produção</span></h1>
        <p>Estamos trabalhando duro para trazer esta funcionalidade para você em breve.</p>
        <Link to="/" className="cta-button">Voltar para o Início</Link>
      </div>
    </section>
  );
}
