import React from 'react'
import { FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa'
import '../App.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>FisioNear</h3>
          <p>Sua recuperação, nossa prioridade.</p>
        </div>
        <div className="footer-section">
          <h4>Contato</h4>
          <div className="social-links">
            <a href="https://instagram.com/fisionear" target="_blank" rel="noopener noreferrer">
              <FaInstagram size={24} />
            </a>
            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer">
              <FaWhatsapp size={24} />
            </a>
            <a href="mailto:contato@fisionear.com">
              <FaEnvelope size={24} />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} FisioNear. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
